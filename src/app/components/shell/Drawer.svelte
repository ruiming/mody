<script>
  // Navigation sidebar: 48px icon rail in the popup (expands as an overlay),
  // permanent 240px panel on the options page.
  import { tick } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { ArrowDownAZ, ArrowUpZA, PanelLeftClose, PanelLeftOpen, Pin, Plus, Search } from 'lucide';
  import Icon from '../../ui/Icon.svelte';
  import ProfileBadge from './ProfileBadge.svelte';
  import ProfileContextMenu from './ProfileContextMenu.svelte';
  import {
    addProfile,
    managedProfiles,
    profiles,
    selectProfile,
    selectedProfile,
    showToast,
    sortProfiles,
  } from '../../stores.js';

  export let isFullscreen = false;

  let expanded = isFullscreen;
  let searchText = '';
  let searchInput;
  let panel;
  let sortOrder = 'asc';
  let contextMenu;

  $: filteredProfiles = $profiles
    .map((profile, index) => ({ profile, index }))
    .filter(({ profile }) => !searchText || profile.title.toLowerCase().includes(searchText.toLowerCase()));

  function collapse() {
    if (!isFullscreen) expanded = false;
  }

  async function openSearch() {
    expanded = true;
    await tick();
    setTimeout(() => searchInput?.focus(), 100);
  }

  function onSearchKeydown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      panel?.querySelector('.profile-item')?.focus();
    }
  }

  function onSelect(index) {
    selectProfile(index);
    collapse();
  }

  function onAddProfile() {
    addProfile();
    collapse();
  }

  function onSort() {
    sortProfiles(sortOrder);
    showToast(`Profiles sorted in ${sortOrder === 'asc' ? 'ascending' : 'descending'} order`, { canUndo: true });
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  }

  function showManagedInfo() {
    showToast(
      'This profile is forced installed on your computer by your administrator. You may not view or edit this profile. Contact your system admin for more details.',
    );
  }

  function onContextMenu(event, index) {
    event.preventDefault();
    contextMenu.openFor(event, index);
  }

  function onKeydown(event) {
    if (event.key === 'Escape' && expanded && !isFullscreen) collapse();
  }

  $: sortIcon = sortOrder === 'asc' ? ArrowDownAZ : ArrowUpZA;
</script>

<svelte:window on:keydown={onKeydown} />

<!-- Collapsed icon rail (popup only). -->
{#if !isFullscreen}
  <nav class="rail" aria-label="Navigation">
    <button class="rail-btn" title="Show navigation" on:click={() => (expanded = true)}>
      <Icon icon={PanelLeftOpen} />
    </button>
    <button class="rail-btn" title="Search" on:click={openSearch}>
      <Icon icon={Search} />
    </button>
    <div class="rail-separator"></div>
    <div class="rail-profiles">
      {#each $managedProfiles as profile}
        <button class="rail-btn" title={profile.title} on:click={showManagedInfo}>
          <ProfileBadge {profile} isManaged />
        </button>
      {/each}
      {#each $profiles as profile, index (profile)}
        <button
          class="rail-btn profile-item"
          title={profile.title}
          on:click={() => onSelect(index)}
          on:contextmenu={(e) => onContextMenu(e, index)}
        >
          <ProfileBadge
            {profile}
            selected={profile === $selectedProfile}
            active={profile.alwaysOn || profile === $selectedProfile}
          />
        </button>
      {/each}
      <button class="rail-btn" title="Add profile" on:click={onAddProfile}>
        <Icon icon={Plus} />
      </button>
      <button class="rail-btn" title="Sort profiles" on:click={onSort}>
        <Icon icon={sortIcon} />
      </button>
    </div>
  </nav>
{/if}

{#if expanded}
  {#if !isFullscreen}
    <div class="scrim" transition:fade={{ duration: 160 }} on:click={collapse} role="presentation"></div>
  {/if}
  <nav
    bind:this={panel}
    class="panel"
    class:overlay={!isFullscreen}
    aria-label="Navigation"
    transition:fly={{ x: isFullscreen ? 0 : -24, duration: isFullscreen ? 0 : 160 }}
  >
    <div class="panel-header">
      {#if !isFullscreen}
        <button class="rail-btn" title="Hide navigation" on:click={collapse}>
          <Icon icon={PanelLeftClose} />
        </button>
      {/if}
      <img src="/images/icon_48.png" width="20" height="20" alt="" class="brand-icon" />
      <span class="brand">Mody</span>
    </div>

    <label class="search">
      <Icon icon={Search} size={14} class="search-icon" />
      <input
        bind:this={searchInput}
        bind:value={searchText}
        name="profile-search"
        type="text"
        placeholder="Search profiles"
        autocomplete="off"
        on:keydown={onSearchKeydown}
      />
    </label>

    <div class="panel-scroll">
      <div class="caption">Profiles</div>
      {#each $managedProfiles as profile}
        <button class="nav-item profile-item" title={profile.title} on:click={showManagedInfo}>
          <ProfileBadge {profile} isManaged size={20} />
          <span class="nav-label">{profile.title}</span>
        </button>
      {/each}
      {#each filteredProfiles as { profile, index } (profile)}
        <button
          class="nav-item profile-item"
          class:selected={profile === $selectedProfile}
          title={profile.title}
          on:click={() => onSelect(index)}
          on:contextmenu={(e) => onContextMenu(e, index)}
        >
          <ProfileBadge {profile} size={20} active={profile.alwaysOn || profile === $selectedProfile} />
          <span class="nav-label">{profile.title}</span>
          {#if profile.alwaysOn}
            <span class="nav-trailing" title="Always stay on"><Icon icon={Pin} size={13} /></span>
          {/if}
        </button>
      {/each}
      <button class="nav-item" title="Add profile" on:click={onAddProfile}>
        <span class="nav-icon"><Icon icon={Plus} /></span>
        <span class="nav-label">Add profile</span>
      </button>
      <button class="nav-item" title="Sort profiles" on:click={onSort}>
        <span class="nav-icon"><Icon icon={sortIcon} /></span>
        <span class="nav-label">Sort profiles</span>
      </button>
    </div>
  </nav>
{/if}

<ProfileContextMenu bind:this={contextMenu} />

<style>
  .rail,
  .panel {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    background: var(--bg-subtle);
    border-right: 1px solid var(--border);
    --avatar-ring-gap: var(--bg-subtle);
  }

  /* ---------- rail ---------- */
  .rail {
    width: 48px;
    align-items: center;
    gap: 2px;
    padding: 8px 0;
    z-index: 5;
  }
  .rail-profiles {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-height: 0;
    overflow-y: auto;
    scrollbar-width: none;
    padding: 3px 0;
  }
  .rail-btn {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg-muted);
    cursor: pointer;
    transition: background-color 0.12s, color 0.12s;
  }
  .rail-btn:hover {
    background: var(--bg-hover);
    color: var(--fg);
  }
  .rail-btn.on,
  .nav-item.on .nav-icon {
    color: var(--accent);
  }
  .rail-separator {
    flex: none;
    width: 20px;
    height: 1px;
    margin: 6px 0;
    background: var(--border);
  }

  /* ---------- expanded panel ---------- */
  .panel {
    width: 240px;
    padding: 0 8px 8px;
    z-index: 20;
  }
  .panel.overlay {
    box-shadow: var(--shadow-md);
  }
  .scrim {
    position: fixed;
    inset: 0;
    z-index: 19;
    background: var(--backdrop);
  }
  .panel-header {
    flex: none;
    display: flex;
    align-items: center;
    gap: 8px;
    height: 48px;
    padding: 0 0 0 4px;
  }
  .panel.overlay .panel-header {
    padding-left: 0;
  }
  .brand-icon {
    border-radius: 5px;
  }
  .brand {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .search {
    flex: none;
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  .search :global(.search-icon) {
    position: absolute;
    left: 9px;
    color: var(--fg-subtle);
    pointer-events: none;
  }
  .search input {
    width: 100%;
    height: 30px;
    padding: 0 10px 0 28px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg);
    color: var(--fg);
    font-size: 12.5px;
  }
  .search input::placeholder {
    color: var(--fg-subtle);
  }
  .search input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--ring);
  }
  .panel-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .caption {
    padding: 8px 8px 4px;
    font-size: 11px;
    font-weight: 500;
    color: var(--fg-subtle);
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    height: 32px;
    padding: 0 8px;
    border: none;
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--fg);
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.12s;
  }
  .nav-item:hover {
    background: var(--bg-hover);
  }
  .nav-item.selected {
    background: var(--bg-active);
    font-weight: 500;
  }
  .nav-icon {
    display: inline-flex;
    justify-content: center;
    width: 20px;
    color: var(--fg-muted);
  }
  .nav-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .nav-trailing {
    display: inline-flex;
    color: var(--fg-subtle);
  }
  .panel-separator {
    height: 1px;
    margin: 8px 4px 4px;
    background: var(--border);
  }
</style>
