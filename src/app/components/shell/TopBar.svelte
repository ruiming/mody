<script>
  import { Maximize2, Pause, Play, Plus, Share2, Undo2 } from 'lucide';
  import IconButton from '../../ui/IconButton.svelte';
  import MoreMenu from './MoreMenu.svelte';
  import ProfileBadge from './ProfileBadge.svelte';
  import ProfileBadgeDialog from './ProfileBadgeDialog.svelte';
  import { addDialogTab, canUndo, isPaused, selectedProfile, showExportDialog, undo, updateProfile } from '../../stores.js';

  export let isFullscreen = false;

  let showBadgeDialog = false;

  async function expandToFullTab() {
    await chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    window.close();
  }
</script>

<header class="top-bar" style="--profile-color: {$selectedProfile.backgroundColor};">
  <div class="top-bar-start">
    <button class="badge-button" title="Change profile badge" on:click={() => (showBadgeDialog = true)}>
      <ProfileBadge profile={$selectedProfile} size={26} showStatus={false} />
    </button>
    <input
      class="profile-title"
      placeholder="No Profile"
      value={$selectedProfile.title || 'No Profile'}
      spellcheck="false"
      on:input={(e) => updateProfile({ title: e.currentTarget.value })}
    />
  </div>
  <div class="top-bar-end">
    {#if $canUndo}
      <IconButton icon={Undo2} title="Undo" on:click={undo} />
    {/if}
    <IconButton icon={Plus} id="add-button" title="Add" on:click={() => addDialogTab.set('mods')} />
    <IconButton
      icon={$isPaused ? Play : Pause}
      title={$isPaused ? 'Resume Mody' : 'Pause Mody'}
      active={$isPaused}
      on:click={() => isPaused.set(!$isPaused)}
    />
    <IconButton icon={Share2} title="Export / share profile" on:click={() => showExportDialog.set(true)} />
    {#if !isFullscreen}
      <IconButton icon={Maximize2} title="Expand to full tab" on:click={expandToFullTab} />
    {/if}
    <MoreMenu />
  </div>
</header>

<ProfileBadgeDialog bind:open={showBadgeDialog} />

<style>
  .top-bar {
    position: relative;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    height: var(--top-bar-height);
    padding: 0 8px 0 10px;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
  }
  /* Thin stripe in the profile color keeps each profile recognizable. */
  .top-bar::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    height: 2px;
    background: var(--profile-color);
  }
  .top-bar-start {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .top-bar-end {
    flex: none;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  .badge-button {
    flex: none;
    display: inline-flex;
    padding: 3px;
    border: none;
    border-radius: var(--radius);
    background: transparent;
    cursor: pointer;
    --avatar-ring-gap: var(--bg);
  }
  .badge-button:hover {
    background: var(--bg-hover);
  }
  .profile-title {
    flex: 1;
    min-width: 0;
    max-width: 320px;
    height: 30px;
    padding: 0 8px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    text-overflow: ellipsis;
    transition: background-color 0.12s, border-color 0.12s, box-shadow 0.12s;
  }
  .profile-title:hover {
    background: var(--bg-hover);
  }
  .profile-title:focus {
    outline: none;
    background: var(--bg);
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--ring);
  }
</style>
