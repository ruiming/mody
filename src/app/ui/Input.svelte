<script>
  // Bordered text input for dialogs and forms.
  export let value = '';
  export let element = undefined;
  let className = '';
  export { className as class };
</script>

<input bind:this={element} bind:value class="input {className}" on:input on:change on:keydown on:focus on:blur {...$$restProps} />

<style>
  .input {
    width: 100%;
    height: 32px;
    padding: 0 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg);
    color: var(--fg);
    transition: border-color 0.12s, box-shadow 0.12s;
  }
  .input::placeholder {
    color: var(--fg-subtle);
  }
  .input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--ring);
  }
</style>
