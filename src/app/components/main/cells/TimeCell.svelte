<script>
  import { createEventDispatcher, onDestroy } from 'svelte';
  import Button from '../../../ui/Button.svelte';

  export let filter;

  const dispatch = createEventDispatcher();
  let now = Date.now();
  const timer = setInterval(() => (now = Date.now()), 1000);
  onDestroy(() => clearInterval(timer));

  const toLocalInput = (ms) => {
    const date = new Date(ms);
    return new Date(ms - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };

  $: inputValue = toLocalInput(filter.expirationTimeMs || Date.now());
  $: active = filter.expirationTimeMs > now;

  function onChange(event) {
    const ms = new Date(event.target.value).getTime();
    if (!Number.isNaN(ms)) dispatch('change', { ...filter, expirationTimeMs: ms });
  }

  function add(ms) {
    dispatch('change', { ...filter, expirationTimeMs: (filter.expirationTimeMs || Date.now()) + ms });
  }
</script>

<div class="mh-cell time-cell">
  <div class="time-line">
    <span class="mh-muted">Expiration time:</span>
    <input type="datetime-local" class="time-input" value={inputValue} on:change={onChange} />
    {#if active}
      <span class="status active">Active</span>
    {:else}
      <span class="status expired">Expired</span>
    {/if}
  </div>
  <div class="time-line">
    <Button variant="outline" size="sm" on:click={() => add(5 * 60000)}>+5 mins</Button>
    <Button variant="outline" size="sm" on:click={() => add(3600000)}>+1 hour</Button>
    <Button variant="outline" size="sm" on:click={() => add(86400000)}>+1 day</Button>
    <Button variant="outline" size="sm" on:click={() => add(7 * 86400000)}>+1 week</Button>
  </div>
</div>

<style>
  .time-cell {
    flex: 2 1 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 4px 0;
  }
  .time-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  .time-input {
    height: 26px;
    padding: 0 6px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .time-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--ring);
  }
  .status {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border-radius: 999px;
    font-size: 11.5px;
    font-weight: 500;
  }
  .status.active {
    color: var(--success);
    background: var(--success-soft);
  }
  .status.expired {
    color: var(--danger);
    background: var(--danger-soft);
  }
</style>
