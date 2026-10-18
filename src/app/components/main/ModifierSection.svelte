<script>
  import { slide } from 'svelte/transition';
  import { orderBy } from 'lodash-es';
  import { Plus } from 'lucide';
  import Button from '../../ui/Button.svelte';
  import Checkbox from '../../ui/Checkbox.svelte';
  import { newModifier, newUrlReplacement } from '../../../shared/profile.js';
  import { updateProfile } from '../../stores.js';
  import ModifierRow from './ModifierRow.svelte';
  import SectionMoreMenu from './SectionMoreMenu.svelte';
  import ExpandDialog from './ExpandDialog.svelte';
  import CustomizeAutocompleteDialog from './CustomizeAutocompleteDialog.svelte';
  import { ModifierType } from './sections.js';

  export let config;
  export let profile;

  let expandOpen = false;
  let expandIndex = -1;
  let expandModifier = { name: '', value: '', comment: '' };
  let autocompleteOpen = false;

  $: modifiers = profile[config.field] || [];
  $: hideComment = profile.hideComment;
  $: custom = profile[config.customAutocompleteField] || {};
  $: customNames = custom.autocompleteName || [];
  $: customValues = custom.autocompleteValue || [];
  $: knownNames = [...new Set([...customNames, ...(config.knownNames || [])])];
  $: allEnabled = modifiers.length > 0 && modifiers.every((m) => m.enabled);
  $: enabledCount = modifiers.filter((m) => m.enabled).length;
  $: someEnabled = modifiers.some((m) => m.enabled);
  $: sortOptions = [
    { key: 'name', label: config.nameLabel },
    { key: 'value', label: config.valueLabel },
    ...(hideComment ? [] : [{ key: 'comment', label: 'Comment' }]),
  ];

  function save(list) {
    updateProfile({ [config.field]: list });
  }

  async function add() {
    const item = config.type === ModifierType.URL_REPLACEMENT ? await newUrlReplacement() : newModifier();
    save([...modifiers, item]);
  }

  function toggleAll() {
    const enabled = !allEnabled;
    save(modifiers.map((m) => ({ ...m, enabled })));
  }

  function replaceAt(index, item) {
    const list = [...modifiers];
    list[index] = item;
    save(list);
  }

  function remove(index) {
    save(modifiers.filter((_, i) => i !== index));
  }

  function duplicate(index) {
    const list = [...modifiers];
    list.splice(index, 0, structuredClone(modifiers[index]));
    save(list);
  }

  function move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= modifiers.length) return;
    const list = [...modifiers];
    [list[index], list[target]] = [list[target], list[index]];
    save(list);
  }

  function openExpand(index) {
    expandIndex = index;
    expandModifier = structuredClone(modifiers[index]);
    expandOpen = true;
  }
</script>

<section class="mh-section" id={config.type}>
  {#if config.autocompleteListId}
    <datalist id={config.autocompleteListId}>
      {#each knownNames as name}
        <option value={name}></option>
      {/each}
    </datalist>
  {/if}
  <datalist id="{config.customAutocompleteField}-name">
    {#each customNames as name}
      <option value={name}></option>
    {/each}
  </datalist>
  <datalist id="{config.customAutocompleteField}-value">
    {#each customValues as value}
      <option value={value}></option>
    {/each}
  </datalist>

  <div class="mh-section-header">
    <Checkbox
      title={allEnabled ? 'Disable all' : 'Enable all'}
      checked={allEnabled}
      indeterminate={someEnabled && !allEnabled}
      disabled={modifiers.length === 0}
      on:click={toggleAll}
    />
    <div class="mh-section-title">
      {config.title}
      <span class="count-badge" title="Enabled / total">{enabledCount}/{modifiers.length}</span>
    </div>
    <SectionMoreMenu
      {sortOptions}
      showCustomizeAutocomplete
      on:add={add}
      on:clear={() => save([])}
      on:customizeAutocomplete={() => (autocompleteOpen = true)}
      on:sort={(e) => save(orderBy(modifiers, [e.detail.key], [e.detail.order]))}
    />
  </div>

  {#each modifiers as modifier, index}
    <div transition:slide|local>
      <ModifierRow
        {modifier}
        {index}
        count={modifiers.length}
        {config}
        {hideComment}
        on:change={(e) => replaceAt(index, e.detail)}
        on:remove={() => remove(index)}
        on:duplicate={() => duplicate(index)}
        on:move={(e) => move(index, e.detail)}
        on:expand={() => openExpand(index)}
        on:toggleComment={() => updateProfile({ hideComment: !hideComment })}
      />
    </div>
  {/each}
  <div class="mh-add-row">
    <Button variant="link" size="sm" icon={Plus} on:click={add}>{config.addModifierText}</Button>
  </div>
  <slot name="bottom-slot" />
</section>

<ExpandDialog
  bind:open={expandOpen}
  title={config.title}
  nameLabel={config.nameLabel}
  valueLabel={config.valueLabel}
  modifier={expandModifier}
  on:save={(e) => expandIndex >= 0 && modifiers[expandIndex] && replaceAt(expandIndex, e.detail)}
/>
<CustomizeAutocompleteDialog
  bind:open={autocompleteOpen}
  nameLabel={config.nameLabel}
  valueLabel={config.valueLabel}
  autocomplete={custom}
  on:save={(e) => updateProfile({ [config.customAutocompleteField]: e.detail })}
/>
