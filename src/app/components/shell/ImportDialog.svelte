<script>
  // Import profiles from pasted JSON or a .json file.
  import { FileUp } from 'lucide';
  import Button from '../../ui/Button.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import Textarea from '../../ui/Textarea.svelte';
  import { importProfiles, showImportDialog, showToast } from '../../stores.js';

  let text = '';
  let fileInput;

  function done(parsed) {
    const list = Array.isArray(parsed) ? parsed : [parsed];
    if (!list.length || list.some((p) => !p || typeof p !== 'object')) throw new Error('Invalid profile');
    importProfiles(list);
    text = '';
    showImportDialog.set(false);
  }

  function fail() {
    showToast('Failed to import profiles. Please double check your exported profile.');
  }

  function importText() {
    const trimmed = text.trim();
    try {
      if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) throw new Error('Not JSON');
      done(JSON.parse(trimmed));
    } catch {
      fail();
    }
  }

  async function onFileSelected(event) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    try {
      done(JSON.parse(await file.text()));
    } catch {
      fail();
    }
  }
</script>

<Dialog
  open={$showImportDialog}
  title="Import profile"
  description="Enter the URL / JSON encoded profile here to import."
  width={520}
  on:close={() => showImportDialog.set(false)}
>
  <Textarea bind:value={text} rows={10} placeholder={'[{"title": "Profile 1", "headers": [...]}]'} />
  <input bind:this={fileInput} type="file" accept=".json,application/json" hidden on:change={onFileSelected} />
  <svelte:fragment slot="footer">
    <Button variant="outline" icon={FileUp} on:click={() => fileInput.click()}>Load file</Button>
    <Button variant="primary" disabled={!text.trim()} on:click={importText}>Import</Button>
  </svelte:fragment>
</Dialog>
