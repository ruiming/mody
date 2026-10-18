<script>
  // App-wide toast. Messages come from the `toast` store; optional Undo action.
  import { fly } from 'svelte/transition';
  import { X } from 'lucide';
  import Icon from '../../ui/Icon.svelte';
  import { toast, undo } from '../../stores.js';

  const TIMEOUT_MS = 4000;

  let visible = false;
  let message = '';
  let canUndo = false;
  let timer;

  $: show($toast);

  function show(value) {
    clearTimeout(timer);
    message = value.message;
    canUndo = value.canUndo;
    visible = Boolean(message);
    if (visible) timer = setTimeout(close, TIMEOUT_MS);
  }

  function close() {
    clearTimeout(timer);
    visible = false;
  }

  function onUndo() {
    close();
    undo();
  }
</script>

{#if visible}
  {#key $toast.id}
    <div class="toast" role="status" transition:fly={{ y: 12, duration: 160 }}>
      <span class="toast-message">{message}</span>
      {#if canUndo}
        <button class="toast-action" on:click={onUndo}>Undo</button>
      {/if}
      <button class="toast-close" title="Dismiss" aria-label="Dismiss" on:click={close}>
        <Icon icon={X} size={14} />
      </button>
    </div>
  {/key}
{/if}

<style>
  .toast {
    position: fixed;
    left: 50%;
    bottom: 60px;
    z-index: 1000;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: min(520px, calc(100vw - 24px));
    padding: 8px 8px 8px 14px;
    border-radius: var(--radius);
    background: var(--primary);
    color: var(--primary-fg);
    box-shadow: var(--shadow-md);
    font-size: 12.5px;
    line-height: 1.4;
  }
  .toast-message {
    flex: 1;
    min-width: 0;
  }
  .toast-action {
    flex: none;
    height: 24px;
    padding: 0 8px;
    border: none;
    border-radius: var(--radius-sm);
    background: rgba(127, 127, 127, 0.22);
    color: inherit;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  .toast-action:hover {
    background: rgba(127, 127, 127, 0.35);
  }
  .toast-close {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: inherit;
    opacity: 0.6;
    cursor: pointer;
  }
  .toast-close:hover {
    opacity: 1;
  }
</style>
