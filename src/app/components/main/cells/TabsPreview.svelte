<script>
  import { FileQuestion } from 'lucide';
  import Icon from '../../../ui/Icon.svelte';

  export let tabs = [];
  export let hideComment = true;

  $: limit = hideComment ? 6 : 3;
</script>

{#each tabs.slice(0, limit) as tab (tab.id)}
  {#if tab.favIconUrl}
    <img src={tab.favIconUrl} class="mh-favicon" alt={tab.title} title={tab.title} />
  {:else}
    <span class="mh-muted" title={tab.title}><Icon icon={FileQuestion} size={16} /></span>
  {/if}
{/each}
{#if tabs.length > limit}
  <span class="mh-muted">{hideComment ? `and ${tabs.length - limit} more...` : `+${tabs.length - limit}...`}</span>
{/if}
