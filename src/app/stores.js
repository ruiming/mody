// UI state layer shared by the popup and the options page.
import { derived, get, writable } from 'svelte/store';
import { isEqual, orderBy, throttle } from 'lodash-es';
import { buttonColorFor, createProfile, fixProfiles } from '../shared/profile.js';
import { getLocal, getManagedProfiles, saveProfiles, setPaused, StorageKey } from '../shared/storage.js';

const cloneDeep = (value) => structuredClone(value);

export const profiles = writable([]);
export const selectedProfileIndex = writable(0);
export const isPaused = writable(false);
export const isInitialized = writable(false);
export const managedProfiles = writable([]);

export const selectedProfile = derived(
  [profiles, selectedProfileIndex],
  ([$profiles, $index]) => $profiles[$index] ?? $profiles[0],
);
export const buttonColor = derived(selectedProfile, ($profile) => buttonColorFor($profile?.backgroundColor));

// UI-only state.
export const isFullscreen = writable(false);
export const showExportDialog = writable(false);
export const showImportDialog = writable(false);
export const showCloudBackupDialog = writable(false);
// 'mods' | 'filters' | undefined (closed)
export const addDialogTab = writable(undefined);

// ---------- toast ----------

export const toast = writable({ message: '', canUndo: false, id: 0 });

export function showToast(message, { canUndo = false } = {}) {
  toast.update((t) => ({ message, canUndo, id: t.id + 1 }));
}

export function clearToast() {
  toast.update((t) => ({ ...t, message: '', canUndo: false }));
}

// ---------- undo ----------

const undoStack = writable([]);
export const canUndo = derived(undoStack, ($stack) => $stack.length > 1);
let committing = false;

function currentSnapshot() {
  return {
    profiles: cloneDeep(get(profiles)),
    selectedProfileIndex: get(selectedProfileIndex),
    isPaused: get(isPaused),
  };
}

function pushSnapshot() {
  if (!get(isInitialized) || committing) return;
  const snapshot = currentSnapshot();
  undoStack.update((stack) => {
    if (stack.length && isEqual(stack[stack.length - 1], snapshot)) return stack;
    return [...stack, snapshot];
  });
}

function commitData({ newProfiles, newIndex, newIsPaused }) {
  committing = true;
  try {
    if (newProfiles !== undefined) profiles.set(newProfiles);
    if (newIndex !== undefined) {
      const length = get(profiles).length;
      selectedProfileIndex.set(Math.max(0, Math.min(newIndex, length - 1)));
    }
    if (newIsPaused !== undefined) isPaused.set(newIsPaused);
  } finally {
    committing = false;
  }
  pushSnapshot();
}

export function undo() {
  const current = currentSnapshot();
  const stack = [...get(undoStack)];
  let target;
  while (stack.length) {
    const top = stack.pop();
    if (!isEqual(top, current)) {
      target = top;
      break;
    }
  }
  undoStack.set(stack);
  if (!target) return;
  commitData({
    newProfiles: cloneDeep(target.profiles),
    newIndex: target.selectedProfileIndex,
    newIsPaused: target.isPaused,
  });
  clearToast();
}

// ---------- persistence ----------

const persistProfiles = throttle(
  () => {
    if (!get(isInitialized)) return;
    saveProfiles(get(profiles), get(selectedProfileIndex));
  },
  500,
  { leading: true, trailing: true },
);

// Writes any pending throttled save immediately (e.g. when the popup closes).
export function flushProfiles() {
  persistProfiles.flush();
}

profiles.subscribe(() => {
  pushSnapshot();
  persistProfiles();
});
selectedProfileIndex.subscribe(() => {
  pushSnapshot();
  persistProfiles();
});
isPaused.subscribe((value) => {
  pushSnapshot();
  if (get(isInitialized)) setPaused(value);
});

export async function loadFromStorage() {
  const stored = await getLocal([StorageKey.PROFILES, StorageKey.SELECTED_PROFILE, StorageKey.IS_PAUSED]);
  const loadedProfiles = Array.isArray(stored.profiles) ? stored.profiles : [];
  fixProfiles(loadedProfiles);
  managedProfiles.set(await getManagedProfiles());
  const newIndex = Number.isInteger(stored.selectedProfile) ? stored.selectedProfile : 0;
  // Avoid writing back identical data (and spurious undo entries) on refocus.
  const unchanged =
    get(isInitialized) &&
    isEqual(loadedProfiles, get(profiles)) &&
    newIndex === get(selectedProfileIndex) &&
    Boolean(stored.isPaused) === get(isPaused);
  if (unchanged) return;
  commitData({ newProfiles: loadedProfiles, newIndex, newIsPaused: Boolean(stored.isPaused) });
  isInitialized.set(true);
  pushSnapshot();
}

// ---------- profile operations ----------

export function selectProfile(index) {
  selectedProfileIndex.set(index);
}

// Shallow-merges `patch` into the selected profile if any field actually changes.
export function updateProfile(patch) {
  const list = get(profiles);
  const index = get(selectedProfileIndex);
  const profile = list[index];
  if (!profile) return;
  const changed = Object.keys(patch).some((key) => !isEqual(profile[key], patch[key]));
  if (!changed) return;
  const newProfiles = [...list];
  newProfiles[index] = { ...cloneDeep(profile), ...cloneDeep(patch) };
  profiles.set(newProfiles);
}

export function addProfile() {
  const list = get(profiles);
  const newProfiles = [...list, createProfile(list)];
  commitData({ newProfiles, newIndex: newProfiles.length - 1 });
}

export function removeProfile(index) {
  const newProfiles = [...get(profiles)];
  newProfiles.splice(index, 1);
  if (newProfiles.length === 0) newProfiles.push(createProfile(newProfiles));
  commitData({ newProfiles, newIndex: newProfiles.length - 1 });
  showToast('Profile deleted', { canUndo: true });
}

export function cloneProfile(profile) {
  const copy = cloneDeep(profile);
  copy.title = `Copy of ${profile.title}`;
  const newProfiles = [...get(profiles), copy];
  commitData({ newProfiles, newIndex: newProfiles.length - 1 });
  showToast('Profile cloned', { canUndo: true });
}

export function sortProfiles(order) {
  const selected = get(selectedProfile);
  const newProfiles = orderBy(get(profiles), [(p) => p.title], [order]);
  commitData({ newProfiles, newIndex: Math.max(0, newProfiles.indexOf(selected)) });
}

export function swapProfile(from, to) {
  const newProfiles = [...get(profiles)];
  if (to < 0 || to >= newProfiles.length) return;
  [newProfiles[from], newProfiles[to]] = [newProfiles[to], newProfiles[from]];
  commitData({ newProfiles, newIndex: to });
}

export function importProfiles(imported) {
  const list = cloneDeep(imported);
  fixProfiles(list);
  const newProfiles = [...get(profiles), ...list];
  commitData({ newProfiles, newIndex: newProfiles.length - 1 });
  showToast(`Imported profiles: ${list.map((p) => p.title).join(', ')}`, { canUndo: true });
}

export function restoreToProfiles(restored) {
  const list = cloneDeep(restored);
  fixProfiles(list);
  commitData({ newProfiles: list, newIndex: 0 });
  showToast('Profiles restored', { canUndo: true });
}

export function setIsPaused(value) {
  isPaused.set(value);
}

export function setAlwaysOn(index, alwaysOn) {
  const newProfiles = [...get(profiles)];
  if (!newProfiles[index]) return;
  newProfiles[index] = { ...newProfiles[index], alwaysOn };
  profiles.set(newProfiles);
}
