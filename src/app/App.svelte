<script>
  import { onDestroy, onMount } from 'svelte';
  import { flushProfiles, isInitialized, loadFromStorage, selectedProfile } from './stores.js';
  import Drawer from './components/shell/Drawer.svelte';
  import TopBar from './components/shell/TopBar.svelte';
  import Snackbars from './components/shell/Snackbars.svelte';
  import AddDialog from './components/shell/AddDialog.svelte';
  import ExportDialog from './components/shell/ExportDialog.svelte';
  import ImportDialog from './components/shell/ImportDialog.svelte';
  import CloudBackupDialog from './components/shell/CloudBackupDialog.svelte';
  import SyncNotice from './components/shell/SyncNotice.svelte';
  import MainContent from './components/main/MainContent.svelte';

  export let isFullscreen = false;

  // Reload when the page regains focus: another popup/options tab may have
  // changed the profiles in the meantime.
  function onVisibilityChange() {
    if (document.visibilityState === 'visible') loadFromStorage();
  }

  onMount(() => {
    loadFromStorage();
    window.addEventListener('focus', loadFromStorage);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flushProfiles);
  });

  onDestroy(() => {
    window.removeEventListener('focus', loadFromStorage);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', flushProfiles);
  });
</script>

{#if $isInitialized && $selectedProfile}
  <Drawer {isFullscreen} />
  <main class="app-content" style="--separator-color: {$selectedProfile.backgroundColor}; --profile-color: {$selectedProfile.backgroundColor};">
    <TopBar {isFullscreen} />
    <MainContent />
  </main>
  <Snackbars />
  <SyncNotice />
  <CloudBackupDialog />
  <ExportDialog />
  <ImportDialog />
  <AddDialog />
{/if}
