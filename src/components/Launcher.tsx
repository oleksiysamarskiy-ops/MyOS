import { useState, useMemo, useRef, useEffect } from 'react';
import { AppDefinition } from '../types';
import { AddAppModal } from './AddAppModal';

interface LauncherProps {
  userApps: AppDefinition[];
  onOpenApp: (app: AppDefinition) => void;
  onAddApp: (app: AppDefinition) => void;
  onRemoveApp: (id: string) => void;
  lastOpenedId: string | null;
}

export function Launcher({ userApps, onOpenApp, onAddApp, onRemoveApp, lastOpenedId }: LauncherProps) {
  const [query, setQuery]         = useState('');
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const lastApp = lastOpenedId ? userApps.find((a) => a.id === lastOpenedId) : null;

  const filtered = useMemo(() => {
    if (!query.trim()) return userApps;
    const q = query.toLowerCase();
    return userApps.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
    );
  }, [query, userApps]);

  // Focus search on '/'
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'fadeIn 0.2s ease',
      }}>

        {/* Header zone */}
        <div style={{
          width: '100%',
          maxWidth: 580,
          padding: '36px 28px 0',
        }}>
          {/* Title row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div>
              <h1 style={{
                fontSize: 18,
                fontWeight: 500,
                color: 'var(--text)',
                letterSpacing: '-0.01em',
              }}>Apps</h1>
              {userApps.length > 0 && (
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                  {userApps.length} {userApps.length === 1 ? 'project' : 'projects'}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '7px 14px',
                background: 'var(--accent)',
                color: '#fff',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 500,
                fontSize: 12,
                letterSpacing: '0.02em',
                transition: 'opacity 0.15s, transform 0.1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.88';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M5 1V9M1 5H9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add app
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-3)' }}
            >
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M9.5 9.5L12 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search apps…"
              style={{
                width: '100%',
                padding: '9px 12px 9px 32px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                outline: 'none',
                fontSize: 13,
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-3)';
                e.currentTarget.style.background = 'var(--surface-2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface)';
              }}
            />
            {!query && (
              <span style={{
                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                fontSize: 11, color: 'var(--text-3)',
                fontFamily: "'JetBrains Mono', monospace",
                border: '1px solid var(--border)',
                borderRadius: 3,
                padding: '1px 5px',
                letterSpacing: 0,
              }}>/</span>
            )}
          </div>

          {/* Quick resume */}
          {lastApp && !query && (
            <button
              onClick={() => onOpenApp(lastApp)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                marginTop: 10,
                background: 'var(--accent-dim)',
                border: '1px solid rgba(91,142,240,0.2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-2)',
                fontSize: 12,
                width: '100%',
                textAlign: 'left',
                transition: 'border-color 0.15s, color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(91,142,240,0.4)';
                e.currentTarget.style.color = 'var(--text)';
                e.currentTarget.style.background = 'rgba(91,142,240,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(91,142,240,0.2)';
                e.currentTarget.style.color = 'var(--text-2)';
                e.currentTarget.style.background = 'var(--accent-dim)';
              }}
            >
              <span style={{ fontSize: 15 }}>{lastApp.icon}</span>
              <span style={{ flex: 1 }}>
                Continue — <span style={{ color: 'var(--text)' }}>{lastApp.name}</span>
              </span>
              <span style={{
                fontSize: 10, color: 'rgba(91,142,240,0.7)',
                fontFamily: "'JetBrains Mono', monospace",
                border: '1px solid rgba(91,142,240,0.25)',
                borderRadius: 3,
                padding: '1px 5px',
              }}>↵</span>
            </button>
          )}
        </div>

        {/* App list or empty */}
        {userApps.length === 0 && !query ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <div style={{
            width: '100%',
            maxWidth: 580,
            padding: '16px 28px 64px',
          }}>
            {filtered.length === 0 && query ? (
              <div style={{ padding: '48px 0', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-3)', fontSize: 13 }}>No results for "<span style={{ color: 'var(--text-2)' }}>{query}</span>"</p>
              </div>
            ) : (
              <div style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                background: 'var(--surface)',
              }}>
                {filtered.map((app, i) => (
                  <AppRow
                    key={app.id}
                    app={app}
                    index={i}
                    isLast={i === filtered.length - 1}
                    onClick={() => onOpenApp(app)}
                    onRemove={() => onRemoveApp(app.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <AddAppModal
          onAdd={(app) => { onAddApp(app); setShowModal(false); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      padding: 40,
      textAlign: 'center',
    }}>
      {/* Animated icon */}
      <div style={{
        width: 52,
        height: 52,
        border: '1px dashed var(--border-2)',
        borderRadius: 'var(--radius)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-3)',
      }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <p style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 8, fontSize: 14 }}>No apps yet</p>
        <p style={{ color: 'var(--text-2)', fontSize: 12, maxWidth: 240, lineHeight: 1.7 }}>
          Add any web app by URL. It opens right here — no redirects, no noise.
        </p>
      </div>
      <button
        onClick={onAdd}
        style={{
          padding: '9px 22px',
          background: 'var(--accent)',
          color: '#fff',
          borderRadius: 'var(--radius-sm)',
          fontWeight: 500,
          fontSize: 13,
          transition: 'opacity 0.15s, transform 0.1s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.88';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >Add your first app</button>
    </div>
  );
}

// ─── AppRow ─────────────────────────────────────────────────────────────────

function AppRow({
  app, index, isLast, onClick, onRemove
}: {
  app: AppDefinition;
  index: number;
  isLast: boolean;
  onClick: () => void;
  onRemove: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        background: hovered ? 'var(--surface-2)' : 'transparent',
        transition: 'background 0.1s',
        position: 'relative',
        animation: `slideDown ${0.12 + index * 0.03}s ease both`,
      }}
    >
      {/* Main click area */}
      <button
        onClick={onClick}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '13px 16px',
          textAlign: 'left',
          color: 'var(--text)',
          minWidth: 0,
        }}
      >
        {/* Icon */}
        <div style={{
          width: 34,
          height: 34,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          background: app.color + '15',
          borderRadius: 'var(--radius-sm)',
          flexShrink: 0,
          border: '1px solid ' + app.color + '20',
        }}>{app.icon}</div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 500,
            fontSize: 13,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: 'var(--text)',
            letterSpacing: '-0.005em',
          }}>
            {app.name}
          </div>
          {app.description ? (
            <div style={{
              color: 'var(--text-2)',
              fontSize: 11.5,
              marginTop: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {app.description}
            </div>
          ) : (
            <div style={{
              color: 'var(--text-3)',
              fontSize: 11,
              marginTop: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {app.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </div>
          )}
        </div>

        {/* Arrow — visible on hover */}
        <div style={{
          flexShrink: 0,
          color: 'var(--text-3)',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
          transition: 'opacity 0.15s, transform 0.15s',
          marginRight: 4,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6H10M7 3L10 6L7 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </button>

      {/* Remove button */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        style={{
          padding: '8px 14px',
          color: hovered ? 'var(--text-3)' : 'transparent',
          transition: 'color 0.1s, background 0.1s',
          borderRadius: 4,
          margin: '0 8px',
          flexShrink: 0,
          fontSize: 15,
          lineHeight: 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--danger)';
          e.currentTarget.style.background = 'rgba(224,82,82,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = hovered ? 'var(--text-3)' : 'transparent';
          e.currentTarget.style.background = 'transparent';
        }}
        title="Remove app"
      >×</button>
    </div>
  );
}
