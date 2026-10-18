<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import Icon from './Icon.svelte';
  import { MENU_CONTEXT } from './Menu.svelte';

  export let icon = undefined;
  export let disabled = false;
  export let danger = false;
  export let title = undefined;
  // Keep the menu open after clicking (e.g. toggles).
  export let keepOpen = false;
  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher();
  const menu = getContext(MENU_CONTEXT);

  function onClick(event) {
    if (disabled) return;
    dispatch('click', event);
    if (!keepOpen) menu?.close();
  }
</script>

<button type="button" role="menuitem" class="menu-item {className}" class:danger {disabled} {title} on:click={onClick}>
  {#if icon}<Icon {icon} size={15} class="menu-item-icon" />{/if}
  <span class="menu-item-label"><slot /></span>
  {#if $$slots.trailing}<span class="menu-item-trailing"><slot name="trailing" /></span>{/if}
</button>

<style>
  .menu-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    height: 30px;
    padding: 0 8px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg);
    text-align: left;
    white-space: nowrap;
    cursor: pointer;
  }
  .menu-item:not(:disabled):hover,
  .menu-item:focus-visible {
    background: var(--bg-hover);
    outline: none;
  }
  .menu-item:disabled {
    color: var(--fg-subtle);
    cursor: default;
  }
  .menu-item :global(.menu-item-icon) {
    color: var(--fg-muted);
  }
  .menu-item.danger,
  .menu-item.danger :global(.menu-item-icon) {
    color: var(--danger);
  }
  .menu-item.danger:not(:disabled):hover {
    background: var(--danger-soft);
  }
  .menu-item-label {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .menu-item-trailing {
    color: var(--fg-subtle);
    font-size: 12px;
  }
</style>
