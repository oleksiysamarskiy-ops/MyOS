import React, { useRef, useState, useEffect, useCallback } from 'react';
import { AppDefinition, MyOSMessage } from '../types';
import { useEventBridge } from '../hooks/useEventBridge';
import { appStore } from '../store/appStore';

interface AppFrameProps { app: AppDefinition; onGoHome: () => void; }
type FrameStatus = 'loading' | 'ready' | 'error';

export function AppFrame({ app, onGoHome }: AppFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<FrameStatus>('loading');

  const handleMessage = useCallback((msg: MyOSMessage) => {
    if (msg.type === 'APP_MOUNTED') setStatus('ready');
    if (msg.type === 'PONG') void 0;
    if (msg.type === 'SET_TITLE') {
      const title = (msg.payload as { title?: string })?.title ?? app.name;
      appStore.setTitle(app.id, title);
    }
  }, [app.id, app.name]);

  const { sendToApp } = useEventBridge(iframeRef, { onMessage: handleMessage, onGoHome });

  const handleLoad = useCallback(() => {
    const t = setTimeout(() => setStatus((s) => s === 'loading' ? 'ready' : s), 3000);
    sendToApp('MYOS_READY', { appId: app.id, version: '1.0' });
    return () => clearTimeout(t);
  }, [app.id, sendToApp]);

  useEffect(() => {
    const id = setInterval(() => sendToApp('PING'), 30_000);
    return () => clearInterval(id);
  }, [sendToApp]);

  const handleReload = useCallback(() => {
    setStatus('loading');
    const f = iframeRef.current;
    if (f) f.src = f.src;
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--bg)' }}>

      {/* Loading overlay */}
      {status === 'loading' && (
        <div style={overlay}>
          <div style={{
            width: 48, height: 48,
            background: app.color + '15',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 4,
            border: '1px solid ' + app.color + '20',
          }}>{app.icon}</div>
          <div className="spinner" style={{ marginTop: 8 }} />
          <span style={{ color: 'var(--text-3)', fontSize: 12, marginTop: 4 }}>Opening {app.name}…</span>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div style={{ ...overlay, gap: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 8,
            border: '1px solid var(--border-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-3)', fontSize: 22,
          }}>!</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 500, marginBottom: 6, color: 'var(--text)' }}>Failed to load</p>
            <p style={{ color: 'var(--text-2)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
              {app.url.replace(/^https?:\/\//, '')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn onClick={handleReload}>Retry</Btn>
            <Btn onClick={onGoHome}>← Back</Btn>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={app.url}
        title={app.name}
        onLoad={handleLoad}
        onError={() => setStatus('error')}
        allow="camera; microphone; clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
        style={{
          width: '100%', height: '100%', border: 'none', display: 'block',
          opacity: status === 'loading' ? 0 : 1,
          transition: 'opacity 0.25s ease',
        }}
      />
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  background: 'var(--bg)', zIndex: 10, gap: 10,
};

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 18px',
        border: '1px solid var(--border)',
        borderRadius: 6,
        color: 'var(--text-2)',
        fontSize: 12,
        transition: 'color 0.15s, border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text)';
        e.currentTarget.style.borderColor = 'var(--border-2)';
        e.currentTarget.style.background = 'var(--surface-2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-2)';
        e.currentTarget.style.borderColor = 'var(--border)';
        e.currentTarget.style.background = 'transparent';
      }}
    >{children}</button>
  );
}
