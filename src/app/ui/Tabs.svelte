<script>
  // Segmented control. items: [{ id, label }]
  export let items = [];
  export let value = items[0]?.id;
  let className = '';
  export { className as class };
</script>

<div class="tabs {className}" role="tablist">
  {#each items as item (item.id)}
    <button
      type="button"
      role="tab"
      id={item.domId}
      class="tab"
      class:selected={value === item.id}
      aria-selected={value === item.id}
      on:click={() => (value = item.id)}
    >
      {item.label}
    </button>
  {/each}
</div>

<style>
  .tabs {
    display: inline-flex;
    gap: 2px;
    padding: 3px;
    border-radius: var(--radius);
    background: var(--bg-muted);
  }
  .tab {
    height: 26px;
    padding: 0 12px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg-muted);
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
  }
  .tab:hover {
    color: var(--fg);
  }
  .tab.selected {
    background: var(--bg);
    color: var(--fg);
    box-shadow: var(--shadow-sm), 0 0 0 1px var(--border);
  }
</style>
