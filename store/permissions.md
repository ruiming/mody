# Permission justifications (paste into the Privacy practices tab)

| Permission | Justification |
|---|---|
| declarativeNetRequest | Core feature: applies the user's header modification, redirect and CSP rules as declarativeNetRequest session rules. |
| host permissions `<all_urls>` | Users choose which sites their rules apply to (any URL pattern), so modifyHeaders/redirect rules must be able to act on all hosts. |
| storage | Saves the user's profiles and settings locally, and in chrome.storage.sync for the optional cloud sync. |
| alarms | Re-evaluates rules when a profile's auto-off timer expires. |
| contextMenus | "Pause / Unpause" item on the toolbar icon's context menu. |

Remote code: none. All code is packaged in the extension.
