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

    // Safe attach refresh button (prevents null error)
    const refreshBtn = document.getElementById(`refresh-${tabId}`);
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => loadStakers(config, tabId));
    }
  });

  // Global progress setup
  const globalProgress = document.getElementById('global-progress');
  globalProgressBar = document.getElementById('global-progress-bar');
  globalCurrentEl = document.getElementById('global-current');
  globalProgress.style.display = 'block';

  // First, fetch all staker lists to calculate total (works for BOTH contract types)
  await Promise.all(contracts.map(async (config) => {
    if (!window.tronWeb || !window.tronWeb.ready) return;
    await initReadTronWeb(config.chainstackUrl);
    const contract = await readTronWeb.contract().at(config.address);

    let count = 0;
    if (config.isRewardsContract) {
      try {
        const result = await contract.getAllStakersAndAmounts().call();
        const addresses = result[0] || result.addresses || [];
        count = addresses.length;
      } catch (e) { console.warn('Count failed for', config.tabName); }
    } else {
      try {
        const list = await contract.getStakersList().call();
        count = list.length;
      } catch (e) { console.warn('Count failed for', config.tabName); }
    }
    globalTotal += count;
  }));

  // Now load all tabs
  contracts.forEach((config) => {
    const tabId = config.tabName.toLowerCase().replace(/\s+/g, '-');
    loadStakers(config, tabId);
  });

  // Tab change handler
  const tabLinks = document.querySelectorAll('#tabs-container .nav-link');
  tabLinks.forEach(link => {
    link.addEventListener('shown.bs.tab', (e) => {
      const tabId = e.target.getAttribute('href').slice(1);
      const config = contracts.find(c => c.tabName.toLowerCase().replace(/\s+/g, '-') === tabId);
      if (!config) return;
      const activeBody = document.getElementById(`active-body-${tabId}`);
      if (activeBody && (activeBody.innerHTML.includes('Loading...') || activeBody.innerHTML.trim() === '')) {
        loadStakers(config, tabId);
      }
    });
  });
}
