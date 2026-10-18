export async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true, windowType: 'normal' });
  return tab;
}

export function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

export function hostnameOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export function originOf(url) {
  try {
    return new URL(url).origin;
  } catch {
    return '';
  }
}
