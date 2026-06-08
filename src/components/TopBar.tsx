import React from 'react';
import { AppDefinition } from '../types';

interface TopBarProps {
  activeApp: AppDefinition | null;
  openApps: AppDefinition[];
  titles: Record<string, string>;
  onHome: () => void;
  onSwitchApp: (id: string) => void;
  onCloseApp: (id: string) => void;
}

export function TopBar({
  activeApp,
  openApps,
  titles,
  onHome,
  onSwitchApp,
  onCloseApp,
}: TopBarProps) {
  return (
    <header
      style={{
        height: 48,
        background: 'var(--bar-bg)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        paddingInline: 12,
        gap: 8,
        flexShrink: 0,
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* Home / logo button */}
      <button
        onClick={onHome}
        title="Launcher (⌘H)"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 12px',
          borderRadius: 8,
          background: activeApp ? 'transparent' : 'var(--accent-subtle)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          fontSize: 13,
          fontWeight: 600,
          flexShrink: 0,
          transition: 'background 0.15s',
        }}
      >
        ⌘ MyOS
      </button>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          flex: 1,
          overflowX: 'auto',
          alignItems: 'center',
        }}
      >
        {openApps.map((app) => {
          const isActive = activeApp?.id === app.id;
          const label = titles[app.id] ?? app.name;
          return (
            <div
              key={app.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 10px',
                borderRadius: 8,
                background: isActive ? 'var(--tab-active)' : 'transparent',
                border: '1px solid ' + (isActive ? 'var(--border)' : 'transparent'),
                fontSize: 13,
                color: 'var(--text)',
                whiteSpace: 'nowrap',
                transition: 'background 0.12s',
                userSelect: 'none',
              }}
            >
              <span
                onClick={() => onSwitchApp(app.id)}
                style={{ cursor: 'pointer', display: 'flex', gap: 5 }}
              >
                <span>{app.icon}</span>
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {label}
                </span>
              </span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseApp(app.id);
                }}
                title="Close"
                style={{
                  fontSize: 16,
                  lineHeight: 1,
                  opacity: 0.45,
                  cursor: 'pointer',
                  marginLeft: 2,
                  transition: 'opacity 0.1s',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.opacity = '1')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.opacity = '0.45')
                }
              >
                ×
              </span>
            </div>
          );
        })}
      </div>

      {/* Right side: active app name */}
      {activeApp && (
        <span
          style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}
        >
          {titles[activeApp.id] ?? activeApp.name}
        </span>
      )}
    </header>
  );
}
