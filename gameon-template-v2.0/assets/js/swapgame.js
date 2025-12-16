// swapgame.js - Full working version for Game Token swaps (CFT → Game & TRX → Game)

let swapContracts = {};
const swapAbi = [
  {
    "inputs": [{"internalType":"uint256","name":"amount","type":"uint256"}],
    "name":"swap",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  },
  {
    "inputs": [],
    "name":"swap",
    "outputs":[],
    "stateMutability":"payable",
    "type":"function"
  }
];

const swapDetails = {
  cft: {
    contractAddress: 'TDqRsqMaxsjMAwx4VLR6xvYDM8RRfiL83r',     // ← Replace with your deployed CFT→Game contract
    cftTokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',            // ← Replace with actual CFT token address
    tokenName: 'CFT',
    inputId: 'swap-cft-amount',
    buttonId: 'swap-cft-button'
  },
  trx: {
    contractAddress: 'TDyLmpoX2aBrpdfmQr7mXvXCY2AX7D8Mje',     // Your deployed TRX→Game contract
    tokenName: 'TRX',
    inputId: 'swap-trx-amount',
    buttonId: 'swap-trx-button'
  }
};

async function initializeSwap() {
  if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
    console.log('TronWeb not ready yet');
    return;
  }

  for (const key of ['cft', 'trx']) {
    const details = swapDetails[key];
    try {
      swapContracts[key] = await window.tronWeb.contract(swapAbi, details.contractAddress);
      const button = document.getElementById(details.buttonId);
      if (button) {
        button.addEventListener('click', () => performSwap(key));
      }
    } catch (e) {
      console.error(`Failed to initialize ${key} swap contract:`, e);
    }
  }
}

async function performSwap(type) {
  console.log(`Starting swap for type: ${type}`);

  const details = swapDetails[type];
  const amountInput = document.getElementById(details.inputId);
  if (!amountInput) {
    showToast({ title: 'Error', body: 'Input field missing.', variant: 'danger' });
    return;
  }

  const rawInput = amountInput.value.trim();
  if (!rawInput) {
    showToast({ title: 'Error', body: 'Please enter an amount.', variant: 'danger' });
    return;
  }

  const cleanedInput = rawInput.replace(',', '.');
  const amount = parseFloat(cleanedInput);

  if (isNaN(amount) || amount <= 0) {
    showToast({ title: 'Invalid Amount', body: 'Enter a valid positive number (e.g. 5 or 5.5).', variant: 'danger' });
    return;
  }

  const button = document.getElementById(details.buttonId);
  withLoading(button, 'Swapping...', async () => {
    try {
      let tx;

      if (type === 'cft') {
        // CFT → Game (requires approval)
        const amountSun = Math.round(amount * 1_000_000); // 6 decimals, as number

        const cftTokenContract = await window.tronWeb.contract().at(details.cftTokenAddress);

        // Step 1: Approve
        showToast({ title: 'Step 1/2', body: 'Approve CFT spending... Confirm in wallet.', variant: 'info' });
        await cftTokenContract.approve(details.contractAddress, amountSun).send({
          feeLimit: 100_000_000
        });
        await delay(6000); // Wait for confirmation

        // Step 2: Swap
        showToast({ title: 'Step 2/2', body: 'Swapping CFT → Game... Confirm.', variant: 'info' });
        tx = await swapContracts.cft.swap(amountSun).send({
          feeLimit: 100_000_000
        });

      } else {
        // TRX → Game
        const amountSun = Math.round(amount * 1_000_000); // Number

        tx = await swapContracts.trx.swap().send({
          callValue: amountSun, // Pass as number
          feeLimit: 80_000_000
        });
      }

      showToast({
        title: 'Swap Complete!',
        body: `You received ${amount.toFixed(6)} Game tokens!<br>
               <a href="https://tronscan.org/#/transaction/${tx}" target="_blank" rel="noopener">View on Tronscan</a>`,
        variant: 'success'
      });

      amountInput.value = '';

    } catch (err) {
      console.error('Swap error:', err);
      let msg = 'Transaction failed or rejected.';
      if (err.message) {
        if (err.message.includes('balance') || err.message.includes('insufficient')) msg = 'Insufficient balance.';
        else if (err.message.includes('energy')) msg = 'Not enough energy. Rent energy and try again.';
        else if (err.message.includes('REVERT')) msg = 'Contract reverted. Check balance/allowance.';
        else msg = err.message;
      }
      showToast({ title: 'Swap Failed', body: msg, variant: 'danger' });
    }
  })();
}

// Helper functions
function showToast({ title, body, variant = 'dark' }) {
  const el = document.getElementById('app-toast');
  if (!el) return;
  el.className = `toast text-bg-${variant}`;
  el.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${title}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">${body}</div>`;
  new bootstrap.Toast(el, { delay: 8000 }).show();
}

function withLoading(btn, label, fn) {
  return async () => {
    btn.disabled = true;
    const oldHTML = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${label}`;
    try {
      await fn();
    } finally {
      btn.disabled = false;
      btn.innerHTML = oldHTML;
    }
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize
document.addEventListener('DOMContentLoaded', initializeSwap);
