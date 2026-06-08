/**
 * myos-sdk.ts
 *
 * Drop this file into any micro-app that will run inside MyOS.
 * It is intentionally zero-dependency and framework-agnostic.
 *
 * Usage (e.g. in your app's main.tsx or App.tsx):
 *
 *   import { MyOSClient } from './myos-sdk';
 *   MyOSClient.init();
 *
 *   // Later:
 *   MyOSClient.goHome();
 *   MyOSClient.setTitle('Finance · $1,234');
 */

type SendableType =
  | 'APP_MOUNTED'
  | 'GO_HOME'
  | 'PONG'
  | 'SET_TITLE';

export const MyOSClient = {
  isInsideMyOS: false,
  appId: null as string | null,

  /** Call once at app startup */
  init() {
    window.addEventListener('message', (event) => {
      const msg = event.data as { source?: string; type?: string; payload?: Record<string, unknown> };
      if (!msg || msg.source !== 'myos') return;

      if (msg.type === 'MYOS_READY') {
        this.isInsideMyOS = true;
        this.appId = (msg.payload?.appId as string) ?? null;

        // Tell the shell we're ready
        this._send('APP_MOUNTED');

        // Optional: hide app's own header/nav when hosted in MyOS
        document.body.classList.add('inside-myos');
      }

      if (msg.type === 'PING') {
        this._send('PONG');
      }
    });
  },

  /** Navigate back to the MyOS launcher */
  goHome() {
    this._send('GO_HOME');
    // Fallback for when the app is opened standalone
    if (!this.isInsideMyOS) {
      window.location.href = 'https://myos.yourdomain.com';
    }
  },

  /**
   * Update the tab label shown in MyOS TopBar.
   * Example: MyOSClient.setTitle('Finance · $1,234');
   */
  setTitle(title: string) {
    this._send('SET_TITLE', { title });
  },

  _send(type: SendableType, payload?: unknown) {
    window.parent.postMessage(
      { source: 'app', type, payload },
      '*' // Replace '*' with 'https://myos.yourdomain.com' in production
    );
  },
};
