import { BADGE_COUNT_FIELDS } from '../shared/constants.js';
import { getActiveProfiles, getSelectedProfile, state } from './state.js';

let lastBadge;

function countActiveModifiers() {
  let count = 0;
  for (const profile of getActiveProfiles()) {
    for (const field of BADGE_COUNT_FIELDS) {
      count += (profile[field] || []).filter((item) => item?.enabled && item.name).length;
    }
  }
  return count;
}

function computeBadge() {
  if (state.isPaused) return { icon: '/images/icon_bw.png', text: '❚❚', color: '#666' };
  const count = countActiveModifiers();
  if (count === 0) return { icon: '/images/icon_bw.png', text: '', color: '#fff' };
  return {
    icon: '/images/icon.png',
    text: String(count),
    color: getSelectedProfile()?.backgroundColor || '#1976d2',
  };
}

export async function updateBadge() {
  const badge = computeBadge();
  const key = JSON.stringify(badge);
  if (key === lastBadge) return;
  lastBadge = key;
  try {
    await Promise.all([
      chrome.action.setIcon({ path: badge.icon }),
      chrome.action.setBadgeText({ text: badge.text }),
      chrome.action.setBadgeBackgroundColor({ color: badge.color }),
    ]);
  } catch (e) {
    lastBadge = undefined;
    console.error('Failed to update badge', e);
  }
}
