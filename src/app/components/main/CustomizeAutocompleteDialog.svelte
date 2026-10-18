<script>
  // Edits the per-profile custom autocomplete entries of one section.
  import { createEventDispatcher } from 'svelte';
  import Button from '../../ui/Button.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import Textarea from '../../ui/Textarea.svelte';

  export let open = false;
  export let nameLabel = 'Name';
  export let valueLabel = 'Value';
  export let autocomplete = { autocompleteName: [], autocompleteValue: [] };

  const dispatch = createEventDispatcher();
  let names = '';
  let values = '';
  let wasOpen = false;

  const toLines = (text) =>
    text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

  $: if (open && !wasOpen) {
    wasOpen = true;
    names = (autocomplete?.autocompleteName || []).join('\n');
    values = (autocomplete?.autocompleteValue || []).join('\n');
  }
  $: if (!open && wasOpen) {
    wasOpen = false;
    dispatch('save', { autocompleteName: toLines(names), autocompleteValue: toLines(values) });
  }
</script>

<Dialog
  bind:open
  title="Customize autocomplete"
  description="Enter the entries that you would like to show up in autocomplete. These autocomplete entries will show up when you focus on an input and as you type."
  width={520}
>
  <div class="dialog-fields">
    <Textarea label="{nameLabel} - One entry per line" rows={5} bind:value={names} />
    <Textarea label="{valueLabel} - One entry per line" rows={5} bind:value={values} />
  </div>
  <svelte:fragment slot="footer">
    <Button variant="primary" on:click={() => (open = false)}>Done</Button>
  </svelte:fragment>
</Dialog>

<style>
  .dialog-fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>
