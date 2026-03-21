// ───────────────────────────────────────────────
// contracts array (comma fixed + USDT Pool restored)
const contracts = [
  {
    name: 'CFT',
    tabName: 'BTC Pool',
    address: 'TQQuD8Lq37zmL2brsdrrqM5fA797T5dhVy',
    decimals: 6,
    soonDays: 10,
    expireDays: 14,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  },
  {
    name: 'CFT',
    tabName: 'TRX Pool',
    address: 'TCf1vY3EMuczBSmo9Cfrffu6TsGrUvrC52',
    decimals: 6,
    soonDays: 10,
    expireDays: 14,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  },
  {
    name: 'CFT',
    tabName: 'CFT Pool',
    address: 'TAbu6yKiVRbs3c7tcwFnreupEfVW9t8d9K',
    decimals: 6,
    soonDays: 10,
    expireDays: 14,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  },
  {
    name: 'CFT',
    tabName: 'USDT Pool',
    address: 'TWTssCnUCDeMMqDA9A9zoxCfrLJXZh2N71',
    decimals: 6,
    soonDays: 10,
    expireDays: 14,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  },
  {
    name: 'CFTGame',
    tabName: 'CFT Game 7 Days',
    address: 'TWdkKsk6nvgLqGUv64WHLsYfh5ABHHtkJZ',
    decimals: 6,
    soonDays: 5,
    expireDays: 7,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  },
  {
    name: 'CFT',
    tabName: 'CFT Game 3 Days',
    address: 'TJ748PrjUZc9Beh1qdCXj1U2do8RsdmEcx',
    decimals: 6,
    soonDays: 2,
    expireDays: 3,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  },
  {
    name: 'StableX',
    tabName: 'USDD Rewards',
    address: 'TD9vT92VYx4AN56R4pmPjpkbtgoehc7SR4',
    decimals: 6,
    soonDays: 10,
    expireDays: 14,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  },
  // ───────────────────────────────────────────────
  // NEW CONTRACT (Advanced Rewards)
  // ───────────────────────────────────────────────
  {
    name: 'STAKE',                    // ← CHANGE THIS to the correct symbol if needed
    tabName: 'Advanced Rewards',
    address: 'TMrDKEu6vSBSwstToiiooAiwB5xKNghEy8',
    decimals: 6,                      // ← change to 18 if your staking token uses 18 decimals
    isRewardsContract: true,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  }
];

// ───────────────────────────────────────────────
// Copy wallet address (unchanged)
// ───────────────────────────────────────────────
function copyAddr(el, addr) {
  navigator.clipboard.writeText(addr)
    .then(() => {
      const original = el.textContent;
      el.textContent = 'Copied!';
      el.style.color = '#62ffcf';
      setTimeout(() => { el.textContent = original; el.style.color = ''; }, 1500);
    })
    .catch(() => alert('Failed to copy address'));
}
window.copyAddr = copyAddr;

const DELAY_MS = 0;
const THROTTLE_GAP_MS = 500;
let tronWeb, readTronWeb;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const throttle = (() => {
  let queue = Promise.resolve();
  let last = 0;
  return async function run(fn) {
    const exec = async () => {
      const now = Date.now();
      const wait = Math.max(0, THROTTLE_GAP_MS - (now - last));
      if (wait) await sleep(wait);
      last = Date.now();
      return await fn();
    };
    queue = queue.then(exec, exec);
    return queue;
  };
})();

async function initReadTronWeb(chainstackUrl) {
  if (readTronWeb) return;
  const TronWebCtor = (typeof window.TronWeb === 'function') ? window.TronWeb : window.tronWeb?.constructor;
  if (!TronWebCtor) throw new Error('TronWeb constructor not found');
  readTronWeb = new TronWebCtor({ fullHost: chainstackUrl });
  readTronWeb.setAddress('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb');
  const originalRequest = readTronWeb.request;
  readTronWeb.request = async function(endpoint, params = {}, method = 'POST') {
    return throttle(() => originalRequest.call(this, endpoint, params, method));
  };
}

let globalTotal = 0;
let globalProcessed = 0;
let globalProgressBar;
let globalCurrentEl;

function updateGlobalProgress() {
  if (globalTotal === 0) return;
  const percent = Math.floor((globalProcessed / globalTotal) * 100);
  globalProgressBar.style.width = `${percent}%`;
  globalCurrentEl.textContent = percent;
  if (globalProcessed >= globalTotal) {
    document.getElementById('global-progress').style.display = 'none';
  }
}

// ───────────────────────────────────────────────
// UPDATED loadStakers (supports both contract types)
// ───────────────────────────────────────────────
async function loadStakers(config, tabId) {
  const activeBody = document.getElementById(`active-body-${tabId}`);
  const soonBody = document.getElementById(`soon-body-${tabId}`);
  const expiredBody = document.getElementById(`expired-body-${tabId}`);
  const totalStakersEl = document.getElementById(`total-stakers-${tabId}`);
  const activeTotalEl = document.getElementById(`active-total-${tabId}`);

  activeBody.innerHTML = '<tr><td colspan="4" class="text-center py-5">Loading...</td></tr>';
  soonBody.innerHTML = '';
  expiredBody.innerHTML = '';

  try {
    await initReadTronWeb(config.chainstackUrl);
    const contract = await readTronWeb.contract().at(config.address);
    let data = [];

    if (config.isRewardsContract) {
      // NEW CONTRACT LOGIC
      document.getElementById(`soon-section-${tabId}`).style.display = 'none';
      document.getElementById(`expired-section-${tabId}`).style.display = 'none';

      const result = await contract.getAllStakersAndAmounts().call();
      const addresses = result[0] || result.addresses || [];
      const amountsRaw = result[1] || result.amounts || [];

      totalStakersEl.textContent = `(${addresses.length} wallets)`;

      for (let i = 0; i < addresses.length; i++) {
        let addr = addresses[i];
        if (addr.startsWith('41') && addr.length === 42) {
          addr = readTronWeb.address.fromHex(addr);
        }

        const stakedNum = readTronWeb.toBigNumber(amountsRaw[i])
          .shiftedBy(-config.decimals)
          .toNumber();

        if (stakedNum < 1) continue;

        let pendingText = '—';
        try {
          let pendingRaw;
          try { pendingRaw = await contract.viewPendingReward(addr).call(); }
          catch { pendingRaw = await contract.earned(addr).call(); }
          const pending = readTronWeb.toBigNumber(pendingRaw).shiftedBy(-config.decimals).toNumber();
          if (pending > 0.0001) pendingText = `Pending: ${pending.toFixed(4)}`;
        } catch (e) {}

        data.push({ addr, stakedNum, lastClaimText: pendingText, status: 'Active', statusClass: 'text-success' });
      }
    } else {
      // ORIGINAL CONTRACT LOGIC
      const list = await contract.getStakersList().call();
      totalStakersEl.textContent = `(${list.length} wallets)`;

      for (let i = 0; i < list.length; i++) {
        let addr = list[i];
        if (addr.startsWith('41') && addr.length === 42) addr = readTronWeb.address.fromHex(addr);

        try {
          const info = await contract.users(addr).call();
          const stakedNum = readTronWeb.toBigNumber(info.stakedAmount).shiftedBy(-config.decimals).toNumber();
          if (stakedNum < 1) continue;

          const lastClaim = Number(info.lastClaimTimestamp);
          const isActive = info.isActive;
          const now = Math.floor(Date.now() / 1000);
          let daysSinceClaim = lastClaim === 0 ? Infinity : Math.floor((now - lastClaim) / 86400);

          let status, statusClass;
          if (lastClaim === 0) { status = 'Never claimed'; statusClass = 'text-muted'; }
          else if (!isActive || daysSinceClaim >= config.expireDays) { status = 'EXPIRED'; statusClass = 'expired'; }
          else if (daysSinceClaim >= config.soonDays) { status = 'Expire Soon'; statusClass = 'soon'; }
          else { status = 'Active'; statusClass = 'text-success'; }

          const lastClaimText = lastClaim === 0 ? 'Never' :
            daysSinceClaim === 0 ? 'Today' :
            daysSinceClaim === 1 ? '1 day ago' : `${daysSinceClaim} days ago`;

          data.push({ addr, stakedNum, lastClaimText, status, statusClass });
        } catch (e) { console.warn('Failed for', addr, e.message); }
      }
    }

    data.sort((a, b) => b.stakedNum - a.stakedNum);

    const buildRows = (rowsData) => {
      let rows = '';
      rowsData.forEach(s => {
        rows += `
          <tr>
            <td data-label="Wallet"><span class="addr" onclick="copyAddr(this, '${s.addr}')">${s.addr}</span></td>
            <td data-label="Staked ${config.name}"><strong>${s.stakedNum.toLocaleString(undefined, {maximumFractionDigits: 4})}</strong> ${config.name}</td>
            <td data-label="Last Claim">${s.lastClaimText}</td>
            <td data-label="Status" class="${s.statusClass}">${s.status}</td>
          </tr>`;
      });
      return rows || '<tr><td colspan="4" class="text-center py-4">None</td></tr>';
    };

    activeBody.innerHTML = buildRows(data);
    const sum = data.reduce((t, s) => t + s.stakedNum, 0);
    activeTotalEl.textContent = config.isRewardsContract 
      ? `Total Staked: ${sum.toLocaleString(undefined, {maximumFractionDigits: 2})} ${config.name}`
      : `Total Active: ${sum.toLocaleString(undefined, {maximumFractionDigits: 2})} ${config.name}`;

  } catch (err) {
    console.error(err);
    activeBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-5">Error: ${err.message}</td></tr>`;
  }
}

// ───────────────────────────────────────────────
// UPDATED setupTabs (global progress now works for both types)
// ───────────────────────────────────────────────
async function setupTabs() {
  const tabsContainer = document.getElementById('tabs-container');
  const tabContent = document.getElementById('tab-content');

  contracts.forEach((config, index) => {
    const tabId = config.tabName.toLowerCase().replace(/\s+/g, '-');
    const tabLabel = config.tabName || `${config.name} Stakers`;

    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `<a class="nav-link ${index === 0 ? 'active' : ''}" id="${tabId}-tab" data-bs-toggle="tab" href="#${tabId}" role="tab">${tabLabel}</a>`;
    tabsContainer.appendChild(li);

    const pane = document.createElement('div');
    pane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
    pane.id = tabId;
    pane.innerHTML = `...` /* (same HTML as before - unchanged) */;
    tabContent.appendChild(pane);

    document.getElementById(`refresh-${tabId}`).addEventListener('click', () => loadStakers(config, tabId));
  });

  // Global progress
  const globalProgress = document.getElementById('global-progress');
  globalProgressBar = document.getElementById('global-progress-bar');
  globalCurrentEl = document.getElementById('global-current');
  globalProgress.style.display = 'block';

  // First, fetch all staker lists to calculate total (supports both contract types)
  await Promise.all(contracts.map(async (config) => {
    if (!window.tronWeb || !window.tronWeb.ready) return;
    await initReadTronWeb(config.chainstackUrl);
    const contract = await readTronWeb.contract().at(config.address);

    let count = 0;
    if (config.isRewardsContract) {
      const result = await contract.getAllStakersAndAmounts().call();
      const addresses = result[0] || result.addresses || [];
      count = addresses.length;
    } else {
      const list = await contract.getStakersList().call();
      count = list.length;
    }
    globalTotal += count;
  }));

  // Now load all tabs
  contracts.forEach((config) => {
    const tabId = config.tabName.toLowerCase().replace(/\s+/g, '-');
    loadStakers(config, tabId);
  });

  // Tab shown handler (unchanged)
  const tabLinks = document.querySelectorAll('#tabs-container .nav-link');
  tabLinks.forEach(link => {
    link.addEventListener('shown.bs.tab', (e) => {
      const tabId = e.target.getAttribute('href').slice(1);
      const config = contracts.find(c => c.tabName.toLowerCase().replace(/\s+/g, '-') === tabId);
      const activeBody = document.getElementById(`active-body-${tabId}`);
      if (activeBody && (activeBody.innerHTML.includes('Loading...') || activeBody.innerHTML === '')) {
        loadStakers(config, tabId);
      }
    });
  });
}

window.addEventListener('load', () => {
  if (window.tronWeb && window.tronWeb.ready) {
    tronWeb = window.tronWeb;
    document.getElementById('connect-button').innerHTML = 'Connected';
  }
  setupTabs();
});
