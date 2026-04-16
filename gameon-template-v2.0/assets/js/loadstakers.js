// assets/js/loadstakers.js

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
  }
];

// copy wallet
function copyAddr(el, addr) {
  navigator.clipboard.writeText(addr)
    .then(() => {
      const original = el.textContent;
      el.textContent = 'Copied!';
      el.style.color = '#62ffcf';

      setTimeout(() => {
        el.textContent = original;
        el.style.color = '';
      }, 1500);
    })
    .catch(() => {
      alert('Failed to copy address');
    });
}

window.copyAddr = copyAddr;

const DELAY_MS = 120;
const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 900;
const HIDE_STAKERS_BELOW_1 = true;

let tronWeb = null;
let readTronWeb = null;

let globalTotal = 0;
let globalProcessed = 0;
let globalProgressBar = null;
let globalCurrentEl = null;
let globalProgressWrap = null;

let currentBatchId = 0;
const tabLoadState = new Map();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function retry(fn, retries = RETRY_COUNT, delay = RETRY_DELAY_MS) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) {
        await sleep(delay);
      }
    }
  }
  throw lastErr;
}

async function initReadTronWeb(chainstackUrl) {
  if (readTronWeb) return readTronWeb;

  const TronWebCtor =
    typeof window.TronWeb === 'function'
      ? window.TronWeb
      : window.tronWeb?.constructor;

  if (!TronWebCtor) {
    throw new Error('TronWeb constructor not found');
  }

  readTronWeb = new TronWebCtor({ fullHost: chainstackUrl });
  readTronWeb.setAddress('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb');

  return readTronWeb;
}

function resetGlobalProgress() {
  globalTotal = 0;
  globalProcessed = 0;

  if (globalProgressBar) globalProgressBar.style.width = '0%';
  if (globalCurrentEl) globalCurrentEl.textContent = '0';
  if (globalProgressWrap) globalProgressWrap.style.display = 'block';
}

function updateGlobalProgress() {
  if (!globalProgressBar || !globalCurrentEl || !globalProgressWrap) return;

  if (globalTotal <= 0) {
    globalProgressBar.style.width = '0%';
    globalCurrentEl.textContent = '0';
    return;
  }

  const safeProcessed = Math.min(globalProcessed, globalTotal);
  const percent = Math.floor((safeProcessed / globalTotal) * 100);

  globalProgressBar.style.width = `${percent}%`;
  globalCurrentEl.textContent = String(percent);

  if (safeProcessed >= globalTotal) {
    globalProgressBar.style.width = '100%';
    globalCurrentEl.textContent = '100';

    setTimeout(() => {
      if (globalProcessed >= globalTotal) {
        globalProgressWrap.style.display = 'none';
      }
    }, 300);
  }
}

function incrementProgress(batchId) {
  if (batchId !== currentBatchId) return;
  globalProcessed += 1;
  updateGlobalProgress();
}

function makeTabId(tabName) {
  return tabName.toLowerCase().replace(/\s+/g, '-');
}

function formatAmount(value, maxFractionDigits = 4) {
  return Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits
  });
}

function toBase58Address(addr) {
  try {
    if (typeof addr !== 'string') return String(addr);
    if (addr.startsWith('41') && addr.length === 42) {
      return readTronWeb.address.fromHex(addr);
    }
    return addr;
  } catch {
    return addr;
  }
}

function parseBool(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1';
  if (typeof value === 'number') return value !== 0;

  try {
    const s = value?.toString?.();
    return s === 'true' || s === '1';
  } catch {
    return false;
  }
}

function parseTimestamp(value) {
  try {
    const n = Number(value?.toString?.() ?? value ?? 0);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

function parseStakedAmount(value, decimals) {
  try {
    return readTronWeb
      .toBigNumber(value?.toString?.() ?? value ?? 0)
      .shiftedBy(-decimals)
      .toNumber();
  } catch {
    return 0;
  }
}

function buildRows(data, config) {
  if (!data.length) {
    return '<tr><td colspan="4" class="text-center py-4">None</td></tr>';
  }

  return data.map((s) => `
    <tr>
      <td data-label="Wallet">
        <span class="addr" onclick="copyAddr(this, '${s.addr}')">${s.addr}</span>
      </td>
      <td data-label="Staked ${config.name}">
        <strong>${formatAmount(s.stakedNum, 4)}</strong> ${config.name}
      </td>
      <td data-label="Last Claim">${s.lastClaimText}</td>
      <td data-label="Status" class="${s.statusClass}">${s.status}</td>
    </tr>
  `).join('');
}

function sumAmounts(arr) {
  return arr.reduce((total, item) => total + item.stakedNum, 0);
}

async function getContract(readClient, address) {
  return retry(() => readClient.contract().at(address));
}

async function getStakerList(contract) {
  const list = await retry(() => contract.getStakersList().call());
  return Array.isArray(list) ? list : [];
}

async function getUserInfo(contract, addr) {
  return retry(() => contract.users(addr).call());
}

async function loadStakers(config, tabId, batchId = currentBatchId) {
  const activeBody = document.getElementById(`active-body-${tabId}`);
  const soonBody = document.getElementById(`soon-body-${tabId}`);
  const expiredBody = document.getElementById(`expired-body-${tabId}`);
  const totalStakersEl = document.getElementById(`total-stakers-${tabId}`);
  const activeTotalEl = document.getElementById(`active-total-${tabId}`);
  const soonTotalEl = document.getElementById(`soon-total-${tabId}`);
  const expiredTotalEl = document.getElementById(`expired-total-${tabId}`);

  if (!activeBody || !soonBody || !expiredBody) return;

  const loadKey = `${tabId}:${batchId}`;
  tabLoadState.set(tabId, loadKey);

  activeBody.innerHTML = '<tr><td colspan="4" class="text-center py-5">Loading...</td></tr>';
  soonBody.innerHTML = '';
  expiredBody.innerHTML = '';
  totalStakersEl.textContent = '(loading...)';
  activeTotalEl.textContent = `Total Active: — ${config.name}`;
  soonTotalEl.textContent = `Total Expire Soon: — ${config.name}`;
  expiredTotalEl.textContent = `Total Expired: — ${config.name}`;

  try {
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error('Please unlock TronLink');
    }

    tronWeb = window.tronWeb;

    const readClient = await initReadTronWeb(config.chainstackUrl);
    const contract = await getContract(readClient, config.address);
    const list = await getStakerList(contract);

    if (tabLoadState.get(tabId) !== loadKey) return;

    totalStakersEl.textContent = `(${list.length} wallets)`;

    const activeData = [];
    const soonData = [];
    const expiredData = [];
    const failedWallets = [];

    for (let i = 0; i < list.length; i++) {
      let addr = toBase58Address(list[i]);

      try {
        const info = await getUserInfo(contract, addr);
        const stakedNum = parseStakedAmount(info.stakedAmount, config.decimals);

        if (HIDE_STAKERS_BELOW_1 && stakedNum < 1) {
          continue;
        }

        const lastClaim = parseTimestamp(info.lastClaimTimestamp);
        const isActive = parseBool(info.isActive);
        const now = Math.floor(Date.now() / 1000);
        const daysSinceClaim = lastClaim === 0
          ? Infinity
          : Math.floor((now - lastClaim) / 86400);

        let status = '';
        let statusClass = '';
        let category = '';

        if (lastClaim === 0) {
          status = 'Never claimed';
          statusClass = 'text-muted';
          category = 'active';
        } else if (!isActive || daysSinceClaim >= config.expireDays) {
          status = 'Expired';
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

        const lastClaimText =
          lastClaim === 0
            ? 'Never'
            : daysSinceClaim === 0
              ? 'Today'
              : daysSinceClaim === 1
                ? '1 day ago'
                : `${daysSinceClaim} days ago`;

        const row = {
          addr,
          stakedNum,
          lastClaimText,
          status,
          statusClass
        };

        if (category === 'active') activeData.push(row);
        else if (category === 'soon') soonData.push(row);
        else expiredData.push(row);

      } catch (e) {
        console.warn('Failed for wallet:', addr, e);
        failedWallets.push(addr);
      } finally {
        incrementProgress(batchId);
      }

      if (i < list.length - 1) {
        await sleep(DELAY_MS);
      }
    }

    if (tabLoadState.get(tabId) !== loadKey) return;

    activeData.sort((a, b) => b.stakedNum - a.stakedNum);
    soonData.sort((a, b) => b.stakedNum - a.stakedNum);
    expiredData.sort((a, b) => b.stakedNum - a.stakedNum);

    activeBody.innerHTML = buildRows(activeData, config);
    soonBody.innerHTML = buildRows(soonData, config);
    expiredBody.innerHTML = buildRows(expiredData, config);

    activeTotalEl.textContent = `Total Active: ${formatAmount(sumAmounts(activeData), 2)} ${config.name}`;
    soonTotalEl.textContent = `Total Expire Soon: ${formatAmount(sumAmounts(soonData), 2)} ${config.name}`;
    expiredTotalEl.textContent = `Total Expired: ${formatAmount(sumAmounts(expiredData), 2)} ${config.name}`;

    if (failedWallets.length > 0) {
      console.warn(`[${config.tabName}] failed wallets:`, failedWallets);
    }

  } catch (err) {
    console.error(`Error loading ${config.tabName}:`, err);
    activeBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-5">Error: ${err.message}</td></tr>`;
    soonBody.innerHTML = '';
    expiredBody.innerHTML = '';
  }
}

async function calculateGlobalTotal(batchId) {
  resetGlobalProgress();

  if (!window.tronWeb || !window.tronWeb.ready) {
    return;
  }

  const readClient = await initReadTronWeb(contracts[0].chainstackUrl);

  for (const config of contracts) {
    if (batchId !== currentBatchId) return;

    try {
      const contract = await getContract(readClient, config.address);
      const list = await getStakerList(contract);
      globalTotal += list.length;
      updateGlobalProgress();
      await sleep(120);
    } catch (err) {
      console.warn(`Failed to get staker count for ${config.tabName}:`, err);
    }
  }
}

async function refreshAllTabs() {
  currentBatchId += 1;
  const batchId = currentBatchId;

  await calculateGlobalTotal(batchId);

  for (const config of contracts) {
    const tabId = makeTabId(config.tabName);
    loadStakers(config, tabId, batchId);
  }
}

async function setupTabs() {
  const tabsContainer = document.getElementById('tabs-container');
  const tabContent = document.getElementById('tab-content');

  if (!tabsContainer || !tabContent) return;

  tabsContainer.innerHTML = '';
  tabContent.innerHTML = '';
  tabLoadState.clear();

  contracts.forEach((config, index) => {
    const tabId = makeTabId(config.tabName);

    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `
      <a class="nav-link ${index === 0 ? 'active' : ''}" id="${tabId}-tab" data-bs-toggle="tab" href="#${tabId}" role="tab">
        ${config.tabName}
      </a>
    `;
    tabsContainer.appendChild(li);

    const pane = document.createElement('div');
    pane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
    pane.id = tabId;
    pane.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="m-0">Stakers <span id="total-stakers-${tabId}" class="text-muted">(loading...)</span></h3>
        <button id="refresh-${tabId}" class="btn primary btn-sm">Refresh List</button>
      </div>

      <div id="active-section-${tabId}" class="luxe-card">
        <h4 class="section-title">Active Stakers</h4>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Staked ${config.name}</th>
                <th>Last Claim</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="active-body-${tabId}"></tbody>
          </table>
        </div>
        <div class="section-total" id="active-total-${tabId}">Total Active: — ${config.name}</div>
      </div>

      <div id="soon-section-${tabId}" class="luxe-card">
        <h4 class="section-title">Expire Soon</h4>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Staked ${config.name}</th>
                <th>Last Claim</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="soon-body-${tabId}"></tbody>
          </table>
        </div>
        <div class="section-total" id="soon-total-${tabId}">Total Expire Soon: — ${config.name}</div>
      </div>

      <div id="expired-section-${tabId}" class="luxe-card">
        <h4 class="section-title">Expired</h4>
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Wallet</th>
                <th>Staked ${config.name}</th>
                <th>Last Claim</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="expired-body-${tabId}"></tbody>
          </table>
        </div>
        <div class="section-total" id="expired-total-${tabId}">Total Expired: — ${config.name}</div>
      </div>
    `;

    tabContent.appendChild(pane);

    document.getElementById(`refresh-${tabId}`).addEventListener('click', async () => {
      currentBatchId += 1;
      const batchId = currentBatchId;
      await calculateGlobalTotal(batchId);
      await loadStakers(config, tabId, batchId);
    });
  });

  globalProgressWrap = document.getElementById('global-progress');
  globalProgressBar = document.getElementById('global-progress-bar');
  globalCurrentEl = document.getElementById('global-current');

  if (globalProgressWrap) {
    globalProgressWrap.style.display = 'block';
  }

  await refreshAllTabs();

  const tabLinks = document.querySelectorAll('#tabs-container .nav-link');
  tabLinks.forEach((link) => {
    link.addEventListener('shown.bs.tab', async (e) => {
      const tabId = e.target.getAttribute('href').slice(1);
      const config = contracts.find(c => makeTabId(c.tabName) === tabId);
      const activeBody = document.getElementById(`active-body-${tabId}`);

      if (!config || !activeBody) return;

      if (
        activeBody.innerHTML.trim() === '' ||
        activeBody.innerHTML.includes('Loading...')
      ) {
        await loadStakers(config, tabId, currentBatchId);
      }
    });
  });
}

window.addEventListener('load', async () => {
  if (window.tronWeb && window.tronWeb.ready) {
    tronWeb = window.tronWeb;
    const connectBtn = document.getElementById('connect-button');
    if (connectBtn) {
      connectBtn.innerHTML = 'Connected';
    }
  }

  await setupTabs();
});
