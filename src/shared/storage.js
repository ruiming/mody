export const StorageKey = {
  PROFILES: 'profiles',
  SELECTED_PROFILE: 'selectedProfile',
  IS_PAUSED: 'isPaused',
  SAVED_TO_CLOUD: 'savedToCloud',
  // Cloud sync: { autoSync } user settings, internal state, status shown in the UI,
  // and a remote update waiting for confirmation when auto sync is off.
  SYNC_SETTINGS: 'sync_settings',
  SYNC_STATE: 'sync_state',
  SYNC_STATUS: 'sync_status',
  SYNC_PENDING: 'sync_pending',
  RULE_SUCCESS: 'mody_rule_success',
};

export function getLocal(keys) {
  return chrome.storage.local.get(keys);
}

export function setLocal(items) {
  return chrome.storage.local.set(items);
}

export function removeLocal(keys) {
  return chrome.storage.local.remove(keys);
}

export function getSync(keys) {
  return chrome.storage.sync.get(keys ?? null);
}

export function setSync(items) {
  return chrome.storage.sync.set(items);
}

export function removeSync(keys) {
  return chrome.storage.sync.remove(keys);
}

export function onLocalChanged(callback) {
  const listener = (changes, areaName) => {
    if (areaName === 'local') callback(changes);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

export async function setPaused(isPaused) {
  if (isPaused) {
    await setLocal({ [StorageKey.IS_PAUSED]: true });
  } else {
    await removeLocal(StorageKey.IS_PAUSED);
  }
}

export async function saveProfiles(profiles, selectedProfile) {
  const items = { [StorageKey.PROFILES]: profiles };
  if (selectedProfile !== undefined) items[StorageKey.SELECTED_PROFILE] = selectedProfile;
  await setLocal(items);
}

// Managed (enterprise policy) profiles: ProfileJson is a JSON profile or array.
export async function getManagedProfiles() {
  try {
    const { ProfileJson } = await chrome.storage.managed.get('ProfileJson');
    if (!ProfileJson) return [];
    const parsed = JSON.parse(ProfileJson);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}
