<script>
  // Export selected profiles as JSON (copy or download).
  import { Download } from 'lucide';
  import Button from '../../ui/Button.svelte';
  import Checkbox from '../../ui/Checkbox.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import Icon from '../../ui/Icon.svelte';
  import ExportTextField from './ExportTextField.svelte';
  import { exportProfile } from '../../../shared/profile.js';
  import { profiles, selectedProfileIndex, showExportDialog } from '../../stores.js';

  let selected = [];
  let keepStyles = false;
  let wasOpen = false;

  $: open = $showExportDialog;
  // Indices of the selected profiles.
  $: onOpenChange(open);

  function onOpenChange(isOpen) {
    if (isOpen && !wasOpen) selected = [$selectedProfileIndex];
    wasOpen = isOpen;
  }

  $: selectedProfiles = $profiles.filter((_, i) => selected.includes(i));
  $: allSelected = selectedProfiles.length === $profiles.length;
  $: exported = selectedProfiles.map((p) => exportProfile(p, { keepStyles }));
  $: json = JSON.stringify(exported);
  $: downloadHref = `data:application/json;base64,${toBase64(json)}`;
  $: downloadName = `${selectedProfiles.map((p) => p.title).join('+')}.json`;

  function toBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function toggle(index) {
    selected = selected.includes(index) ? selected.filter((i) => i !== index) : [...selected, index];
  }

  function toggleAll() {
    selected = allSelected ? [] : $profiles.map((_, i) => i);
  }
</script>

<Dialog
  {open}
  title="Share with people"
  description="Export the selected profiles as JSON."
  width={600}
  hideFooter
  on:close={() => showExportDialog.set(false)}
>
  <div class="export-json-dialog-content">
    <div class="profile-list">
      {#each $profiles as profile, index}
        <label class="profile-option" class:checked={selected.includes(index)}>
          <Checkbox checked={selected.includes(index)} on:change={() => toggle(index)} />
          <span class="profile-dot" style="background: {profile.backgroundColor};"></span>
          <span class="profile-name">{profile.title}</span>
        </label>
      {/each}
    </div>
    <div class="export-pane">
      <ExportTextField value={json} numRows={8} />
      <div class="caption">Be careful about sharing sensitive data, e.g. auth token / cookies!</div>
      <label class="inline-check">
        <Checkbox bind:checked={keepStyles} />
        <span>Export styles</span>
      </label>
      <div class="actions">
        <Button variant="ghost" size="sm" on:click={toggleAll}>{allSelected ? 'Deselect all' : 'Select all'}</Button>
        <span class="flex-grow"></span>
        {#if selectedProfiles.length === 0}
          <Button variant="primary" size="sm" icon={Download} disabled>Download JSON</Button>
        {:else}
          <a class="download-link" href={downloadHref} download={downloadName}>
            <Icon icon={Download} size={14} />
            Download JSON
          </a>
        {/if}
      </div>
    </div>
  </div>
</Dialog>

<style>
  .export-json-dialog-content {
    display: grid;
    grid-template-columns: 170px 1fr;
    gap: 16px;
  }
  .profile-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    max-height: 260px;
    overflow-y: auto;
  }
  .profile-option {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 30px;
    padding: 0 8px;
    border-radius: var(--radius-sm);
    cursor: pointer;
  }
  .profile-option:hover {
    background: var(--bg-hover);
  }
  .profile-option.checked {
    background: var(--bg-active);
  }
  .profile-dot {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .profile-name {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .export-pane {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
  }
  .caption {
    color: var(--warning);
    font-size: 12px;
  }
  .inline-check {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }
  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  /* Styled like a small primary Button. */
  .download-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 26px;
    padding: 0 8px;
    border-radius: var(--radius-sm);
    background: var(--primary);
    color: var(--primary-fg);
    box-shadow: var(--shadow-sm);
    font-size: 12px;
    font-weight: 500;
    text-decoration: none;
  }
  .download-link:hover {
    background: var(--primary-hover);
  }
</style>
