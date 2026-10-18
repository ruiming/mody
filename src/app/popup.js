import './ui/base.css';
import './app.css';
import './theme.js';
import App from './App.svelte';
import { isFullscreen } from './stores.js';

const style = document.createElement('style');
style.textContent = `
  html, body { height: 510px; width: 620px !important; }
  :root { --drawer-width: 48px; }`;
document.head.appendChild(style);

isFullscreen.set(false);
export default new App({ target: document.body, props: { isFullscreen: false } });
