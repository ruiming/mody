// Section definitions for modifiers and filters, in display order.
import { KNOWN_CSP_POLICIES, KNOWN_REQUEST_HEADERS, KNOWN_RESPONSE_HEADERS } from '../../data/headers.js';

export const ModifierType = {
  REQUEST_HEADER: 'request-header',
  RESPONSE_HEADER: 'response-header',
  COOKIE_MODIFIER: 'cookie-modifier',
  SET_COOKIE_MODIFIER: 'set-cookie-modifier',
  REQUEST_COOKIE_APPEND: 'request-cookie-append',
  CSP_MODIFIER: 'csp-modifier',
  URL_REPLACEMENT: 'url-replacement',
};

export const MODIFIER_SECTIONS = [
  {
    type: ModifierType.REQUEST_HEADER,
    title: 'Request headers',
    addModifierText: 'Add request header',
    nameLabel: 'Name',
    valueLabel: 'Value',
    field: 'headers',
    customAutocompleteField: 'headersAutocomplete',
    autocompleteListId: 'request-autocomplete',
    knownNames: KNOWN_REQUEST_HEADERS,
    supportAppendMode: true,
    advanced: 'header',
  },
  {
    type: ModifierType.RESPONSE_HEADER,
    title: 'Response headers',
    addModifierText: 'Add response header',
    nameLabel: 'Name',
    valueLabel: 'Value',
    field: 'respHeaders',
    customAutocompleteField: 'respHeadersAutocomplete',
    autocompleteListId: 'response-autocomplete',
    knownNames: KNOWN_RESPONSE_HEADERS,
    supportAppendMode: true,
    advanced: 'header',
  },
  // Cookie / Set-Cookie modifier sections are not enforceable under MV3 and stay hidden.
  {
    type: ModifierType.REQUEST_COOKIE_APPEND,
    title: 'Cookie request append',
    addModifierText: 'Add request cookie append item',
    nameLabel: 'Name',
    valueLabel: 'Value',
    field: 'reqCookieAppend',
    customAutocompleteField: 'cookieHeadersAutocomplete',
  },
  {
    type: ModifierType.CSP_MODIFIER,
    title: 'CSP response modifiers',
    addModifierText: 'Add CSP response modifier',
    nameLabel: 'Directive',
    valueLabel: 'Value',
    field: 'cspHeaders',
    customAutocompleteField: 'cspHeadersAutocomplete',
    autocompleteListId: 'csp-autocomplete',
    knownNames: KNOWN_CSP_POLICIES,
  },
  {
    type: ModifierType.URL_REPLACEMENT,
    title: 'Redirect URLs',
    addModifierText: 'Add redirect URL',
    nameLabel: 'Original URL',
    valueLabel: 'Redirect URL',
    field: 'urlReplacements',
    customAutocompleteField: 'urlReplacementsAutocomplete',
  },
];

export const MODIFIER_FIELDS_SHOWN = MODIFIER_SECTIONS.map((s) => s.field);

export const FILTER_SECTIONS = [
  { type: 'tabs', label: 'Tab filters', addFilterText: 'Add tab filter', field: 'tabFilters' },
  { type: 'tabGroups', label: 'Tab group filters', addFilterText: 'Add tab group filter', field: 'tabGroupFilters' },
  { type: 'windows', label: 'Window filters', addFilterText: 'Add window filter', field: 'windowFilters' },
  {
    type: 'urls',
    label: 'Request URL filters',
    addFilterText: 'Add URL filter',
    field: 'urlFilters',
    sortKey: 'urlRegex',
    sortLabel: 'URL regex',
  },
  {
    type: 'initiatorDomains',
    label: 'Request domain filters',
    addFilterText: 'Add Request domain filter',
    field: 'initiatorDomainFilters',
    sortKey: 'domain',
    sortLabel: 'Domain',
  },
  {
    type: 'types',
    label: 'Resource type filters',
    addFilterText: 'Add resource type filter',
    field: 'resourceFilters',
    sortKey: 'type',
    sortLabel: 'Type',
  },
  {
    type: 'time',
    label: 'Time filters',
    description: 'Use time filters to automatically turn off modifications after a certain time.',
    addFilterText: 'Add time filter',
    field: 'timeFilters',
  },
  {
    type: 'excludeRequestDomains',
    label: 'Exclude request domain filters',
    addFilterText: 'Add exclude request domain filter',
    field: 'excludeRequestDomainFilters',
  },
  {
    type: 'requestMethods',
    label: 'Request method filters',
    addFilterText: 'Add request method filter',
    field: 'requestMethodFilters',
  },
];

export const FILTER_FIELDS_SHOWN = FILTER_SECTIONS.map((s) => s.field);
