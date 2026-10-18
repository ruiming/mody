<script>
  // Saturation/value square plus hue slider. Emits `colorchange` with {hex}.
  import { createEventDispatcher } from 'svelte';

  export let color = '#ff0000';

  const dispatch = createEventDispatcher();

  let h = 0;
  let s = 1;
  let v = 1;
  let lastEmitted;

  $: if (color !== lastEmitted) setFromHex(color);

  function setFromHex(hex) {
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex || '');
    if (!m) return;
    const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16) / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let hue = 0;
    if (d) {
      if (max === r) hue = ((g - b) / d) % 6;
      else if (max === g) hue = (b - r) / d + 2;
      else hue = (r - g) / d + 4;
      hue *= 60;
      if (hue < 0) hue += 360;
    }
    h = hue;
    s = max ? d / max : 0;
    v = max;
    lastEmitted = hex;
  }

  function toHex(hue, sat, val) {
    const f = (n) => {
      const k = (n + hue / 60) % 6;
      const c = val - val * sat * Math.max(Math.min(k, 4 - k, 1), 0);
      return Math.round(c * 255)
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(5)}${f(3)}${f(1)}`;
  }

  function emit() {
    lastEmitted = toHex(h, s, v);
    color = lastEmitted;
    dispatch('colorchange', { hex: lastEmitted });
  }

  const clamp = (x) => Math.max(0, Math.min(1, x));

  function dragHandler(update) {
    return (event) => {
      const target = event.currentTarget;
      target.setPointerCapture(event.pointerId);
      const move = (e) => {
        const rect = target.getBoundingClientRect();
        update(e, rect);
        emit();
      };
      move(event);
      const up = () => {
        target.removeEventListener('pointermove', move);
        target.removeEventListener('pointerup', up);
      };
      target.addEventListener('pointermove', move);
      target.addEventListener('pointerup', up);
    };
  }

  const onSquareDown = dragHandler((e, rect) => {
    s = clamp((e.clientX - rect.left) / rect.width);
    v = 1 - clamp((e.clientY - rect.top) / rect.height);
  });

  const onHueDown = dragHandler((e, rect) => {
    h = clamp((e.clientX - rect.left) / rect.width) * 359.99;
  });
</script>

<div class="picker">
  <div class="square" style="background: {toHex(h, 1, 1)};" on:pointerdown={onSquareDown}>
    <div class="square-white"></div>
    <div class="square-black"></div>
    <div class="square-thumb" style="left: {s * 100}%; top: {(1 - v) * 100}%; background: {toHex(h, s, v)};"></div>
  </div>
  <div class="hue" on:pointerdown={onHueDown}>
    <div class="hue-thumb" style="left: {(h / 360) * 100}%; background: {toHex(h, 1, 1)};"></div>
  </div>
  <div class="hex-row">
    <span class="swatch" style="background: {toHex(h, s, v)};"></span>
    <input
      class="hex-input"
      value={toHex(h, s, v)}
      spellcheck="false"
      maxlength="7"
      on:change={(e) => {
        const hex = e.currentTarget.value.trim();
        setFromHex(hex.startsWith('#') ? hex : `#${hex}`);
        emit();
      }}
    />
  </div>
</div>

<style>
  .picker {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
    user-select: none;
  }
  .square {
    position: relative;
    height: 160px;
    border-radius: var(--radius);
    overflow: hidden;
    cursor: crosshair;
    touch-action: none;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
  }
  .square-white,
  .square-black {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }
  .square-white {
    background: linear-gradient(to right, #fff, rgba(255, 255, 255, 0));
  }
  .square-black {
    background: linear-gradient(to top, #000, rgba(0, 0, 0, 0));
  }
  .square-thumb,
  .hue-thumb {
    position: absolute;
    width: 14px;
    height: 14px;
    border: 2px solid #fff;
    border-radius: 50%;
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.3);
    transform: translate(-50%, -50%);
    pointer-events: none;
  }
  .hue {
    position: relative;
    height: 12px;
    border-radius: 999px;
    cursor: pointer;
    touch-action: none;
    background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);
  }
  .hue-thumb {
    top: 50%;
  }
  .hex-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .swatch {
    flex: none;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-sm);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
  }
  .hex-input {
    width: 100px;
    height: 28px;
    padding: 0 8px;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg);
    color: var(--fg);
    font-family: var(--font-mono);
    font-size: 12px;
    text-transform: lowercase;
  }
  .hex-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--ring);
  }
</style>
