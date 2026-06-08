import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { AppDefinition, MyOSMessage } from '../types';
import { useEventBridge } from '../hooks/useEventBridge';
import { appStore } from '../store/appStore';

interface AppFrameProps {
  app: AppDefinition;
  onGoHome: () => void;
}

type FrameStatus = 'loading' | 'ready' | 'error';

export function AppFrame({ app, onGoHome }: AppFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<FrameStatus>('loading');

  const handleMessage = useCallback(
    (msg: MyOSMessage) => {
      if (msg.type === 'APP_MOUNTED') setStatus('ready');
      if (msg.type === 'PONG') console.debug('[MyOS] App alive:', app.id);
      if (msg.type === 'SET_TITLE') {
        const title = (msg.payload as { title?: string })?.title ?? app.name;
        appStore.setTitle(app.id, title);
      }
    },
    [app.id, app.name]
  );

  const { sendToApp } = useEventBridge(iframeRef, {
    onMessage: handleMessage,
    onGoHome,
  });

  const handleLoad = useCallback(() => {
    // If the app doesn't implement the bridge, still mark ready after 3 s
    const timer = setTimeout(
      () => setStatus((s) => (s === 'loading' ? 'ready' : s)),
      3000
    );
    sendToApp('MYOS_READY', { appId: app.id, version: '1.0' });
    return () => clearTimeout(timer);
  }, [app.id, sendToApp]);

  const handleError = useCallback(() => setStatus('error'), []);

  const handleReload = useCallback(() => {
    setStatus('loading');
    const iframe = iframeRef.current;
    if (iframe) iframe.src = iframe.src;
  }, []);

  // Keep-alive ping every 30 s
  useEffect(() => {
    const id = setInterval(() => sendToApp('PING'), 30_000);
    return () => clearInterval(id);
  }, [sendToApp]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Loading overlay */}
      {status === 'loading' && (
        <div style={overlayStyle}>
          <span style={{ fontSize: 40 }}>{app.icon}</span>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
            Loading {app.name}…
          </p>
          <div className="spinner" />
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div style={{ ...overlayStyle, gap: 16 }}>
          <span style={{ fontSize: 48 }}>⚠️</span>
          <p style={{ fontWeight: 600, margin: 0 }}>
            Could not load {app.name}
          </p>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 12,
              margin: 0,
              wordBreak: 'break-all',
              maxWidth: 340,
              textAlign: 'center',
            }}
          >
            {app.url}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <ActionButton onClick={handleReload}>↺ Retry</ActionButton>
            <ActionButton onClick={onGoHome}>← Launcher</ActionButton>
          </div>
        </div>
      )}

      {/* The iframe */}
      <iframe
        ref={iframeRef}
        src={app.url}
        title={app.name}
        onLoad={handleLoad}
        onError={handleError}
        allow="camera; microphone; clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          opacity: status === 'loading' ? 0 : 1,
          transition: 'opacity 0.25s',
        }}
      />
    </div>
  );
}

// ─── Small helpers ──────────────────────────────────────────────────────────

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--bg)',
  zIndex: 10,
  gap: 12,
};

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 18px',
        borderRadius: 10,
        border: '1px solid var(--border)',
        background: 'var(--card-bg)',
        color: 'var(--text)',
        fontSize: 13,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}
