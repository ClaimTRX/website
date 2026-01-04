const contracts = [
  {
    name: 'CFT',
    address: 'TCf1vY3EMuczBSmo9Cfrffu6TsGrUvrC52',
    decimals: 6,
    soonDays: 10,
    expireDays: 14,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  },
  {
    name: 'CFT',
    address: 'TAbu6yKiVRbs3c7tcwFnreupEfVW9t8d9K',
    decimals: 6,
    soonDays: 10,
    expireDays: 14,
    chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  },
  // Add more contracts here, e.g.:
  // {
  //   name: 'DFT',
  //   address: 'TAnotherExampleAddressHere',
  //   decimals: 18,
  //   soonDays: 15,
  //   expireDays: 21,
  //   chainstackUrl: 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299'
  // }
];


const DELAY_MS = 380;
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
  readTronWeb.setAddress('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'); // Dummy address for view calls
  const originalRequest = readTronWeb.request;
  readTronWeb.request = async function(endpoint, params = {}, method = 'POST') {
    return throttle(() => originalRequest.call(this, endpoint, params, method));
  };
}

async function loadStakers(config, tabId) {
  const activeBody = document.getElementById(`active-body-${tabId}`);
  const soonBody = document.getElementById(`soon-body-${tabId}`);
  const expiredBody = document.getElementById(`expired-body-${tabId}`);
  const progress = document.getElementById(`progress-${tabId}`);
  const progressBar = progress.querySelector('.progress-bar');
  const currentEl = document.getElementById(`current-${tabId}`);
  const totalEl = document.getElementById(`total-${tabId}`);
  const totalStakersEl = document.getElementById(`total-stakers-${tabId}`);
  const activeTotalEl = document.getElementById(`active-total-${tabId}`);
  const soonTotalEl = document.getElementById(`soon-total-${tabId}`);
  const expiredTotalEl = document.getElementById(`expired-total-${tabId}`);

  activeBody.innerHTML = '<tr><td colspan="4" class="text-center py-5">Connecting...</td></tr>';
  soonBody.innerHTML = '';
  expiredBody.innerHTML = '';
  progress.style.display = 'block';
  totalStakersEl.textContent = '(loading...)';

  try {
    if (!window.tronWeb || !window.tronWeb.ready) {
      throw new Error('Please unlock TronLink');
    }
    tronWeb = window.tronWeb;
    await initReadTronWeb(config.chainstackUrl);
    const contract = await readTronWeb.contract().at(config.address);
    const list = await contract.getStakersList().call();
    totalStakersEl.textContent = `(${list.length} wallets)`;
    totalEl.textContent = list.length;
    const activeData = [], soonData = [], expiredData = [];
    for (let i = 0; i < list.length; i++) {
      let addr = list[i];
      if (addr.startsWith('41') && addr.length === 42) {
        addr = readTronWeb.address.fromHex(addr);
      }
      currentEl.textContent = i + 1;
      progressBar.style.width = `${((i + 1) / list.length) * 100}%`;
      try {
        const info = await contract.users(addr).call();
        const stakedNum = readTronWeb.toBigNumber(info.stakedAmount).shiftedBy(-config.decimals).toNumber();
        const lastClaim = Number(info.lastClaimTimestamp);
        const isActive = info.isActive;
        const now = Math.floor(Date.now() / 1000);
        let daysSinceClaim = lastClaim === 0 ? Infinity : Math.floor((now - lastClaim) / 86400);
        let status, statusClass, category;
        if (lastClaim === 0) {
          status = 'Never claimed'; statusClass = 'text-muted'; category = 'active';
        } else if (!isActive || daysSinceClaim > config.expireDays) {
          status = 'EXPIRED'; statusClass = 'expired'; category = 'expired';
        } else if (daysSinceClaim >= config.soonDays) {
          status = 'Expire Soon'; statusClass = 'soon'; category = 'soon';
        } else {
          status = 'Active'; statusClass = 'text-success'; category = 'active';
        }
        const lastClaimText = lastClaim === 0 ? 'Never' :
          daysSinceClaim === 0 ? 'Today' :
          daysSinceClaim === 1 ? '1 day ago' : `${daysSinceClaim} days ago`;
        const data = { addr, stakedNum, lastClaimText, status, statusClass };
        if (category === 'active') activeData.push(data);
        else if (category === 'soon') soonData.push(data);
        else expiredData.push(data);
      } catch (e) { console.warn('Failed for', addr, e.message); }
      if (i < list.length - 1) await sleep(DELAY_MS);
    }
    activeData.sort((a, b) => b.stakedNum - a.stakedNum);
    soonData.sort((a, b) => b.stakedNum - a.stakedNum);
    expiredData.sort((a, b) => b.stakedNum - a.stakedNum);
    const buildRows = (data) => {
      let rows = '';
      data.forEach(s => {
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
    activeBody.innerHTML = buildRows(activeData);
    soonBody.innerHTML = buildRows(soonData);
    expiredBody.innerHTML = buildRows(expiredData);
    const sum = arr => arr.reduce((t, s) => t + s.stakedNum, 0);
    activeTotalEl.textContent = `Total Active: ${sum(activeData).toLocaleString(undefined, {maximumFractionDigits: 2})} ${config.name}`;
    soonTotalEl.textContent = `Total Expire Soon: ${sum(soonData).toLocaleString(undefined, {maximumFractionDigits: 2})} ${config.name}`;
    expiredTotalEl.textContent = `Total Expired: ${sum(expiredData).toLocaleString(undefined, {maximumFractionDigits: 2})} ${config.name}`;
    progress.style.display = 'none';
  } catch (err) {
    activeBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger py-5">Error: ${err.message}</td></tr>`;
    progress.style.display = 'none';
  }
}

function copyAddr(el, addr) {
  navigator.clipboard.writeText(addr);
  const orig = el.textContent;
  el.textContent = 'Copied!';
  el.style.color = '#62ffcf';
  setTimeout(() => { el.textContent = orig; el.style.color = ''; }, 1500);
}

function setupTabs() {
  const tabsContainer = document.getElementById('tabs-container');
  const tabContent = document.getElementById('tab-content');
  contracts.forEach((config, index) => {
    const tabId = config.name.toLowerCase();
    const li = document.createElement('li');
    li.className = 'nav-item';
    li.innerHTML = `<a class="nav-link ${index === 0 ? 'active' : ''}" id="${tabId}-tab" data-bs-toggle="tab" href="#${tabId}" role="tab">${config.name} Stakers</a>`;
    tabsContainer.appendChild(li);

    const pane = document.createElement('div');
    pane.className = `tab-pane fade ${index === 0 ? 'show active' : ''}`;
    pane.id = tabId;
    pane.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h3 class="m-0">Stakers <span id="total-stakers-${tabId}" class="text-muted">(loading...)</span></h3>
        <button id="refresh-${tabId}" class="btn primary btn-sm">Refresh List</button>
      </div>
      <div class="text-center my-4" id="progress-${tabId}" style="display:none">
        <div class="progress" style="height:8px;background:var(--bg-2)">
          <div class="progress-bar" style="width:0%"></div>
        </div>
        <div class="progress-text mt-2">Loading staker <span id="current-${tabId}">0</span> of <span id="total-${tabId}">0</span></div>
      </div>
      <div id="active-section-${tabId}" class="luxe-card">
        <h4 class="section-title">Active Stakers (${config.soonDays}-${config.expireDays} day claim timeout)</h4>
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

    document.getElementById(`refresh-${tabId}`).addEventListener('click', () => loadStakers(config, tabId));
  });

  // Load all tabs on initial load
  contracts.forEach((config, index) => {
    const tabId = config.name.toLowerCase();
    loadStakers(config, tabId);
  });

  // For tab shown, check if needs refresh, but since loaded at start, optional
  const tabLinks = document.querySelectorAll('#tabs-container .nav-link');
  tabLinks.forEach(link => {
    link.addEventListener('shown.bs.tab', (e) => {
      const tabId = e.target.getAttribute('href').slice(1);
      const config = contracts.find(c => c.name.toLowerCase() === tabId);
      const activeBody = document.getElementById(`active-body-${tabId}`);
      if (activeBody && (activeBody.innerHTML.includes('Connecting...') || activeBody.innerHTML === '')) {
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
