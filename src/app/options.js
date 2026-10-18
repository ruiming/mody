import './ui/base.css';
import './app.css';
import './theme.js';
import App from './App.svelte';
import { isFullscreen } from './stores.js';

const style = document.createElement('style');
style.textContent = `
  html, body { height: 100%; width: 100%; }
  :root { --drawer-width: 240px; }`;
document.head.appendChild(style);

isFullscreen.set(true);
export default new App({ target: document.body, props: { isFullscreen: true } });
