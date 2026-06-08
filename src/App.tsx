import { useState, useEffect } from 'react';
import { AppDefinition } from './types';
import { appStore } from './store/appStore';
import { AppFrame } from './components/AppFrame';
import { TopBar } from './components/TopBar';
import { Launcher } from './components/Launcher';

export default function App() {
  const [state, setState] = useState(() => appStore.getState());

  useEffect(() => appStore.subscribe(() => setState(appStore.getState())), []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'h') { e.preventDefault(); appStore.goHome(); }
      if (mod && e.key === 'k') {
        e.preventDefault();
        appStore.goHome();
        setTimeout(() => {
          (document.querySelector('input[placeholder*="Поиск"]') as HTMLInputElement | null)?.focus();
        }, 50);
      }
      if (mod && e.key === 'w' && state.activeAppId) {
        e.preventDefault();
        appStore.closeApp(state.activeAppId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.activeAppId]);

  const activeApp = state.activeAppId ? appStore.getApp(state.activeAppId) : null;

  const openApps = state.openApps
    .map((id) => appStore.getApp(id))
    .filter(Boolean) as AppDefinition[];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>
      <TopBar
        activeApp={activeApp ?? null}
        openApps={openApps}
        titles={state.titles}
        hasApps={state.userApps.length > 0}
        onHome={() => appStore.goHome()}
        onSwitchApp={(id) => appStore.openApp(id)}
        onCloseApp={(id) => appStore.closeApp(id)}
      />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* All open app frames — inactive ones hidden via display:none to preserve state */}
        {state.openApps.map((id) => {
          const app = appStore.getApp(id);
          if (!app) return null;
          return (
            <div
              key={id}
              style={{ flex: 1, display: state.activeAppId === id ? 'flex' : 'none' }}
            >
              <AppFrame app={app} onGoHome={() => appStore.goHome()} />
            </div>
          );
        })}

        {/* Launcher — shown when no active app */}
        {!activeApp && (
          <Launcher
            userApps={state.userApps}
            onOpenApp={(app) => appStore.openApp(app.id)}
            onAddApp={(app) => appStore.addApp(app)}
            onRemoveApp={(id) => appStore.removeApp(id)}
            lastOpenedId={state.openApps[state.openApps.length - 1] ?? null}
          />
        )}
      </main>
    </div>
  );
}
