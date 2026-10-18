<script context="module">
  export const MENU_CONTEXT = Symbol('menu');
</script>

<script>
  // Dropdown / context menu rendered in the top layer (popover="auto"), so it
  // is never clipped by its container. Light dismiss and Esc come for free.
  //   <Menu bind:this={menu}>...</Menu>
  //   menu.toggle(anchorEl) | menu.openAt(anchorEl) | menu.openAtPoint(x, y) | menu.close()
  import { createEventDispatcher, setContext, tick } from 'svelte';

  export let placement = 'bottom-end'; // bottom-start | bottom-end
  export let width = undefined;
  export let isOpen = false;
  let className = '';
  export { className as class };

  const dispatch = createEventDispatcher();
  let surface;
  let anchor;
  let point;

  setContext(MENU_CONTEXT, { close });

  const MARGIN = 6;

  async function show() {
    if (!surface) return;
    if (!isOpen) surface.showPopover();
    isOpen = true;
    await tick();
    position();
    surface.querySelector('[role="menuitem"]:not([disabled])')?.focus({ preventScroll: true });
    dispatch('open');
  }

  function position() {
    const box = surface.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left;
    let top;
    if (point) {
      left = point.x;
      top = point.y;
    } else {
      const rect = anchor.getBoundingClientRect();
      left = placement === 'bottom-start' ? rect.left : rect.right - box.width;
      top = rect.bottom + 4;
      if (top + box.height > vh - MARGIN && rect.top - box.height - 4 > MARGIN) top = rect.top - box.height - 4;
    }
    left = Math.max(MARGIN, Math.min(left, vw - box.width - MARGIN));
    top = Math.max(MARGIN, Math.min(top, vh - box.height - MARGIN));
    surface.style.left = `${left}px`;
    surface.style.top = `${top}px`;
  }

  export function openAt(element) {
    anchor = element;
    point = undefined;
    show();
  }

  // Pass the triggering mouse event when a button may still be held (macOS
  // fires contextmenu on mousedown): showing before pointerup would let the
  // popover's light dismiss close it immediately.
  export function openAtPoint(x, y, event = undefined) {
    point = { x, y };
    if (event?.buttons) {
      let shown = false;
      const showOnce = () => {
        if (shown) return;
        shown = true;
        window.removeEventListener('pointerup', onUp, true);
        show();
      };
      const onUp = () => setTimeout(showOnce);
      window.addEventListener('pointerup', onUp, true);
      setTimeout(showOnce, 1000);
    } else {
      show();
    }
  }

  export function toggle(element) {
    if (isOpen && anchor === element) close();
    else openAt(element);
  }

  export function close() {
    if (isOpen) surface?.hidePopover();
  }

  function onToggle(event) {
    if (event.newState === 'closed') {
      isOpen = false;
      dispatch('close');
    }
  }

  function onKeydown(event) {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = [...surface.querySelectorAll('[role="menuitem"]:not([disabled])')];
    const index = items.indexOf(document.activeElement);
    const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  }
</script>

<div
  bind:this={surface}
  popover="auto"
  role="menu"
  tabindex="-1"
  class="menu {className}"
  style={width ? `width:${width}px` : ''}
  on:toggle={onToggle}
  on:keydown={onKeydown}
>
  <slot />
</div>

<style>
  .menu {
    position: fixed;
    inset: auto;
    margin: 0;
    min-width: 180px;
    max-height: calc(100vh - 12px);
    overflow-y: auto;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elevated);
    color: var(--fg);
    box-shadow: var(--shadow-md);
    font-size: 13px;
  }
  .menu:popover-open {
    animation: menu-in 0.12s ease-out;
  }
  @keyframes menu-in {
    from {
      opacity: 0;
      transform: translateY(-4px) scale(0.98);
    }
  }
</style>
