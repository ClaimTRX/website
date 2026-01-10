// loadstakers.js
const MIN_VISIBLE_STAKE = 1; // ← Change this value to show/hide small stakes

const contracts = [
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
];

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
  const TronWebCtor = window.TronWeb || window.tronWeb?.constructor;
  if (!TronWebCtor) throw new Error('TronWeb constructor not found');
  
  readTronWeb = new TronWebCtor({ fullHost: chainstackUrl });
  readTronWeb.setAddress('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'); // dummy address
  
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

// Global copy function - will be attached to window
function copyAddr(element, address, event) {
  event?.stopPropagation?.();
  
  navigator.clipboard.writeText(address)
    .then(() => {
      const originalText = element.textContent;
      element.textContent = 'Copied!';
      element.style.color = 'var(--success)';
      
      setTimeout(() => {
        element.textContent = originalText;
        element.style.color = '';
      }, 1400);
    })
    .catch(() => {
      element.textContent = 'Copy failed';
      setTimeout(() => {
        element.textContent = address;
        element.style.color = '';
      }, 2000);
    });
}

async function loadStakers(config, tabId) {
  const activeBody = document.getElementById(`active-body-${tabId}`);
  const soonBody = document.getElementById(`soon-body-${tabId}`);
  const expiredBody = document.getElementById(`expired-body-${tabId}`);
  
  const totalStakersEl = document.getElementById(`total-stakers-${tabId}`);
  const activeTotalEl = document.getElementById(`active-total-${tabId}`);
  const soonTotalEl = document.getElementById(`soon-total-${tabId}`);
  const expiredTotalEl = document.getElementById(`expired-total-${tabId}`);

  activeBody.innerHTML = '<tr><td colspan="4" class="text-center py-5">Loading...</td></tr>';
  soonBody.innerHTML = expiredBody.innerHTML = '';

  try {
    if (!window.tronWeb?.ready) throw new Error('Please connect TronLink');

    tronWeb = window.tronWeb;
    await initReadTronWeb(config.chainstackUrl);

    const contract = await readTronWeb.contract().at(config.address);
    const list = await contract.getStakersList().call();

    totalStakersEl.textContent = `(${list.length} wallets)`;

    const activeData = [];
    const soonData = [];
    const expiredData = [];

    for (const hexAddr of list) {
      let addr = hexAddr.startsWith('41') && hexAddr.length === 42
        ? readTronWeb.address.fromHex(hexAddr)
        : hexAddr;

      try {
        const info = await contract.users(addr).call();
        
        const stakedNum = Number(
          readTronWeb.toBigNumber(info.stakedAmount).shiftedBy(-config.decimals)
        );

        // Skip very small stakes
        if (stakedNum < MIN_VISIBLE_STAKE) continue;

        const lastClaim = Number(info.lastClaimTimestamp);
        const isActive = info.isActive;
        const now = Math.floor(Date.now() / 1000);
        const daysSinceClaim = lastClaim === 0 ? Infinity : Math.floor((now - lastClaim) / 86400);

        let status, statusClass, category;

        if (lastClaim === 0) {
          status = 'Never claimed';
          statusClass = 'text-muted';
          category = 'active';
        } else if (!isActive || daysSinceClaim >= config.expireDays) {
          status = 'EXPIRED';
          statusClass = 'expired';
          category = 'expired';
        } else if (daysSinceClaim >= config.soonDays) {
          status = 'Expire Soon';
          statusClass = 'soon';
          category = 'soon';
        } else {
          status = 'Active';
          statusClass = 'text-success';
          category = 'active';
        }

        const lastClaimText = lastClaim === 0 ? 'Never' :
          daysSinceClaim === 0 ? 'Today' :
          daysSinceClaim === 1 ? '1 day ago' : `${daysSinceClaim} days ago`;

        const data = { addr, stakedNum, lastClaimText, status, statusClass };

        if (category === 'active') activeData.push(data);
        else if (category === 'soon') soonData.push(data);
        else expiredData.push(data);

      } catch (e) {
        console.warn(`Failed for ${addr}:`, e.message);
      }

      globalProcessed++;
      updateGlobalProgress();
      if (list.indexOf(hexAddr) < list.length - 1) await sleep(DELAY_MS);
    }

    // Sort by stake amount descending
    const sortFn = (a, b) => b.stakedNum - a.stakedNum;
    activeData.sort(sortFn);
    soonData.sort(sortFn);
    expiredData.sort(sortFn);

    const buildRows = (data) => {
      if (data.length === 0) {
        return '<tr><td colspan="4" class="text-center py-4">None</td></tr>';
      }
      
      return data.map(s => `
        <tr>
          <td data-label="Wallet">
            <span class="addr" onclick="copyAddr(this, '${s.addr}', event)">${s.addr}</span>
          </td>
          <td data-label="Staked ${config.name}">
            <strong>${s.stakedNum.toLocaleString(undefined, { maximumFractionDigits: 4 })}</strong> ${config.name}
          </td>
          <td data-label="Last Claim">${s.lastClaimText}</td>
          <td data-label="Status" class="${s.statusClass}">${s.status}</td>
        </tr>
      `).join('');
    };

    activeBody.innerHTML = buildRows(activeData);
    soonBody.innerHTML = buildRows(soonData);
    expiredBody.innerHTML = buildRows(expiredData);

    const sum = arr => arr.reduce((total, s) => total + s.stakedNum, 0);

    activeTotalEl.textContent = `Total Active: ${sum(activeData).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${config.name}`;
    soonTotalEl.textContent = `Total Expire Soon: ${sum(soonData).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${config.name}`;
    expiredTotalEl.textContent = `Total Expired: ${sum(expiredData).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${config.name}`;

  } catch (err) {
    console.error(err);
    activeBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-5">Error: ${err.message}</td></tr>`;
  }
}

async function setupTabs() {
  const tabsContainer = document.getElementById('tabs-container');
  const tabContent = document.getElementById('tab-content');

  // Make copyAddr globally available
  window.copyAddr = copyAddr;

  contracts.forEach((config, index) => {
    const tabId = config.tabName.toLowerCase().replace(/\s+/g, '-');
    const tabLabel = config.tabName;

    // Tab navigation
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `
      <a class="nav-link ${index === 0 ? 'active' : ''}" 
         id="${tabId}-tab" 
         data-bs-toggle="tab" 
         href="#${tabId}" 
         role="tab">${tabLabel}</a>`;
    tabsContainer.appendChild(li);

    // Tab content pane
    const pane = document.createElement('div');
    pane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
    pane.id = tabId;
    pane.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="m-0">Stakers <span id="total-stakers-${tabId}" class="text-muted">(loading...)</span></h3>
        <button id="refresh-${tabId}" class="btn btn-primary btn-sm">Refresh</button>
      </div>

      <div id="active-section-${tabId}" class="luxe-card">
        <h4 class="section-title">Active Stakers</h4>
        <div class="table-responsive">
          <table>
            <thead><tr><th>Wallet</th><th>Staked ${config.name}</th><th>Last Claim</th><th>Status</th></tr></thead>
            <tbody id="active-body-${tabId}"></tbody>
          </table>
        </div>
        <div class="section-total" id="active-total-${tabId}">Total Active: — ${config.name}</div>
      </div>

      <div id="soon-section-${tabId}" class="luxe-card">
        <h4 class="section-title">Expire Soon</h4>
        <div class="table-responsive">
          <table>
            <thead><tr><th>Wallet</th><th>Staked ${config.name}</th><th>Last Claim</th><th>Status</th></tr></thead>
            <tbody id="soon-body-${tabId}"></tbody>
          </table>
        </div>
        <div class="section-total" id="soon-total-${tabId}">Total Expire Soon: — ${config.name}</div>
      </div>

      <div id="expired-section-${tabId}" class="luxe-card">
        <h4 class="section-title">Expired</h4>
        <div class="table-responsive">
          <table>
            <thead><tr><th>Wallet</th><th>Staked ${config.name}</th><th>Last Claim</th><th>Status</th></tr></thead>
            <tbody id="expired-body-${tabId}"></tbody>
          </table>
        </div>
        <div class="section-total" id="expired-total-${tabId}">Total Expired: — ${config.name}</div>
      </div>
    `;
    tabContent.appendChild(pane);

    document.getElementById(`refresh-${tabId}`).onclick = () => loadStakers(config, tabId);
  });

  // Global progress elements
  globalProgressBar = document.getElementById('global-progress-bar');
  globalCurrentEl = document.getElementById('global-current');
  document.getElementById('global-progress').style.display = 'block';

  // Count total stakers first (for global progress)
  await Promise.all(contracts.map(async (config) => {
    try {
      await initReadTronWeb(config.chainstackUrl);
      const contract = await readTronWeb.contract().at(config.address);
      const list = await contract.getStakersList().call();
      globalTotal += list.length;
    } catch {}
  }));

  // Load all tabs
  contracts.forEach(config => {
    const tabId = config.tabName.toLowerCase().replace(/\s+/g, '-');
    loadStakers(config, tabId);
  });

  // Auto-refresh when tab becomes visible and still empty
  document.querySelectorAll('#tabs-container .nav-link').forEach(link => {
    link.addEventListener('shown.bs.tab', (e) => {
      const tabId = e.target.getAttribute('href').slice(1);
      const activeBody = document.getElementById(`active-body-${tabId}`);
      const config = contracts.find(c => 
        c.tabName.toLowerCase().replace(/\s+/g, '-') === tabId
      );
      if (config && activeBody && activeBody.innerHTML.includes('loading')) {
        loadStakers(config, tabId);
      }
    });
  });
}

window.addEventListener('load', () => {
  setupTabs();
});
