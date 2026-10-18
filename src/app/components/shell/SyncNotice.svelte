<script>
  // Reacts to cloud sync: reloads the UI when another device's changes were
  // applied, and asks before applying them when auto sync is off.
  import { onDestroy, onMount } from 'svelte';
  import { CloudDownload } from 'lucide';
  import Button from '../../ui/Button.svelte';
  import Icon from '../../ui/Icon.svelte';
  import { MessageType, sendMessage } from '../../../shared/messages.js';
  import { getLocal, onLocalChanged, removeLocal, StorageKey } from '../../../shared/storage.js';
  import { loadFromStorage, showToast } from '../../stores.js';

  let pending;

  onMount(async () => {
    pending = (await getLocal(StorageKey.SYNC_PENDING))[StorageKey.SYNC_PENDING];
  });

  const stop = onLocalChanged((changes) => {
    if (StorageKey.SYNC_PENDING in changes) pending = changes[StorageKey.SYNC_PENDING].newValue;
    const status = changes[StorageKey.SYNC_STATUS];
    if (status && status.newValue?.lastAppliedAt !== status.oldValue?.lastAppliedAt && status.newValue?.lastAppliedAt) {
      loadFromStorage().then(() =>
        showToast(`Synced changes from ${status.newValue.lastAppliedFrom || 'another device'}`, { canUndo: true }),
      );
    }
  });
  onDestroy(stop);

  const apply = () => sendMessage({ type: MessageType.APPLY_PENDING_SYNC });
  const dismiss = () => removeLocal(StorageKey.SYNC_PENDING);
</script>

{#if pending}
  <div class="sync-notice" role="status">
    <Icon icon={CloudDownload} size={16} />
    <div class="text">
      <div class="title">Profiles changed on another device</div>
      <div class="sub">{pending.deviceName || 'Another device'} · {new Date(pending.time).toLocaleString()}</div>
    </div>
    <Button size="sm" variant="ghost" on:click={dismiss}>Dismiss</Button>
    <Button size="sm" variant="primary" on:click={apply}>Apply</Button>
  </div>
{/if}

<style>
  .sync-notice {
    position: fixed;
    right: 10px;
    top: calc(var(--top-bar-height) + 8px);
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: calc(100vw - var(--drawer-width) - 20px);
    padding: 8px 8px 8px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elevated);
    box-shadow: var(--shadow-md);
    color: var(--fg);
  }
  .text {
    min-width: 0;
  }
  .title {
    font-weight: 500;
  }
  .sub {
    color: var(--fg-muted);
    font-size: 11.5px;
  }
</style>
