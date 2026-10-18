<script>
  // Small pill with an optional trailing action icon.
  import { createEventDispatcher } from 'svelte';
  import { ArrowRight, ChevronDown, CircleHelp, RefreshCw, X } from 'lucide';
  import Icon from '../../ui/Icon.svelte';

  // 'toggle' | 'close' | 'dropdown' | 'action' | 'help' | 'none'
  export let trailingAction = 'toggle';
  export let tooltip = undefined;
  export let fieldName = undefined;
  let className = '';
  export { className as class };

  const ACTIONS = {
    toggle: { icon: RefreshCw, event: 'click', tooltip: 'Click to change behavior' },
    close: { icon: X, event: 'close', tooltip: 'Click on the chip to edit, click on X to remove.' },
    dropdown: { icon: ChevronDown, event: 'click', tooltip: 'Click to add behavior' },
    action: { icon: ArrowRight, event: 'click', tooltip: 'Click to apply the suggestion' },
    help: { icon: CircleHelp, event: 'click', tooltip: 'Click to learn more about the header' },
  };

  const dispatch = createEventDispatcher();
  let element;
  $: action = ACTIONS[trailingAction];

  // Lets parents anchor menus to the chip.
  export function getElement() {
    return element;
  }
</script>

<span
  bind:this={element}
  class="chip {className}"
  class:is-action={trailingAction === 'action'}
  title={tooltip || action?.tooltip}
  data-field-name={fieldName}
>
  <button type="button" class="chip-main" on:click={(e) => dispatch('click', e)}>
    <slot />
  </button>
  {#if action}
    <button
      type="button"
      class="chip-trailing"
      tabindex={action.event === 'click' ? -1 : 0}
      aria-label={action.tooltip}
      on:click|stopPropagation={(e) => dispatch(action.event, e)}
    >
      <Icon icon={action.icon} size={12} strokeWidth={2} />
    </button>
  {/if}
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    height: 22px;
    max-width: 100%;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-muted);
    color: var(--fg);
    font-size: 11.5px;
    white-space: nowrap;
    vertical-align: middle;
    transition: background-color 0.12s, border-color 0.12s;
  }
  .chip:hover {
    background: var(--bg-active);
    border-color: var(--border-strong);
  }
  .chip.is-action {
    border-style: dashed;
    background: transparent;
    color: var(--fg-muted);
  }
  .chip.is-action:hover {
    color: var(--fg);
  }
  .chip-main {
    display: inline-flex;
    align-items: center;
    height: 100%;
    padding: 0 4px 0 9px;
    border: none;
    background: none;
    color: inherit;
    font-size: inherit;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .chip-main:last-child {
    padding-right: 9px;
  }
  .chip-trailing {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-right: 2px;
    padding: 0;
    border: none;
    border-radius: 999px;
    background: none;
    color: var(--fg-subtle);
    cursor: pointer;
  }
  .chip-trailing:hover {
    color: var(--fg);
    background: var(--bg-active);
  }
</style>
