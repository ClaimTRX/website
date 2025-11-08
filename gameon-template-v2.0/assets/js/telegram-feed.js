/* telegram-feed.js – CFT Live Telegram Feed (Bot API – New Messages Only) */
/* -------------------------------------------------
   Polls for new posts from @CFTAnnouncement after page load.
   Shows in scrollable list (up to 5 newest). Reload = fresh start.
   ------------------------------------------------- */

const BOT_TOKEN = '8452869704:AAFx0HbaGqQJG_OgZdMAKgR_-L_5rIjbOjc';
const CHANNEL_ID = -1002414524369;  // Your numeric chat ID
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const MAX_POSTS = 5;  // How many new posts to keep visible

let lastUpdateId = 0;
const messages = [];  // Store new messages

/* ---------- Helpers ---------- */
function formatTime(unix) {
  const d = new Date(unix * 1000);
  return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) +
         ' – ' + d.toLocaleDateString([], {day:'numeric', month:'short', year:'numeric'});
}

function entitiesToHTML(text, entities = []) {
  if (!entities.length) return text.replace(/\n/g, '<br>');

  // Sort descending to avoid index shift
  entities = entities.slice().sort((a, b) => b.offset - a.offset);

  for (const e of entities) {
    const s = e.offset, len = e.length, part = text.slice(s, s + len);
    let html = part;
    switch (e.type) {
      case 'bold': html = `<strong>${part}</strong>`; break;
      case 'italic': html = `<em>${part}</em>`; break;
      case 'underline': html = `<u>${part}</u>`; break;
      case 'strikethrough': html = `<s>${part}</s>`; break;
      case 'code': html = `<code>${part}</code>`; break;
      case 'pre': html = `<pre>${part}</pre>`; break;
      case 'text_link': html = `<a href="${e.url}" target="_blank" style="color:var(--accent-1);">${part}</a>`; break;
      case 'url': html = `<a href="${part}" target="_blank" style="color:var(--accent-1);">${part}</a>`; break;
    }
    text = text.slice(0, s) + html + text.slice(s + len);
  }
  return text.replace(/\n/g, '<br>');
}

/* ---------- Render ---------- */
function render() {
  const container = document.getElementById('tg-messages');
  if (!messages.length) {
    container.innerHTML = '<div class="text-center text-muted small">Waiting for new announcements…</div>';
    return;
  }

  container.innerHTML = messages.map(m => `
    <div class="msg">
      <div>${m.html}</div>
      <div class="ts text-muted">${formatTime(m.date)}</div>
    </div>
  `).join('');

  container.scrollTop = 0;  // Newest on top

  // Update header timestamp
  if (messages.length) {
    document.getElementById('tg-latest-ts').textContent = formatTime(messages[0].date);
  }
}

/* ---------- Fetch New Posts ---------- */
async function loadLatest() {
  try {
    const res = await fetch(`${API}/getUpdates?offset=${lastUpdateId + 1}&limit=10&allowed_updates=["channel_post"]`);
    const data = await res.json();
    if (!data.ok) throw new Error(data.description || 'API error');

    const posts = data.result
      .filter(u => u.channel_post && u.channel_post.chat.id === CHANNEL_ID)
      .sort((a, b) => b.update_id - a.update_id);

    if (!posts.length) return;

    // Add new posts (newest first)
    for (const p of posts) {
      const msg = p.channel_post;
      const html = entitiesToHTML(msg.text || msg.caption || '[Media]', msg.entities || msg.caption_entities);
      messages.unshift({ id: msg.message_id, html, date: msg.date });  // Prepend newest
    }

    // Limit to MAX_POSTS
    if (messages.length > MAX_POSTS) messages.splice(MAX_POSTS);

    lastUpdateId = posts[0].update_id;

    render();

  } catch (e) {
    console.error('Telegram error:', e);
    const container = document.getElementById('tg-messages');
    container.innerHTML = `<div class="text-center text-muted small">
      Check announcements → <a href="https://t.me/CFTAnnouncement" target="_blank" style="color:var(--accent-1)">Open Channel</a>
    </div>`;
  }
}

/* ---------- Auto-Start After Page Loads ---------- */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Telegram feed started – polling for new posts...');
  loadLatest();  // Initial check
  setInterval(loadLatest, 30000);  // Poll every 30s
});
