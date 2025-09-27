/*
  CFT Ecosystem – Pool Staking (Refined + ROI + Pool Stats)
  - Premium UI hooks (toasts, loaders, skeletons)
  - Safer BigInt math & formatting helpers
  - Energy rental flow + Tronscan links
  - NEW: ROI, user total claimed, global pool stats (pool size, total claimed/unclaimed, daily %)
*/
let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// ===================== Config =====================
const TRONGRID_API_KEYS = [
  'd0abc8e9-5d3d-420d-88dd-60f4f1bd95ca', // First API key
  '664292b1-47ad-47b7-88c1-db67bee6e732'  // Second API key
];
const TRONGRID_API_URL = 'https://api.trongrid.io';
const PAYMENT_ADDRESS = 'TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn';
const SERVER_URL = 'https://api.cftecosystem.com';
const SAFETY_ENERGY = 20000;
const ENERGY_PRICE_SUN = 10;
const SUN_PER_TRX = 1_000_000;
const ENERGY_RENTAL_DURATION = 2;
const API_CALL_DELAY = 100; // Delay between API calls in ms
const tokenDetails = {
  cft: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    stakingAddress: 'TFQf7a3sYmcFgp62aTXhMiK95psKyptMoY',
    decimals: 6,
    displayName: 'CFT',
    rewardDisplayName: 'TRX',
    rewardDecimals: 6,
    energyCosts: {
      stake: 120000,
      unstake: 75000,
      claimRewards: 100000,
      activateTokens: 50000,
      setPoolSize: 60000,
      addToPool: 70000,
      setDailyPayout: 60000,
      setClaimTimeout: 60000,
      setAuthorizedWallet: 60000,
      withdrawTRX: 80000,
      withdrawTRC20: 90000
    }
  }
};

// ===================== TronGrid helper =====================
async function tronGridApiCall(endpoint, params = {}, keyIndex = 0) {
  try {
    console.log(`Using API key ${keyIndex + 1}: ${TRONGRID_API_KEYS[keyIndex]}`); // Log API key usage
    const response = await fetch(`${TRONGRID_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': TRONGRID_API_KEYS[keyIndex]
      },
      body: JSON.stringify(params)
    });
    if ((response.status === 403 || response.status === 429) && keyIndex < TRONGRID_API_KEYS.length - 1) {
      console.warn(`Rate limit or forbidden error for API key ${keyIndex + 1} (status ${response.status}), trying next key...`);
      await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY));
      return await tronGridApiCall(endpoint, params, keyIndex + 1);
    }
    const data = await response.json();
    if (data.Error) throw new Error(data.Error);
    return data;
  } catch (e) {
    if (keyIndex < TRONGRID_API_KEYS.length - 1) {
      console.warn(`Error with API key ${keyIndex + 1}: ${e.message}, trying next key...`);
      await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY));
      return await tronGridApiCall(endpoint, params, keyIndex + 1);
    }
    showToast({ title: 'API Error', body: 'All API keys are rate-limited or failed. Please try again later.', variant: 'danger' });
    return { error: e.message };
  }
}

// ===================== Custom TronWeb Setup =====================
async function initializeTronWeb() {
  await new Promise(resolve => setTimeout(resolve, 800));
  if (!window.tronLink || !window.tronWeb) throw new Error('TronLink is not detected. Install or unlock TronLink.');
  if (!window.tronLink.ready) throw new Error('TronLink is not ready. Unlock TronLink and select mainnet.');

  // Configure TronWeb with custom HTTP client for API key fallback
  const HttpProvider = TronWeb.providers.HttpProvider;
  let currentApiKeyIndex = 0;

  const customHttpProvider = new Proxy(new HttpProvider(TRONGRID_API_URL), {
    get(target, prop) {
      if (prop === 'request') {
        return async function (endpoint, params = {}, method = 'POST') {
          try {
            console.log(`TronWeb using API key ${currentApiKeyIndex + 1}: ${TRONGRID_API_KEYS[currentApiKeyIndex]}`);
            const response = await fetch(`${TRONGRID_API_URL}${endpoint}`, {
              method,
              headers: {
                'Content-Type': 'application/json',
                'TRON-PRO-API-KEY': TRONGRID_API_KEYS[currentApiKeyIndex]
              },
              body: method === 'POST' ? JSON.stringify(params) : undefined
            });
            if ((response.status === 403 || response.status === 429) && currentApiKeyIndex < TRONGRID_API_KEYS.length - 1) {
              console.warn(`TronWeb request failed with status ${response.status} for API key ${currentApiKeyIndex + 1}, switching to next key...`);
              currentApiKeyIndex = (currentApiKeyIndex + 1) % TRONGRID_API_KEYS.length;
              await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY));
              return customHttpProvider.request(endpoint, params, method);
            }
            const data = await response.json();
            if (data.Error) throw new Error(data.Error);
            return data;
          } catch (e) {
            if (currentApiKeyIndex < TRONGRID_API_KEYS.length - 1) {
              console.warn(`TronWeb error with API key ${currentApiKeyIndex + 1}: ${e.message}, trying next key...`);
              currentApiKeyIndex = (currentApiKeyIndex + 1) % TRONGRID_API_KEYS.length;
              await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY));
              return customHttpProvider.request(endpoint, params, method);
            }
            throw e;
          }
        };
      }
      return target[prop];
    }
  });

  tronWeb = new TronWeb({
    fullNode: customHttpProvider,
    solidityNode: customHttpProvider,
    eventServer: customHttpProvider
  });

  userAddress = tronWeb.defaultAddress.base58;
  if (!userAddress) throw new Error('No user address found. Ensure TronLink is connected to mainnet.');
  document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
  const key = 'cft';
  const details = tokenDetails[key];
  if (!isValidTronAddress(details.tokenAddress)) throw new Error(`Invalid token address for ${key}`);
  if (!isValidTronAddress(details.stakingAddress)) throw new Error(`Invalid staking address for ${key}`);
  tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
  stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
  if (!details.decimals) { tokenDetails[key].decimals = await tokenContracts[key].methods.decimals().call(); }
  setStatus('Connected', true);
  await updateTokenUI(key, true);
  try {
    const owner = await stakingContracts[key].methods.owner().call();
    if (userAddress === owner) { const admin = document.getElementById('admin-section'); if (admin) admin.style.display = 'block'; }
  } catch {}
  setInterval(() => updateTokenUI(key), 120000); // Update every 2 minutes
}

// ===================== Energy helpers =====================
async function checkUserEnergy(address, token, action, extraEnergy = 0) {
  try {
    const resources = await tronGridApiCall('/wallet/getaccountresource', { address });
    if (resources.error) throw new Error(resources.error);
    const energyLimit = resources.EnergyLimit || 0;
    const energyUsed = resources.EnergyUsed || 0;
    const availableEnergy = energyLimit - energyUsed;
    const baseRequiredEnergy = tokenDetails[token].energyCosts[action];
    const requiredEnergy = baseRequiredEnergy + extraEnergy;
    const shortfall = Math.max(0, requiredEnergy - availableEnergy);
    return { availableEnergy, shortfall, requiredEnergy };
  } catch {
    const baseRequiredEnergy = tokenDetails[token].energyCosts[action];
    const requiredEnergy = baseRequiredEnergy + extraEnergy;
    return { availableEnergy: 0, shortfall: requiredEnergy, requiredEnergy };
  }
}

async function checkDelegatorEnergy(requiredAmount) {
  try {
    const response = await fetch(`${SERVER_URL}/api/available-energy`);
    const data = await response.json();
    if (data.success) return Number(data.availableEnergy) >= requiredAmount;
    return false;
  } catch {
    return false;
  }
}

async function requestEnergyRental(rentalEnergy, rentalCostTrx) {
  let processingModal = null;
  try {
    processingModal = showProcessingModal('(1/2)');
    if (!userAddress) throw new Error('Please connect your wallet first.');
    const result = await tronWeb.trx.sendTransaction(PAYMENT_ADDRESS, rentalCostTrx * SUN_PER_TRX);
    if (!result.result) throw new Error('Transaction was rejected or failed.');
    const totalEnergy = rentalEnergy + SAFETY_ENERGY;
    const res = await fetch(`${SERVER_URL}/api/request-energy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        energyAmount: totalEnergy,
        receiverAddress: userAddress,
        trxPrice: rentalCostTrx,
        userAddress,
        paymentTxId: result.txid,
        delegationDuration: ENERGY_RENTAL_DURATION
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error(`Server error: ${data.message}`);
    await pollDelegationStatus(data.requestId);
    hideProcessingModal(processingModal);
    return true;
  } catch (e) {
    hideProcessingModal(processingModal);
    throw e;
  }
}

function showEnergyRentalModal(userEnergy, shortfall, requiredEnergy, message = '') {
  return new Promise((resolve, reject) => {
    const modalElement = document.getElementById('energy-rental-modal');
    if (!modalElement) return reject(new Error('Energy rental modal not found.'));
    const rentalEnergy = shortfall;
    const rentalCostSun = rentalEnergy * ENERGY_PRICE_SUN;
    const rentalCostTrx = rentalCostSun / SUN_PER_TRX;
    const map = {
      'user-energy': userEnergy.toLocaleString('en-US'),
      'required-energy': requiredEnergy.toLocaleString('en-US') + message,
      'rental-energy': rentalEnergy.toLocaleString('en-US'),
      'rental-cost-trx': rentalCostTrx.toFixed(2),
      'rental-duration': ENERGY_RENTAL_DURATION
    };
    for (const [id, val] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (!el) return reject(new Error(`Modal element ${id} not found.`));
      el.textContent = val;
    }
    const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
    const confirmButton = document.getElementById('rent-energy-confirm');
    if (!confirmButton) return reject(new Error('Rent energy confirm button not found.'));
    const confirmHandler = () => {
      modal.hide();
      resolve({ rent: true, rentalEnergy, rentalCostTrx });
      confirmButton.removeEventListener('click', confirmHandler);
    };
    confirmButton.addEventListener('click', confirmHandler);
    modalElement.addEventListener('hidden.bs.modal', () => resolve({ rent: false }), { once: true });
    modal.show();
  });
}

async function pollDelegationStatus(requestId) {
  const maxPoll = 30;
  let attempts = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await fetch(`${SERVER_URL}/api/delegation-status?requestId=${requestId}`);
        const data = await response.json();
        if (data.status === 'delegated') {
          clearInterval(interval);
          resolve(true);
        } else if (['failed', 'expired'].includes(data.status)) {
          clearInterval(interval);
          reject(new Error(`Delegation ${data.status}: ${data.message || ''}`));
        } else if (attempts >= maxPoll) {
          clearInterval(interval);
          reject(new Error('Delegation timed out after ~60s.'));
        }
      } catch (e) {
        if (attempts >= maxPoll) {
          clearInterval(interval);
          reject(e);
        }
      }
    }, 2000);
  });
}

// ===================== ABIs =====================
const stakingContractAbi = [
  {"inputs":[{"internalType":"address","name":"_trc20Token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Unstaked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalRewards","type":"uint256"}],"name":"RewardsDistributed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsClaimed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newSize","type":"uint256"}],"name":"PoolSizeUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newPercentage","type":"uint256"}],"name":"DailyPayoutPercentageUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTimeout","type":"uint256"}],"name":"ClaimTimeoutUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newWallet","type":"address"}],"name":"AuthorizedWalletUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsForfeited","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"TokensActivated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TRXWithdrawn","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TRC20Withdrawn","type":"event"},
  {"inputs":[],"name":"trc20Token","outputs":[{"internalType":"contract ITRC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"authorizedWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"poolSize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"dailyPayoutPercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"claimTimeout","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[{"internalType":"uint256","name":"stakedAmount","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"uint256","name":"pendingRewards","type":"uint256"},{"internalType":"uint256","name":"lastClaimTimestamp","type":"uint256"},{"internalType":"uint256","name":"totalClaimed","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"distributeRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"calculateAPY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"calculateROI","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"viewUserTotalClaimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"viewTotalClaimedRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"viewTotalUnclaimedRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"setPoolSize","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"addToPool","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_percentage","type":"uint256"}],"name":"setDailyPayoutPercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_timeout","type":"uint256"}],"name":"setClaimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"setAuthorizedWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"activateTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_to","type":"address"}],"name":"withdrawTRX","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_to","type":"address"}],"name":"withdrawTRC20","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"stateMutability":"payable","type":"receive"}
];
const tokenContractAbi = [
  {"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
];

// ===================== Utils =====================
const TEN = 10n;
const toUnits = (raw, decimals = 6) => {
  try { return Number(BigInt(raw) / (TEN ** BigInt(decimals))); }
  catch { return 0; }
};
const toWei = (amt, decimals = 6) => {
  const n = Number(amt || 0);
  if (!isFinite(n) || n <= 0) return 0n;
  const base = BigInt(Math.round(n * 1e6));
  const pow = BigInt(Math.max(0, decimals - 6));
  return base * (TEN ** pow);
};
const fmt = (n, max=6) => Number(n ?? 0).toLocaleString('en-US', { maximumFractionDigits: max });
const fmtPct = (n) => `${(Number(n) || 0).toFixed(2)}%`;
const fmtTrx = (n) => `${fmt(n)} TRX`;
function isValidTronAddress(address){
  return !!(address && typeof address === 'string' && address.startsWith('T') && address.length === 34 && /^[A-Za-z1-9]+$/.test(address));
}

// ===================== UI helpers =====================
function showToast({ title='Notification', body='', variant='dark', autohide=true }){
  const el = document.getElementById('app-toast');
  if (!el) return;
  el.className = `toast text-bg-${variant}`;
  el.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${title}</strong>
      <button type="button" class="btn-close ms-2 mb-1" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">${body}</div>`;
  new bootstrap.Toast(el, { autohide, delay: 4500 }).show();
}
function withLoading(btn, label='Processing', fn){
  return async (...args)=>{
    if (!btn) return fn(...args);
    btn.disabled = true; const old = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${label}`;
    try { return await fn(...args); }
    finally { btn.disabled = false; btn.innerHTML = old; }
  };
}
function setStatus(text, ok=true){
  const chip = document.getElementById('status-chip');
  const txt = document.getElementById('status-text');
  if (chip && txt){ txt.textContent = text; chip.querySelector('.dot').style.background = ok ? '#00ff88' : '#ff4d4d'; }
}
function setSkeleton(id, on){
  const el = document.getElementById(id);
  if (!el) return;
  if (on){ el.classList.add('skeleton'); el.textContent = ''; el.style.minHeight = el.style.minHeight || '22px'; }
  else { el.classList.remove('skeleton'); }
}
function showProcessingModal(step=''){
  const modalElement = document.getElementById('transaction-processing-modal');
  if (!modalElement) throw new Error('Processing modal not found.');
  const titleElement = document.getElementById('transactionProcessingModalLabel');
  if (titleElement) titleElement.textContent = `Processing Transaction ${step}`;
  const modal = new bootstrap.Modal(modalElement, { backdrop:'static', keyboard:false });
  modal.show();
  return modal;
}
function hideProcessingModal(modal){ if (modal) modal.hide(); }
function delay(ms){ return new Promise(r=>setTimeout(r, ms)); }

// ===================== Core =====================
async function initialize(){
  const connectButton = document.getElementById('connect-button');
  if (connectButton){ connectButton.addEventListener('click', connectWallet); }
  // Tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(t => new bootstrap.Tooltip(t));
  // Quick-fill buttons
  document.querySelectorAll('[data-fill]')?.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const pct = Number(btn.dataset.fill || '0');
      const availEl = document.getElementById('available-tokens-cft');
      const input = document.getElementById('stake-amount-cft');
      const available = Number((availEl?.dataset.raw) || availEl?.textContent?.replace(/[^0-9.]/g,'') || '0');
      if (input) input.value = (available * pct).toFixed(6);
    });
  });
  // Auto connect if ready
  const isTronLinkInstalled = await checkTronLinkInstalled();
  if (isTronLinkInstalled && window.tronLink && window.tronLink.ready){
    try{ await initializeTronWeb(); }catch(e){ showToast({ title:'Auto-connect failed', body:e.message, variant:'danger' }); }
  }
}
function checkTronLinkInstalled(){
  return new Promise(resolve=>{
    let attempts = 0; const maxAttempts = 10;
    const interval = setInterval(()=>{
      attempts++;
      if (window.tronWeb && window.tronWeb.defaultAddress.base58){ clearInterval(interval); resolve(true); }
      else if (attempts >= maxAttempts){ clearInterval(interval); resolve(false); }
    }, 1000);
  });
}
async function connectWallet(){
  try{
    if (!window.tronLink) throw new Error('TronLink is not detected. Install or unlock TronLink.');
    if (!window.tronLink.ready) throw new Error('TronLink is not ready. Unlock TronLink and select mainnet.');
    await window.tronLink.request({ method:'tron_requestAccounts' });
    await initializeTronWeb();
  }catch(e){ showToast({ title:'Wallet', body:e.message, variant:'danger' }); }
}

async function updateTokenUI(token, first = false) {
  const cacheKey = `tokenUI_${token}_${userAddress}`;
  if (!first) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < 120000) {
        // Update UI with cached data
        const { balanceUnits, stakedUnits, rewardUnits, userTotalClaimed, poolSize, totalNextPayout, yourNextPayout, roiPct, apyPct, dailyPctRaw } = data;
        const availEl = document.getElementById(`available-tokens-${token}`);
        if (availEl) { availEl.textContent = fmt(balanceUnits); availEl.dataset.raw = String(balanceUnits); setSkeleton(`available-tokens-${token}`, false); }
        const stakedEl = document.getElementById(`staked-amount-${token}`);
        if (stakedEl) { stakedEl.textContent = fmt(stakedUnits); setSkeleton(`staked-amount-${token}`, false); }
        const apyEl = document.getElementById(`projected-rewards-${token}`);
        if (apyEl) { apyEl.textContent = fmtPct(apyPct); setSkeleton(`projected-rewards-${token}`, false); }
        const claimableEl = document.getElementById(`claimable-rewards-${token}`);
        if (claimableEl) { claimableEl.textContent = `${fmt(rewardUnits)} ${tokenDetails[token].rewardDisplayName}`; }
        const userClaimedEl = document.getElementById('user-total-claimed-cft');
        if (userClaimedEl) { userClaimedEl.textContent = fmtTrx(userTotalClaimed); setSkeleton('user-total-claimed-cft', false); }
        const roiEl = document.getElementById('roi-cft');
        if (roiEl) { roiEl.textContent = fmtPct(roiPct); setSkeleton('roi-cft', false); }
        const poolEl = document.getElementById('pool-size'); if (poolEl) { poolEl.textContent = fmtTrx(poolSize); setSkeleton('pool-size', false); }
        const dailyEl = document.getElementById('daily-payout'); if (dailyEl) { dailyEl.textContent = `${(Number(dailyPctRaw)/100).toFixed(2)}% / day`; setSkeleton('daily-payout', false); }
        const totalNextPayoutEl = document.getElementById('total-next-payout'); if (totalNextPayoutEl) { totalNextPayoutEl.textContent = fmtTrx(totalNextPayout); setSkeleton('total-next-payout', false); }
        const yourNextPayoutEl = document.getElementById('your-next-payout'); if (yourNextPayoutEl) { yourNextPayoutEl.textContent = fmtTrx(yourNextPayout); setSkeleton('your-next-payout', false); }
        return;
      }
    }
  }
  try {
    if (first) {
      ['available-tokens-cft', 'staked-amount-cft', 'projected-rewards-cft', 'user-total-claimed-cft', 'roi-cft']
        .forEach(id => setSkeleton(id, true));
      ['pool-size', 'daily-payout', 'total-next-payout', 'your-next-payout'].forEach(id => setSkeleton(id, true));
    }
    const [balanceRaw, userData, apy, timeout, userTotalClaimedRaw, poolSizeRaw, dailyPctRaw] = await Promise.all([
      tokenContracts[token].methods.balanceOf(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.users(userAddress).call().catch(() => ({ stakedAmount: '0', pendingRewards: '0', isActive: false, lastClaimTimestamp: '0', totalClaimed: '0' })),
      stakingContracts[token].methods.calculateAPY(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.claimTimeout().call().catch(() => '0'),
      stakingContracts[token].methods.viewUserTotalClaimed(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.poolSize().call().catch(() => '0'),
      stakingContracts[token].methods.dailyPayoutPercentage().call().catch(() => '0')
    ]);
    const d = tokenDetails[token];
    const balanceUnits = toUnits(balanceRaw, d.decimals);
    const stakedUnits = toUnits(userData.stakedAmount, d.decimals);
    const rewardUnits = toUnits(userData.pendingRewards, d.rewardDecimals);
    const userTotalClaimed = Number(userTotalClaimedRaw) / SUN_PER_TRX;
    const poolSize = Number(poolSizeRaw) / SUN_PER_TRX;
    const dailyPayoutPct = Number(dailyPctRaw) / 100; // e.g., 1% = 1.00
    const totalNextPayout = poolSize * dailyPayoutPct / 100; // Total daily payout in TRX
    const yourNextPayout = stakedUnits > 0 && poolSize > 0 ? (stakedUnits / poolSize) * totalNextPayout : 0; // User's share
    const roiPct = Number(apy) / 1; // Assuming calculateROI returns actual percentage
    const apyPct = Number(apy); // Fixed: no division by 100
    // Cache results
    const cacheData = {
      data: { balanceUnits, stakedUnits, rewardUnits, userTotalClaimed, poolSize, totalNextPayout, yourNextPayout, roiPct, apyPct, dailyPctRaw },
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    const availEl = document.getElementById(`available-tokens-${token}`);
    if (availEl) { availEl.textContent = fmt(balanceUnits); availEl.dataset.raw = String(balanceUnits); setSkeleton(`available-tokens-${token}`, false); }
    await delay(100);
    const stakedEl = document.getElementById(`staked-amount-${token}`);
    if (stakedEl) { stakedEl.textContent = fmt(stakedUnits); setSkeleton(`staked-amount-${token}`, false); }
    await delay(100);
    const apyEl = document.getElementById(`projected-rewards-${token}`);
    if (apyEl) { apyEl.textContent = fmtPct(apyPct); setSkeleton(`projected-rewards-${token}`, false); }
    await delay(100);
    const claimableEl = document.getElementById(`claimable-rewards-${token}`);
    if (claimableEl) { claimableEl.textContent = `${fmt(rewardUnits)} ${d.rewardDisplayName}`; }
    const userClaimedEl = document.getElementById('user-total-claimed-cft');
    if (userClaimedEl) { userClaimedEl.textContent = fmtTrx(userTotalClaimed); setSkeleton('user-total-claimed-cft', false); }
    const roiEl = document.getElementById('roi-cft');
    if (roiEl) { roiEl.textContent = fmtPct(roiPct); setSkeleton('roi-cft', false); }
    // Pool stats
    const poolEl = document.getElementById('pool-size'); if (poolEl) { poolEl.textContent = fmtTrx(poolSize); setSkeleton('pool-size', false); }
    const dailyEl = document.getElementById('daily-payout'); if (dailyEl) { dailyEl.textContent = `${dailyPayoutPct.toFixed(2)}% / day`; setSkeleton('daily-payout', false); }
    const totalNextPayoutEl = document.getElementById('total-next-payout'); if (totalNextPayoutEl) { totalNextPayoutEl.textContent = fmtTrx(totalNextPayout); setSkeleton('total-next-payout', false); }
    const yourNextPayoutEl = document.getElementById('your-next-payout'); if (yourNextPayoutEl) { yourNextPayoutEl.textContent = fmtTrx(yourNextPayout); setSkeleton('your-next-payout', false); }
    // Activate visibility
    const activateButton = document.getElementById(`activate-tokens-${token}`) || document.getElementById(`activate-tokens-button-${token}`);
    if (activateButton) { activateButton.style.display = (userData.isActive || Number(userData.stakedAmount) === 0) ? 'none' : 'block'; }
    // Claim timer
    updateClaimTimer(Number(timeout), Number(userData.lastClaimTimestamp));
  } catch (e) {
    showToast({ title: 'UI Update Error', body: e.message, variant: 'danger' });
  }
}
function updateClaimTimer(timeoutSec, lastClaimTs) {
  const timerEl = document.getElementById('next-claim-timer');
  const claimBtn = document.getElementById('claim-rewards-button-cft');
  if (!timerEl || !claimBtn) return;
  if (!timeoutSec) {
    timerEl.textContent = '—';
    claimBtn.disabled = false;
    return;
  }
  const now = Math.floor(Date.now() / 1000);
  const next = (lastClaimTs || 0) + timeoutSec;
  const remaining = Math.max(0, next - now);
  if (remaining === 0) {
    timerEl.textContent = 'Claim available';
    claimBtn.disabled = false;
    return;
  }
  claimBtn.disabled = true;
  const format = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${h > 0 ? h + 'h ' : ''}${m}m ${sec}s`;
  };
  timerEl.textContent = `Available in ${format(remaining)}`;
  const id = setInterval(() => {
    const now2 = Math.floor(Date.now() / 1000);
    const rem = Math.max(0, next - now2);
    if (rem === 0) {
      clearInterval(id);
      timerEl.textContent = 'Claim available';
      claimBtn.disabled = false;
    } else {
      timerEl.textContent = `Available in ${format(rem)}`;
    }
  }, 1000);
}

// ===================== Actions =====================
async function stakeTokens(token, amount){
  let processingModal = null; const stakeBtn = document.getElementById(`stake-button-${token}`);
  const run = async ()=>{
    try{
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!isValidTronAddress(tokenDetails[token].tokenAddress)) throw new Error('Invalid token address');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      const amountToStake = toWei(amount, tokenDetails[token].decimals);
      if (amountToStake === 0n) throw new Error('Enter a valid amount to stake.');
      const stakingContractAddress = tokenDetails[token].stakingAddress;
      const tokenContract = tokenContracts[token];
      const stakingContract = stakingContracts[token];
      if (!tokenContract?.methods?.allowance) throw new Error('Token contract not initialized');
      if (!stakingContract?.methods?.stake) throw new Error('Staking contract not initialized');
      const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
      if (BigInt(balanceRaw) < amountToStake) throw new Error('Insufficient balance to stake.');
      const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
      const allowance = BigInt(allowanceRaw);
      const approvalRequired = allowance < amountToStake;
      let energyCheckResult = approvalRequired
        ? await checkUserEnergy(userAddress, token, 'stake', 30000)
        : await checkUserEnergy(userAddress, token, 'stake');
      let { availableEnergy, shortfall, requiredEnergy } = energyCheckResult;
      if (shortfall > 0){
        const totalRequired = shortfall + SAFETY_ENERGY;
        if (await checkDelegatorEnergy(totalRequired)){
          const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy, approvalRequired ? ' (incl. ~30,000 for approval)' : '');
          if (modalResult.rent){
            processingModal = showProcessingModal('(1/2)');
            await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
            await delay(5000); hideProcessingModal(processingModal);
          }
        }
      }
      processingModal = showProcessingModal('(2/2)');
      if (approvalRequired){
        const approvalTx = await tronWeb.transactionBuilder.triggerSmartContract(
          tokenDetails[token].tokenAddress,
          'approve(address,uint256)', {},
          [ { type:'address', value: stakingContractAddress }, { type:'uint256', value: maxUint256 } ],
          userAddress
        );
        if (!approvalTx.result || !approvalTx.transaction) throw new Error('Failed to create approve transaction');
        const signedApprovalTx = await tronWeb.trx.sign(approvalTx.transaction);
        const broadcastApproval = await tronWeb.trx.sendRawTransaction(signedApprovalTx);
        if (!broadcastApproval.result) throw new Error('Failed to broadcast approve transaction');
        showToast({ title:'Approve submitted', body:`<a href="https://tronscan.org/#/transaction/${broadcastApproval.txid}" target="_blank" rel="noopener">View on Tronscan</a>` });
        await delay(5000);
      }
      const stakeTx = await tronWeb.transactionBuilder.triggerSmartContract(
        stakingContractAddress, 'stake(uint256)', {}, [ { type:'uint256', value: amountToStake.toString() } ], userAddress
      );
      if (!stakeTx.result || !stakeTx.transaction) throw new Error('Failed to create stake transaction');
      const signedStakeTx = await tronWeb.trx.sign(stakeTx.transaction);
      const broadcastStake = await tronWeb.trx.sendRawTransaction(signedStakeTx);
      if (!broadcastStake.result) throw new Error('Failed to broadcast stake transaction');
      showToast({ title:'Stake submitted', body:`<a href="https://tronscan.org/#/transaction/${broadcastStake.txid}" target="_blank" rel="noopener">View on Tronscan</a>` });
      hideProcessingModal(processingModal);
      await updateTokenUI(token);
    }catch(e){ hideProcessingModal(processingModal); showToast({ title:'Stake error', body:e.message, variant:'danger' }); }
  };
  return withLoading(stakeBtn, 'Staking...', run)();
}
async function unstakeTokens(token){
  let processingModal = null; const btn = document.getElementById(`unstake-button-${token}`);
  const run = async ()=>{
    try{
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
      if (!unstakeAmount || isNaN(unstakeAmount) || Number(unstakeAmount) <= 0) throw new Error('Enter a valid amount to withdraw.');
      const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'unstake');
      if (shortfall > 0){
        const totalRequired = shortfall + SAFETY_ENERGY;
        if (await checkDelegatorEnergy(totalRequired)){
          const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
          if (modalResult.rent){ processingModal = showProcessingModal('(1/2)'); await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx); await delay(5000); hideProcessingModal(processingModal); }
        }
      }
      processingModal = showProcessingModal('(2/2)');
      const amountToUnstake = toWei(unstakeAmount, tokenDetails[token].decimals);
      const stakingContract = stakingContracts[token];
      const userData = await stakingContract.methods.users(userAddress).call();
      if (BigInt(userData.stakedAmount) < amountToUnstake) throw new Error('Insufficient staked amount.');
      const withdrawTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress, 'unstake(uint256)', {}, [ { type:'uint256', value: amountToUnstake.toString() } ], userAddress
      );
      if (!withdrawTx.result || !withdrawTx.transaction) throw new Error('Failed to create unstake transaction');
      const signedWithdrawTx = await tronWeb.trx.sign(withdrawTx.transaction);
      const broadcastWithdraw = await tronWeb.trx.sendRawTransaction(signedWithdrawTx);
      if (!broadcastWithdraw.result) throw new Error('Failed to broadcast unstake transaction');
      showToast({ title:'Withdraw submitted', body:`<a href="https://tronscan.org/#/transaction/${broadcastWithdraw.txid}" target="_blank" rel="noopener">View on Tronscan</a>` });
      hideProcessingModal(processingModal);
      await updateTokenUI(token);
    }catch(e){ hideProcessingModal(processingModal); showToast({ title:'Withdraw error', body:e.message, variant:'danger' }); }
  };
  return withLoading(btn, 'Withdrawing...', run)();
}
async function claimRewards(token){
  let processingModal = null; const btn = document.getElementById(`claim-rewards-button-${token}`);
  const run = async ()=>{
    try{
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'claimRewards');
      if (shortfall > 0){
        const totalRequired = shortfall + SAFETY_ENERGY;
        if (await checkDelegatorEnergy(totalRequired)){
          const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
          if (modalResult.rent){ processingModal = showProcessingModal('(1/2)'); await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx); await delay(5000); hideProcessingModal(processingModal); }
        }
      }
      processingModal = showProcessingModal('(2/2)');
      const stakingContract = stakingContracts[token];
      const userData = await stakingContract.methods.users(userAddress).call();
      if (BigInt(userData.pendingRewards) === 0n) throw new Error('No rewards available to claim.');
      const claimTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress, 'claimRewards()', {}, [], userAddress
      );
      if (!claimTx.result || !claimTx.transaction) throw new Error('Failed to create claim transaction');
      const signedClaimTx = await tronWeb.trx.sign(claimTx.transaction);
      const broadcastClaim = await tronWeb.trx.sendRawTransaction(signedClaimTx);
      if (!broadcastClaim.result) throw new Error('Failed to broadcast claim transaction');
      showToast({ title:'Claim submitted', body:`<a href="https://tronscan.org/#/transaction/${broadcastClaim.txid}" target="_blank" rel="noopener">View on Tronscan</a>` });
      hideProcessingModal(processingModal);
      await updateTokenUI(token);
    }catch(e){ hideProcessingModal(processingModal); showToast({ title:'Claim error', body:e.message, variant:'danger' }); }
  };
  return withLoading(btn, 'Claiming...', run)();
}
async function activateTokens(token){
  let processingModal = null; const btn = document.getElementById(`activate-tokens-button-${token}`);
  const run = async ()=>{
    try{
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'activateTokens');
      if (shortfall > 0){
        const totalRequired = shortfall + SAFETY_ENERGY;
        if (await checkDelegatorEnergy(totalRequired)){
          const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
          if (modalResult.rent){ processingModal = showProcessingModal('(1/2)'); await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx); await delay(5000); hideProcessingModal(processingModal); }
        }
      }
      processingModal = showProcessingModal('(2/2)');
      const stakingContract = stakingContracts[token];
      const userData = await stakingContract.methods.users(userAddress).call();
      if (userData.isActive || BigInt(userData.stakedAmount) === 0n) throw new Error('No inactive tokens to activate.');
      const activateTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress, 'activateTokens()', {}, [], userAddress
      );
      if (!activateTx.result || !activateTx.transaction) throw new Error('Failed to create activation transaction');
      const signedActivateTx = await tronWeb.trx.sign(activateTx.transaction);
      const broadcastActivate = await tronWeb.trx.sendRawTransaction(signedActivateTx);
      if (!broadcastActivate.result) throw new Error('Failed to broadcast activation transaction');
      showToast({ title:'Activation submitted', body:`<a href="https://tronscan.org/#/transaction/${broadcastActivate.txid}" target="_blank" rel="noopener">View on Tronscan</a>` });
      hideProcessingModal(processingModal);
      await updateTokenUI(token);
    }catch(e){ hideProcessingModal(processingModal); showToast({ title:'Activation error', body:e.message, variant:'danger' }); }
  };
  return withLoading(btn, 'Activating...', run)();
}

// ===================== Events =====================
document.addEventListener('DOMContentLoaded', () => {
  const key = 'cft';
  const stakeButton = document.getElementById(`stake-button-${key}`);
  if (stakeButton){ stakeButton.addEventListener('click', async (e)=>{ e.preventDefault(); const amount = document.getElementById(`stake-amount-${key}`).value; await stakeTokens(key, amount); }); }
  const unstakeButton = document.getElementById(`unstake-button-${key}`);
  if (unstakeButton){ unstakeButton.addEventListener('click', async (e)=>{ e.preventDefault(); await unstakeTokens(key); }); }
  const claimButton = document.getElementById(`claim-rewards-button-${key}`);
  if (claimButton){ claimButton.addEventListener('click', async (e)=>{ e.preventDefault(); await claimRewards(key); }); }
  const activateButton = document.getElementById(`activate-tokens-button-${key}`);
  if (activateButton){ activateButton.addEventListener('click', async (e)=>{ e.preventDefault(); await activateTokens(key); }); }
  initialize();
});
