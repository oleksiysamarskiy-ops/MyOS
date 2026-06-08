import { useState } from 'react';
import { UserApp } from '../types';

const COLORS = ['#e8e8e8','#4ade80','#60a5fa','#f59e0b','#f87171','#a78bfa','#34d399','#fb923c'];
const EMOJIS = ['🌐','📊','🛠️','📝','💰','🏋️','📚','🎵','🎨','📷','🗂️','⚙️','🚀','🔔','🗓️','💬'];

interface Props { onAdd: (app: UserApp) => void; onClose: () => void; }

export function AddAppModal({ onAdd, onClose }: Props) {
  const [url, setUrl]     = useState('');
  const [name, setName]   = useState('');
  const [icon, setIcon]   = useState('🌐');
  const [color, setColor] = useState(COLORS[0]);
  const [desc, setDesc]   = useState('');
  const [error, setError] = useState('');

  function normalizeUrl(raw: string) {
    const s = raw.trim();
    if (!s) return '';
    return /^https?:\/\//i.test(s) ? s : 'https://' + s;
  }

  function submit() {
    const finalUrl = normalizeUrl(url);
    if (!finalUrl) return setError('URL is required');
    try { new URL(finalUrl); } catch { return setError('Invalid URL'); }
    if (!name.trim()) return setError('Name is required');
    onAdd({ id: 'app_' + Date.now(), name: name.trim(), icon, url: finalUrl, color, description: desc.trim() || undefined });
    onClose();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.12s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
        style={{
          width: '100%', maxWidth: 400,
          background: 'var(--surface)',
          border: '1px solid var(--border-2)',
          borderRadius: 6,
          padding: 24,
          display: 'flex', flexDirection: 'column', gap: 20,
          animation: 'slideUp 0.15s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-2)' }}>
            Add app
          </span>
          <button
            onClick={onClose}
            style={{ color: 'var(--text-3)', fontSize: 18, lineHeight: 1, padding: 2 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-3)')}
          >×</button>
        </div>

        {/* URL */}
        <Field label="URL">
          <input
            autoFocus
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="https://myapp.com"
            style={inp}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-2)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </Field>

        {/* Name + icon row */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Emoji picker trigger */}
          <div style={{ position: 'relative' }}>
            <EmojiPicker selected={icon} onSelect={setIcon} color={color} />
          </div>
          <Field label="Name" style={{ flex: 1 }}>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="My App"
              style={inp}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-2)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description (optional)">
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Short note"
            style={inp}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--border-2)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </Field>

        {/* Color row */}
        <Field label="Color">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 22, height: 22, borderRadius: '50%', padding: 0,
                  background: c,
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: 2,
                  opacity: color === c ? 1 : 0.45,
                  transition: 'opacity 0.1s, outline 0.1s',
                }}
              />
            ))}
          </div>
        </Field>

        {/* Error */}
        {error && <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: -8 }}>{error}</p>}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '7px 16px',
              borderRadius: 4,
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
              fontSize: 13,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-2)')}
          >Cancel</button>
          <button
            onClick={submit}
            style={{
              padding: '7px 20px',
              borderRadius: 4,
              background: 'var(--text)',
              color: 'var(--bg)',
              fontWeight: 600,
              fontSize: 13,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >Add</button>
        </div>
      </div>
    </div>
  );
}

// ─── Emoji picker (inline popover) ───────────────────────────────────────────

function EmojiPicker({ selected, onSelect, color }: { selected: string; onSelect: (e: string) => void; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 40, height: 40, // matches input height
          marginTop: 18, // aligns with input (label + gap)
          background: color + '18',
          border: '1px solid var(--border)',
          borderRadius: 4,
          fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.1s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-2)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >{selected}</button>
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 10,
            background: 'var(--surface-2)',
            border: '1px solid var(--border-2)',
            borderRadius: 6,
            padding: 8,
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2,
            width: 132,
            animation: 'slideUp 0.1s ease',
          }}
        >
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => { onSelect(e); setOpen(false); }}
              style={{
                fontSize: 18, padding: 4, borderRadius: 4,
                background: selected === e ? 'var(--border-2)' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(ev) => (ev.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={(ev) => (ev.currentTarget.style.background = selected === e ? 'var(--border-2)' : 'transparent')}
            >{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: '8px 10px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 4,
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
};
