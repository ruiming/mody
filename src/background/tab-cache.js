// tabId -> {tabId, url, groupId, windowId}; used to expand tab group / window filters.
export const tabCache = new Map();

function snapshot() {
  return JSON.stringify([...tabCache.values()].map((t) => [t.tabId, t.groupId, t.windowId]));
}

// Refreshes the cache. Returns true if any tab's group or window changed.
export async function refreshTabCache() {
  const before = snapshot();
  const tabs = await chrome.tabs.query({});
  tabCache.clear();
  for (const tab of tabs) {
    tabCache.set(tab.id, { tabId: tab.id, url: tab.url, groupId: tab.groupId, windowId: tab.windowId });
  }
  return snapshot() !== before;
}
