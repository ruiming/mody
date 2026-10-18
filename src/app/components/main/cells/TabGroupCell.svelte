<script>
  // Shared by tab group and window filters.
  import { createEventDispatcher } from 'svelte';
  import Chip from '../../common/Chip.svelte';
  import TabsPreview from './TabsPreview.svelte';
  import { getActiveTab } from '../../../../shared/tabs.js';

  export let filter;
  export let hideComment = true;
  // 'groupId' | 'windowId'
  export let key = 'groupId';

  const dispatch = createEventDispatcher();
  let tabs = [];
  let loaded = false;

  async function load(id) {
    try {
      tabs = id === undefined || id === null || id < 0 ? [] : await chrome.tabs.query({ [key]: id });
    } catch {
      tabs = [];
    }
    loaded = true;
  }

  $: load(filter[key]);
  $: labels =
    key === 'groupId'
      ? { use: 'Use current tab group', tooltip: 'Filter by current tab group', missing: 'Tab group no longer exists' }
      : { use: 'Use current window', tooltip: 'Filter by current window', missing: 'Window no longer exists' };

  async function useCurrent() {
    const current = await getActiveTab();
    if (current) dispatch('change', { ...filter, [key]: current[key] });
  }
</script>

{#if tabs.length}
  <TabsPreview {tabs} {hideComment} />
{:else if loaded}
  <Chip trailingAction="none" tooltip={labels.tooltip} on:click={useCurrent}>{labels.use}</Chip>
  <span class="mh-muted">{labels.missing}</span>
{/if}
