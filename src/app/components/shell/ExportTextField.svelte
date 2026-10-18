<script>
  // Read-only textarea; focusing it selects and copies its content.
  import { showToast } from '../../stores.js';

  export let value = '';
  export let numRows = 5;
  export let updating = false;

  async function onFocus(event) {
    const textarea = event.target;
    textarea.select();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      document.execCommand('copy');
    }
    showToast('Copied to clipboard!');
  }
</script>

{#if updating}
  <div class="progress"></div>
{/if}
<textarea class="export-text-field" readonly rows={numRows} {value} on:focus={onFocus}></textarea>

<style>
  .export-text-field {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-subtle);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: 11.5px;
    line-height: 1.5;
    resize: vertical;
    cursor: copy;
  }
  .export-text-field:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--ring);
  }
  .progress {
    height: 2px;
    margin-bottom: 4px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    background-size: 200% 100%;
    animation: progress 1s linear infinite;
  }
  @keyframes progress {
    from {
      background-position: 100% 0;
    }
    to {
      background-position: -100% 0;
    }
  }
</style>
