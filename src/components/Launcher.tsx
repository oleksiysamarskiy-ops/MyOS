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
  const [query, setQuery]       = useState('');
  const [showModal, setShowModal] = useState(false);

  const lastApp = lastOpenedId ? userApps.find((a) => a.id === lastOpenedId) : null;

  const filtered = useMemo(() => {
    if (!query.trim()) return userApps;
    const q = query.toLowerCase();
    return userApps.filter(
      (a) => a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
    );
  }, [query, userApps]);

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <>
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '40px 24px 60px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>MyOS</h1>
          <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: 14 }}>{today}</p>
        </div>

        {/* Search + Add */}
        <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 440 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск приложений…"
            style={{
              flex: 1, padding: '9px 16px', borderRadius: 12,
              border: '1px solid var(--border)', background: 'var(--card-bg)',
              color: 'var(--text)', fontSize: 14, outline: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          />
          <button
            onClick={() => setShowModal(true)}
            title="Добавить приложение"
            style={{
              padding: '9px 16px', borderRadius: 12,
              background: 'var(--accent)', color: '#fff',
              border: 'none', fontWeight: 600, fontSize: 20,
              cursor: 'pointer', lineHeight: 1,
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              flexShrink: 0,
            }}
          >+</button>
        </div>

        {/* Quick resume */}
        {lastApp && !query && (
          <button
            onClick={() => onOpenApp(lastApp)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 20px', borderRadius: 12,
              border: '1px solid var(--border)', background: 'var(--card-bg)',
              color: 'var(--text)', fontSize: 14, cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            <span style={{ fontSize: 20 }}>{lastApp.icon}</span>
            <span>Продолжить: <strong>{lastApp.name}</strong></span>
            <span style={{ color: 'var(--text-secondary)' }}>→</span>
          </button>
        )}

        {/* App grid */}
        {userApps.length === 0 && !query ? (
          <EmptyState onAdd={() => setShowModal(true)} />
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 14, width: '100%', maxWidth: 760,
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
                gridColumn: '1/-1', textAlign: 'center',
                color: 'var(--text-secondary)', fontSize: 14, padding: '32px 0',
              }}>
                Ничего не найдено по «{query}»
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
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      padding: '48px 24px', textAlign: 'center',
    }}>
      <span style={{ fontSize: 56 }}>📭</span>
      <p style={{ margin: 0, fontWeight: 600, fontSize: 17 }}>Нет приложений</p>
      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, maxWidth: 280, lineHeight: 1.5 }}>
        Добавь первое приложение — оно откроется прямо здесь, без переадресации.
      </p>
      <button
        onClick={onAdd}
        style={{
          marginTop: 8, padding: '11px 28px', borderRadius: 12,
          background: 'var(--accent)', color: '#fff',
          border: 'none', fontWeight: 600, fontSize: 15, cursor: 'pointer',
        }}
      >+ Добавить приложение</button>
    </div>
  );
}

// ─── AppCard ─────────────────────────────────────────────────────────────────

function AppCard({
  app, onClick, onRemove,
}: { app: AppDefinition; onClick: () => void; onRemove: () => void }) {
  const [hovered, setHovered]   = useState(false);
  const [delHover, setDelHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setDelHover(false); }}
      style={{ position: 'relative' }}
    >
      <button
        onClick={onClick}
        style={{
          width: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          padding: '22px 14px', borderRadius: 18,
          border: '1px solid var(--border)', background: 'var(--card-bg)',
          cursor: 'pointer', textAlign: 'center', color: 'var(--text)',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
      >
        <span style={{
          fontSize: 36, width: 60, height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 16, background: app.color + '20', border: `1px solid ${app.color}40`,
        }}>{app.icon}</span>

        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{app.name}</div>
          {app.description && (
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4 }}>
              {app.description}
            </div>
          )}
        </div>

        <div style={{ width: 6, height: 6, borderRadius: '50%', background: app.color, opacity: 0.7 }} />
      </button>

      {/* Delete button — visible on hover */}
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          onMouseEnter={() => setDelHover(true)}
          onMouseLeave={() => setDelHover(false)}
          title="Удалить"
          style={{
            position: 'absolute', top: 8, right: 8,
            width: 22, height: 22, borderRadius: '50%',
            background: delHover ? '#ff3b30' : 'var(--tab-active)',
            color: delHover ? '#fff' : 'var(--text-secondary)',
            border: '1px solid var(--border)',
            fontSize: 14, lineHeight: 1, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.12s, color 0.12s',
          }}
        >×</button>
      )}
    </div>
  );
}
