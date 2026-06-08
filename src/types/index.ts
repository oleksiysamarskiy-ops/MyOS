// ─── App Definition ────────────────────────────────────────────────────────

export interface AppDefinition {
  id: string;
  name: string;
  /** emoji icon */
  icon: string;
  /** URL loaded in the iframe */
  url: string;
  /** Accent colour for the card */
  color: string;
  description?: string;
}

/** A user-added app — same shape, persisted in localStorage */
export type UserApp = AppDefinition;

// ─── postMessage Bridge ────────────────────────────────────────────────────

export type MyOSMessageType =
  | 'MYOS_READY'
  | 'APP_MOUNTED'
  | 'GO_HOME'
  | 'PING'
  | 'PONG'
  | 'SET_TITLE';

export interface MyOSMessage {
  source: 'myos' | 'app';
  type: MyOSMessageType;
  appId?: string;
  payload?: unknown;
}

// ─── Shell State ────────────────────────────────────────────────────────────

export interface AppState {
  activeAppId: string | null;
  openApps: string[];
  titles: Record<string, string>;
  /** User-added apps, persisted */
  userApps: UserApp[];
}
