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
  const amount = amountInput.value.trim();

  // Early validation: prevent empty or invalid input
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    showToast({ title: 'Invalid Amount', body: 'Please enter a valid positive number.', variant: 'danger' });
    return;
  }

  // Convert to number and check again (extra safety)
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    showToast({ title: 'Invalid Amount', body: 'Amount must be a positive number.', variant: 'danger' });
    return;
  }

  const button = document.getElementById(details.buttonId);
  withLoading(button, 'Swapping...', async () => {
    try {
      let tx;
      if (type === 'cft') {
        const amountWei = tronWeb.toSun(amount); // Safe now
        const tokenContract = await tronWeb.contract().at('CFT_TOKEN_ADDRESS_HERE');
        await tokenContract.approve(details.contractAddress, amountWei).send();
        await delay(3000);
        tx = await swapContracts.cft.swap(amountWei).send();
      } else { // trx
        const trxAmountSun = tronWeb.toSun(amount); // Safe now
        tx = await swapContracts.trx.swap().send({
          callValue: trxAmountSun
        });
      }

      showToast({
        title: 'Swap Successful!',
        body: `<a href="https://tronscan.org/#/transaction/${tx}" target="_blank">View on Tronscan</a>`,
        variant: 'success'
      });
      amountInput.value = '';
    } catch (err) {
      showToast({ title: 'Swap Failed', body: err.message || 'Transaction rejected', variant: 'danger' });
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
