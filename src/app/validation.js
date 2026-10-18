// Checks whether values are accepted by declarativeNetRequest. Results are
// cached; trial session rules are installed one at a time and removed right away.
import { VALIDATION_RULE_IDS } from '../shared/constants.js';
import { toRegexSubstitution } from '../shared/profile.js';

const dnr = globalThis.chrome?.declarativeNetRequest;
const caches = { regex: new Map(), domain: new Map(), redirect: new Map() };
let queue = Promise.resolve();

function serialize(task) {
  const result = queue.then(task, task);
  queue = result.catch(() => {});
  return result;
}

async function tryRule(rule) {
  try {
    await dnr.updateSessionRules({ removeRuleIds: [rule.id], addRules: [rule] });
    return true;
  } catch {
    return false;
  } finally {
    await dnr.updateSessionRules({ removeRuleIds: [rule.id] }).catch(() => {});
  }
}

function cached(kind, value, check) {
  const cache = caches[kind];
  if (!cache.has(value)) cache.set(value, check(value));
  return cache.get(value);
}

function isValidJsRegex(value) {
  try {
    new RegExp(value);
    return true;
  } catch {
    return false;
  }
}

export function isRegexValid(regex) {
  if (!regex) return Promise.resolve(true);
  if (!dnr?.isRegexSupported) return Promise.resolve(isValidJsRegex(regex));
  return cached('regex', regex, async (value) => {
    try {
      const result = await dnr.isRegexSupported({ regex: value });
      return result.isSupported;
    } catch {
      return false;
    }
  });
}

export function isDomainValid(domain) {
  if (!domain || !dnr) return Promise.resolve(true);
  return cached('domain', domain, (value) =>
    serialize(() =>
      tryRule({
        id: VALIDATION_RULE_IDS.DOMAIN,
        action: {
          type: 'modifyHeaders',
          requestHeaders: [{ header: 'x-mody-validation', operation: 'remove' }],
        },
        condition: { resourceTypes: ['image'], requestDomains: [value] },
      }),
    ),
  );
}

export function isRedirectValid(substitution) {
  if (!substitution || !dnr) return Promise.resolve(true);
  return cached('redirect', substitution, (value) =>
    serialize(() =>
      tryRule({
        id: VALIDATION_RULE_IDS.REDIRECT,
        priority: 99,
        action: { type: 'redirect', redirect: { regexSubstitution: toRegexSubstitution(value) } },
        condition: {
          regexFilter: `.*://www.example666666666.com/${'(.*?)/'.repeat(9)}(.*?)`,
          resourceTypes: ['main_frame'],
        },
      }),
    ),
  );
}
