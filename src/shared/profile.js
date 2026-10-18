import { ALL_FIELDS, PROFILE_VERSION } from './constants.js';
import { getActiveTab, hostOf, hostnameOf, originOf } from './tabs.js';

const cloneDeep = (value) => structuredClone(value);

// ---------- colors ----------

function hslToHex(h, s, l) {
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h * 12) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateBackgroundColor() {
  return hslToHex(Math.random(), Math.random(), 0.1 + Math.random() * 0.45);
}

function parseHex(hex) {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})/i.exec(hex || '');
  if (!m) return [0, 0, 0];
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

export function isLightColor(hex) {
  const [r, g, b] = parseHex(hex);
  return Math.sqrt(0.299 * r * r + 0.587 * g * g + 0.114 * b * b) > 127.5;
}

// Color for icons drawn on top of the profile background.
export function buttonColorFor(backgroundColor) {
  return isLightColor(backgroundColor) ? 'black' : 'white';
}

// ---------- profile ----------

export function lastChar(value) {
  const str = String(value ?? '');
  return str.length ? str.charAt(str.length - 1) : '0';
}

export function newModifier() {
  return { enabled: true, name: '', value: '', comment: '' };
}

function nextProfileNumber(profiles) {
  const titles = new Set(profiles.map((p) => p.title));
  let n = 1;
  while (titles.has(`Profile ${n}`)) n++;
  return n;
}

export function createProfile(profiles = []) {
  const n = nextProfileNumber(profiles);
  const profile = {
    version: PROFILE_VERSION,
    title: `Profile ${n}`,
    shortTitle: lastChar(n),
    hideComment: true,
    backgroundColor: generateBackgroundColor(),
    textColor: '#ffffff',
  };
  for (const field of ALL_FIELDS) profile[field] = [];
  profile.headers.push(newModifier());
  return profile;
}

// Normalizes a profile in place. Returns true if anything changed.
export function fixProfile(profile) {
  let changed = false;
  const setDefault = (key, value) => {
    if (profile[key] === undefined) {
      profile[key] = value;
      changed = true;
    }
  };
  setDefault('version', PROFILE_VERSION);
  setDefault('title', 'Profile');
  setDefault('hideComment', true);
  setDefault('backgroundColor', generateBackgroundColor());
  setDefault('textColor', '#ffffff');
  setDefault('shortTitle', lastChar(profile.title));
  for (const field of ALL_FIELDS) {
    if (!Array.isArray(profile[field])) {
      profile[field] = [];
      changed = true;
    }
    for (const item of profile[field]) {
      if (item && item.comment === undefined) {
        item.comment = '';
        changed = true;
      }
    }
  }
  return changed;
}

// Normalizes a list of profiles in place, adding a default profile if empty.
export function fixProfiles(profiles) {
  let changed = false;
  if (profiles.length === 0) {
    profiles.push(createProfile(profiles));
    changed = true;
  }
  for (const profile of profiles) {
    if (fixProfile(profile)) changed = true;
  }
  return changed;
}

export function exportProfile(profile, { keepStyles = false } = {}) {
  const exported = cloneDeep(profile);
  if (exported.hideComment) delete exported.hideComment;
  if (!keepStyles) {
    delete exported.backgroundColor;
    delete exported.textColor;
  }
  for (const field of ALL_FIELDS) {
    if (!exported[field] || exported[field].length === 0) {
      delete exported[field];
      continue;
    }
    for (const item of exported[field]) {
      if (!item.comment) delete item.comment;
    }
  }
  for (const key of Object.keys(exported)) {
    if (!key.endsWith('Autocomplete')) continue;
    const value = exported[key];
    if (!value?.autocompleteName?.length && !value?.autocompleteValue?.length) delete exported[key];
  }
  return exported;
}

// ---------- filter / modifier constructors (prefilled from the active tab) ----------

export async function newUrlReplacement() {
  const tab = await getActiveTab().catch(() => undefined);
  const host = tab?.url ? hostOf(tab.url) : '';
  return {
    ...newModifier(),
    name: host ? `.*://${host}/.*` : '',
    value: tab?.url ? originOf(tab.url) : '',
  };
}

export async function createFilter(field) {
  const tab = await getActiveTab().catch(() => undefined);
  const base = { enabled: true, comment: '' };
  const host = tab?.url ? hostOf(tab.url) : '';
  const hostname = tab?.url ? hostnameOf(tab.url) : '';
  switch (field) {
    case 'urlFilters':
    case 'excludeUrlFilters':
      return { ...base, urlRegex: host ? `.*://${host}/.*` : '' };
    case 'initiatorDomainFilters':
    case 'excludeRequestDomainFilters':
      return { ...base, domain: hostname };
    case 'resourceFilters':
      return { ...base, resourceType: [] };
    case 'tabFilters':
      return { ...base, tabId: tab?.id };
    case 'tabGroupFilters':
      return { ...base, groupId: tab?.groupId };
    case 'windowFilters':
      return { ...base, windowId: tab?.windowId };
    case 'timeFilters':
      return { ...base, expirationTimeMs: Date.now() + 3600 * 1000 };
    case 'requestMethodFilters':
      return { ...base, methods: [] };
    default:
      throw new Error(`Unknown filter field: ${field}`);
  }
}

// ---------- header helpers ----------

const INVALID_HEADER_CHARS = new Set('()<>@,;:\\"/[]?={}'.split(''));

export function isValidHeaderName(name) {
  if (!name) return false;
  for (const ch of name) {
    const code = ch.charCodeAt(0);
    if (code <= 32 || code >= 127 || INVALID_HEADER_CHARS.has(ch)) return false;
  }
  return true;
}

// Converts JS-style "$1" group references to the RE2 "\1" form DNR expects.
export function toRegexSubstitution(value) {
  return (value || '').replace(/(?<!\\)\$(\d+)/g, '\\$1');
}

export function serializeCsp(cspHeaders) {
  const directives = {};
  for (const item of cspHeaders) directives[item.name] = item.value;
  return Object.entries(directives)
    .map(([k, v]) => `${k} ${v}`)
    .join('; ');
}

export function isProfileActive(profile, selectedProfile) {
  return Boolean(profile.alwaysOn) || profile === selectedProfile;
}
