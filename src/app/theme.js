// Light/dark theme: toggles the `dark-mode` class that switches the CSS tokens.
import { writable } from 'svelte/store';

const STORAGE_KEY = 'preferredColorScheme';

function readPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // ignore
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const colorScheme = writable(readPreference());

colorScheme.subscribe((scheme) => {
  document.documentElement.classList.toggle('dark-mode', scheme === 'dark');
});

export function toggleColorScheme() {
  colorScheme.update((scheme) => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    return next;
  });
}
