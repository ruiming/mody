export const PROFILE_VERSION = 2;

export const MODIFIER_FIELDS = [
  'headers',
  'respHeaders',
  'urlReplacements',
  'cookieHeaders',
  'setCookieHeaders',
  'cspHeaders',
  'reqCookieAppend',
];

export const FILTER_FIELDS = [
  'urlFilters',
  'initiatorDomainFilters',
  'excludeUrlFilters',
  'resourceFilters',
  'tabFilters',
  'tabGroupFilters',
  'windowFilters',
  'timeFilters',
  'excludeRequestDomainFilters',
  'requestMethodFilters',
];

export const ALL_FIELDS = [...MODIFIER_FIELDS, ...FILTER_FIELDS];

// Fields counted for the action badge.
export const BADGE_COUNT_FIELDS = [
  'headers',
  'respHeaders',
  'cookieHeaders',
  'setCookieHeaders',
  'cspHeaders',
  'urlReplacements',
];

export const AppendMode = {
  APPEND: 'append',
  COMMA: 'comma',
};

export const ALL_RESOURCE_TYPES = [
  'main_frame',
  'sub_frame',
  'stylesheet',
  'script',
  'image',
  'font',
  'object',
  'xmlhttprequest',
  'ping',
  'csp_report',
  'media',
  'websocket',
  'webtransport',
  'webbundle',
  'other',
];

// Resource types offered in the resource filter UI, with display names.
export const RESOURCE_TYPE_NAMES = {
  main_frame: 'Main Frame',
  sub_frame: 'Sub Frame',
  stylesheet: 'Stylesheet',
  image: 'Image',
  font: 'Font',
  object: 'Object',
  xmlhttprequest: 'XmlHttpRequest',
  ping: 'Ping',
  csp_report: 'CSP Report',
  media: 'Media',
  websocket: 'Web Socket',
  other: 'Other',
};

export const REQUEST_METHODS = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS', 'HEAD', 'CONNECT', 'TRACE'];

// Request headers that declarativeNetRequest allows the "append" operation on.
export const APPEND_ALLOWED_REQUEST_HEADERS = [
  'accept',
  'accept-encoding',
  'accept-language',
  'access-control-request-headers',
  'cache-control',
  'connection',
  'content-language',
  'cookie',
  'forwarded',
  'if-match',
  'if-none-match',
  'keep-alive',
  'range',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'user-agent',
  'via',
  'want-digest',
  'x-forwarded-for',
];

// Headers that declarativeNetRequest refuses or handles unreliably.
export const DNR_UNSUPPORTED_HEADERS = ['host', 'set-cookie', 'set-cookie2', 'clear-site-data'];

export const DEFAULT_WARNING_COLOR = '#e6a900';
export const MAX_CLOUD_BACKUPS = 20;

export const ALARM_TIME_FILTER = 'checkTimeFilterAlarm';
export const CONTEXT_MENU_PAUSE = 'pause';

// Rule id ranges.
export const VALIDATION_RULE_IDS = {
  REDIRECT: 5000,
  DOMAIN: 777771,
  REGEX: 777772,
};
