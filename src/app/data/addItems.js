// Entries of the "Add" dialog (Mods / Filters tabs).
import { get } from 'svelte/store';
import {
  AppWindow,
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Cookie,
  Globe,
  GlobeLock,
  Layers,
  Link,
  Link2Off,
  PanelsTopLeft,
  Route,
  Shapes,
  ShieldCheck,
  Timer,
} from 'lucide';
import { createFilter, newModifier, newUrlReplacement } from '../../shared/profile.js';
import { selectedProfile, updateProfile } from '../stores.js';

async function appendTo(field, itemPromise) {
  const item = await itemPromise;
  const profile = get(selectedProfile);
  updateProfile({ [field]: [...(profile[field] || []), item] });
}

const addModifier = (field) => () => appendTo(field, newModifier());
const addFilter = (field) => () => appendTo(field, createFilter(field));

export const MOD_ITEMS = [
  {
    id: 'add-request-header',
    text: 'Request header',
    description: 'Add, modify, or delete request header',
    icon: ArrowUpRight,
    popular: true,
    action: addModifier('headers'),
  },
  {
    id: 'add-response-header',
    text: 'Response header',
    description: 'Add, modify, or delete response header',
    icon: ArrowDownLeft,
    popular: true,
    action: addModifier('respHeaders'),
  },
  {
    id: 'add-url-replacement',
    text: 'Redirect URL',
    description: 'Redirect matching URLs to other URLs',
    icon: ArrowRightLeft,
    action: () => appendTo('urlReplacements', newUrlReplacement()),
  },
  {
    id: 'add-cookie-modifier',
    text: 'Cookie request header',
    description: 'Modify individual cookies in Cookie request header',
    icon: Cookie,
    disableText:
      'The Manifest V3 plugin API does not support modifying individual items within request cookies; it only allows for the addition of cookie sub-items (the same sub-item can be added multiple times) or the resetting of the entire cookie request header.',
    action: addModifier('cookieHeaders'),
  },
  {
    id: 'add-set-cookie-modifier',
    text: 'Set-Cookie response',
    description: 'Modify individual cookies in Set-Cookie response header',
    icon: Cookie,
    disableText: 'The Manifest V3 plugin API does not support modifying response cookies.',
    action: addModifier('setCookieHeaders'),
  },
  {
    id: 'add-csp-modifier',
    text: 'Content-Security-Policy',
    description: 'Edit and test Content-Security-Policy response header',
    icon: ShieldCheck,
    action: addModifier('cspHeaders'),
  },
  {
    id: 'add-request-cookie-append',
    text: 'Cookie request header append',
    description: 'Append individual cookies in Cookie request header',
    icon: Cookie,
    action: addModifier('reqCookieAppend'),
  },
];

export const FILTER_ITEMS = [
  {
    id: 'add-tab-filter',
    text: 'Tab filter',
    description: 'Restrict to the selected tabs',
    icon: AppWindow,
    popular: true,
    action: addFilter('tabFilters'),
  },
  {
    id: 'add-url-filter',
    text: 'Request URL filter',
    description: 'Restrict to request URLs that matches a URL regex',
    icon: Link,
    popular: true,
    action: addFilter('urlFilters'),
  },
  {
    id: 'add-initiator-domain-filter',
    text: 'Request domain filter',
    description: 'Restrict requests to the specified domains',
    icon: Globe,
    action: addFilter('initiatorDomainFilters'),
  },
  {
    id: 'add-exclude-url-filter',
    text: 'Exclude request URL filter',
    description: 'Deactivate when request URLs matches a URL regex',
    icon: Link2Off,
    disableText:
      'The Manifest v3 version of the plugin API does not support excluding links via regular expressions. Please use the "Exclude request domain filters" feature instead.',
    action: addFilter('excludeUrlFilters'),
  },
  {
    id: 'add-tab-group-filter',
    text: 'Tab group filter',
    description: 'Restrict to the selected tab group',
    icon: Layers,
    action: addFilter('tabGroupFilters'),
  },
  {
    id: 'add-window-filter',
    text: 'Window filter',
    description: 'Restrict to the selected window',
    icon: PanelsTopLeft,
    action: addFilter('windowFilters'),
  },
  {
    id: 'add-time-filter',
    text: 'Auto-off timer',
    description: 'Automatically deactivate the mods after certain time',
    icon: Timer,
    action: addFilter('timeFilters'),
  },
  {
    id: 'add-resource-filter',
    text: 'Resource filter',
    description: 'Restrict to the matching resource type',
    icon: Shapes,
    action: addFilter('resourceFilters'),
  },
  {
    id: 'add-exclude-request-domain-filter',
    text: 'Exclude request domain filter',
    description: 'Deactivate when request domain matches a domains',
    icon: GlobeLock,
    action: addFilter('excludeRequestDomainFilters'),
  },
  {
    id: 'add-request-method-filter',
    text: 'Request methods filter',
    description: 'Restrict to the matching request method',
    icon: Route,
    action: addFilter('requestMethodFilters'),
  },
];

// Disabled entries are listed last.
export const sortItems = (items) => [...items.filter((i) => !i.disableText), ...items.filter((i) => i.disableText)];
