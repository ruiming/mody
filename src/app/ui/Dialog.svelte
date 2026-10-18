<script>
  // Modal dialog on the native <dialog> element (top layer, focus trap, Esc).
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { X } from 'lucide';
  import IconButton from './IconButton.svelte';

  export let open = false;
  export let title = '';
  export let description = '';
  export let showCloseButton = true;
  export let largeDialog = false;
  export let hideTitle = false;
  export let hideFooter = false;
  export let width = 480;

  const dispatch = createEventDispatcher();
  let dialog;

  $: if (dialog) sync(open);

  function sync(isOpen) {
    if (isOpen && !dialog.open) dialog.showModal();
    else if (!isOpen && dialog.open) dialog.close();
  }

  function close() {
    if (!open) return;
    open = false;
    dispatch('close');
  }

  function onCancel(event) {
    event.preventDefault();
    if (showCloseButton) close();
  }

  function onBackdropClick(event) {
    if (event.target === dialog && showCloseButton) close();
  }

  onDestroy(() => {
    if (dialog?.open) dialog.close();
  });
</script>

<dialog
  bind:this={dialog}
  class="dialog"
  class:large={largeDialog}
  style={largeDialog ? '' : `width:min(${width}px, calc(100vw - 24px))`}
  on:cancel={onCancel}
  on:click={onBackdropClick}
>
  {#if open}
    <div class="dialog-surface">
      {#if !hideTitle}
        <header class="dialog-header">
          <div class="dialog-titles">
            <h2 class="dialog-title">{title}</h2>
            {#if description}<p class="dialog-description">{description}</p>{/if}
          </div>
          {#if showCloseButton}
            <IconButton icon={X} title="Close" size="sm" on:click={close} />
          {/if}
        </header>
      {/if}
      <div class="dialog-body">
        <slot {close} />
      </div>
      {#if !hideFooter && $$slots.footer}
        <footer class="dialog-footer">
          <slot name="footer" {close} />
        </footer>
      {/if}
    </div>
  {/if}
</dialog>

<style>
  .dialog {
    max-width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
    padding: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-elevated);
    color: var(--fg);
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }
  .dialog.large {
    width: calc(100vw - 16px);
    height: calc(100vh - 16px);
    max-width: calc(100vw - 16px);
    max-height: calc(100vh - 16px);
  }
  .dialog[open] {
    animation: dialog-in 0.16s ease-out;
  }
  .dialog::backdrop {
    background: var(--backdrop);
    backdrop-filter: blur(2px);
  }
  @keyframes dialog-in {
    from {
      opacity: 0;
      transform: translateY(6px) scale(0.98);
    }
  }
  .dialog-surface {
    display: flex;
    flex-direction: column;
    max-height: calc(100vh - 26px);
    height: 100%;
  }
  .dialog-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 16px 8px 20px;
  }
  .dialog-titles {
    flex: 1;
    min-width: 0;
  }
  .dialog-title {
    margin: 2px 0 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .dialog-description {
    margin: 4px 0 0;
    color: var(--fg-muted);
    font-size: 12.5px;
  }
  .dialog-body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    padding: 8px 20px 16px;
  }
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
    background: var(--bg-subtle);
  }
</style>
