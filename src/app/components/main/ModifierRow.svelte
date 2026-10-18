<script>
  import { createEventDispatcher } from 'svelte';
  import { X } from 'lucide';
  import Checkbox from '../../ui/Checkbox.svelte';
  import IconButton from '../../ui/IconButton.svelte';
  import AutocompleteInput from '../common/AutocompleteInput.svelte';
  import RowMoreMenu from './RowMoreMenu.svelte';
  import HeaderAdvancedRow from './HeaderAdvancedRow.svelte';

  export let modifier;
  export let index;
  export let count;
  export let config;
  export let hideComment;

  const dispatch = createEventDispatcher();

  $: customField = config.customAutocompleteField;
  $: nameList = modifier.name && config.autocompleteListId ? config.autocompleteListId : `${customField}-name`;

  function update(patch) {
    dispatch('change', { ...modifier, ...patch });
  }
</script>

<div class="mh-row" class:unchecked={!modifier.enabled}>
  <Checkbox
    checked={modifier.enabled}
    title={modifier.enabled ? 'Disable' : 'Enable'}
    on:change={(e) => update({ enabled: e.target.checked })}
  />
  <AutocompleteInput
    name="header-name"
    placeholder={config.nameLabel}
    list={nameList}
    selectAllOnFocus
    append={Boolean(modifier.appendMode)}
    value={modifier.name}
    title={modifier.name}
    on:input={(e) => update({ name: e.target.value })}
  />
  <AutocompleteInput
    name="header-value"
    placeholder={config.valueLabel}
    list="{customField}-value"
    selectAllOnFocus
    value={modifier.value}
    title={modifier.value}
    on:input={(e) => update({ value: e.target.value })}
  />
  {#if !hideComment}
    <AutocompleteInput
      name="header-comment"
      placeholder="Comment"
      value={modifier.comment}
      on:input={(e) => update({ comment: e.target.value })}
    />
  {/if}
  <IconButton class="mh-row-action" icon={X} title="Delete" size="sm" tone="danger" on:click={() => dispatch('remove')} />
  <RowMoreMenu
    {index}
    {count}
    {hideComment}
    supportAppendMode={config.supportAppendMode}
    appendMode={modifier.appendMode}
    on:expand
    on:duplicate
    on:move
    on:toggleComment
    on:clearValue={() => update({ value: '' })}
    on:toggleAppend={() => {
      if (modifier.appendMode) {
        const { appendMode, ...rest } = modifier;
        dispatch('change', rest);
      } else {
        update({ appendMode: 'append' });
      }
    }}
  />
</div>
{#if config.advanced === 'header'}
  <HeaderAdvancedRow
    {modifier}
    modifierIndex={index}
    modifierType={config.type}
    unchecked={!modifier.enabled}
    on:change
  />
{/if}
