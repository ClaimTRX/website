/* =====================================================
   CFT TOKEN STATUS PAGE

   Edit only the numbers below when you post a new update.
   The page compares latestUpdate against previousUpdate.
===================================================== */

const previousUpdate = {
  date: 'June 18',

  totalSupply: 997238,
  activeCft: 416933,
  teamHoldings: 414617,
  inactiveCft: 141500,
  sunswapLiquidity: 399,
  tradingPageSupply: 23789
};

const latestUpdate = {
  date: 'Latest Update',

  totalSupply: 996938,
  activeCft: 394129,
  teamHoldings: 416017,
  inactiveCft: 158496,
  sunswapLiquidity: 298,
  tradingPageSupply: 27998
};

/* =====================================================
   Do not need to edit below this line
===================================================== */

const metrics = [
  {
    key: 'totalSupply',
    label: '📦 Total CFT Supply',
    group: 'supply',
    suffix: ' CFT'
  },
  {
    key: 'activeCft',
    label: '🟢 Total Active CFT',
    group: 'supply',
    suffix: ' CFT'
  },
  {
    key: 'teamHoldings',
    label: '👥 Team Holdings',
    group: 'supply',
    suffix: ' CFT'
  },
  {
    key: 'inactiveCft',
    label: '💤 Inactive CFT',
    group: 'supply',
    suffix: ' CFT'
  },
  {
    key: 'sunswapLiquidity',
    label: '🔷 SunSwap Liquidity',
    group: 'market',
    suffix: ' CFT'
  },
  {
    key: 'tradingPageSupply',
    label: '🔹 Trading Page Supply',
    group: 'market',
    suffix: ' CFT'
  }
];

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2
  });
}

function calculateChange(previous, current) {
  previous = Number(previous || 0);
  current = Number(current || 0);

  const difference = current - previous;

  if (previous === 0 && current === 0) {
    return {
      difference,
      percent: 0,
      direction: 'flat'
    };
  }

  if (previous === 0 && current > 0) {
    return {
      difference,
      percent: 100,
      direction: 'up'
    };
  }

  const percent = (difference / previous) * 100;

  return {
    difference,
    percent,
    direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'flat'
  };
}

function changeBadge(previous, current) {
  const change = calculateChange(previous, current);

  let icon = 'fa-minus';
  let label = 'No change';

  if (change.direction === 'up') {
    icon = 'fa-arrow-up';
    label = `+${formatNumber(change.difference)} / +${change.percent.toFixed(2)}%`;
  }

  if (change.direction === 'down') {
    icon = 'fa-arrow-down';
    label = `${formatNumber(change.difference)} / ${change.percent.toFixed(2)}%`;
  }

  return `
    <span class="change ${change.direction}">
      <i class="fa-solid ${icon}"></i>
      ${label}
    </span>
  `;
}

function renderRow(metric) {
  const previous = previousUpdate[metric.key];
  const current = latestUpdate[metric.key];

  return `
    <div class="status-row">
      <div class="status-label">${metric.label}</div>
      <div class="status-value">
        <strong>${formatNumber(current)}${metric.suffix}</strong>
        ${changeBadge(previous, current)}
      </div>
    </div>
  `;
}

function calculateMarketAvailable(update) {
  return Number(update.sunswapLiquidity || 0) + Number(update.tradingPageSupply || 0);
}

function calculateMarketPercent(update) {
  const totalSupply = Number(update.totalSupply || 0);
  const marketAvailable = calculateMarketAvailable(update);

  if (totalSupply <= 0) return 0;

  return (marketAvailable / totalSupply) * 100;
}

function renderStatusPage() {
  const updateDate = document.getElementById('update-date');

  if (updateDate) {
    updateDate.textContent = latestUpdate.date;
  }

  const marketAvailable = calculateMarketAvailable(latestUpdate);
  const marketPercent = calculateMarketPercent(latestUpdate);

  document.getElementById('summary-total-supply').textContent =
    `${formatNumber(latestUpdate.totalSupply)} CFT`;

  document.getElementById('summary-active-cft').textContent =
    `${formatNumber(latestUpdate.activeCft)} CFT`;

  document.getElementById('summary-market-available').textContent =
    `${formatNumber(marketAvailable)} CFT`;

  document.getElementById('summary-market-percent').textContent =
    `${marketPercent.toFixed(2)}%`;

  const supplyStatus = document.getElementById('supply-status');
  const marketStatus = document.getElementById('market-status');

  if (supplyStatus) {
    supplyStatus.innerHTML = metrics
      .filter(metric => metric.group === 'supply')
      .map(renderRow)
      .join('');
  }

  if (marketStatus) {
    marketStatus.innerHTML = metrics
      .filter(metric => metric.group === 'market')
      .map(renderRow)
      .join('');
  }

  const line1 = document.getElementById('status-summary-line-1');
  const line2 = document.getElementById('status-summary-line-2');

  if (line1) {
    line1.textContent =
      `Currently, ${formatNumber(marketAvailable)} CFT is available through SunSwap liquidity and the trading page.`;
  }

  if (line2) {
    line2.textContent =
      `This equals ${marketPercent.toFixed(2)}% of the total CFT supply.`;
  }
}

document.addEventListener('DOMContentLoaded', renderStatusPage);
