<script>
  import { createEventDispatcher } from 'svelte';
  import { X } from 'lucide';
  import { REQUEST_METHODS } from '../../../../shared/constants.js';
  import Chip from '../../common/Chip.svelte';
  import Icon from '../../../ui/Icon.svelte';
  import Menu from '../../../ui/Menu.svelte';

  export let filter;

  const dispatch = createEventDispatcher();
  let menu;
  let chip;

  $: methods = filter.methods || [];

  function toggle(method) {
    if (method === 'ALL') {
      dispatch('change', { ...filter, methods: [] });
      return;
    }
    const next = methods.includes(method) ? methods.filter((m) => m !== method) : [...methods, method];
    dispatch('change', { ...filter, methods: next });
  }

  const isSelected = (method, list) => (method === 'ALL' ? list.length === 0 : list.includes(method));
</script>

<div class="mh-cell">
  <Chip bind:this={chip} trailingAction="dropdown" fieldName="method" on:click={() => menu.toggle(chip.getElement())}>
    <span class="mono">{methods.length ? methods.join(', ') : 'All methods'}</span>
  </Chip>
  <Menu bind:this={menu} placement="bottom-start">
    <div class="mh-chip-menu">
      {#each ['ALL', ...REQUEST_METHODS] as method (method)}
        <button
          type="button"
          class="mh-chip-option mono"
          class:selected={isSelected(method, methods)}
          on:click={() => toggle(method)}
        >
          {method}
          {#if isSelected(method, methods)}<Icon icon={X} size={12} strokeWidth={2} />{/if}
        </button>
      {/each}
    </div>
  </Menu>
</div>
