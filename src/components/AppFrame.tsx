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

      {/* Loading */}
      {status === 'loading' && (
        <div style={overlay}>
          <div className="spinner" />
          <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{app.name}</span>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{ ...overlay, gap: 20 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 4,
            border: '1px solid var(--border-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-3)', fontSize: 20,
          }}>!</div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: 500, marginBottom: 4 }}>Failed to load</p>
            <p style={{ color: 'var(--text-2)', fontSize: 12 }}>{app.url}</p>
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
          transition: 'opacity 0.2s',
        }}
      />
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: 'absolute', inset: 0,
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
  background: 'var(--bg)', zIndex: 10, gap: 12,
};

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px',
        border: '1px solid var(--border)',
        borderRadius: 4,
        color: 'var(--text-2)',
        fontSize: 12,
        transition: 'color 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
    >{children}</button>
  );
}
