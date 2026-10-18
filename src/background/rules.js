import {
  ALARM_TIME_FILTER,
  ALL_RESOURCE_TYPES,
  APPEND_ALLOWED_REQUEST_HEADERS,
} from '../shared/constants.js';
import { MessageType } from '../shared/messages.js';
import { isValidHeaderName, serializeCsp, toRegexSubstitution } from '../shared/profile.js';
import { setLocal, StorageKey } from '../shared/storage.js';
import { getActiveProfiles, state } from './state.js';
import { tabCache } from './tab-cache.js';

const enabledItems = (list) => (list || []).filter((item) => item && item.enabled);
const namedItems = (list) => enabledItems(list).filter((item) => item.name);
const uniq = (list) => [...new Set(list)];

function isValidJsRegex(source) {
  try {
    new RegExp(source);
    return true;
  } catch {
    return false;
  }
}

function hostnameOf(value) {
  const trimmed = (value || '').trim();
  if (!trimmed) return trimmed;
  const withScheme = /^[a-zA-Z]+:\/\//.test(trimmed) ? trimmed : `http://${trimmed}`;
  try {
    return new URL(withScheme).hostname;
  } catch {
    return trimmed;
  }
}

function headerOperation(item, isRequest) {
  const header = item.name.toLowerCase().trim();
  if (!item.sendEmptyHeader && !item.value) return { header, operation: 'remove' };
  if (item.appendMode && (!isRequest || APPEND_ALLOWED_REQUEST_HEADERS.includes(header))) {
    return { header, operation: 'append', value: item.value };
  }
  return { header, operation: 'set', value: item.value };
}

function headerOperations(list, isRequest) {
  return namedItems(list)
    .filter((item) => isValidHeaderName(item.name.trim()))
    .map((item) => headerOperation(item, isRequest));
}

// Partial rules (action + optional own condition) for one profile's modifiers.
function buildActions(profile) {
  const actions = [];
  const requestHeaders = [
    ...headerOperations(profile.headers, true),
    ...namedItems(profile.reqCookieAppend).map((item) => ({
      header: 'cookie',
      operation: 'append',
      value: `${item.name}=${item.value}`,
    })),
  ];
  const responseHeaders = headerOperations(profile.respHeaders, false);
  if (requestHeaders.length || responseHeaders.length) {
    const action = { type: 'modifyHeaders' };
    if (requestHeaders.length) action.requestHeaders = requestHeaders;
    if (responseHeaders.length) action.responseHeaders = responseHeaders;
    actions.push({ action });
  }

  for (const item of namedItems(profile.urlReplacements)) {
    const regexFilter = item.name.trim();
    if (!isValidJsRegex(regexFilter)) continue;
    actions.push({
      action: { type: 'redirect', redirect: { regexSubstitution: toRegexSubstitution((item.value || '').trim()) } },
      condition: { resourceTypes: ALL_RESOURCE_TYPES, regexFilter },
    });
  }

  const csp = namedItems(profile.cspHeaders);
  if (csp.length) {
    actions.push({
      action: {
        type: 'modifyHeaders',
        responseHeaders: [{ header: 'content-security-policy', operation: 'set', value: serializeCsp(csp) }],
      },
      condition: { resourceTypes: ALL_RESOURCE_TYPES },
    });
  }
  return actions;
}

// Shared condition derived from the profile's filters. Returns null when the
// profile's tab/group/window filters match no existing tab (rules must not apply).
function buildCondition(profile) {
  const condition = {};

  const excluded = uniq(enabledItems(profile.excludeRequestDomainFilters).map((f) => hostnameOf(f.domain))).filter(Boolean);
  if (excluded.length) condition.excludedRequestDomains = excluded;

  const domains = uniq(enabledItems(profile.initiatorDomainFilters).map((f) => hostnameOf(f.domain))).filter(Boolean);
  if (domains.length) condition.requestDomains = domains;

  const methods = uniq(enabledItems(profile.requestMethodFilters).flatMap((f) => f.methods || [])).map((m) =>
    m.toLowerCase(),
  );
  if (methods.length) condition.requestMethods = uniq(methods);

  const resourceTypes = uniq(enabledItems(profile.resourceFilters).flatMap((f) => f.resourceType || []));
  condition.resourceTypes = resourceTypes.length ? resourceTypes : ALL_RESOURCE_TYPES;

  const tabFilters = enabledItems(profile.tabFilters);
  const groupIds = new Set(enabledItems(profile.tabGroupFilters).map((f) => f.groupId));
  const windowIds = new Set(enabledItems(profile.windowFilters).map((f) => f.windowId));
  if (tabFilters.length || groupIds.size || windowIds.size) {
    const tabIds = tabFilters.map((f) => f.tabId);
    for (const tab of tabCache.values()) {
      if (groupIds.has(tab.groupId) || windowIds.has(tab.windowId)) tabIds.push(tab.tabId);
    }
    const valid = uniq(tabIds.filter((id) => Number.isInteger(id) && id >= 0));
    if (!valid.length) return null;
    condition.tabIds = valid;
  }
  return condition;
}

function urlRegexes(profile) {
  return enabledItems(profile.urlFilters)
    .map((f) => (f.urlRegex || '').trim())
    .filter((source) => source && isValidJsRegex(source));
}

export function buildProfileRules(profile) {
  const condition = buildCondition(profile);
  if (!condition) return [];
  const regexes = urlRegexes(profile);
  const rules = [];
  for (const { action, condition: own } of buildActions(profile)) {
    // A redirect carries its own regexFilter, which would override every URL
    // filter anyway, so it is emitted once instead of once per URL filter.
    if (!regexes.length || own?.regexFilter) {
      rules.push({ action: structuredClone(action), condition: { ...structuredClone(condition), ...own } });
      continue;
    }
    for (const regexFilter of regexes) {
      rules.push({ action: structuredClone(action), condition: { ...structuredClone(condition), regexFilter, ...own } });
    }
  }
  return rules;
}

function isProfileExpired(profile, now) {
  const timeFilters = enabledItems(profile.timeFilters);
  return timeFilters.length > 0 && !timeFilters.every((f) => f.expirationTimeMs > now);
}

function broadcast(message) {
  chrome.runtime.sendMessage(message).catch(() => {});
}

async function scheduleTimeFilterAlarm(now) {
  await chrome.alarms.clear(ALARM_TIME_FILTER);
  const expirations = getActiveProfiles()
    .flatMap((p) => enabledItems(p.timeFilters))
    .map((f) => f.expirationTimeMs)
    .filter((t) => t > now);
  if (expirations.length) chrome.alarms.create(ALARM_TIME_FILTER, { when: Math.min(...expirations) });
}

async function applyRules() {
  const now = Date.now();
  const existing = await chrome.declarativeNetRequest.getSessionRules();
  const oldIds = existing.map((r) => r.id);
  const usedIds = new Set(oldIds);

  const rules = state.isPaused
    ? []
    : getActiveProfiles()
        .filter((p) => !isProfileExpired(p, now))
        .flatMap(buildProfileRules);
  let nextId = 1;
  for (const rule of rules) {
    while (usedIds.has(nextId)) nextId++;
    rule.id = nextId++;
    usedIds.add(rule.id);
  }
  const addRules = rules;

  let error;
  try {
    await chrome.declarativeNetRequest.updateSessionRules({ addRules });
  } catch (e) {
    // Fall back to adding rules one by one so a single invalid rule does not
    // disable every modification.
    const errors = [];
    for (const rule of addRules) {
      try {
        await chrome.declarativeNetRequest.updateSessionRules({ addRules: [rule] });
      } catch (ruleError) {
        errors.push(String(ruleError?.message || ruleError));
      }
    }
    error = uniq(errors).join('\n') || String(e?.message || e);
  }
  await chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: oldIds });

  if (error) {
    broadcast({ type: MessageType.UPDATE_RULES_ERROR, error });
    await setLocal({ [StorageKey.RULE_SUCCESS]: false });
  } else {
    broadcast({ type: MessageType.UPDATE_RULES_SUCCESS });
    await setLocal({ [StorageKey.RULE_SUCCESS]: true });
  }
  await scheduleTimeFilterAlarm(now);
}

// Serializes rebuilds; concurrent requests collapse into one trailing rebuild.
let running = null;
let pending = false;

export function updateRules() {
  if (running) {
    pending = true;
    return running;
  }
  running = (async () => {
    try {
      do {
        pending = false;
        await applyRules().catch((e) => console.error('Failed to update rules', e));
      } while (pending);
    } finally {
      running = null;
    }
  })();
  return running;
}
