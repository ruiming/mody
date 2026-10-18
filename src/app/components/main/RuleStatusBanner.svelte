<script>
  // Shows whether the last declarativeNetRequest rule update succeeded.
  import { onDestroy, onMount } from 'svelte';
  import { CircleCheck, CircleHelp, TriangleAlert, X } from 'lucide';
  import { MessageType } from '../../../shared/messages.js';
  import { getLocal, StorageKey } from '../../../shared/storage.js';
  import Icon from '../../ui/Icon.svelte';

  let status = '';
  let error = '';
  let hideTimer;

  const message = (key, fallback) => {
    try {
      return chrome.i18n.getMessage(key) || fallback;
    } catch {
      return fallback;
    }
  };

  function onMessage(request) {
    clearTimeout(hideTimer);
    if (request?.type === MessageType.UPDATE_RULES_ERROR) {
      status = 'error';
      error = String(request.error || '');
    } else if (request?.type === MessageType.UPDATE_RULES_SUCCESS) {
      status = 'success';
      hideTimer = setTimeout(() => (status = ''), 1500);
    }
  }

  onMount(async () => {
    chrome.runtime.onMessage.addListener(onMessage);
    const stored = await getLocal(StorageKey.RULE_SUCCESS);
    if (stored[StorageKey.RULE_SUCCESS] === false && !status) status = 'error';
  });

  onDestroy(() => {
    clearTimeout(hideTimer);
    chrome.runtime.onMessage.removeListener(onMessage);
  });
</script>

{#if status === 'success'}
  <div class="rule-success" role="status">
    <Icon icon={CircleCheck} size={13} strokeWidth={2} />
    {message('rule_success', 'Rules applied')}
  </div>
{:else if status === 'error'}
  <div class="rule-status" role="alert">
    <Icon icon={TriangleAlert} size={14} />
    <span class="status-text">
      {message('mody_rule_error', 'Some rules are invalid and could not be applied.')}
    </span>
    {#if error}
      <span class="status-help" data-tooltip-text={error}>
        <Icon icon={CircleHelp} size={14} />
      </span>
    {/if}
    <button type="button" class="status-close" title="Close" on:click={() => (status = '')}>
      <Icon icon={X} size={14} />
    </button>
  </div>
{/if}

<style>
  /* Success is a transient pill so the content does not shift on every edit. */
  .rule-success {
    position: fixed;
    right: 12px;
    bottom: 62px;
    z-index: 99999;
    display: flex;
    align-items: center;
    gap: 5px;
    height: 24px;
    padding: 0 10px;
    border: 1px solid color-mix(in srgb, var(--success) 30%, transparent);
    border-radius: 999px;
    background: var(--bg-elevated);
    color: var(--success);
    font-size: 11.5px;
    font-weight: 500;
    box-shadow: var(--shadow-md);
    pointer-events: none;
    animation: rule-success-fade 1.5s ease forwards;
  }
  @keyframes rule-success-fade {
    0% {
      opacity: 0;
      transform: translateY(4px);
    }
    12%,
    75% {
      opacity: 1;
      transform: none;
    }
    100% {
      opacity: 0;
    }
  }
  .rule-status {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 0 6px 0 14px;
    border-bottom: 1px solid color-mix(in srgb, var(--danger) 25%, transparent);
    background: color-mix(in srgb, var(--danger) 10%, var(--bg));
    color: var(--danger);
    font-size: 12px;
    font-weight: 500;
  }
  .status-text {
    flex: 1;
  }
  .status-help {
    display: inline-flex;
    cursor: help;
  }
  .status-close {
    display: inline-flex;
    padding: 4px;
    border: none;
    border-radius: var(--radius-sm);
    background: none;
    color: inherit;
    cursor: pointer;
  }
  .status-close:hover {
    background: var(--danger-soft);
  }
</style>
