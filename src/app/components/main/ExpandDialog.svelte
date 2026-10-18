<script>
  // Edits one modifier's name / value / comment in large text areas.
  import { createEventDispatcher } from 'svelte';
  import Button from '../../ui/Button.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import Textarea from '../../ui/Textarea.svelte';

  export let open = false;
  export let title = '';
  export let nameLabel = 'Name';
  export let valueLabel = 'Value';
  export let modifier = { name: '', value: '', comment: '' };

  const dispatch = createEventDispatcher();
  let wasOpen = false;

  $: if (open) wasOpen = true;
  $: if (!open && wasOpen) {
    wasOpen = false;
    dispatch('save', modifier);
  }
</script>

<Dialog bind:open {title} width={520}>
  <div class="dialog-fields">
    <Textarea label={nameLabel} rows={2} bind:value={modifier.name} />
    <Textarea label={valueLabel} rows={5} bind:value={modifier.value} />
    <Textarea label="Comment" rows={2} bind:value={modifier.comment} />
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
