<script>
  import {
    Check,
    CloudDownload,
    Copy,
    EllipsisVertical,
    FileInput,
    Keyboard,
    MessageSquare,
    MessageSquareOff,
    Pin,
    Share2,
    SunMoon,
    Trash2,
  } from 'lucide';
  import IconButton from '../../ui/IconButton.svelte';
  import Menu from '../../ui/Menu.svelte';
  import MenuItem from '../../ui/MenuItem.svelte';
  import MenuSeparator from '../../ui/MenuSeparator.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { colorScheme, toggleColorScheme } from '../../theme.js';
  import {
    cloneProfile,
    removeProfile,
    selectedProfile,
    selectedProfileIndex,
    showCloudBackupDialog,
    showExportDialog,
    showImportDialog,
    showToast,
    updateProfile,
  } from '../../stores.js';

  let menu;
  let button;
  let isOpen = false;

  function toggleAlwaysOn() {
    const alwaysOn = !$selectedProfile.alwaysOn;
    updateProfile({ alwaysOn });
    showToast(
      alwaysOn
        ? 'This profile will stay active even when it is not selected'
        : 'This profile will only be active when selected.',
    );
  }

  function openShortcuts() {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  }

  const alwaysOnText = 'Always stay enabled';
</script>

<IconButton bind:element={button} icon={EllipsisVertical} title="More" active={isOpen} on:click={() => menu.toggle(button)} />
<Menu bind:this={menu} bind:isOpen width={248}>
  <MenuItem
    icon={$selectedProfile.hideComment ? MessageSquare : MessageSquareOff}
    on:click={() => updateProfile({ hideComment: !$selectedProfile.hideComment })}
  >
    {$selectedProfile.hideComment ? 'Show comment' : 'Hide comment'}
  </MenuItem>
  <MenuItem icon={SunMoon} on:click={toggleColorScheme}>
    Dark mode: {$colorScheme === 'dark' ? 'Dark' : 'Light'}
  </MenuItem>
  <MenuItem icon={Keyboard} on:click={openShortcuts}>Keyboard shortcuts</MenuItem>
  <MenuSeparator />
  <MenuItem icon={Pin} title="{alwaysOnText}." on:click={toggleAlwaysOn}>
    {alwaysOnText}
    <svelte:fragment slot="trailing">
      {#if $selectedProfile.alwaysOn}<Icon icon={Check} size={14} />{/if}
    </svelte:fragment>
  </MenuItem>
  <MenuItem icon={Trash2} danger on:click={() => removeProfile($selectedProfileIndex)}>Delete profile</MenuItem>
  <MenuItem icon={Copy} on:click={() => cloneProfile($selectedProfile)}>Clone profile</MenuItem>
  <MenuItem icon={FileInput} class="import-profile" on:click={() => showImportDialog.set(true)}>Import profile</MenuItem>
  <MenuItem icon={Share2} on:click={() => showExportDialog.set(true)}>Export / share profile</MenuItem>
  <MenuItem icon={CloudDownload} on:click={() => showCloudBackupDialog.set(true)}>Cloud sync &amp; backup</MenuItem>
</Menu>
