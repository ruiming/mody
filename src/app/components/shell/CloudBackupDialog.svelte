<script>
  // Cloud sync settings, status, and the list of snapshots in chrome.storage.sync.
  import { onDestroy } from 'svelte';
  import { CloudOff, History, Laptop, RefreshCw, Trash2, TriangleAlert } from 'lucide';
  import Button from '../../ui/Button.svelte';
  import Checkbox from '../../ui/Checkbox.svelte';
  import Dialog from '../../ui/Dialog.svelte';
  import Icon from '../../ui/Icon.svelte';
  import IconButton from '../../ui/IconButton.svelte';
  import { deleteBackups, listBackups, loadBackup, SYNC_QUOTA_BYTES } from '../../../shared/cloud.js';
  import { MessageType, sendMessage } from '../../../shared/messages.js';
  import { getLocal, onLocalChanged, setLocal, StorageKey } from '../../../shared/storage.js';
  import { restoreToProfiles, showCloudBackupDialog, showToast } from '../../stores.js';

  let backups = [];
  let autoSync = true;
  let status = {};
  let deviceId;
  let syncing = false;

  $: if ($showCloudBackupDialog) refresh();
  $: usage = status.bytesInUse !== undefined ? Math.min(100, Math.round((status.bytesInUse / SYNC_QUOTA_BYTES) * 100)) : undefined;

  async function refresh() {
    const local = await getLocal([StorageKey.SYNC_SETTINGS, StorageKey.SYNC_STATUS, StorageKey.SYNC_STATE]);
    autoSync = local[StorageKey.SYNC_SETTINGS]?.autoSync !== false;
    status = local[StorageKey.SYNC_STATUS] || {};
    deviceId = local[StorageKey.SYNC_STATE]?.deviceId;
    backups = (await listBackups()).reverse();
  }

  const stopListening = onLocalChanged((changes) => {
    if ($showCloudBackupDialog && (StorageKey.SYNC_STATUS in changes)) refresh();
  });
  onDestroy(stopListening);

  async function toggleAutoSync(event) {
    autoSync = event.target.checked;
    await setLocal({ [StorageKey.SYNC_SETTINGS]: { autoSync } });
  }

  async function syncNow() {
    syncing = true;
    try {
      await sendMessage({ type: MessageType.SYNC_NOW });
      await refresh();
    } finally {
      syncing = false;
    }
  }

  function describe(backup) {
    const titles = backup.titles || [];
    const more = (backup.count ?? titles.length) - titles.length;
    return more > 0 ? `${titles.join(', ')}, + ${more} more` : titles.join(', ');
  }

  function close() {
    showCloudBackupDialog.set(false);
  }

  async function restore(backup) {
    try {
      restoreToProfiles(await loadBackup(backup));
      close();
    } catch (e) {
      showToast(`Failed to restore: ${e.message || e}`);
    }
  }

  async function remove(list) {
    await deleteBackups(list);
    await refresh();
  }

  const formatTime = (ms) => (ms ? new Date(ms).toLocaleString() : '—');
  const formatSize = (bytes) => (bytes === undefined ? '—' : `${(bytes / 1024).toFixed(1)} KB`);
</script>

<Dialog
  open={$showCloudBackupDialog}
  title="Cloud sync"
  description="Profiles are synced through your browser account (chrome.storage.sync). No other server is involved."
  width={560}
  on:close={close}
>
  <section class="sync-panel">
    <label class="sync-toggle">
      <Checkbox checked={autoSync} on:change={toggleAutoSync} />
      <span>
        <span class="toggle-title">Auto sync across devices</span>
        <span class="toggle-hint">
          Apply newer changes from your other browsers automatically. When off, you are asked before applying.
        </span>
      </span>
    </label>
    <div class="sync-meta">
      <span>Last synced: {formatTime(status.lastSyncAt)}</span>
      {#if status.lastAppliedFrom}<span>· Last pulled from {status.lastAppliedFrom}</span>{/if}
      <span class="flex-grow"></span>
      <Button size="sm" variant="outline" icon={RefreshCw} disabled={syncing} on:click={syncNow}>Sync now</Button>
    </div>
    {#if usage !== undefined}
      <div class="usage" title="chrome.storage.sync quota">
        <div class="usage-bar"><div class="usage-fill" class:warn={usage > 85} style="width:{usage}%"></div></div>
        <span>{formatSize(status.bytesInUse)} / {formatSize(SYNC_QUOTA_BYTES)}</span>
      </div>
    {/if}
    {#if status.error}
      <div class="sync-error">
        <Icon icon={TriangleAlert} size={14} />
        <span>
          {status.errorCode === 'too_large'
            ? 'Your profiles are too large for browser sync. Export them as JSON to move them between devices.'
            : status.error}
        </span>
      </div>
    {/if}
  </section>

  <div class="list-caption">Snapshots</div>
  {#if backups.length === 0}
    <div class="missing-backup-info">
      <Icon icon={CloudOff} size={22} />
      <span>No cloud backup available</span>
    </div>
  {:else}
    <div class="backup-list">
      {#each backups as backup (backup.id)}
        <div class="backup-entry">
          <button class="entry-main" title="Restore this backup" on:click={() => restore(backup)}>
            <span class="entry-icon"><Icon icon={History} size={14} /></span>
            <span class="entry-text">
              <span class="entry-time">
                {formatTime(backup.time)}
                {#if backup.deviceName}
                  <span class="entry-device" class:this-device={backup.deviceId === deviceId}>
                    <Icon icon={Laptop} size={11} />
                    {backup.deviceId === deviceId ? 'This device' : backup.deviceName}
                  </span>
                {/if}
              </span>
              <span class="entry-label">{describe(backup)}</span>
            </span>
          </button>
          <IconButton icon={Trash2} tone="danger" size="sm" title="Delete" on:click={() => remove([backup])} />
        </div>
      {/each}
    </div>
  {/if}
  <svelte:fragment slot="footer">
    <Button variant="ghost" on:click={() => remove(backups)} disabled={backups.length === 0}>Delete all backup</Button>
    <span class="flex-grow"></span>
    <Button variant="outline" on:click={close}>Close</Button>
  </svelte:fragment>
</Dialog>

<style>
  .sync-panel {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-subtle);
  }
  .sync-toggle {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    cursor: pointer;
  }
  .sync-toggle :global(.checkbox) {
    margin-top: 2px;
  }
  .toggle-title {
    display: block;
    font-weight: 500;
  }
  .toggle-hint {
    display: block;
    color: var(--fg-muted);
    font-size: 12px;
  }
  .sync-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    color: var(--fg-muted);
    font-size: 12px;
  }
  .usage {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--fg-muted);
    font-size: 11.5px;
    font-variant-numeric: tabular-nums;
  }
  .usage-bar {
    flex: 1;
    height: 6px;
    border-radius: 999px;
    background: var(--bg-active);
    overflow: hidden;
  }
  .usage-fill {
    height: 100%;
    background: var(--accent);
  }
  .usage-fill.warn {
    background: var(--warning);
  }
  .sync-error {
    display: flex;
    gap: 6px;
    align-items: flex-start;
    padding: 8px 10px;
    border-radius: var(--radius-sm);
    background: var(--danger-soft);
    color: var(--danger);
    font-size: 12px;
  }
  .sync-error :global(.icon) {
    margin-top: 2px;
  }
  .list-caption {
    margin: 14px 0 4px;
    font-size: 11px;
    font-weight: 500;
    color: var(--fg-subtle);
  }
  .missing-backup-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 0;
    color: var(--fg-muted);
  }
  .backup-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0 -8px;
  }
  .backup-entry {
    display: flex;
    align-items: center;
    gap: 4px;
    padding-right: 6px;
    border-radius: var(--radius);
  }
  .backup-entry:hover {
    background: var(--bg-hover);
  }
  .entry-main {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    border: none;
    background: transparent;
    color: var(--fg);
    text-align: left;
    cursor: pointer;
  }
  .entry-icon {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: var(--radius-sm);
    background: var(--bg-muted);
    color: var(--fg-muted);
  }
  .entry-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .entry-time {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .entry-device {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 0 6px;
    height: 18px;
    border-radius: 999px;
    border: 1px solid var(--border);
    color: var(--fg-muted);
    font-size: 11px;
    font-weight: 400;
  }
  .entry-device.this-device {
    color: var(--accent);
    border-color: var(--accent-soft);
    background: var(--accent-soft);
  }
  .entry-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--fg-muted);
    font-size: 12px;
  }
</style>
