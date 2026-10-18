<script>
  export let value = '';
  export let rows = 5;
  export let label = undefined;
  export let element = undefined;
  let className = '';
  export { className as class };
</script>

<label class="field {className}">
  {#if label}<span class="field-label">{label}</span>{/if}
  <textarea bind:this={element} bind:value {rows} class="textarea" on:input on:change on:focus on:keydown {...$$restProps}></textarea>
</label>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }
  .field-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--fg-muted);
  }
  .textarea {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: 12px;
    line-height: 1.5;
    resize: vertical;
  }
  .textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--ring);
  }
</style>
