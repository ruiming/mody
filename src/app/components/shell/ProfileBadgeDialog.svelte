<script>
  // Edit badge text, background and text color of the selected profile.
  import { tick } from 'svelte';
  import { Check } from 'lucide';
  import Button from '../../ui/Button.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import Tabs from '../../ui/Tabs.svelte';
  import HsvColorPicker from './HsvColorPicker.svelte';
  import { selectedProfile, updateProfile } from '../../stores.js';

  export let open = false;

  const tabs = [
    { id: 'backgroundColor', label: 'Background' },
    { id: 'textColor', label: 'Text Color' },
  ];

  let activeTab = 'backgroundColor';
  let shortTitle = '';
  let backgroundColor = '#000000';
  let textColor = '#ffffff';
  let input;
  let wasOpen = false;

  $: onOpenChange(open);

  function onOpenChange(isOpen) {
    if (isOpen && !wasOpen) reset();
    wasOpen = isOpen;
  }

  async function reset() {
    shortTitle = $selectedProfile.shortTitle ?? '';
    backgroundColor = $selectedProfile.backgroundColor;
    textColor = $selectedProfile.textColor;
    activeTab = 'backgroundColor';
    await tick();
    setTimeout(() => input?.focus(), 100);
  }

  function onColorChange(event) {
    if (activeTab === 'backgroundColor') backgroundColor = event.detail.hex;
    else textColor = event.detail.hex;
  }

  function save() {
    updateProfile({ shortTitle, backgroundColor, textColor });
    open = false;
  }
</script>

<Dialog bind:open title="Profile badge" width={340}>
  <div class="badge-row">
    <span class="badge-label">Change badge text:</span>
    <span class="profile-badge-preview" style="background: {backgroundColor};">
      <input
        bind:this={input}
        bind:value={shortTitle}
        class="profile-badge-preview-text"
        style="color: {textColor};"
        type="text"
        maxlength="1"
      />
    </span>
  </div>
  <Tabs items={tabs} bind:value={activeTab} class="badge-tabs" />
  <div class="color-picker-container">
    {#key activeTab}
      <HsvColorPicker color={activeTab === 'backgroundColor' ? backgroundColor : textColor} on:colorchange={onColorChange} />
    {/key}
  </div>
  <svelte:fragment slot="footer">
    <Button variant="outline" on:click={() => (open = false)}>Cancel</Button>
    <Button variant="primary" icon={Check} on:click={save}>Save</Button>
  </svelte:fragment>
</Dialog>

<style>
  .badge-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .badge-label {
    color: var(--fg-muted);
  }
  .profile-badge-preview {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  }
  .profile-badge-preview-text {
    width: 100%;
    border: none;
    background: none;
    outline: none;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
  }
  .badge-row :global(+ .badge-tabs),
  :global(.badge-tabs) {
    display: flex;
  }
  :global(.badge-tabs .tab) {
    flex: 1;
  }
  .color-picker-container {
    margin-top: 12px;
  }
</style>
