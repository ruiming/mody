<script>
  // Hover tooltip for any element carrying a data-tooltip-text attribute.
  import { onDestroy, onMount, tick } from 'svelte';

  export let showHoverTime = 50;
  export let zIndex = 2147483642;
  export let maxAncestorDepth = 50;

  let tooltip;
  let arrow;
  let visible = false;
  let text = '';
  let target;
  let hoverMs = 0;
  let hideTimer;
  let interval;

  function findTarget(element) {
    for (let depth = 0; element && depth < maxAncestorDepth; depth++) {
      if (element.getAttribute?.('data-tooltip-text')) return element;
      element = element.parentElement;
    }
    return undefined;
  }

  function scheduleHide() {
    if (hideTimer) return;
    hideTimer = setTimeout(() => {
      hideTimer = null;
      if (tooltip?.matches(':hover')) return scheduleHide();
      visible = false;
    }, 100);
  }

  async function position() {
    if (!target || !tooltip) return;
    await tick();
    const anchor = target.getBoundingClientRect();
    const box = tooltip.getBoundingClientRect();
    const arrowBox = arrow.getBoundingClientRect();
    let left = anchor.left + anchor.width / 2 - box.width / 2;
    let top = anchor.top - box.height - 8;
    let placement = 'top';
    if (left + 15 + box.width > window.innerWidth) left = window.innerWidth - 15 - box.width;
    if (left < 15) left = 15;
    if (top < 15) {
      top = anchor.top + anchor.height + 8;
      placement = 'bottom';
    }
    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    arrow.style.left = `${anchor.left + anchor.width / 2 - arrowBox.width / 2 - left}px`;
    if (placement === 'top') {
      arrow.style.top = `${box.height}px`;
      arrow.style.clipPath = 'polygon(100% 0, 0 0, 50% 100%)';
    } else {
      arrow.style.top = '-4px';
      arrow.style.clipPath = 'polygon(100% 100%, 0 100%, 50% 0)';
    }
  }

  function onMouseMove(event) {
    const found = findTarget(document.elementFromPoint(event.clientX, event.clientY));
    if (found !== target) {
      target = found;
      hoverMs = 0;
      scheduleHide();
    }
  }

  function onMouseLeave() {
    target = null;
    scheduleHide();
  }

  function tickHover() {
    if (!target) return;
    hoverMs += 50;
    if (hoverMs <= showHoverTime) return;
    clearTimeout(hideTimer);
    hideTimer = null;
    const newText = target.getAttribute('data-tooltip-text');
    if (newText !== text || !visible) {
      text = newText;
      visible = true;
      position();
    }
  }

  onMount(() => {
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    interval = setInterval(tickHover, 50);
  });

  onDestroy(() => {
    clearInterval(interval);
    clearTimeout(hideTimer);
    window.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseleave', onMouseLeave);
  });
</script>

<div class="batch-tooltip" bind:this={tooltip} style="z-index:{zIndex};display:{visible ? 'block' : 'none'}">
  {text}
  <div class="corner-markers" bind:this={arrow}></div>
</div>

<style>
  .batch-tooltip {
    position: fixed;
    top: 10px;
    left: 10px;
    max-width: min(320px, calc(100vw - 30px));
    padding: 6px 9px;
    border-radius: var(--radius-sm);
    background: var(--tooltip-background);
    color: var(--tooltip-color);
    font-size: 12px;
    line-height: 1.4;
    box-shadow: var(--shadow-md);
    white-space: pre-wrap;
    word-break: break-word;
    pointer-events: auto;
  }
  .corner-markers {
    position: absolute;
    width: 8px;
    height: 4px;
    background: var(--tooltip-background);
    clip-path: polygon(100% 0, 0 0, 50% 100%);
  }
</style>
