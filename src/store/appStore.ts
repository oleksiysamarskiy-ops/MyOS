import { AppState, UserApp } from '../types';

const STORAGE_KEY = 'myos_state';

const defaultState: AppState = {
  activeAppId: null,
  openApps: [],
  titles: {},
  userApps: [],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

function saveState(state: AppState): void {
  const { titles: _t, ...persisted } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
}

class AppStore {
  private state: AppState = loadState();
  private listeners: Array<() => void> = [];

  getState(): AppState {
    return this.state;
  }

  // ─── App registry ───────────────────────────────────────────────────────

  getApp(id: string): UserApp | undefined {
    return this.state.userApps.find((a) => a.id === id);
  }

  addApp(app: UserApp): void {
    if (this.state.userApps.find((a) => a.id === app.id)) return;
    this.setState({ userApps: [...this.state.userApps, app] });
  }

  removeApp(appId: string): void {
    const userApps = this.state.userApps.filter((a) => a.id !== appId);
    // also close if open
    const openApps = this.state.openApps.filter((id) => id !== appId);
    const activeAppId =
      this.state.activeAppId === appId
        ? (openApps[openApps.length - 1] ?? null)
        : this.state.activeAppId;
    const titles = { ...this.state.titles };
    delete titles[appId];
    this.setState({ userApps, openApps, activeAppId, titles });
  }

  // ─── Navigation ────────────────────────────────────────────────────────

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

  // ───────────────────────────────────────────────────────────────────────

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
