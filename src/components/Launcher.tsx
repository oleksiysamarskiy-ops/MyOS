import { useState, useMemo } from 'react';
import { AppDefinition } from '../types';
import { APP_REGISTRY } from '../apps/registry';

interface LauncherProps {
  onOpenApp: (app: AppDefinition) => void;
  lastOpenedId: string | null;
}

export function Launcher({ onOpenApp, lastOpenedId }: LauncherProps) {
  const [query, setQuery] = useState('');

  const lastApp = lastOpenedId
    ? APP_REGISTRY.find((a) => a.id === lastOpenedId)
    : null;

  const filtered = useMemo(() => {
    if (!query.trim()) return APP_REGISTRY;
    const q = query.toLowerCase();
    return APP_REGISTRY.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
    );
  }, [query]);

  const today = new Date().toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '40px 24px 60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 32,
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
          MyOS
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0', fontSize: 14 }}>
          {today}
        </p>
      </div>

      {/* Search — ⌘K shortcut wired in App.tsx */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="⌘K  Search apps…"
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '9px 16px',
          borderRadius: 12,
          border: '1px solid var(--border)',
          background: 'var(--card-bg)',
          color: 'var(--text)',
          fontSize: 14,
          outline: 'none',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}
      />

      {/* Quick resume */}
      {lastApp && !query && (
        <button
          onClick={() => onOpenApp(lastApp)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 20px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            background: 'var(--card-bg)',
            color: 'var(--text)',
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <span style={{ fontSize: 20 }}>{lastApp.icon}</span>
          <span>Continue: <strong>{lastApp.name}</strong></span>
          <span style={{ color: 'var(--text-secondary)' }}>→</span>
        </button>
      )}

      {/* App grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 14,
          width: '100%',
          maxWidth: 760,
        }}
      >
        {filtered.map((app) => (
          <AppCard key={app.id} app={app} onClick={() => onOpenApp(app)} />
        ))}
        {filtered.length === 0 && (
          <p
            style={{
              gridColumn: '1/-1',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: 14,
              padding: '32px 0',
            }}
          >
            No apps match "{query}"
          </p>
        )}
      </div>
    </div>
  );
}

// ─── AppCard ────────────────────────────────────────────────────────────────

function AppCard({ app, onClick }: { app: AppDefinition; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        padding: '22px 14px',
        borderRadius: 18,
        border: '1px solid var(--border)',
        background: 'var(--card-bg)',
        cursor: 'pointer',
        textAlign: 'center',
        color: 'var(--text)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 8px 24px rgba(0,0,0,0.10)'
          : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Icon */}
      <span
        style={{
          fontSize: 36,
          width: 60,
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          background: app.color + '20',
          border: `1px solid ${app.color}40`,
        }}
      >
        {app.icon}
      </span>

      {/* Labels */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{app.name}</div>
        {app.description && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            {app.description}
          </div>
        )}
      </div>

      {/* Accent dot */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: app.color,
          opacity: 0.7,
        }}
      />
    </button>
  );
}
