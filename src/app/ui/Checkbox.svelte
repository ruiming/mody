<script>
  // Native checkbox with custom styling: on:change / on:click receive the
  // native event, so `event.target.checked` works as usual.
  export let checked = false;
  export let indeterminate = false;
  export let disabled = false;
  export let title = undefined;
  let className = '';
  export { className as class };
</script>

<input
  type="checkbox"
  class="checkbox {className}"
  bind:checked
  bind:indeterminate
  {disabled}
  {title}
  aria-label={title}
  on:change
  on:click
/>

<style>
  .checkbox {
    appearance: none;
    flex: none;
    width: 16px;
    height: 16px;
    margin: 0;
    border: 1px solid var(--border-strong);
    border-radius: 4px;
    background: var(--bg) center / 12px 12px no-repeat;
    cursor: pointer;
    transition: background-color 0.12s, border-color 0.12s, box-shadow 0.12s;
  }
  .checkbox:hover:not(:disabled) {
    border-color: var(--fg-subtle);
  }
  .checkbox:checked,
  .checkbox:indeterminate {
    background-color: var(--accent);
    border-color: var(--accent);
  }
  .checkbox:checked {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");
  }
  .checkbox:indeterminate {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.2' stroke-linecap='round'%3E%3Cpath d='M6 12h12'/%3E%3C/svg%3E");
  }
  :global(html.dark-mode) .checkbox:checked {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230b0b1a' stroke-width='3.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 6 9 17l-5-5'/%3E%3C/svg%3E");
  }
  :global(html.dark-mode) .checkbox:indeterminate {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230b0b1a' stroke-width='3.2' stroke-linecap='round'%3E%3Cpath d='M6 12h12'/%3E%3C/svg%3E");
  }
  .checkbox:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
