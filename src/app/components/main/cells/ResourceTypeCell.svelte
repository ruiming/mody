<script>
  import { createEventDispatcher } from 'svelte';
  import { RESOURCE_TYPE_NAMES } from '../../../../shared/constants.js';
  import Chip from '../../common/Chip.svelte';
  import Menu from '../../../ui/Menu.svelte';

  export let filter;

  const dispatch = createEventDispatcher();
  let menu;
  let chip;

  $: selected = filter.resourceType || [];
  $: available = Object.keys(RESOURCE_TYPE_NAMES).filter((type) => !selected.includes(type));

  function add(type) {
    dispatch('change', { ...filter, resourceType: [...selected, type] });
  }

  function remove(type) {
    dispatch('change', { ...filter, resourceType: selected.filter((t) => t !== type) });
  }
</script>

<div class="mh-cell">
  {#each selected as type (type)}
    <Chip trailingAction="close" on:close={() => remove(type)}>{RESOURCE_TYPE_NAMES[type] || type}</Chip>
  {/each}
  <Chip
    bind:this={chip}
    trailingAction="dropdown"
    fieldName="resource-type"
    class="is-dropdown"
    on:click={() => menu.toggle(chip.getElement())}
  >
    Resource type
  </Chip>
  <Menu bind:this={menu} placement="bottom-start">
    <div class="mh-chip-menu">
      {#each available as type (type)}
        <button type="button" class="mh-chip-option" data-resource-type={type} on:click={() => add(type)}>
          {RESOURCE_TYPE_NAMES[type]}
        </button>
      {:else}
        <span class="mh-muted">All resource types selected</span>
      {/each}
    </div>
  </Menu>
</div>
