<script>
  // Shows the combined CSP value and offers copy / parse helpers.
  import { Copy, ScanText } from 'lucide';
  import { showToast, updateProfile } from '../../stores.js';
  import Button from '../../ui/Button.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import Textarea from '../../ui/Textarea.svelte';

  export let cspHeaders = [];

  let parserOpen = false;
  let rawCsp = '';

  $: cspValue = cspHeaders
    .filter((item) => item.enabled && item.name)
    .map((item) => `${item.name} ${item.value}`)
    .join('; ');

  async function copyCsp() {
    await navigator.clipboard.writeText(cspValue);
    showToast('Content-Security-Policy value has been copied to your clipboard');
  }

  function parseCsp() {
    const directives = [];
    for (const part of rawCsp.split(';')) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const space = trimmed.indexOf(' ');
      directives.push({
        enabled: true,
        name: space >= 0 ? trimmed.slice(0, space) : trimmed,
        value: space >= 0 ? trimmed.slice(space + 1).trim() : '',
        comment: '',
      });
    }
    updateProfile({ cspHeaders: directives });
    parserOpen = false;
  }
</script>

<div class="csp-container">
  <div class="csp-preview">
    <span class="csp-label">Content-Security-Policy:</span>
    <code>{cspValue}</code>
  </div>
  <div class="csp-actions">
    <Button variant="outline" size="sm" icon={Copy} on:click={copyCsp}>Copy CSP</Button>
    <Button variant="outline" size="sm" icon={ScanText} on:click={() => (parserOpen = true)}>Parse CSP</Button>
  </div>
</div>

<Dialog bind:open={parserOpen} title="Content-Security-Policy parser" width={520}>
  <Textarea label="Content-Security-Policy value" rows={6} bind:value={rawCsp} />
  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (parserOpen = false)}>Cancel</Button>
    <Button variant="primary" on:click={parseCsp}>Parse</Button>
  </svelte:fragment>
</Dialog>

<style>
  .csp-container {
    margin: 6px 8px 2px 8px;
  }
  .csp-preview {
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-subtle);
    font-size: 12px;
    word-break: break-all;
  }
  .csp-label {
    color: var(--fg-muted);
    margin-right: 4px;
  }
  .csp-preview code {
    font-family: var(--font-mono);
    color: var(--fg);
  }
  .csp-actions {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }
</style>
