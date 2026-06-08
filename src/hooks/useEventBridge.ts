import { useEffect, useRef, useCallback } from 'react';
import { MyOSMessage, MyOSMessageType } from '../types';

// In production, list your app origins explicitly.
// 'null' covers data: URLs (inline demo apps).
const ALLOWED_ORIGINS: string[] = [
  'null', // data: URL iframes
  // 'https://finance.yourdomain.com',
  // 'https://fitness.yourdomain.com',
  // 'https://english.yourdomain.com',
];

interface UseEventBridgeOptions {
  onMessage?: (msg: MyOSMessage) => void;
  onGoHome?: () => void;
}

export function useEventBridge(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  { onMessage, onGoHome }: UseEventBridgeOptions
) {
  const onMessageRef = useRef(onMessage);
  const onGoHomeRef = useRef(onGoHome);
  onMessageRef.current = onMessage;
  onGoHomeRef.current = onGoHome;

  /** Send a message into the iframe */
  const sendToApp = useCallback(
    (type: MyOSMessageType, payload?: unknown) => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      const msg: MyOSMessage = { source: 'myos', type, payload };
      win.postMessage(msg, '*'); // '*' is fine when we're sending TO the child
    },
    [iframeRef]
  );

  /** Listen for messages FROM the iframe */
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const originOk =
        ALLOWED_ORIGINS.includes(event.origin) ||
        event.origin.startsWith('http://localhost') ||
        event.origin.startsWith('http://127.0.0.1');

      if (!originOk) return;

      const msg = event.data as MyOSMessage;
      if (!msg || msg.source !== 'app') return;

      onMessageRef.current?.(msg);
      if (msg.type === 'GO_HOME') onGoHomeRef.current?.();
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []); // stable — refs handle the changing callbacks

  return { sendToApp };
}
