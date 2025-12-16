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
  const rawInput = amountInput.value.trim();

  // === Strict validation first ===
  if (!rawInput) {
    showToast({ title: 'Error', body: 'Please enter an amount.', variant: 'danger' });
    return;
  }

  // Handle comma as decimal separator (common in some regions)
  const cleanedInput = rawInput.replace(',', '.');

  const amount = parseFloat(cleanedInput);

  if (isNaN(amount) || amount <= 0) {
    showToast({ title: 'Invalid Amount', body: 'Enter a valid positive number (e.g., 5 or 5.5).', variant: 'danger' });
    return;
  }

  const button = document.getElementById(details.buttonId);
  withLoading(button, 'Swapping...', async () => {
    try {
      let tx;

      if (type === 'cft') {
        // CFT → Game
        const amountSun = Math.round(amount * 1000000); // 6 decimals
        if (amountSun <= 0) throw new Error('Amount too small');

        const amountStr = amountSun.toString();

        const cftTokenContract = await tronWeb.contract().at('YOUR_CFT_TOKEN_ADDRESS_HERE'); // ← Replace!

        // Approve
        await cftTokenContract.approve(details.contractAddress, amountStr).send();
        await delay(5000); // Wait longer for confirmation

        // Swap
        tx = await swapContracts.cft.swap(amountStr).send();

      } else { // TRX → Game
        // Manual SUN calculation — safest way
        const amountSun = Math.round(amount * 1000000); // 1 TRX = 1e6 SUN
        if (amountSun <= 0) throw new Error('Amount too small');

        const amountSunStr = amountSun.toString(); // Guaranteed valid string

        console.log('Sending callValue:', amountSunStr); // Debug line — check browser console

        tx = await swapContracts.trx.swap().send({
          callValue: amountSunStr
        });
      }

      showToast({
        title: 'Swap Complete!',
        body: `You received ${amount.toFixed(6)} Game tokens.<br>
               <a href="https://tronscan.org/#/transaction/${tx}" target="_blank" rel="noopener">View Transaction</a>`,
        variant: 'success'
      });

      amountInput.value = ''; // Clear input

    } catch (err) {
      console.error('Swap error details:', err);
      let msg = 'Transaction failed.';
      if (err.message) {
        if (err.message.includes('balance')) msg = 'Insufficient TRX balance.';
        else if (err.message.includes('energy')) msg = 'Not enough energy. Rent energy or try later.';
        else if (err.message.includes('REVERT')) msg = 'Contract reverted. Check balance or approval.';
        else msg = err.message;
      }
      showToast({ title: 'Swap Failed', body: msg, variant: 'danger' });
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
