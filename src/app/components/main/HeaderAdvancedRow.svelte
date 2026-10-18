<script>
  // Behavior chips under a request/response header row.
  import { createEventDispatcher } from 'svelte';
  import { AppendMode } from '../../../shared/constants.js';
  import { newModifier } from '../../../shared/profile.js';
  import { KNOWN_REQUEST_HEADER_SET, KNOWN_RESPONSE_HEADER_SET } from '../../data/headers.js';
  import { selectedProfile, showToast, updateProfile } from '../../stores.js';
  import Chip from '../common/Chip.svelte';
  import { ModifierType } from './sections.js';

  export let modifier;
  export let modifierIndex;
  export let modifierType;
  export let unchecked = false;

  const dispatch = createEventDispatcher();

  $: lowerName = (modifier.name || '').trim().toLowerCase();
  $: isRequest = modifierType === ModifierType.REQUEST_HEADER;
  $: isResponse = modifierType === ModifierType.RESPONSE_HEADER;
  $: suggestResponse =
    isRequest && !KNOWN_REQUEST_HEADER_SET.has(lowerName) && KNOWN_RESPONSE_HEADER_SET.has(lowerName);
  $: suggestRequest =
    isResponse && KNOWN_REQUEST_HEADER_SET.has(lowerName) && !KNOWN_RESPONSE_HEADER_SET.has(lowerName);
  $: suggestCsp = isResponse && lowerName === 'content-security-policy';

  function change(patch) {
    dispatch('change', { ...modifier, ...patch });
  }

  function toggleSendEmpty() {
    const sendEmptyHeader = !modifier.sendEmptyHeader;
    change({ sendEmptyHeader });
    showToast(
      sendEmptyHeader
        ? `"${modifier.name}" header will be sent as empty value`
        : `"${modifier.name}" header will be removed if found`,
    );
  }

  function toggleAppendMode() {
    change({ appendMode: modifier.appendMode === AppendMode.APPEND ? AppendMode.COMMA : AppendMode.APPEND });
  }

  function clearAppendMode() {
    const { appendMode, ...rest } = modifier;
    dispatch('change', rest);
  }

  const without = (list, index) => list.filter((_, i) => i !== index);

  function convertToResponse() {
    updateProfile({
      headers: without($selectedProfile.headers, modifierIndex),
      respHeaders: [...$selectedProfile.respHeaders, modifier],
    });
  }

  function convertToRequest() {
    updateProfile({
      respHeaders: without($selectedProfile.respHeaders, modifierIndex),
      headers: [...$selectedProfile.headers, modifier],
    });
  }

  function useCspEditor() {
    const directives = [];
    for (const part of (modifier.value || '').split(';')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const space = trimmed.indexOf(' ');
      directives.push({
        enabled: modifier.enabled,
        name: space >= 0 ? trimmed.slice(0, space) : trimmed,
        value: space >= 0 ? trimmed.slice(space + 1) : '',
        comment: modifier.comment || '',
      });
    }
    if (directives.length === 0) directives.push(newModifier());
    updateProfile({
      respHeaders: without($selectedProfile.respHeaders, modifierIndex),
      cspHeaders: [...$selectedProfile.cspHeaders, ...directives],
    });
  }
</script>

{#if modifier.name}
  <div class="mh-sub-row" class:unchecked>
    {#if !modifier.value}
      <Chip
        fieldName="send-empty-header"
        tooltip={modifier.sendEmptyHeader
          ? 'Header will be replaced with empty value instead of removed. Click to change behavior'
          : 'Header will be removed if found. Enter a value to override header value. Click to change behavior'}
        on:click={toggleSendEmpty}
      >
        Empty header: {modifier.sendEmptyHeader ? 'send empty value' : 'remove'}
      </Chip>
    {/if}
    {#if modifier.appendMode}
      <Chip fieldName="append-mode" trailingAction="close" on:click={toggleAppendMode} on:close={clearAppendMode}>
        {modifier.appendMode === AppendMode.APPEND ? 'append value' : 'append with comma separated'}
      </Chip>
    {/if}
    {#if suggestResponse}
      <Chip fieldName="convert-to-response-header" trailingAction="action" on:click={convertToResponse}>
        Convert to response header
      </Chip>
    {/if}
    {#if suggestRequest}
      <Chip fieldName="convert-to-request-header" trailingAction="action" on:click={convertToRequest}>
        Convert to request header
      </Chip>
    {/if}
    {#if suggestCsp}
      <Chip fieldName="use-advanced-content-security-policy" trailingAction="action" on:click={useCspEditor}>
        Use advanced CSP editor
      </Chip>
    {/if}
  </div>
{/if}
