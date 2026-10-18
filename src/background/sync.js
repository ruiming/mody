// Cloud sync: writes a snapshot to chrome.storage.sync after local edits and,
// when another device publishes a newer snapshot, applies it (auto sync) or
// records it as pending for the UI to confirm.
import { canonicalJson, getLatestEntry, loadBackup, SyncTooLargeError, syncUsage, writeBackup, INDEX_KEY } from '../shared/cloud.js';
import { fixProfiles } from '../shared/profile.js';
import { getLocal, removeLocal, saveProfiles, setLocal, StorageKey } from '../shared/storage.js';
import { state } from './state.js';

const WRITE_DELAY_MS = 3000;

let syncState; // { deviceId, lastAppliedId, lastLocalChange }
let writeTimer;
// Profiles we just wrote from a remote snapshot; their storage change must not
// count as a local edit.
let applyingRemote;

async function loadSyncState() {
  if (syncState) return syncState;
  const stored = (await getLocal(StorageKey.SYNC_STATE))[StorageKey.SYNC_STATE] || {};
  syncState = { lastLocalChange: 0, ...stored };
  if (!syncState.deviceId) {
    syncState.deviceId = crypto.randomUUID();
    await persistSyncState();
  }
  return syncState;
}

function persistSyncState() {
  return setLocal({ [StorageKey.SYNC_STATE]: syncState });
}

export async function isAutoSync() {
  const settings = (await getLocal(StorageKey.SYNC_SETTINGS))[StorageKey.SYNC_SETTINGS];
  return settings?.autoSync !== false;
}

async function setStatus(patch) {
  const current = (await getLocal(StorageKey.SYNC_STATUS))[StorageKey.SYNC_STATUS] || {};
  await setLocal({ [StorageKey.SYNC_STATUS]: { ...current, ...patch, bytesInUse: await syncUsage() } });
}

async function writeNow() {
  clearTimeout(writeTimer);
  writeTimer = undefined;
  const { deviceId } = await loadSyncState();
  try {
    const entry = await writeBackup(state.profiles, { deviceId });
    if (entry) {
      syncState.lastAppliedId = entry.id;
      await persistSyncState();
    }
    await setStatus({ lastSyncAt: Date.now(), error: undefined, errorCode: undefined });
  } catch (e) {
    console.warn('Cloud sync failed', e);
    await setStatus({
      error: String(e?.message || e),
      errorCode: e instanceof SyncTooLargeError ? e.code : 'write_failed',
      errorAt: Date.now(),
    });
  }
}

// Called by index.js whenever the local profile list changes.
export async function onLocalProfilesChanged(profiles) {
  if (applyingRemote && canonicalJson(applyingRemote) === canonicalJson(profiles)) {
    applyingRemote = undefined;
    return;
  }
  await loadSyncState();
  syncState.lastLocalChange = Date.now();
  await persistSyncState();
  clearTimeout(writeTimer);
  // Sync storage has strict write-rate limits; coalesce rapid edits.
  writeTimer = setTimeout(writeNow, WRITE_DELAY_MS);
}

export function syncNow() {
  return writeNow();
}

async function applyRemote(entry, profiles) {
  fixProfiles(profiles);
  applyingRemote = profiles;
  syncState.lastAppliedId = entry.id;
  await persistSyncState();
  const selected = Math.min(state.selectedProfile, profiles.length - 1);
  await saveProfiles(profiles, Math.max(0, selected));
  await removeLocal(StorageKey.SYNC_PENDING);
  await setStatus({ lastSyncAt: Date.now(), lastAppliedAt: Date.now(), lastAppliedFrom: entry.deviceName, error: undefined, errorCode: undefined });
}

// Looks at the newest snapshot and pulls it in if it came from another device
// and is newer than our last local edit.
export async function checkRemote() {
  await loadSyncState();
  const entry = await getLatestEntry().catch(() => undefined);
  if (!entry || entry.legacy) return;
  if (entry.deviceId === syncState.deviceId || entry.id === syncState.lastAppliedId) return;
  // A local edit is newer (or still waiting to be written): local wins.
  if (writeTimer || entry.time <= syncState.lastLocalChange) return;

  let profiles;
  try {
    profiles = await loadBackup(entry);
  } catch {
    return; // chunks not fully synced yet; a later change event retries
  }
  if (canonicalJson(profiles) === canonicalJson(state.profiles)) {
    syncState.lastAppliedId = entry.id;
    await persistSyncState();
    return;
  }
  if (await isAutoSync()) {
    await applyRemote(entry, profiles);
  } else {
    await setLocal({
      [StorageKey.SYNC_PENDING]: { id: entry.id, time: entry.time, deviceName: entry.deviceName, count: entry.count },
    });
  }
}

// Applies the pending remote snapshot after the user confirmed it in the UI.
export async function applyPending() {
  const pending = (await getLocal(StorageKey.SYNC_PENDING))[StorageKey.SYNC_PENDING];
  if (!pending) return;
  const entry = await getLatestEntry();
  if (!entry || entry.id !== pending.id) {
    await removeLocal(StorageKey.SYNC_PENDING);
    return;
  }
  await applyRemote(entry, await loadBackup(entry));
}

export function registerSyncListeners(ready) {
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName !== 'sync') return;
    await ready;
    // Chunks and the index may arrive in separate change events.
    if (INDEX_KEY in changes || Object.keys(changes).some((k) => k.startsWith('mody_b_'))) checkRemote();
  });
}
