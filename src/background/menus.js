import { CONTEXT_MENU_PAUSE } from '../shared/constants.js';
import { setLocal, setPaused, StorageKey } from '../shared/storage.js';
import { state } from './state.js';

const pauseTitle = () => (state.isPaused ? 'Unpause Mody' : 'Pause Mody');

export function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: CONTEXT_MENU_PAUSE, title: pauseTitle(), contexts: ['action'] }, () => {
      void chrome.runtime.lastError;
    });
  });
}

export function updateContextMenu() {
  chrome.contextMenus.update(CONTEXT_MENU_PAUSE, { title: pauseTitle() }, () => {
    void chrome.runtime.lastError;
  });
}

export function registerMenuAndCommandListeners() {
  chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === CONTEXT_MENU_PAUSE) setPaused(!state.isPaused);
  });

  chrome.commands.onCommand.addListener((command) => {
    if (command === 'toggle_pause') {
      setPaused(!state.isPaused);
      return;
    }
    const match = /^switch_to_profile_(\d+)$/.exec(command);
    if (!match) return;
    const index = Number(match[1]) - 1;
    if (index < state.profiles.length) setLocal({ [StorageKey.SELECTED_PROFILE]: index });
  });
}
