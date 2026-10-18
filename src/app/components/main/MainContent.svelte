<script>
  import { onDestroy, onMount } from 'svelte';
  import { CirclePause, Info, ListFilter, Play, Plus, SlidersHorizontal } from 'lucide';
  import { addDialogTab, isPaused, loadFromStorage, selectedProfile, setIsPaused } from '../../stores.js';
  import Button from '../../ui/Button.svelte';
  import Icon from '../../ui/Icon.svelte';
  import './main.css';
  import Tooltip from '../common/Tooltip.svelte';
  import RuleStatusBanner from './RuleStatusBanner.svelte';
  import ModifierSection from './ModifierSection.svelte';
  import FilterSection from './FilterSection.svelte';
  import CspPreview from './CspPreview.svelte';
  import { FILTER_FIELDS_SHOWN, FILTER_SECTIONS, MODIFIER_FIELDS_SHOWN, MODIFIER_SECTIONS } from './sections.js';

  $: profile = $selectedProfile;
  $: hasModifiers = profile && MODIFIER_FIELDS_SHOWN.some((field) => profile[field]?.length);
  $: hasFilters = profile && FILTER_FIELDS_SHOWN.some((field) => profile[field]?.length);

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') loadFromStorage();
  }

  onMount(() => {
    window.addEventListener('focus', loadFromStorage);
    document.addEventListener('visibilitychange', onVisibilityChange);
  });

  onDestroy(() => {
    window.removeEventListener('focus', loadFromStorage);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  });
</script>

<div class="main-content" class:paused={$isPaused}>
  <Tooltip />
  <RuleStatusBanner />
  {#if $isPaused}
    <div class="paused-banner">
      <Icon icon={CirclePause} size={15} />
      <span class="banner-text">Mody is paused. Modifications are not applied.</span>
      <Button variant="ghost" size="sm" icon={Play} class="resume-button" on:click={() => setIsPaused(false)}>Resume</Button>
    </div>
  {/if}
  {#if profile}
    {#each MODIFIER_SECTIONS as config (config.type)}
      {#if profile[config.field]?.length}
        <ModifierSection {config} {profile}>
          <svelte:fragment slot="bottom-slot">
            {#if config.field === 'cspHeaders'}
              <CspPreview cspHeaders={profile.cspHeaders} />
            {/if}
          </svelte:fragment>
        </ModifierSection>
      {/if}
    {/each}

    {#if hasFilters}
      <div class="filter-group">
        <div class="filter-group-label">Filters</div>
        {#each FILTER_SECTIONS as config (config.type)}
          {#if profile[config.field]?.length}
            <FilterSection {config} {profile} />
          {/if}
        {/each}
      </div>
    {/if}

    <div class="content-fill">
      {#if !hasModifiers}
        <div class="empty-state">
          <div class="empty-icon"><Icon icon={SlidersHorizontal} size={24} /></div>
          <div>You have no modifications. Add a modification to get started.</div>
        </div>
      {:else if !hasFilters}
        <div class="hint-text">
          <Icon icon={Info} size={14} />
          <span>
            Your modifications are being applied to all requests. Add a filter to limit the modification to certain
            URLs or tabs.
          </span>
        </div>
      {/if}
    </div>

    <div class="bottom-bar">
      <Button variant="primary" icon={Plus} on:click={() => addDialogTab.set('mods')}>Mod</Button>
      <Button variant="outline" icon={ListFilter} on:click={() => addDialogTab.set('filters')}>Filter</Button>
    </div>
  {/if}
</div>

<style>
  .main-content {
    position: absolute;
    top: var(--top-bar-height);
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: clip;
    background: var(--bg);
  }
  .main-content.paused > :global(:not(.paused-banner):not(.rule-status):not(.rule-success)) {
    opacity: 0.5;
    pointer-events: none;
  }
  .paused-banner {
    position: sticky;
    top: 0;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 6px 0 14px;
    border-bottom: 1px solid var(--border);
    background: var(--warning-soft);
    color: var(--warning);
    font-size: 12.5px;
    font-weight: 500;
    backdrop-filter: blur(8px);
  }
  .banner-text {
    flex: 1;
  }
  .paused-banner :global(.resume-button) {
    color: var(--warning);
  }
  .filter-group {
    background: var(--bg-subtle);
    border-bottom: 1px solid var(--border);
  }
  .filter-group :global(.mh-section:last-child) {
    border-bottom: none;
  }
  .filter-group-label {
    padding: 10px 18px 0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-subtle);
  }
  .content-fill {
    flex: 1 0 auto;
  }
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 40px 24px;
    color: var(--fg-muted);
    font-size: 13px;
    text-align: center;
  }
  .empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    background: var(--bg-muted);
    color: var(--fg-muted);
  }
  .hint-text {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 12px 18px;
    color: var(--fg-muted);
    font-size: 12.5px;
    line-height: 1.5;
  }
  .hint-text :global(.icon) {
    margin-top: 2px;
  }
  .bottom-bar {
    position: sticky;
    bottom: 0;
    z-index: 3;
    display: flex;
    gap: 8px;
    padding: 10px 12px;
    border-top: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg) 85%, transparent);
    backdrop-filter: blur(8px);
  }
</style>
