<script>
  // Right-click menu for a profile in the sidebar.
  import { ArrowDown, ArrowUp, Check, Copy, Pin, PinOff, Plus, Trash2 } from 'lucide';
  import Icon from '../../ui/Icon.svelte';
  import Menu from '../../ui/Menu.svelte';
  import MenuItem from '../../ui/MenuItem.svelte';
  import MenuSeparator from '../../ui/MenuSeparator.svelte';
  import {
    addProfile,
    cloneProfile,
    profiles,
    removeProfile,
    selectProfile,
    setAlwaysOn,
    showToast,
    swapProfile,
  } from '../../stores.js';

  let menu;
  let index = -1;

  $: profile = $profiles[index];

  export function openFor(event, profileIndex) {
    index = profileIndex;
    menu.openAtPoint(event.clientX, event.clientY, event);
  }

  function toggleAlwaysOn() {
    selectProfile(index);
    const alwaysOn = !profile.alwaysOn;
    setAlwaysOn(index, alwaysOn);
    showToast(
      alwaysOn
        ? `${profile.title} will stay active even when it is not selected`
        : `${profile.title} will only be active when selected.`,
    );
  }
</script>

<Menu bind:this={menu} width={200}>
  {#if profile}
    <MenuItem icon={profile.alwaysOn ? PinOff : Pin} on:click={toggleAlwaysOn}>
      Always stay on
      <svelte:fragment slot="trailing">
        {#if profile.alwaysOn}<Icon icon={Check} size={14} />{/if}
      </svelte:fragment>
    </MenuItem>
    <MenuItem icon={Plus} on:click={addProfile}>Add profile</MenuItem>
    <MenuItem icon={Copy} on:click={() => cloneProfile(profile)}>Clone profile</MenuItem>
    <MenuItem icon={Trash2} danger on:click={() => removeProfile(index)}>Delete profile</MenuItem>
    <MenuSeparator />
    <MenuItem icon={ArrowDown} disabled={index >= $profiles.length - 1} on:click={() => swapProfile(index, index + 1)}>
      Move down
    </MenuItem>
    <MenuItem icon={ArrowUp} disabled={index <= 0} on:click={() => swapProfile(index, index - 1)}>Move up</MenuItem>
  {/if}
</Menu>
