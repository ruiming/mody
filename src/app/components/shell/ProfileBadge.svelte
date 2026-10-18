<script>
  // Rounded-square avatar with the profile short title, selection ring and an
  // active / managed status indicator.
  import { Briefcase } from 'lucide';
  import Icon from '../../ui/Icon.svelte';

  export let profile;
  export let isManaged = false;
  export let active = false;
  export let selected = false;
  export let size = 24;
  export let showStatus = true;
</script>

<span
  class="avatar"
  class:selected
  style="--size:{size}px; background:{profile.backgroundColor}; color:{profile.textColor};"
>
  <span class="avatar-text">{profile.shortTitle ?? ''}</span>
  {#if showStatus}
    {#if isManaged}
      <span class="status managed"><Icon icon={Briefcase} size={9} strokeWidth={2.5} /></span>
    {:else}
      <span class="status" class:active></span>
    {/if}
  {/if}
</span>

<style>
  .avatar {
    position: relative;
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--size);
    height: var(--size);
    border-radius: calc(var(--size) / 4);
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.08);
    font-size: calc(var(--size) * 0.5);
    font-weight: 600;
    line-height: 1;
    user-select: none;
    transition: box-shadow 0.12s;
  }
  .avatar.selected {
    box-shadow:
      0 0 0 2px var(--avatar-ring-gap, var(--bg-subtle)),
      0 0 0 4px var(--accent);
  }
  .avatar-text {
    overflow: hidden;
    max-width: 100%;
  }
  .status {
    position: absolute;
    right: -3px;
    bottom: -3px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2px solid var(--avatar-ring-gap, var(--bg-subtle));
    background: var(--fg-subtle);
    box-sizing: content-box;
  }
  .status.active {
    background: var(--success);
  }
  .status.managed {
    width: 12px;
    height: 12px;
    right: -4px;
    bottom: -4px;
    border-width: 1px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent);
    color: var(--accent-fg);
  }
</style>
