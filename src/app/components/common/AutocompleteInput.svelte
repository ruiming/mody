<script>
  // Compact text input with datalist autocomplete and inline DNR validation.
  import { createEventDispatcher } from 'svelte';
  import { tick } from 'svelte';
  import { APPEND_ALLOWED_REQUEST_HEADERS, DNR_UNSUPPORTED_HEADERS } from '../../../shared/constants.js';
  import { isValidHeaderName } from '../../../shared/profile.js';
  import { isDomainValid, isRedirectValid, isRegexValid } from '../../validation.js';

  export let name;
  export let list = undefined;
  export let placeholder = undefined;
  export let value = '';
  export let selectAllOnFocus = false;
  export let append = false;
  export let title = undefined;
  let className = '';
  export { className as class };

  const APPEND_DOC_URL =
    'https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/declarativeNetRequest/ModifyHeaderInfo#header_limits';
  const HEADER_NAME_LISTS = ['request-autocomplete', 'respHeadersAutocomplete-name', 'response-autocomplete'];

  // Header names / values, URLs and domains read better in a monospace font.
  const MONO_NAMES = ['header-name', 'header-value', 'url-regex', 'url-request-domain', 'domain'];

  const dispatch = createEventDispatcher();
  let input;
  let tip;
  let focused = false;
  let hovered = false;
  let hideTimer;
  let message = '';
  let level = '';
  let validationId = 0;

  export function focus() {
    input?.focus();
  }

  async function computeError(text) {
    const trimmed = (text ?? '').trim();
    const isHeaderName = name === 'header-name' && HEADER_NAME_LISTS.includes(list);
    const isRequestHeaderName = name === 'header-name' && list === 'request-autocomplete';
    if (isHeaderName && DNR_UNSUPPORTED_HEADERS.includes(trimmed.toLowerCase())) {
      return ['warning', 'Due to browser restrictions, modifying the current header may fail.'];
    }
    if (isRequestHeaderName && append && !APPEND_ALLOWED_REQUEST_HEADERS.includes(trimmed.toLowerCase())) {
      return [
        'error',
        `The current header does not support append mode in the manifest V3 version. For all headers that support append mode, please <a href="${APPEND_DOC_URL}" target="_blank" style="color:white;font-weight: bold;">click here</a> to view.`,
      ];
    }
    if (isHeaderName && trimmed && !isValidHeaderName(trimmed)) {
      return ['error', 'Invalid HTTP header'];
    }
    if (list === 'urlReplacementsAutocomplete-value' && !(await isRedirectValid(text))) {
      return ['error', 'Invalid redirect value'];
    }
    if (['domain', 'url-request-domain'].includes(name) && !(await isDomainValid(trimmed))) {
      return [
        'error',
        'Incorrect domain or the current browser does not support domains containing non-ASCII characters.',
      ];
    }
    const isRegexInput = name === 'url-regex' || (name === 'header-name' && placeholder === 'Original URL');
    if (isRegexInput && !(await isRegexValid(text))) {
      return [
        'error',
        'Regular expression syntax error or the current browser does not support regular expressions containing non-ASCII characters.',
      ];
    }
    return ['', ''];
  }

  async function validate(text) {
    const id = ++validationId;
    const [newLevel, newMessage] = await computeError(text);
    if (id !== validationId) return;
    level = newLevel;
    message = newMessage;
  }

  $: if (value || append || list || name) validate(value);

  // Validation message: popover in the top layer, shown while hovered/focused.
  $: showTip = Boolean(message) && (focused || hovered);
  $: syncTip(showTip, message);

  async function syncTip(show) {
    if (!tip) return;
    clearTimeout(hideTimer);
    if (!show) {
      hideTimer = setTimeout(() => tip?.matches(':popover-open') && !tip.matches(':hover') && tip.hidePopover(), 150);
      return;
    }
    if (!tip.matches(':popover-open')) tip.showPopover();
    await tick();
    const rect = input.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    let top = rect.top - box.height - 6;
    if (top < 6) top = rect.bottom + 6;
    const left = Math.max(6, Math.min(rect.left, window.innerWidth - box.width - 6));
    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  }

  function onFocus(event) {
    focused = true;
    if (selectAllOnFocus) input.select();
    dispatch('focus', event);
  }

  function onBlur(event) {
    focused = false;
    dispatch('blur', event);
  }
</script>

<span
  class="ac-input {className}"
  class:mono={MONO_NAMES.includes(name)}
  class:has-warning={level === 'warning'}
  class:has-error={level === 'error'}
  role="presentation"
  on:mouseenter={() => (hovered = true)}
  on:mouseleave={() => (hovered = false)}
>
  <input
    bind:this={input}
    bind:value
    type="text"
    {name}
    {placeholder}
    {list}
    {title}
    autocomplete="on"
    spellcheck="false"
    data-autocomplete-color={level || undefined}
    on:input
    on:change
    on:keydown
    on:focus={onFocus}
    on:blur={onBlur}
  />
</span>
<div
  bind:this={tip}
  popover="manual"
  class="ac-tip"
  class:warning={level === 'warning'}
  role="tooltip"
  on:mouseleave={() => syncTip(showTip)}
>
  {@html message}
</div>

<style>
  .ac-input {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
  }
  .ac-input input {
    width: 100%;
    height: 28px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg);
    font-size: 13px;
    transition: background-color 0.12s, border-color 0.12s, box-shadow 0.12s;
  }
  .ac-input.mono input {
    font-family: var(--font-mono);
    font-size: 12.5px;
  }
  .ac-input input::placeholder {
    color: var(--fg-subtle);
  }
  .ac-input input:hover {
    background: var(--bg-active);
  }
  .ac-input input:focus {
    outline: none;
    background: var(--bg);
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--ring);
  }
  .ac-input.has-warning input {
    color: var(--warning);
    border-color: color-mix(in srgb, var(--warning) 45%, transparent);
    background: var(--warning-soft);
  }
  .ac-input.has-error input {
    color: var(--danger);
    border-color: color-mix(in srgb, var(--danger) 45%, transparent);
    background: var(--danger-soft);
  }
  .ac-tip {
    position: fixed;
    inset: auto;
    margin: 0;
    max-width: min(340px, calc(100vw - 12px));
    padding: 6px 9px;
    border: none;
    border-radius: var(--radius-sm);
    background: var(--danger);
    color: #fff;
    font-size: 12px;
    line-height: 1.4;
    box-shadow: var(--shadow-md);
  }
  .ac-tip.warning {
    background: var(--warning);
  }
  .ac-tip :global(a) {
    color: inherit !important;
    font-weight: 600;
  }
  :global(input[data-autocomplete-color='warning']:-webkit-autofill) {
    -webkit-text-fill-color: var(--warning) !important;
  }
  :global(input[data-autocomplete-color='error']:-webkit-autofill) {
    -webkit-text-fill-color: var(--danger) !important;
  }
</style>
