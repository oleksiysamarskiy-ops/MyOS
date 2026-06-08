import { useState } from 'react';
import { AppDefinition } from '../types';
import { appStore } from '../store/appStore';

interface TopBarProps {
  activeApp: AppDefinition | null;
  openApps: AppDefinition[];
  titles: Record<string, string>;
  hasApps: boolean;
  onHome: () => void;
  onSwitchApp: (id: string) => void;
  onCloseApp: (id: string) => void;
}

export function TopBar({ activeApp, openApps, titles, hasApps, onHome, onSwitchApp, onCloseApp }: TopBarProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = appStore.getShareUrl();
    try { await navigator.clipboard.writeText(url); }
    catch {
      const ta = Object.assign(document.createElement('textarea'), { value: url });
      Object.assign(ta.style, { position: 'fixed', opacity: '0' });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <header style={{
      height: 'var(--bar-h)',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      paddingInline: 16,
      gap: 0,
      flexShrink: 0,
      zIndex: 100,
    }}>

      {/* Wordmark */}
      <button
        onClick={onHome}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: activeApp ? 'var(--text-2)' : 'var(--text)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: '0 16px 0 0',
          borderRight: '1px solid var(--border)',
          height: '100%',
          transition: 'color 0.15s',
        }}
      >MyOS</button>

      {/* Tabs */}
      <div style={{ display: 'flex', flex: 1, overflowX: 'auto', height: '100%', alignItems: 'stretch' }}>
        {openApps.map((app) => {
          const isActive = activeApp?.id === app.id;
          const label = titles[app.id] ?? app.name;
          return (
            <div key={app.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              paddingInline: 14,
              borderRight: '1px solid var(--border)',
              background: isActive ? 'var(--surface-2)' : 'transparent',
              color: isActive ? 'var(--text)' : 'var(--text-2)',
              cursor: 'default',
              userSelect: 'none',
              transition: 'background 0.12s',
              position: 'relative',
            }}>
              {/* Active indicator line */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: 1,
                  background: 'var(--text)',
                }} />
              )}
              <span
                onClick={() => onSwitchApp(app.id)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  maxWidth: 140,
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{app.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                  {label}
                </span>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onCloseApp(app.id); }}
                style={{
                  color: 'var(--text-3)',
                  fontSize: 16,
                  lineHeight: 1,
                  flexShrink: 0,
                  padding: '0 0 0 4px',
                  transition: 'color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
              >×</button>
            </div>
          );
        })}
      </div>

      {/* Share */}
      {hasApps && (
        <button
          onClick={handleShare}
          style={{
            paddingInline: 14,
            height: '100%',
            borderLeft: '1px solid var(--border)',
            color: copied ? '#4ade80' : 'var(--text-2)',
            fontSize: 12,
            letterSpacing: '0.04em',
            transition: 'color 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => { if (!copied) e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { if (!copied) e.currentTarget.style.color = 'var(--text-2)'; }}
        >
          {copied ? '✓ copied' : 'share'}
        </button>
      )}
    </header>
  );
}
