import { useState } from 'react';
import { UserApp } from '../types';

const COLORS = [
  '#007aff', '#34c759', '#ff9500', '#ff3b30',
  '#af52de', '#5ac8fa', '#ff2d55', '#a2845e',
];

const EMOJIS = [
  '🌐','📊','🛠️','📝','💰','🏋️','📚','🎵',
  '🎨','📷','🗂️','⚙️','🚀','🔔','🗓️','💬',
];

interface Props {
  onAdd: (app: UserApp) => void;
  onClose: () => void;
}

export function AddAppModal({ onAdd, onClose }: Props) {
  const [url, setUrl]         = useState('');
  const [name, setName]       = useState('');
  const [icon, setIcon]       = useState('🌐');
  const [color, setColor]     = useState(COLORS[0]);
  const [desc, setDesc]       = useState('');
  const [error, setError]     = useState('');

  function normalizeUrl(raw: string): string {
    const s = raw.trim();
    if (!s) return '';
    if (/^https?:\/\//i.test(s)) return s;
    return 'https://' + s;
  }

  function handleSubmit() {
    const finalUrl = normalizeUrl(url);
    if (!finalUrl) { setError('URL обязателен'); return; }
    try { new URL(finalUrl); } catch { setError('Некорректный URL'); return; }
    if (!name.trim()) { setError('Название обязательно'); return; }

    const id = 'app_' + Date.now();
    onAdd({ id, name: name.trim(), icon, url: finalUrl, color, description: desc.trim() || undefined });
    onClose();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  }

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKey}
        style={{
          width: '100%', maxWidth: 440,
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: '28px 28px 24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', gap: 18,
          animation: 'slideUp 0.18s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Добавить приложение</h2>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--tab-active)', border: 'none',
              fontSize: 16, cursor: 'pointer', color: 'var(--text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >×</button>
        </div>

        {/* URL */}
        <Field label="URL приложения *">
          <input
            autoFocus
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="https://myapp.com"
            style={inputStyle}
          />
        </Field>

        {/* Name */}
        <Field label="Название *">
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            placeholder="Моё приложение"
            style={inputStyle}
          />
        </Field>

        {/* Description */}
        <Field label="Описание">
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Необязательно"
            style={inputStyle}
          />
        </Field>

        {/* Icon picker */}
        <Field label="Иконка">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setIcon(e)}
                style={{
                  width: 36, height: 36, borderRadius: 9, fontSize: 20,
                  border: `2px solid ${icon === e ? color : 'var(--border)'}`,
                  background: icon === e ? color + '20' : 'transparent',
                  cursor: 'pointer', transition: 'border-color 0.1s',
                }}
              >{e}</button>
            ))}
          </div>
        </Field>

        {/* Color picker */}
        <Field label="Цвет">
          <div style={{ display: 'flex', gap: 8 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: c, border: `3px solid ${color === c ? 'var(--text)' : 'transparent'}`,
                  cursor: 'pointer', padding: 0, transition: 'border-color 0.1s',
                }}
              />
            ))}
          </div>
        </Field>

        {/* Error */}
        {error && (
          <p style={{ margin: 0, fontSize: 12, color: '#ff3b30' }}>{error}</p>
        )}

        {/* Preview + Submit */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
          {/* Mini preview */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            flex: 1, padding: '8px 12px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg)',
          }}>
            <span style={{
              fontSize: 22, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 9, background: color + '20',
            }}>{icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              {name || 'Название'}
            </span>
          </div>
          <button
            onClick={handleSubmit}
            style={{
              padding: '10px 22px', borderRadius: 12,
              background: color, color: '#fff',
              border: 'none', fontWeight: 600, fontSize: 14,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'opacity 0.15s',
            }}
          >Добавить</button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(16px); opacity:0 } to { transform: translateY(0); opacity:1 } }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg)',
  color: 'var(--text)',
  fontSize: 14,
  outline: 'none',
  width: '100%',
};
