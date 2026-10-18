<script>
  // Dropdown that swaps the current filter for one derived from the active tab.
  import { createEventDispatcher } from 'svelte';
  import { AppWindow, Globe, Layers, PanelsTopLeft } from 'lucide';
  import Chip from '../../common/Chip.svelte';
  import Menu from '../../../ui/Menu.svelte';
  import MenuItem from '../../../ui/MenuItem.svelte';

  const dispatch = createEventDispatcher();
  let menu;
  let chip;

  const OPTIONS = [
    { label: 'Use current tab', icon: AppWindow, field: 'tabFilters' },
    { label: 'Use current tab domain', icon: Globe, field: 'initiatorDomainFilters' },
    { label: 'Use current tab group', icon: Layers, field: 'tabGroupFilters' },
    { label: 'Use current window', icon: PanelsTopLeft, field: 'windowFilters' },
  ];
</script>

<Chip
  bind:this={chip}
  trailingAction="dropdown"
  fieldName="single-tab"
  tooltip="Update filter"
  on:click={() => menu.toggle(chip.getElement())}
>
  Update
</Chip>
<Menu bind:this={menu} placement="bottom-start" width={220}>
  {#each OPTIONS as option (option.field)}
    <MenuItem icon={option.icon} on:click={() => dispatch('replace', option.field)}>{option.label}</MenuItem>
  {/each}
</Menu>
