import { useState, useEffect } from 'react';
import { AppDefinition } from './types';
import { appStore } from './store/appStore';
import { getApp } from './apps/registry';
import { Launcher } from './components/Launcher';
import { AppFrame } from './components/AppFrame';
import { TopBar } from './components/TopBar';

export default function App() {
  const [state, setState] = useState(() => appStore.getState());

  // Subscribe to store changes
  useEffect(() => appStore.subscribe(() => setState(appStore.getState())), []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      // ⌘H  →  home / launcher
      if (mod && e.key === 'h') {
        e.preventDefault();
        appStore.goHome();
      }
      // ⌘K  →  focus search (browser-safe: no conflict)
      if (mod && e.key === 'k') {
        e.preventDefault();
        appStore.goHome();
        setTimeout(() => {
          (document.querySelector('input[placeholder*="Search"]') as HTMLInputElement | null)?.focus();
        }, 50);
      }
      // ⌘W  →  close active app
      if (mod && e.key === 'w' && state.activeAppId) {
        e.preventDefault();
        appStore.closeApp(state.activeAppId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.activeAppId]);

  const activeApp = state.activeAppId ? getApp(state.activeAppId) : null;
  const openApps = state.openApps
    .map((id) => getApp(id))
    .filter(Boolean) as AppDefinition[];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      <TopBar
        activeApp={activeApp ?? null}
        openApps={openApps}
        titles={state.titles}
        onHome={() => appStore.goHome()}
        onSwitchApp={(id) => appStore.openApp(id)}
        onCloseApp={(id) => appStore.closeApp(id)}
      />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Render all open app frames, hide inactive ones */}
        {state.openApps.map((id) => {
          const app = getApp(id);
          if (!app) return null;
          return (
            <div
              key={id}
              style={{
                flex: 1,
                display: state.activeAppId === id ? 'flex' : 'none',
              }}
            >
              <AppFrame app={app} onGoHome={() => appStore.goHome()} />
            </div>
          );
        })}

        {/* Launcher — shown when no active app */}
        {!activeApp && (
          <Launcher
            onOpenApp={(app) => appStore.openApp(app.id)}
            lastOpenedId={state.openApps[state.openApps.length - 1] ?? null}
          />
        )}
      </main>
    </div>
  );
}
