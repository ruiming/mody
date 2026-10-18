// In-memory copy of the persisted extension state, kept current by index.js.
export const state = {
  profiles: [],
  selectedProfile: 0,
  isPaused: false,
  managedProfiles: [],
};

// Managed profiles are always active, followed by the selected and always-on ones.
export function getActiveProfiles() {
  const { profiles, selectedProfile, managedProfiles } = state;
  return [...managedProfiles, ...profiles.filter((p, i) => i === selectedProfile || p.alwaysOn)];
}

export function getSelectedProfile() {
  return state.profiles[state.selectedProfile];
}
