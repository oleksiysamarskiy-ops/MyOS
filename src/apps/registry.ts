import { AppDefinition } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
//  Inline demo HTML — must be declared BEFORE APP_REGISTRY uses them
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_COUNTER_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Counter Demo</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; font-family: -apple-system, sans-serif;
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; min-height: 100vh; gap: 24px;
    background: #f5f5f7; color: #1d1d1f;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1e; color: #f5f5f7; }
    button { background: #2c2c2e !important; color: #f5f5f7 !important; border-color: rgba(255,255,255,0.15) !important; }
  }
  h2 { font-size: 20px; font-weight: 600; margin: 0; }
  .count { font-size: 72px; font-weight: 700; line-height: 1; }
  .row { display: flex; gap: 12px; }
  button {
    padding: 10px 24px; border-radius: 10px; border: 1px solid rgba(0,0,0,0.12);
    background: #fff; font-size: 20px; cursor: pointer;
    transition: transform .1s; font-family: inherit;
  }
  button:active { transform: scale(.94); }
  .home-btn {
    font-size: 13px; padding: 8px 16px;
    background: rgba(0,122,255,0.1); border-color: rgba(0,122,255,0.3);
    color: #007aff;
  }
  .log { font-size: 11px; color: #888; max-width: 300px; text-align: center; }
</style>
</head>
<body>
<h2>🔢 Counter Demo</h2>
<div class="count" id="num">0</div>
<div class="row">
  <button onclick="change(-1)">−</button>
  <button onclick="change(1)">+</button>
</div>
<button class="home-btn" onclick="goHome()">⌘ Back to Launcher</button>
<div class="log" id="log">Bridge status: waiting…</div>

<script>
  let n = 0;
  const log = document.getElementById('log');

  function change(d) {
    n += d;
    document.getElementById('num').textContent = n;
    send('SET_TITLE', { title: 'Counter (' + n + ')' });
  }

  function goHome() { send('GO_HOME'); }

  function send(type, payload) {
    window.parent.postMessage({ source: 'app', type, payload }, '*');
  }

  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || m.source !== 'myos') return;
    if (m.type === 'MYOS_READY') {
      log.textContent = '✅ Connected to MyOS shell';
      send('APP_MOUNTED');
    }
    if (m.type === 'PING') send('PONG');
  });
</script>
</body>
</html>`;

const DEMO_NOTES_HTML = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Quick Notes</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0; font-family: -apple-system, sans-serif;
    display: flex; flex-direction: column; height: 100vh;
    background: #fefce8; color: #1d1d1f;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1a0e; color: #f5f5f7; }
    header { background: rgba(0,0,0,.4) !important; border-color: rgba(255,255,255,.1) !important; }
    textarea { background: #1c1a0e !important; color: #f5f5f7 !important; }
    .status { color: #888 !important; }
  }
  header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 16px; background: rgba(255,255,255,.6);
    border-bottom: 1px solid rgba(0,0,0,.1); flex-shrink: 0;
  }
  header span { font-weight: 600; font-size: 15px; }
  .row { display: flex; gap: 8px; align-items: center; }
  button {
    padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(0,0,0,.12);
    background: #fff; font-size: 12px; cursor: pointer; font-family: inherit;
  }
  textarea {
    flex: 1; border: none; outline: none; resize: none;
    padding: 20px; font-size: 15px; line-height: 1.6;
    background: transparent; font-family: inherit; color: inherit;
  }
  .status { font-size: 11px; color: #999; }
</style>
</head>
<body>
<header>
  <span>📝 Quick Notes</span>
  <div class="row">
    <span class="status" id="st">loading…</span>
    <button onclick="save()">Save</button>
    <button onclick="goHome()">← Home</button>
  </div>
</header>
<textarea id="ta" placeholder="Start typing…"></textarea>

<script>
  const ta = document.getElementById('ta');
  const st = document.getElementById('st');

  ta.value = sessionStorage.getItem('myos_notes') || '';

  ta.addEventListener('input', () => {
    sessionStorage.setItem('myos_notes', ta.value);
    const words = ta.value.trim().split(/\s+/).filter(Boolean).length;
    st.textContent = words + ' words';
    send('SET_TITLE', { title: 'Notes (' + words + 'w)' });
  });

  function save() {
    st.textContent = '✓ Saved';
    setTimeout(() => { st.textContent = ''; }, 1500);
  }
  function goHome() { send('GO_HOME'); }

  function send(type, payload) {
    window.parent.postMessage({ source: 'app', type, payload }, '*');
  }

  window.addEventListener('message', (e) => {
    const m = e.data;
    if (!m || m.source !== 'myos') return;
    if (m.type === 'MYOS_READY') { st.textContent = '● live'; send('APP_MOUNTED'); }
    if (m.type === 'PING') send('PONG');
  });
</script>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
//  App Registry — adding a new app = one entry here
// ─────────────────────────────────────────────────────────────────────────────

export const APP_REGISTRY: AppDefinition[] = [
  {
    id: 'demo-counter',
    name: 'Counter Demo',
    icon: '🔢',
    url: 'data:text/html;charset=utf-8,' + encodeURIComponent(DEMO_COUNTER_HTML),
    color: '#007aff',
    description: 'Демо: postMessage bridge',
    category: 'tools',
  },
  {
    id: 'demo-notes',
    name: 'Quick Notes',
    icon: '📝',
    url: 'data:text/html;charset=utf-8,' + encodeURIComponent(DEMO_NOTES_HTML),
    color: '#f59e0b',
    description: 'Заметки прямо в iframe',
    category: 'productivity',
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    url: 'https://finance.yourdomain.com',
    color: '#22c55e',
    description: 'Бюджет, расходы, цели',
    category: 'productivity',
  },
  {
    id: 'fitness',
    name: 'Fitness',
    icon: '🏋️',
    url: 'https://fitness.yourdomain.com',
    color: '#3b82f6',
    description: 'Тренировки, питание, расписание',
    category: 'health',
  },
  {
    id: 'english',
    name: 'English',
    icon: '📚',
    url: 'https://english.yourdomain.com',
    color: '#a855f7',
    description: 'Изучение английского',
    category: 'learning',
  },
];

export function getApp(id: string): AppDefinition | undefined {
  return APP_REGISTRY.find((app) => app.id === id);
}
