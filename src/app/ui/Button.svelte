<script>
  // variant: primary | secondary | outline | ghost | danger | link
  import Icon from './Icon.svelte';

  export let variant = 'secondary';
  export let size = 'md';
  export let icon = undefined;
  export let disabled = false;
  export let type = 'button';
  export let title = undefined;
  export let element = undefined;
  let className = '';
  export { className as class };
</script>

<button
  bind:this={element}
  {type}
  {title}
  {disabled}
  class="btn btn-{variant} btn-{size} {className}"
  on:click
  {...$$restProps}
>
  {#if icon}<Icon {icon} size={size === 'sm' ? 14 : 16} />{/if}
  <slot />
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    font-weight: 500;
    white-space: nowrap;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.12s, border-color 0.12s, color 0.12s, box-shadow 0.12s;
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .btn-md {
    height: 32px;
    padding: 0 12px;
    font-size: 13px;
  }
  .btn-sm {
    height: 26px;
    padding: 0 8px;
    font-size: 12px;
    gap: 4px;
  }
  .btn-primary {
    background: var(--primary);
    color: var(--primary-fg);
    box-shadow: var(--shadow-sm);
  }
  .btn-primary:not(:disabled):hover {
    background: var(--primary-hover);
  }
  .btn-secondary {
    background: var(--bg-muted);
    color: var(--fg);
  }
  .btn-secondary:not(:disabled):hover {
    background: var(--bg-active);
  }
  .btn-outline {
    background: var(--bg);
    border-color: var(--border);
    color: var(--fg);
    box-shadow: var(--shadow-sm);
  }
  .btn-outline:not(:disabled):hover {
    background: var(--bg-hover);
  }
  .btn-ghost {
    background: transparent;
    color: var(--fg-muted);
  }
  .btn-ghost:not(:disabled):hover {
    background: var(--bg-hover);
    color: var(--fg);
  }
  .btn-danger {
    background: var(--danger);
    color: #fff;
  }
  .btn-danger:not(:disabled):hover {
    filter: brightness(0.95);
  }
  .btn-link {
    background: transparent;
    color: var(--fg-muted);
    padding-left: 6px;
    padding-right: 8px;
  }
  .btn-link:not(:disabled):hover {
    color: var(--fg);
    background: var(--bg-hover);
  }
</style>
