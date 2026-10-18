<script>
  // Renders a lucide icon node: ['svg', attrs, children].
  export let icon;
  export let size = 16;
  export let strokeWidth = 1.75;
  export let color = 'currentColor';
  let className = '';
  export { className as class };

  $: children = icon?.[2] ?? [];
</script>

<svg
  class="icon {className}"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke={color}
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#each children as [tag, attrs]}
    <svelte:element this={tag} {...attrs} />
  {/each}
</svg>

<style>
  .icon {
    flex: none;
    display: block;
  }
</style>
