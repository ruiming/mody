<script>
  import { createEventDispatcher } from 'svelte';
  import {
    ArrowDown,
    ArrowUp,
    Copy,
    EllipsisVertical,
    Eraser,
    Maximize2,
    MessageSquare,
    MessageSquareOff,
    TextCursorInput,
  } from 'lucide';
  import IconButton from '../../ui/IconButton.svelte';
  import Menu from '../../ui/Menu.svelte';
  import MenuItem from '../../ui/MenuItem.svelte';
  import MenuSeparator from '../../ui/MenuSeparator.svelte';

  export let index;
  export let count;
  export let hideComment;
  // Modifier rows only; filter rows hide these entries.
  export let showExpand = true;
  export let showClearValue = true;
  export let supportAppendMode = false;
  export let appendMode = undefined;

  const dispatch = createEventDispatcher();
  let menu;
  let button;
  let isOpen = false;
</script>

<IconButton
  bind:element={button}
  class="mh-row-action"
  icon={EllipsisVertical}
  title="Expand"
  size="sm"
  active={isOpen}
  on:click={() => menu.toggle(button)}
/>
<Menu bind:this={menu} bind:isOpen width={220}>
  {#if showExpand}
    <MenuItem icon={Maximize2} on:click={() => dispatch('expand')}>Expand</MenuItem>
  {/if}
  <MenuItem icon={Copy} on:click={() => dispatch('duplicate')}>Duplicate</MenuItem>
  {#if showClearValue}
    <MenuItem icon={Eraser} on:click={() => dispatch('clearValue')}>Clear value</MenuItem>
  {/if}
  <MenuItem icon={hideComment ? MessageSquare : MessageSquareOff} on:click={() => dispatch('toggleComment')}>
    {hideComment ? 'Show comment' : 'Hide comment'}
  </MenuItem>
  <MenuSeparator />
  <MenuItem icon={ArrowDown} disabled={index >= count - 1} on:click={() => dispatch('move', 1)}>Move down</MenuItem>
  <MenuItem icon={ArrowUp} disabled={index === 0} on:click={() => dispatch('move', -1)}>Move up</MenuItem>
  {#if supportAppendMode}
    <MenuSeparator />
    <MenuItem icon={TextCursorInput} on:click={() => dispatch('toggleAppend')}>
      {appendMode ? 'Clear append mode' : 'Append instead of override'}
    </MenuItem>
  {/if}
</Menu>
