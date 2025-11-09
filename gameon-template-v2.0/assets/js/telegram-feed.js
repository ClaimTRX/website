/* telegram-feed.js – CFT Live Telegram Feed (Bot API – Pending Messages Snapshot) */
/* -------------------------------------------------
   Fetches pending channel_post updates from @CFTAnnouncement
   and renders the newest MAX_POSTS as a feed.

   NOTE: This is still using Bot API directly from frontend,
   which is NOT secure. Move BOT_TOKEN to a backend ASAP.
   ------------------------------------------------- */

const BOT_TOKEN = '8452869704:AAFx0HbaGqQJG_OgZdMAKgR_-L_5rIjbOjc';
const CHANNEL_ID = -1002414524369;  // Your numeric chat ID
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const MAX_POSTS = 10;

const messages = [];  // Rendered snapshot

/* ---------- Helpers ---------- */
function formatTime(unix) {
  const d = new Date(unix * 1000);
  return (
    d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
    ' – ' +
    d.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })
  );
}

function entitiesToHTML(text, entities = []) {
  if (!entities || !entities.length) return (text || '').replace(/\n/g, '<br>');

  // Sort descending to avoid index shift
  entities = entities.slice().sort((a, b) => b.offset - a.offset);

  for (const e of entities) {
    const s = e.offset;
    const len = e.length;
    const part = text.slice(s, s + len);
    let html = part;

    switch (e.type) {
      case 'bold':
        html = `<strong>${part}</strong>`;
        break;
      case 'italic':
        html = `<em>${part}</em>`;
        break;
      case 'underline':
        html = `<u>${part}</u>`;
        break;
      case 'strikethrough':
        html = `<s>${part}</s>`;
        break;
      case 'code':
        html = `<code>${part}</code>`;
        break;
      case 'pre':
        html = `<pre>${part}</pre>`;
        break;
      case 'text_link':
        html = `<a href="${e.url}" target="_blank" style="color:var(--accent-1);">${part}</a>`;
        break;
      case 'url':
        html = `<a href="${part}" target="_blank" style="color:var(--accent-1);">${part}</a>`;
        break;
    }

    text = text.slice(0, s) + html + text.slice(s + len);
  }

  return text.replace(/\n/g, '<br>');
}

/* ---------- Render ---------- */
function render() {
  const container = document.getElementById('tg-messages');
  const headerTs = document.getElementById('tg-latest-ts');

  if (!container) return;

  if (!messages.length) {
    container.innerHTML =
      '<div class="text-center text-muted small">Waiting for announcements…</div>';
    if (headerTs) headerTs.textContent = '';
    return;
  }

  container.innerHTML = messages
    .map(
      (m) => `
      <div class="msg">
        <div>${m.html}</div>
        <div class="ts text-muted">${formatTime(m.date)}</div>
      </div>`
    )
    .join('');

  // Show newest on top
  container.scrollTop = 0;

  // Update header timestamp
  if (headerTs) {
    headerTs.textContent = formatTime(messages[0].date);
  }
}

/* ---------- Fetch & Build Snapshot ---------- */
async function loadLatest() {
  try {
    // IMPORTANT: no offset / lastUpdateId
    const res = await fetch(
      `${API}/getUpdates?limit=100&allowed_updates=["channel_post"]`
    );
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || 'API error');

    const posts = data.result
      .filter((u) => u.channel_post && u.channel_post.chat.id === CHANNEL_ID)
      // sort by message date, newest first
      .sort((a, b) => b.channel_post.date - a.channel_post.date)
      .slice(0, MAX_POSTS);

    messages.length = 0; // reset snapshot

    for (const p of posts) {
      const msg = p.channel_post;
      const html = entitiesToHTML(
        msg.text || msg.caption || '[Media]',
        msg.entities || msg.caption_entities
      );
      messages.push({
        id: msg.message_id,
        html,
        date: msg.date,
      });
    }

    render();
  } catch (e) {
    console.error('Telegram error:', e);
    const container = document.getElementById('tg-messages');
    if (container) {
      container.innerHTML = `
        <div class="text-center text-muted small">
          Check announcements → 
          <a href="https://t.me/CFTAnnouncement" target="_blank" style="color:var(--accent-1)">
            Open Channel
          </a>
        </div>`;
    }
  }
}

/* ---------- Auto-Start After Page Loads ---------- */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Telegram feed started – polling for pending posts...');
  loadLatest();              // Initial load
  setInterval(loadLatest, 30_000); // Refresh snapshot every 30s
});

