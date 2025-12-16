let swapContracts = {};
const swapAbi = [
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"swap","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"swap","outputs":[],"stateMutability":"payable","type":"function"}
];

const swapDetails = {
  cft: {
    contractAddress: 'YOUR_CFT_TO_GAME_SWAP_ADDRESS_HERE',
    tokenName: 'CFT',
    inputId: 'swap-cft-amount',
    buttonId: 'swap-cft-button'
  },
  trx: {
    contractAddress: 'TDyLmpoX2aBrpdfmQr7mXvXCY2AX7D8Mje',
    tokenName: 'TRX',
    inputId: 'swap-trx-amount',
    buttonId: 'swap-trx-button'
  }
};

async function initializeSwap() {
  if (!tronWeb || !tronWeb.defaultAddress.base58) return;

  for (const key of ['cft', 'trx']) {
    const details = swapDetails[key];
    try {
      swapContracts[key] = await tronWeb.contract(swapAbi, details.contractAddress);
      document.getElementById(details.buttonId).addEventListener('click', () => performSwap(key));
    } catch (e) {
      console.error(`Failed to load ${key} swap contract:`, e);
    }
  }
}

async function performSwap(type) {
  const details = swapDetails[type];
  const amountInput = document.getElementById(details.inputId);
  let amountStr = amountInput.value.trim();

  if (!amountStr || isNaN(amountStr) || Number(amountStr) <= 0) {
    showToast({ title: 'Invalid Amount', body: 'Please enter a valid positive number (e.g., 5 or 5.5).', variant: 'danger' });
    return;
  }

  // Clean input: replace comma with dot for locales
  amountStr = amountStr.replace(',', '.');

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    showToast({ title: 'Invalid Amount', body: 'Amount must be a positive number.', variant: 'danger' });
    return;
  }

  const button = document.getElementById(details.buttonId);
  withLoading(button, 'Swapping...', async () => {
    try {
      let tx;
      if (type === 'cft') {
        // For CFT → Game: Use toSun (CFT is TRC20 with 6 decimals)
        const amountSun = tronWeb.toSun(amount);
        const cftTokenContract = await tronWeb.contract().at('YOUR_CFT_TOKEN_ADDRESS_HERE'); // Replace!
        // Approve
        const approveTx = await cftTokenContract.approve(details.contractAddress, amountSun).send();
        await delay(4000); // Wait for approval confirmation
        // Swap
        tx = await swapContracts.cft.swap(amountSun).send();
      } else { // TRX → Game
        // Manual conversion: 1 TRX = 1,000,000 SUN → multiply by 1e6
        const amountSun = Math.round(amount * 1000000); // Round to avoid float issues
        if (amountSun <= 0) throw new Error('Amount too small');

        const amountSunStr = amountSun.toString(); // Safe string

        tx = await swapContracts.trx.swap().send({
          callValue: amountSunStr // Pass as string to avoid BigNumber parsing issues
        });
      }

      showToast({
        title: 'Swap Successful!',
        body: `You received ${amount} Game!<br><a href="https://tronscan.org/#/transaction/${tx}" target="_blank" rel="noopener">View on Tronscan</a>`,
        variant: 'success'
      });
      amountInput.value = '';
    } catch (err) {
      console.error('Swap error:', err);
      showToast({ 
        title: 'Swap Failed', 
        body: err.message || 'Transaction rejected or failed. Check energy/balance.', 
        variant: 'danger' 
      });
    }
  })();
}

// Reuse existing helpers
function showToast({ title, body, variant = 'dark' }) {
  const el = document.getElementById('app-toast');
  if (!el) return;
  el.className = `toast text-bg-${variant}`;
  el.innerHTML = `<div class="toast-header"><strong class="me-auto">${title}</strong><button type="button" class="btn-close" data-bs-dismiss="toast"></button></div><div class="toast-body">${body}</div>`;
  new bootstrap.Toast(el, { delay: 6000 }).show();
}

function withLoading(btn, label, fn) {
  return async () => {
    btn.disabled = true;
    const old = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${label}`;
    try { await fn(); }
    finally { btn.disabled = false; btn.innerHTML = old; }
  };
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeSwap);
