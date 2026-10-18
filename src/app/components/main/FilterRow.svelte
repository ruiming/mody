<script>
  import { createEventDispatcher } from 'svelte';
  import { X } from 'lucide';
  import Checkbox from '../../ui/Checkbox.svelte';
  import IconButton from '../../ui/IconButton.svelte';
  import AutocompleteInput from '../common/AutocompleteInput.svelte';
  import RowMoreMenu from './RowMoreMenu.svelte';
  import UpdateFilterChip from './cells/UpdateFilterChip.svelte';
  import ResourceTypeCell from './cells/ResourceTypeCell.svelte';
  import MethodsCell from './cells/MethodsCell.svelte';
  import TimeCell from './cells/TimeCell.svelte';
  import TabCell from './cells/TabCell.svelte';
  import TabGroupCell from './cells/TabGroupCell.svelte';

  export let filter;
  export let type;
  export let index;
  export let count;
  export let hideComment;

  const dispatch = createEventDispatcher();

  function update(patch) {
    dispatch('change', { ...filter, ...patch });
  }

  const forward = (e) => dispatch('change', e.detail);
</script>

<div class="mh-row" class:unchecked={!filter.enabled}>
  <Checkbox
    checked={filter.enabled}
    title={filter.enabled ? 'Disable' : 'Enable'}
    on:change={(e) => update({ enabled: e.target.checked })}
  />
  {#if type === 'urls' || type === 'excludeUrls'}
    <AutocompleteInput
      name="url-regex"
      placeholder=".*://.*.google.com/.*"
      value={filter.urlRegex}
      on:input={(e) => update({ urlRegex: e.target.value })}
    />
  {:else if type === 'excludeRequestDomains'}
    <AutocompleteInput
      name="url-request-domain"
      placeholder="www.example.com"
      value={filter.domain}
      on:input={(e) => update({ domain: e.target.value })}
    />
  {:else if type === 'requestMethods'}
    <MethodsCell {filter} on:change={forward} />
  {:else if type === 'initiatorDomains'}
    <div class="mh-cell">
      <UpdateFilterChip on:replace />
      <AutocompleteInput
        name="domain"
        placeholder="google.com"
        value={filter.domain}
        on:input={(e) => update({ domain: e.target.value })}
      />
    </div>
  {:else if type === 'types'}
    <ResourceTypeCell {filter} on:change={forward} />
  {:else if type === 'time'}
    <TimeCell {filter} on:change={forward} />
  {:else if type === 'tabs'}
    <div class="mh-cell">
      <UpdateFilterChip on:replace />
      <TabCell {filter} {hideComment} on:change={forward} />
    </div>
  {:else if type === 'tabGroups'}
    <div class="mh-cell">
      <UpdateFilterChip on:replace />
      <TabGroupCell {filter} {hideComment} key="groupId" on:change={forward} />
    </div>
  {:else if type === 'windows'}
    <div class="mh-cell">
      <UpdateFilterChip on:replace />
      <TabGroupCell {filter} {hideComment} key="windowId" on:change={forward} />
    </div>
  {/if}
  {#if !hideComment}
    <AutocompleteInput
      name="comment"
      placeholder="Comment"
      value={filter.comment}
      on:input={(e) => update({ comment: e.target.value })}
    />
  {/if}
  <IconButton class="mh-row-action" icon={X} title="Delete" size="sm" tone="danger" on:click={() => dispatch('remove')} />
  <RowMoreMenu
    {index}
    {count}
    {hideComment}
    showExpand={false}
    showClearValue={false}
    on:duplicate
    on:move
    on:toggleComment
  />
</div>
