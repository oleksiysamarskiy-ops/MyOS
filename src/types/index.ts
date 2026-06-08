// ─── App Definition ────────────────────────────────────────────────────────

export interface AppDefinition {
  id: string;
  name: string;
  /** emoji or absolute URL to an icon image */
  icon: string;
  /** URL of the deployed micro-app */
  url: string;
  /** Accent colour for the card (hex / css var) */
  color: string;
  description?: string;
  category?: 'productivity' | 'health' | 'learning' | 'tools';
}

// ─── postMessage Bridge ────────────────────────────────────────────────────

export type MyOSMessageType =
  | 'MYOS_READY'   // MyOS → App : shell is mounted, you're inside MyOS
  | 'APP_MOUNTED'  // App  → MyOS: app finished loading
  | 'GO_HOME'      // App  → MyOS: navigate back to launcher
  | 'PING'         // MyOS → App : keep-alive check
  | 'PONG'         // App  → MyOS: response to PING
  | 'SET_TITLE';   // App  → MyOS: update the tab label

export interface MyOSMessage {
  source: 'myos' | 'app';
  type: MyOSMessageType;
  appId?: string;
  payload?: unknown;
}

// ─── Shell State ────────────────────────────────────────────────────────────

export interface AppState {
  /** ID of the currently visible app, or null → show Launcher */
  activeAppId: string | null;
  /** Ordered list of open app IDs (for tab bar), max 5 */
  openApps: string[];
  /** Dynamic title overrides sent via SET_TITLE */
  titles: Record<string, string>;
}
