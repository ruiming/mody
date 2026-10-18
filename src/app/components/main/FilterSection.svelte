<script>
  import { slide } from 'svelte/transition';
  import { orderBy } from 'lodash-es';
  import { Plus } from 'lucide';
  import Checkbox from '../../ui/Checkbox.svelte';
  import IconButton from '../../ui/IconButton.svelte';
  import { createFilter } from '../../../shared/profile.js';
  import { updateProfile } from '../../stores.js';
  import FilterRow from './FilterRow.svelte';
  import SectionMoreMenu from './SectionMoreMenu.svelte';

  export let config;
  export let profile;

  $: filters = profile[config.field] || [];
  $: hideComment = profile.hideComment;
  $: allEnabled = filters.length > 0 && filters.every((f) => f.enabled);
  $: someEnabled = filters.some((f) => f.enabled);
  $: sortOptions = [
    ...(config.sortKey ? [{ key: config.sortKey, label: config.sortLabel }] : []),
    ...(hideComment ? [] : [{ key: 'comment', label: 'Comment' }]),
  ];

  function save(list) {
    updateProfile({ [config.field]: list });
  }

  async function add() {
    save([...filters, await createFilter(config.field)]);
  }

  function replaceAt(index, item) {
    const list = [...filters];
    list[index] = item;
    save(list);
  }

  function duplicate(index) {
    const list = [...filters];
    list.splice(index, 0, structuredClone(filters[index]));
    save(list);
  }

  function move(index, delta) {
    const target = index + delta;
    if (target < 0 || target >= filters.length) return;
    const list = [...filters];
    [list[index], list[target]] = [list[target], list[index]];
    save(list);
  }

  // Replaces the filter at `index` with a new filter of `field` built from the active tab.
  async function replaceWith(index, field) {
    const created = await createFilter(field);
    const remaining = filters.filter((_, i) => i !== index);
    if (field === config.field) {
      save([...remaining, created]);
    } else {
      updateProfile({ [config.field]: remaining, [field]: [...(profile[field] || []), created] });
    }
  }

  function sortBy({ key, order }) {
    // Resource filters sort by their joined type list.
    const iteratee = key === 'type' ? (f) => (f.resourceType || []).join(',') : key;
    save(orderBy(filters, [iteratee], [order]));
  }
</script>

<section class="mh-section" id={config.type}>
  <div class="mh-section-header">
    <Checkbox
      title={allEnabled ? 'Disable all' : 'Enable all'}
      checked={allEnabled}
      indeterminate={someEnabled && !allEnabled}
      disabled={filters.length === 0}
      on:click={() => save(filters.map((f) => ({ ...f, enabled: !allEnabled })))}
    />
    <div class="mh-section-title">
      {config.label}
      <span class="count-badge" title="Enabled / total">{filters.filter((f) => f.enabled).length}/{filters.length}</span>
    </div>
    <IconButton icon={Plus} title={config.addFilterText} on:click={add} />
    <SectionMoreMenu {sortOptions} on:add={add} on:clear={() => save([])} on:sort={(e) => sortBy(e.detail)} />
  </div>
  {#if config.description}
    <div class="mh-section-description">{config.description}</div>
  {/if}
  {#each filters as filter, index}
    <div transition:slide|local>
      <FilterRow
        {filter}
        type={config.type}
        {index}
        count={filters.length}
        {hideComment}
        on:change={(e) => replaceAt(index, e.detail)}
        on:remove={() => save(filters.filter((_, i) => i !== index))}
        on:duplicate={() => duplicate(index)}
        on:move={(e) => move(index, e.detail)}
        on:replace={(e) => replaceWith(index, e.detail)}
        on:toggleComment={() => updateProfile({ hideComment: !hideComment })}
      />
    </div>
  {/each}
</section>
