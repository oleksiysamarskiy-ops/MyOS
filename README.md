# MyOS — Personal Web Launcher

A minimal personal OS shell built with React + Vite. Opens your micro-apps in sandboxed iframes and connects them via a postMessage event bridge.

## Quick Start

```bash
npm install
npm run dev        # → http://localhost:3000
```

Two demo apps are included and work offline — **Counter Demo** (shows the postMessage bridge live) and **Quick Notes** (persists text in sessionStorage).

## Project Structure

```
src/
├── types/index.ts          # AppDefinition, MyOSMessage, AppState
├── store/appStore.ts       # Singleton store with localStorage persistence
├── apps/registry.ts        # All registered apps — add yours here
├── hooks/useEventBridge.ts # postMessage send / receive hook
├── components/
│   ├── AppFrame.tsx        # iframe container + loading / error states
│   ├── TopBar.tsx          # Tab bar + home button
│   └── Launcher.tsx        # App grid + search + quick resume
├── myos-sdk.ts             # Drop this into each micro-app
└── App.tsx                 # Root — keyboard shortcuts, store wiring
```

## Adding a New App

One entry in `src/apps/registry.ts`:

```ts
{
  id: 'my-app',
  name: 'My App',
  icon: '🚀',
  url: 'https://my-app.yourdomain.com',
  color: '#f97316',
  description: 'Does something useful',
  category: 'tools',
},
```

That's it. The Launcher, TopBar, and AppFrame all pick it up automatically.

## Integrating the SDK into a Micro-App

Copy `src/myos-sdk.ts` into your app, then:

```ts
import { MyOSClient } from './myos-sdk';
MyOSClient.init(); // call once at startup

// Navigate back to the launcher:
MyOSClient.goHome();

// Update the tab label in MyOS:
MyOSClient.setTitle('Finance · $1,234');
```

Optional CSS to hide your app's own nav when running inside MyOS:

```css
body.inside-myos .app-nav {
  display: none;
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `⌘H` / `Ctrl+H` | Go to Launcher |
| `⌘K` / `Ctrl+K` | Go to Launcher + focus search |
| `⌘W` / `Ctrl+W` | Close active app |

## postMessage Protocol

| Message | Direction | Meaning |
|---|---|---|
| `MYOS_READY` | Shell → App | Shell mounted, you're inside MyOS |
| `APP_MOUNTED` | App → Shell | App finished loading |
| `GO_HOME` | App → Shell | Return to Launcher |
| `PING` | Shell → App | Keep-alive check (every 30 s) |
| `PONG` | App → Shell | Response to PING |
| `SET_TITLE` | App → Shell | Update the tab label |

## Build & Deploy

```bash
npm run build      # outputs to dist/
```

Deploy `dist/` to Cloudflare Pages, Vercel, Netlify, or GitHub Pages — it is a plain static SPA.

### iframe Requirements for Your Apps

Your apps must **not** send `X-Frame-Options: DENY`. The recommended header:

```
Content-Security-Policy: frame-ancestors 'self' https://myos.yourdomain.com
```

CORS is not needed — MyOS only loads app URLs in iframes, it never fetches them directly.

## Security Notes

- `sandbox` attribute on all iframes: `allow-scripts allow-same-origin allow-forms allow-popups allow-modals`
- In production, update `ALLOWED_ORIGINS` in `hooks/useEventBridge.ts` and the `_send` target in `myos-sdk.ts` from `'*'` to your actual domain.
