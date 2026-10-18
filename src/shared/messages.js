// Runtime message types exchanged between the background and extension pages.
export const MessageType = {
  // background -> extension pages
  UPDATE_RULES_SUCCESS: 'UPDATE_RULES_SUCCESS',
  UPDATE_RULES_ERROR: 'UPDATE_RULES_ERROR',

  // Cloud sync (app -> background).
  SYNC_NOW: 'SYNC_NOW',
  APPLY_PENDING_SYNC: 'APPLY_PENDING_SYNC',
};

export function sendMessage(message) {
  return chrome.runtime.sendMessage(message);
}
