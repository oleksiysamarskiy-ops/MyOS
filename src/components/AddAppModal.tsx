import { useState } from 'react';
import { UserApp } from '../types';

const COLORS = ['#5B8EF0','#4ade80','#f59e0b','#f87171','#a78bfa','#34d399','#fb923c','#e879f9'];
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
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
        style={{
          width: '100%', maxWidth: 420,
          background: 'var(--surface)',
          border: '1px solid var(--border-2)',
          borderRadius: 12,
          padding: 28,
          display: 'flex', flexDirection: 'column', gap: 22,
          animation: 'scaleIn 0.18s ease',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
              Add app
            </h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-2)', marginTop: 3 }}>
              Any web URL, opens in a frame
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              color: 'var(--text-3)', fontSize: 18, lineHeight: 1, padding: '3px 5px',
              borderRadius: 4, transition: 'color 0.1s, background 0.1s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.background = 'var(--surface-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-3)';
              e.currentTarget.style.background = 'transparent';
            }}
          >×</button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', marginTop: -8 }} />

        {/* URL */}
        <Field label="URL">
          <input
            autoFocus
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(''); }}
            placeholder="https://myapp.com"
            style={inp}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </Field>

        {/* Name + icon row */}
        <div style={{ display: 'flex', gap: 10 }}>
          <EmojiPicker selected={icon} onSelect={setIcon} color={color} />
          <Field label="Name" style={{ flex: 1 }}>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="My App"
              style={inp}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description (optional)">
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Short description"
            style={inp}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </Field>

        {/* Color */}
        <Field label="Accent color">
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: '50%', padding: 0,
                  background: c,
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: 2.5,
                  opacity: color === c ? 1 : 0.35,
                  transition: 'opacity 0.15s, outline 0.1s, transform 0.1s',
                  transform: color === c ? 'scale(1.05)' : 'scale(1)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = color === c ? '1' : '0.35')}
              />
            ))}
          </div>
        </Field>

        {/* Error */}
        {error && (
          <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: -10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="var(--danger)" strokeWidth="1.2"/>
              <path d="M6 3.5V6.5" stroke="var(--danger)" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="6" cy="8.5" r="0.7" fill="var(--danger)"/>
            </svg>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: -4 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              borderRadius: 6,
              border: '1px solid var(--border-2)',
              color: 'var(--text-2)',
              fontSize: 13,
              transition: 'color 0.15s, border-color 0.15s, background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.background = 'var(--surface-2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-2)';
              e.currentTarget.style.background = 'transparent';
            }}
          >Cancel</button>
          <button
            onClick={submit}
            style={{
              padding: '8px 22px',
              borderRadius: 6,
              background: 'var(--accent)',
              color: '#fff',
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
          >Add app</button>
        </div>
      </div>
    </div>
  );
}

// ─── Emoji picker ─────────────────────────────────────────────────────────────

function EmojiPicker({ selected, onSelect, color }: { selected: string; onSelect: (e: string) => void; color: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', marginTop: 18 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 42, height: 42,
          background: color + '20',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color 0.1s, background 0.1s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-2)';
          e.currentTarget.style.background = color + '28';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
          e.currentTarget.style.background = color + '20';
        }}
      >{selected}</button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 10,
          background: 'var(--surface-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 10,
          padding: 8,
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3,
          width: 140,
          animation: 'scaleIn 0.12s ease',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => { onSelect(e); setOpen(false); }}
              style={{
                fontSize: 18, padding: 5, borderRadius: 6,
                background: selected === e ? 'var(--accent-dim)' : 'transparent',
                transition: 'background 0.1s, transform 0.1s',
              }}
              onMouseEnter={(ev) => {
                ev.currentTarget.style.background = 'var(--surface-3)';
                ev.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(ev) => {
                ev.currentTarget.style.background = selected === e ? 'var(--accent-dim)' : 'transparent';
                ev.currentTarget.style.transform = 'scale(1)';
              }}
            >{e}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7, ...style }}>
      <label style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--text-2)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: '9px 12px',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 7,
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s',
};
