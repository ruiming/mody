// Service worker entry point. All listeners are registered synchronously at the
// top level so that events wake the worker correctly.
import { isEqual } from 'lodash-es';
import { ALARM_TIME_FILTER } from '../shared/constants.js';
import { fixProfile, fixProfiles } from '../shared/profile.js';
import { getLocal, getManagedProfiles, onLocalChanged, saveProfiles, setLocal, StorageKey } from '../shared/storage.js';
import { getLatestEntry, loadBackup } from '../shared/cloud.js';
import { MessageType } from '../shared/messages.js';
import { applyPending, checkRemote, onLocalProfilesChanged, registerSyncListeners, syncNow } from './sync.js';
import { updateBadge } from './badge.js';
import { createContextMenu, registerMenuAndCommandListeners, updateContextMenu } from './menus.js';
import { updateRules } from './rules.js';
import { state } from './state.js';
import { refreshTabCache } from './tab-cache.js';

async function loadState() {
  const stored = await getLocal([StorageKey.PROFILES, StorageKey.SELECTED_PROFILE, StorageKey.IS_PAUSED]);
  let profiles = stored[StorageKey.PROFILES];
  let needsSave = false;

  if (!Array.isArray(profiles)) {
    // Fresh install (or cleared storage): restore the latest cloud backup if any.
    const latest = await getLatestEntry().catch(() => undefined);
    const backup = latest ? await loadBackup(latest).catch(() => undefined) : undefined;
    profiles = Array.isArray(backup) ? backup : [];
    if (backup) await setLocal({ [StorageKey.SAVED_TO_CLOUD]: true });
    needsSave = true;
  }
  if (fixProfiles(profiles)) needsSave = true;

  let selected = stored[StorageKey.SELECTED_PROFILE];
  if (!Number.isInteger(selected) || selected < 0 || selected >= profiles.length) {
    selected = profiles.length - 1;
    needsSave = true;
  }

  state.profiles = profiles;
  state.selectedProfile = selected;
  state.isPaused = stored[StorageKey.IS_PAUSED] === true;
  state.managedProfiles = await getManagedProfiles();
  state.managedProfiles.forEach(fixProfile);

  if (needsSave) await saveProfiles(profiles, selected);
}

function refreshDerivedState() {
  updateRules();
  updateBadge();
  updateContextMenu();
}

const ready = (async () => {
  await loadState();
  await refreshTabCache().catch(() => {});
  createContextMenu();
  refreshDerivedState();
  checkRemote().catch(() => {});
})();

onLocalChanged(async (changes) => {
  await ready;
  if (changes[StorageKey.SYNC_SETTINGS]?.newValue?.autoSync !== false && StorageKey.SYNC_SETTINGS in changes) {
    checkRemote().catch(() => {});
  }

  const profilesChange = changes[StorageKey.PROFILES];
  if (profilesChange) {
    const profiles = Array.isArray(profilesChange.newValue) ? structuredClone(profilesChange.newValue) : [];
    if (fixProfiles(profiles)) {
      // Write the normalized list back; this listener fires again with it.
      await saveProfiles(profiles);
      return;
    }
  }

  let relevant = false;
  if (profilesChange) {
    relevant = true;
    state.profiles = profilesChange.newValue;
  }
  if (StorageKey.SELECTED_PROFILE in changes) {
    relevant = true;
    const selected = changes[StorageKey.SELECTED_PROFILE].newValue;
    state.selectedProfile = Number.isInteger(selected) ? selected : 0;
  }
  if (StorageKey.IS_PAUSED in changes) {
    relevant = true;
    state.isPaused = changes[StorageKey.IS_PAUSED].newValue === true;
  }
  if (!relevant) return;
  if (state.selectedProfile >= state.profiles.length) state.selectedProfile = state.profiles.length - 1;
  refreshDerivedState();
  if (profilesChange && !isEqual(profilesChange.oldValue, profilesChange.newValue)) {
    onLocalProfilesChanged(state.profiles);
  }
});

chrome.storage.onChanged.addListener(async (changes, areaName) => {
  if (areaName !== 'managed') return;
  await ready;
  state.managedProfiles = await getManagedProfiles();
  state.managedProfiles.forEach(fixProfile);
  refreshDerivedState();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  await ready;
  if (alarm.name === ALARM_TIME_FILTER) updateRules();
});

// Tab group / window filters depend on which tabs belong to which group/window.
async function onTabsChanged() {
  await ready;
  if (await refreshTabCache().catch(() => false)) updateRules();
}
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'complete' || 'groupId' in changeInfo) onTabsChanged();
});
chrome.tabs.onAttached.addListener(onTabsChanged);
chrome.tabs.onRemoved.addListener(onTabsChanged);

registerMenuAndCommandListeners();
registerSyncListeners(ready);

const syncHandlers = {
  [MessageType.SYNC_NOW]: () => syncNow(),
  [MessageType.APPLY_PENDING_SYNC]: () => applyPending(),
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const syncHandler = message && syncHandlers[message.type];
  if (syncHandler) {
    ready
      .then(syncHandler)
      .then(() => sendResponse({ ok: true }), (e) => sendResponse({ error: String(e?.message || e) }));
    return true;
  }
  return false;
});
