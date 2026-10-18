<script>
  // Square ghost button holding a single icon.
  // tone: default | danger (red on hover) | inverse (on a colored surface)
  import Icon from './Icon.svelte';

  export let icon;
  export let title = undefined;
  export let size = 'md'; // sm 24px | md 28px | lg 32px
  export let iconSize = undefined;
  export let tone = 'default';
  export let active = false;
  export let disabled = false;
  export let element = undefined;
  let className = '';
  export { className as class };

  $: px = { sm: 24, md: 28, lg: 32 }[size] ?? 28;
  $: glyph = iconSize ?? (size === 'sm' ? 14 : 16);
</script>

<button
  bind:this={element}
  type="button"
  class="icon-btn tone-{tone} {className}"
  class:active
  style="width:{px}px;height:{px}px"
  {title}
  aria-label={title}
  {disabled}
  on:click
  on:contextmenu
  {...$$restProps}
>
  <Icon {icon} size={glyph} />
</button>

<style>
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    padding: 0;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    transition: background-color 0.12s, color 0.12s;
  }
  .icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .icon-btn:not(:disabled):hover,
  .icon-btn.active {
    background: var(--bg-hover);
    color: var(--fg);
  }
  .tone-danger:not(:disabled):hover {
    background: var(--danger-soft);
    color: var(--danger);
  }
  .tone-inverse {
    color: inherit;
    opacity: 0.85;
  }
  .tone-inverse:not(:disabled):hover,
  .tone-inverse.active {
    background: rgba(127, 127, 127, 0.18);
    color: inherit;
    opacity: 1;
  }
</style>
