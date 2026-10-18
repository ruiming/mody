// Cloud sync / backup on chrome.storage.sync.
//
// Layout (all keys prefixed to stay clear of other data):
//   mody_backups          index: [{ id, time, deviceId, deviceName, chunks, bytes, count, titles, hash }]
//                         ordered oldest -> newest
//   mody_b_<id>_<n>       base64 chunk n of the deflate-compressed profiles JSON
//
// chrome.storage.sync allows 100 KB in total and 8 KB per item, so snapshots are
// compressed and split; the oldest snapshots are evicted to make room.
import { getSync, removeSync, setSync } from './storage.js';

export const INDEX_KEY = 'mody_backups';
const CHUNK_PREFIX = 'mody_b_';
const CHUNK_CHARS = 7000;
export const MAX_BACKUPS = 20;
const QUOTA = chrome.storage.sync.QUOTA_BYTES ?? 102400;
// Leave headroom for the index itself and key/JSON overhead.
const USABLE_QUOTA = Math.floor(QUOTA * 0.9);

export class SyncTooLargeError extends Error {
  constructor(bytes) {
    super(`Profiles are too large to sync (${Math.ceil(bytes / 1024)} KB compressed, limit ~${Math.floor(USABLE_QUOTA / 1024)} KB)`);
    this.code = 'too_large';
  }
}

// ---------- encoding ----------

async function pipe(bytes, stream) {
  const response = new Response(new Blob([bytes]).stream().pipeThrough(stream));
  return new Uint8Array(await response.arrayBuffer());
}

function toBase64(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

function fromBase64(text) {
  const binary = atob(text);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encodeProfiles(profiles) {
  const json = new TextEncoder().encode(JSON.stringify(profiles));
  const base64 = toBase64(await pipe(json, new CompressionStream('deflate-raw')));
  const chunks = [];
  for (let i = 0; i < base64.length; i += CHUNK_CHARS) chunks.push(base64.slice(i, i + CHUNK_CHARS));
  return chunks;
}

export async function decodeProfiles(chunks) {
  const bytes = await pipe(fromBase64(chunks.join('')), new DecompressionStream('deflate-raw'));
  return JSON.parse(new TextDecoder().decode(bytes));
}

// JSON with sorted object keys: chrome.storage does not preserve key order, so
// plain JSON.stringify of equal data can differ between devices.
export function canonicalJson(value) {
  return JSON.stringify(value, (_, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, v[k]]))
      : v,
  );
}

export async function hashProfiles(profiles) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonicalJson(profiles)));
  return toBase64(new Uint8Array(digest)).slice(0, 22);
}

const chunkKey = (id, n) => `${CHUNK_PREFIX}${id}_${n}`;
const chunkKeys = (entry) => Array.from({ length: entry.chunks }, (_, n) => chunkKey(entry.id, n));

// ---------- index ----------

export async function listBackups() {
  const all = await getSync();
  const index = Array.isArray(all[INDEX_KEY]) ? all[INDEX_KEY] : [];
  // Snapshots written by earlier versions: plain arrays keyed by a timestamp.
  const legacy = Object.entries(all)
    .filter(([key, value]) => /^\d+$/.test(key) && Array.isArray(value))
    .map(([key, profiles]) => ({
      id: key,
      time: Number(key),
      legacy: true,
      count: profiles.length,
      titles: profiles.slice(0, 3).map((p) => p.title),
      profiles,
    }));
  return [...index, ...legacy].sort((a, b) => a.time - b.time);
}

export async function getLatestEntry() {
  const backups = await listBackups();
  return backups[backups.length - 1];
}

export async function loadBackup(entry) {
  if (entry.legacy) return entry.profiles;
  const keys = chunkKeys(entry);
  const items = await getSync(keys);
  const chunks = keys.map((key) => items[key]);
  if (chunks.some((c) => typeof c !== 'string')) throw new Error('Backup is incomplete (still syncing?)');
  return decodeProfiles(chunks);
}

export async function deleteBackups(entries) {
  const index = (await getSync(INDEX_KEY))[INDEX_KEY] || [];
  const ids = new Set(entries.map((e) => e.id));
  const keys = entries.flatMap((e) => (e.legacy ? [e.id] : chunkKeys(e)));
  await setSync({ [INDEX_KEY]: index.filter((e) => !ids.has(e.id)) });
  if (keys.length) await removeSync(keys);
}

// ---------- writing ----------

export function describeDevice() {
  const platform = navigator.userAgentData?.platform || navigator.platform || 'Unknown';
  const brand =
    navigator.userAgentData?.brands?.find((b) => !/not.a.brand|chromium/i.test(b.brand))?.brand || 'Chrome';
  return `${brand} · ${platform}`;
}

// Writes a snapshot unless it matches the newest one. Returns the new index
// entry, or undefined when nothing was written.
export async function writeBackup(profiles, { deviceId, deviceName = describeDevice() } = {}) {
  const hash = await hashProfiles(profiles);
  const backups = await listBackups();
  const latest = backups[backups.length - 1];
  if (latest?.hash === hash) return undefined;
  if (latest?.legacy && canonicalJson(latest.profiles) === canonicalJson(profiles)) return undefined;

  const chunks = await encodeProfiles(profiles);
  const bytes = chunks.reduce((sum, c) => sum + c.length + 40, 0);
  if (bytes > USABLE_QUOTA) throw new SyncTooLargeError(bytes);

  const id = String(Date.now());
  const entry = {
    id,
    time: Number(id),
    deviceId,
    deviceName,
    chunks: chunks.length,
    bytes,
    count: profiles.length,
    titles: profiles.slice(0, 3).map((p) => String(p.title ?? '').slice(0, 40)),
    hash,
  };

  // Evict legacy snapshots first, then the oldest ones, until the new one fits.
  const kept = backups.filter((b) => !b.legacy);
  const evict = backups.filter((b) => b.legacy);
  const sizeOf = (b) => b.bytes ?? 0;
  let used = kept.reduce((sum, b) => sum + sizeOf(b), 0);
  while (kept.length && (kept.length >= MAX_BACKUPS || used + bytes > USABLE_QUOTA)) {
    const oldest = kept.shift();
    used -= sizeOf(oldest);
    evict.push(oldest);
  }
  if (evict.length) await deleteBackups(evict);

  const items = { [INDEX_KEY]: [...kept, entry] };
  chunks.forEach((chunk, n) => (items[chunkKey(id, n)] = chunk));
  await setSync(items);
  return entry;
}

export async function syncUsage() {
  try {
    return await chrome.storage.sync.getBytesInUse(null);
  } catch {
    return undefined;
  }
}

export const SYNC_QUOTA_BYTES = QUOTA;
