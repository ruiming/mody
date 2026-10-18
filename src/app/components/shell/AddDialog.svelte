<script>
  import { X } from 'lucide';
  import Dialog from '../../ui/Dialog.svelte';
  import Icon from '../../ui/Icon.svelte';
  import IconButton from '../../ui/IconButton.svelte';
  import Tabs from '../../ui/Tabs.svelte';
  import { FILTER_ITEMS, MOD_ITEMS, sortItems } from '../../data/addItems.js';
  import { addDialogTab } from '../../stores.js';

  const tabs = [
    { id: 'mods', label: 'Mods', domId: 'add-dialog-tab-mods' },
    { id: 'filters', label: 'Filters', domId: 'add-dialog-tab-filters' },
  ];
  const modItems = sortItems(MOD_ITEMS);
  const filterItems = sortItems(FILTER_ITEMS);

  let active = 'mods';

  $: open = $addDialogTab !== undefined;
  $: if ($addDialogTab) active = $addDialogTab;
  $: items = active === 'mods' ? modItems : filterItems;

  function close() {
    addDialogTab.set(undefined);
  }

  function onSelect(item) {
    if (item.disableText) return;
    item.action();
    close();
  }
</script>

<Dialog {open} hideTitle hideFooter width={560} on:close={close}>
  <div class="add-header">
    <Tabs items={tabs} bind:value={active} />
    <IconButton icon={X} title="Close" size="sm" on:click={close} />
  </div>
  <div class="add-list" role="list">
    {#each items as item (item.id)}
      <button
        id={item.id}
        class="add-item"
        class:disabled={!!item.disableText}
        title={item.disableText || ''}
        aria-disabled={!!item.disableText}
        on:click={() => onSelect(item)}
      >
        <span class="add-item-icon"><Icon icon={item.icon} size={16} /></span>
        <span class="add-item-text">
          <span class="add-item-title">
            {item.text}
            {#if item.popular}<span class="pill">Popular</span>{/if}
          </span>
          <span class="add-item-description">{item.description}</span>
        </span>
      </button>
    {/each}
  </div>
</Dialog>

<style>
  .add-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0 12px;
  }
  .add-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0 -8px;
  }
  .add-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    color: var(--fg);
    text-align: left;
    cursor: pointer;
    transition: background-color 0.12s;
  }
  .add-item:hover:not(.disabled) {
    background: var(--bg-hover);
  }
  .add-item:hover:not(.disabled) .add-item-icon {
    border-color: var(--border-strong);
    color: var(--accent);
  }
  .add-item.disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .add-item-icon {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-subtle);
    color: var(--fg);
    transition: border-color 0.12s, color 0.12s;
  }
  .add-item-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .add-item-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
  }
  .add-item-description {
    color: var(--fg-muted);
    font-size: 12px;
  }
</style>
