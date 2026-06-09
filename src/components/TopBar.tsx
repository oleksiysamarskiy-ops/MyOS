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
      alignItems: 'stretch',
      paddingInline: 0,
      flexShrink: 0,
      zIndex: 100,
    }}>

      {/* Wordmark */}
      <button
        onClick={onHome}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          paddingInline: 18,
          borderRight: '1px solid var(--border)',
          transition: 'background 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >
        {/* Dot grid logo */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: activeApp ? 0.4 : 1, transition: 'opacity 0.2s' }}>
          <circle cx="2" cy="2" r="1.5" fill={activeApp ? 'var(--text-2)' : 'var(--accent)'} />
          <circle cx="7" cy="2" r="1.5" fill="var(--text-2)" />
          <circle cx="12" cy="2" r="1.5" fill="var(--text-2)" />
          <circle cx="2" cy="7" r="1.5" fill="var(--text-2)" />
          <circle cx="7" cy="7" r="1.5" fill="var(--text-2)" />
          <circle cx="12" cy="7" r="1.5" fill="var(--text-2)" />
          <circle cx="2" cy="12" r="1.5" fill="var(--text-2)" />
          <circle cx="7" cy="12" r="1.5" fill="var(--text-2)" />
          <circle cx="12" cy="12" r="1.5" fill="var(--text-2)" />
        </svg>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: activeApp ? 'var(--text-2)' : 'var(--text)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          transition: 'color 0.15s',
          fontFamily: "'JetBrains Mono', monospace",
        }}>MyOS</span>
      </button>

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
              transition: 'background 0.12s, color 0.12s',
              position: 'relative',
              minWidth: 0,
            }}>
              {/* Active indicator */}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: 1.5,
                  background: 'var(--accent)',
                  borderRadius: '1px 1px 0 0',
                }} />
              )}
              <span
                onClick={() => onSwitchApp(app.id)}
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  maxWidth: 150,
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>{app.icon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                  {label}
                </span>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onCloseApp(app.id); }}
                style={{
                  color: 'var(--text-3)',
                  fontSize: 14,
                  lineHeight: 1,
                  flexShrink: 0,
                  padding: '2px 3px',
                  borderRadius: 3,
                  transition: 'color 0.1s, background 0.1s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--text)';
                  e.currentTarget.style.background = 'var(--surface-3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-3)';
                  e.currentTarget.style.background = 'transparent';
                }}
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
            paddingInline: 16,
            height: '100%',
            borderLeft: '1px solid var(--border)',
            color: copied ? 'var(--green)' : 'var(--text-2)',
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 500,
            transition: 'color 0.2s, background 0.15s',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.background = 'var(--surface-2)';
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.color = 'var(--text-2)';
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Copied
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M7 1H10V4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 1L4.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M5 3H1V10H8V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Share
            </>
          )}
        </button>
      )}
    </header>
  );
}
