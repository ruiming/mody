<script>
  import { createEventDispatcher } from 'svelte';
  import { FileQuestion } from 'lucide';
  import Icon from '../../../ui/Icon.svelte';
  import Chip from '../../common/Chip.svelte';
  import { getActiveTab } from '../../../../shared/tabs.js';

  export let filter;
  export let hideComment = true;

  const dispatch = createEventDispatcher();
  let tab;
  let missing = false;

  async function load(tabId) {
    try {
      tab = await chrome.tabs.get(tabId);
      missing = false;
    } catch {
      tab = undefined;
      missing = true;
    }
  }

  $: load(filter.tabId);
  $: title = tab?.title || '';
  $: shortTitle = title.length > 30 ? `${title.slice(0, 30)}...` : title;

  async function useCurrentTab() {
    const current = await getActiveTab();
    if (current) dispatch('change', { ...filter, tabId: current.id });
  }
</script>

{#if tab}
  {#if tab.favIconUrl}
    <img src={tab.favIconUrl} class="mh-favicon" alt={title} title={title} />
  {:else}
    <span class="mh-muted" title={title}><Icon icon={FileQuestion} size={16} /></span>
  {/if}
  {#if hideComment}<span class="tab-title" title={title}>{shortTitle}</span>{/if}
{:else if missing}
  <Chip trailingAction="none" tooltip="Filter by current tab" on:click={useCurrentTab}>Use current tab</Chip>
  <span class="mh-muted">Tab no longer exists.</span>
{/if}

<style>
  .tab-title {
    font-size: 12.5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
