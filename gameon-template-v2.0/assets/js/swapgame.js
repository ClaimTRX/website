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
  console.log(`Starting swap for type: ${type}`);
  
  const details = swapDetails[type];
  const amountInput = document.getElementById(details.inputId);
  if (!amountInput) {
    console.error('Input element not found');
    showToast({ title: 'Error', body: 'Input field not found.', variant: 'danger' });
    return;
  }
  
  const rawInput = amountInput.value.trim();
  console.log('Raw input value:', rawInput);
  
  if (!rawInput) {
    console.log('Validation failed: Empty input');
    showToast({ title: 'Error', body: 'Please enter an amount.', variant: 'danger' });
    return;
  }
  
  const cleanedInput = rawInput.replace(',', '.');
  console.log('Cleaned input:', cleanedInput);
  
  const amount = parseFloat(cleanedInput);
  console.log('Parsed amount:', amount);
  
  if (isNaN(amount) || amount <= 0) {
    console.log('Validation failed: Invalid or non-positive amount');
    showToast({ title: 'Invalid Amount', body: 'Enter a valid positive number (e.g., 5 or 5.5).', variant: 'danger' });
    return;
  }
  
  const button = document.getElementById(details.buttonId);
  withLoading(button, 'Swapping...', async () => {
    try {
      let tx;
      if (type === 'cft') {
        console.log('Processing CFT swap');
        const amountSun = Math.round(amount * 1000000);
        console.log('Amount SUN (CFT):', amountSun);
        if (amountSun <= 0) throw new Error('Amount too small');
        
        const amountStr = amountSun.toString();
        console.log('Amount string (CFT):', amountStr);
        
        const cftTokenContract = await tronWeb.contract().at('YOUR_CFT_TOKEN_ADDRESS_HERE');
        console.log('CFT contract loaded');
        
        // Approve
        await cftTokenContract.approve(details.contractAddress, amountStr).send();
        console.log('Approve sent');
        await delay(5000);
        
        // Swap
        tx = await swapContracts.cft.swap(amountStr).send();
        console.log('CFT Swap TX:', tx);
      } else { // TRX → Game
        console.log('Processing TRX swap');
        const amountSun = Math.round(amount * 1000000);
        console.log('Amount SUN (TRX):', amountSun);
        if (amountSun <= 0) throw new Error('Amount too small');
        
        const amountSunStr = amountSun.toString();
        console.log('Amount string (TRX):', amountSunStr);
        
        if (!amountSunStr || amountSunStr === '') {
          throw new Error('Invalid amount string - empty');
        }
        
        tx = await swapContracts.trx.swap().send({
          callValue: amountSunStr
        });
        console.log('TRX Swap TX:', tx);
      }
      
      showToast({
        title: 'Swap Complete!',
        body: `You received ${amount.toFixed(6)} Game tokens.<br>
               <a href="https://tronscan.org/#/transaction/${tx}" target="_blank" rel="noopener">View Transaction</a>`,
        variant: 'success'
      });
      amountInput.value = '';
    } catch (err) {
      console.error('Swap error details:', err);
      let msg = 'Transaction failed.';
      if (err.message) {
        if (err.message.includes('balance')) msg = 'Insufficient TRX balance.';
        else if (err.message.includes('energy')) msg = 'Not enough energy. Rent energy or try later.';
        else if (err.message.includes('REVERT')) msg = 'Contract reverted. Check balance or approval.';
        else if (err.message.includes('BigNumberish')) msg = 'Invalid amount format - please check input.';
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
