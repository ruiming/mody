<script>
  import { createEventDispatcher } from 'svelte';
  import { ArrowDownAZ, ArrowUpZA, EllipsisVertical, ListPlus, Plus, Trash2 } from 'lucide';
  import IconButton from '../../ui/IconButton.svelte';
  import Menu from '../../ui/Menu.svelte';
  import MenuItem from '../../ui/MenuItem.svelte';
  import MenuSeparator from '../../ui/MenuSeparator.svelte';

  // sortOptions: [{key, label}]
  export let sortOptions = [];
  export let showCustomizeAutocomplete = false;

  const dispatch = createEventDispatcher();
  let menu;
  let button;
  let isOpen = false;
</script>

<IconButton
  bind:element={button}
  icon={EllipsisVertical}
  title="More menu"
  active={isOpen}
  on:click={() => menu.toggle(button)}
/>
<Menu bind:this={menu} bind:isOpen width={230}>
  <MenuItem icon={Plus} on:click={() => dispatch('add')}>Add</MenuItem>
  <MenuItem icon={Trash2} on:click={() => dispatch('clear')}>Clear all</MenuItem>
  {#if showCustomizeAutocomplete}
    <MenuItem icon={ListPlus} on:click={() => dispatch('customizeAutocomplete')}>Customize autocomplete</MenuItem>
  {/if}
  {#if sortOptions.length}
    <MenuSeparator />
    {#each sortOptions as option (option.key)}
      <MenuItem icon={ArrowDownAZ} on:click={() => dispatch('sort', { key: option.key, order: 'asc' })}>
        {option.label} - ascending
      </MenuItem>
      <MenuItem icon={ArrowUpZA} on:click={() => dispatch('sort', { key: option.key, order: 'desc' })}>
        {option.label} - descending
      </MenuItem>
    {/each}
  {/if}
</Menu>
