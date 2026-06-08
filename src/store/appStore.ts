import { AppState, UserApp } from '../types';

const STORAGE_KEY = 'myos_state';

// ─── URL hash encoding ──────────────────────────────────────────────────────
// Hash format: #apps=<base64url(JSON)>
// Only userApps are shared via URL — navigation state stays local.

export function encodeAppsToHash(apps: UserApp[]): string {
  if (apps.length === 0) return '';
  const json = JSON.stringify(apps);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return '#apps=' + b64;
}

export function decodeAppsFromHash(hash: string): UserApp[] {
  try {
    const match = hash.match(/[#&]?apps=([^&]+)/);
    if (!match) return [];
    const json = decodeURIComponent(escape(atob(match[1])));
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a) => a && typeof a.id === 'string' && typeof a.url === 'string' && typeof a.name === 'string'
    );
  } catch {
    return [];
  }
}

function syncHash(apps: UserApp[]): void {
  const newHash = encodeAppsToHash(apps);
  // Replace without pushing a history entry
  history.replaceState(null, '', newHash || window.location.pathname);
}

// ─── localStorage ───────────────────────────────────────────────────────────

const defaultState: AppState = {
  activeAppId: null,
  openApps: [],
  titles: {},
  userApps: [],
};

function loadState(): AppState {
  // 1. Read hash apps
  const hashApps = decodeAppsFromHash(window.location.hash);

  // 2. Read localStorage
  let stored: Partial<AppState> = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch { /* ignore */ }

  const localApps: UserApp[] = Array.isArray(stored.userApps) ? stored.userApps : [];

  // 3. Merge: hash wins for apps with same id, then append local-only apps
  const merged = [...hashApps];
  for (const app of localApps) {
    if (!merged.find((a) => a.id === app.id)) merged.push(app);
  }

  return {
    ...defaultState,
    ...(stored as Partial<AppState>),
    titles: {},       // never persist titles
    userApps: merged,
  };
}

function saveState(state: AppState): void {
  const { titles: _t, ...persisted } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  syncHash(state.userApps);
}

// ─── Store ──────────────────────────────────────────────────────────────────

class AppStore {
  private state: AppState = loadState();
  private listeners: Array<() => void> = [];

  getState(): AppState {
    return this.state;
  }

  // ─── App registry ────────────────────────────────────────────────────────

  getApp(id: string): UserApp | undefined {
    return this.state.userApps.find((a) => a.id === id);
  }

  addApp(app: UserApp): void {
    if (this.state.userApps.find((a) => a.id === app.id)) return;
    this.setState({ userApps: [...this.state.userApps, app] });
  }

  removeApp(appId: string): void {
    const userApps = this.state.userApps.filter((a) => a.id !== appId);
    const openApps = this.state.openApps.filter((id) => id !== appId);
    const activeAppId =
      this.state.activeAppId === appId
        ? (openApps[openApps.length - 1] ?? null)
        : this.state.activeAppId;
    const titles = { ...this.state.titles };
    delete titles[appId];
    this.setState({ userApps, openApps, activeAppId, titles });
  }

  getShareUrl(): string {
    return window.location.origin +
      window.location.pathname +
      encodeAppsToHash(this.state.userApps);
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  openApp(appId: string): void {
    const already = this.state.openApps.includes(appId);
    const openApps = already
      ? this.state.openApps
      : [...this.state.openApps.slice(-4), appId];
    this.setState({ activeAppId: appId, openApps });
  }

  goHome(): void {
    this.setState({ activeAppId: null });
  }

  closeApp(appId: string): void {
    const openApps = this.state.openApps.filter((id) => id !== appId);
    const activeAppId =
      this.state.activeAppId === appId
        ? (openApps[openApps.length - 1] ?? null)
        : this.state.activeAppId;
    const titles = { ...this.state.titles };
    delete titles[appId];
    this.setState({ activeAppId, openApps, titles });
  }

  setTitle(appId: string, title: string): void {
    this.setState({ titles: { ...this.state.titles, [appId]: title } });
  }

  // ─────────────────────────────────────────────────────────────────────────

  private setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    saveState(this.state);
    this.listeners.forEach((fn) => fn());
  }

  subscribe(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }
}

export const appStore = new AppStore();
