import { useState, useMemo } from 'react';
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

  const lastApp = lastOpenedId ? userApps.find((a) => a.id === lastOpenedId) : null;

  const filtered = useMemo(() => {
    if (!query.trim()) return userApps;
    const q = query.toLowerCase();
    return userApps.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
    );
  }, [query, userApps]);

  return (
    <>
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Top toolbar */}
        <div style={{
          width: '100%',
          maxWidth: 640,
          padding: '32px 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            style={{
              flex: 1,
              padding: '8px 12px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: 'var(--text)',
              outline: 'none',
              fontSize: 13,
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-2)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '8px 16px',
              background: 'var(--text)',
              color: 'var(--bg)',
              borderRadius: 4,
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: '0.02em',
              flexShrink: 0,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >+ Add</button>
        </div>

        {/* Quick resume */}
        {lastApp && !query && (
          <div style={{
            width: '100%',
            maxWidth: 640,
            padding: '20px 24px 0',
          }}>
            <button
              onClick={() => onOpenApp(lastApp)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 4,
                color: 'var(--text-2)',
                fontSize: 12,
                width: '100%',
                textAlign: 'left',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-2)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-2)';
              }}
            >
              <span style={{ fontSize: 16 }}>{lastApp.icon}</span>
              <span>Continue — <span style={{ color: 'var(--text)' }}>{lastApp.name}</span></span>
              <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)' }}>↵</span>
            </button>
          </div>
        )}

        {/* App grid or empty */}
        {userApps.length === 0 && !query ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <div style={{
            width: '100%',
            maxWidth: 640,
            padding: '20px 24px 48px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 1,
          }}>
            {filtered.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                onClick={() => onOpenApp(app)}
                onRemove={() => onRemoveApp(app.id)}
              />
            ))}
            {filtered.length === 0 && query && (
              <p style={{
                gridColumn: '1/-1',
                padding: '32px 0',
                color: 'var(--text-3)',
                fontSize: 13,
              }}>
                No results for "{query}"
              </p>
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
      gap: 16,
      padding: 40,
      textAlign: 'center',
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '1px solid var(--border-2)',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        color: 'var(--text-3)',
      }}>+</div>
      <div>
        <p style={{ color: 'var(--text)', fontWeight: 500, marginBottom: 6 }}>No apps yet</p>
        <p style={{ color: 'var(--text-2)', fontSize: 12, maxWidth: 260, lineHeight: 1.6 }}>
          Add any web app by URL. It will open here in a frame — no redirect.
        </p>
      </div>
      <button
        onClick={onAdd}
        style={{
          padding: '8px 20px',
          background: 'var(--text)',
          color: 'var(--bg)',
          borderRadius: 4,
          fontWeight: 600,
          fontSize: 13,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >+ Add app</button>
    </div>
  );
}

// ─── AppCard ─────────────────────────────────────────────────────────────────

function AppCard({ app, onClick, onRemove }: { app: AppDefinition; onClick: () => void; onRemove: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered ? 'var(--surface)' : 'transparent',
        border: '1px solid ' + (hovered ? 'var(--border)' : 'transparent'),
        borderRadius: 4,
        transition: 'background 0.12s, border-color 0.12s',
      }}
    >
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          width: '100%',
          textAlign: 'left',
          color: 'var(--text)',
        }}
      >
        {/* Icon */}
        <span style={{
          fontSize: 22,
          width: 38,
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: app.color + '18',
          borderRadius: 6,
          flexShrink: 0,
        }}>{app.icon}</span>

        {/* Text */}
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontWeight: 500, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {app.name}
          </div>
          {app.description && (
            <div style={{ color: 'var(--text-2)', fontSize: 11, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {app.description}
            </div>
          )}
        </div>
      </button>

      {/* Remove */}
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{
            position: 'absolute',
            top: 8, right: 8,
            width: 20, height: 20,
            fontSize: 14,
            color: 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 3,
            transition: 'color 0.1s, background 0.1s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--danger)';
            e.currentTarget.style.background = 'rgba(224,82,82,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-3)';
            e.currentTarget.style.background = 'transparent';
          }}
        >×</button>
      )}
    </div>
  );
}
