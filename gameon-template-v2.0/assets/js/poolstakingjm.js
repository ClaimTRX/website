/* stakingpool.js — energy flow aligned with staking.js + throttle + pacing
   - Same server flow as staking.js (GET /available-energy → pay → POST /request-energy → poll /delegation-status)
   - Payment sends integer SUN (no float rounding issues)
   - Payment address set to the same as staking.js so backend recognizes the tx
   - Global 5000ms throttle + round-robin API key rotation
   - 1000ms delays between sequential on-chain contract calls to avoid bursts
   - Whitelist check to display "Whitelisted" instead of countdown
   - UI refresh after stake/unstake/claim/activate to prevent stale "Expired" display
   - Reduced updateClaimTimer frequency to 5s and cached results to minimize API calls
   - Paused timer during transactions to prevent overlapping calls
   - Optimizations: Consolidated user data fetch, increased delays, prioritized UI updates
*/
let tronWeb, readTronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const readStakingContracts = {};
const readTokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

/* ===================== Config ===================== */
const CHAINSTACK_BASE_URL = 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299';
const PAYMENT_ADDRESS = 'TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn';
const SERVER_URL = 'https://api.cftecosystem.com';
const SAFETY_ENERGY = 50000;
const ENERGY_PRICE_SUN = 30;
const SUN_PER_TRX = 1_000_000;
const ENERGY_RENTAL_DURATION = 2;
const CACHE_TIMEOUT_MS = 120_000; // 120s cache for runtime updates
const THROTTLE_GAP_MS = 500; // Keep 5000ms to stay under 15 QPS per key
const CONTRACT_CALL_DELAY_MS = 300; // Increased to 1000ms for safer pacing
const UI_REFRESH_DELAY_MS = 3000; // 3s delay for UI refresh after actions
// Since staking and reward token are the same (CFT), use 1:1 for APY calculation
const CFT_PRICE = 1; // 1:1 ratio
const DAILY_PAYOUT_PERCENTAGE = 1; // 1% daily payout as per requirement
// === MANUAL DAILY CFT PRICE IN USDT ===
const CFT_PRICE_USDT = 0.1745; // ← UPDATE THIS NUMBER DAILY (e.g., 0.0018 means $0.0018 per CFT)
// Example: if today CFT = $0.0021 USDT → change to 0.0021
const REWARD_PRICE_USDT = 0.000008234709551940406; // ← UPDATE THIS: USDT price of your new reward token (e.g., if RWD = $0.05 USDT, set to 0.05)

/* ===================== Token Config ===================== */
const tokenDetails = {
  cft_rwd: {  // Updated key to reflect new reward
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK', // CFT - staking token (unchanged)
    rewardTokenAddress: 'TVHH59uHVpHzLDMFFpUgCx2dNAQqCzPhcR', // ← UPDATE: New TRC20 reward token address (e.g., RWD)
    stakingAddress: 'TEG1ckez7pwe6kYCWsTxR7wHiJUEV24BUB', // your staking contract (unchanged)
    decimals: 6,  // CFT decimals (unchanged)
    rewardDecimals: 6,  // ← UPDATE: Decimals of your new reward token (e.g., 18 for many TRC20 tokens)
    displayName: 'CFT',
    rewardDisplayName: 'JM',  // ← UPDATE: Display name of your new reward token
    energyCosts: {
      stake: 120000,
      unstake: 75000,
      claimRewards: 100000,
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

/* ===================== ABIs ===================== */
const tokenContractAbi = [
  {"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
];
const stakingContractAbi = [
  {"inputs":[{"internalType":"address","name":"_trc20Token","type":"address"},{"internalType":"address","name":"_rewardToken","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
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
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TRC20Withdrawn","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardTokenWithdrawn","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"TotalClaimedRewardsUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"TotalUnclaimedRewardsUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"StakerRemoved","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"wallet","type":"address"}],"name":"WalletAddedToWhitelist","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"wallet","type":"address"}],"name":"WalletRemovedFromWhitelist","type":"event"},
  {"inputs":[],"name":"trc20Token","outputs":[{"internalType":"contract ITRC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"rewardToken","outputs":[{"internalType":"contract ITRC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"authorizedWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"poolSize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"dailyPayoutPercentage","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"claimTimeout","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"lastDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalClaimedRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalUnclaimedRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalActiveStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"users","outputs":[
    {"internalType":"uint256","name":"stakedAmount","type":"uint256"},
    {"internalType":"bool","name":"isActive","type":"bool"},
    {"internalType":"uint256","name":"lastClaimTimestamp","type":"uint256"},
    {"internalType":"uint256","name":"totalClaimed","type":"uint256"},
    {"internalType":"uint256","name":"rewards","type":"uint256"},
    {"internalType":"uint256","name":"userRewardPerTokenPaid","type":"uint256"}
  ],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"earned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"getStakerInfo","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getStakersList","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"claimRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"distributeRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"forfeitUser","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"calculateAPY","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"calculateROI","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_user","type":"address"}],"name":"viewUserTotalClaimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"viewTotalClaimedRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"viewTotalUnclaimedRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_newSize","type":"uint256"}],"name":"setPoolSize","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"addToPool","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_percentage","type":"uint256"}],"name":"setDailyPayoutPercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_timeout","type":"uint256"}],"name":"setClaimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"setAuthorizedWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"activateTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_to","type":"address"}],"name":"withdrawTRC20","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_to","type":"address"}],"name":"withdrawRewardToken","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"addToWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"removeFromWhitelist","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"whitelist","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"stakersList","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"stateMutability":"payable","type":"receive"}
];

/* ===================== Helpers: throttle, rotation, delay, retry ===================== */
const throttle = (() => {
  let queue = Promise.resolve();
  let last = 0;
  const gap = THROTTLE_GAP_MS;
  return async function run(fn) {
    const exec = async () => {
      const now = Date.now();
      const wait = Math.max(0, gap - (now - last));
      if (wait) await new Promise(r => setTimeout(r, wait));
      last = Date.now();
      return await fn();
    };
    queue = queue.then(exec, exec);
    return queue;
  };
})();
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function retryWithBackoff(fn, maxRetries = 5, baseDelay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('429') && i < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, i);
        console.warn(`429 error, retrying after ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
}
function normalizeContractOutput(output) {
  if (typeof output === 'object' && output !== null) {
    if (output[0] !== undefined) return String(output[0]);
    if (output.value !== undefined) return String(output.value);
    return output;
  }
  return String(output || '0');
}
function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

/* ===================== Chainstack helper (throttled + retry) ===================== */
async function chainstackApiCall(endpoint, params = {}) {
  const needsHex = endpoint.startsWith('/wallet/');
  let body = params;
  if (needsHex && params && params.address) {
    try {
      const hex = tronWeb?.address?.toHex ? tronWeb.address.toHex(params.address) : params.address;
      body = { ...params, address: hex };
    } catch {
      body = params;
    }
  }
  return throttle(async () => {
    return retryWithBackoff(async () => {
      const res = await fetch(`${CHAINSTACK_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      if (res.status === 429) {
        const text = await res.text().catch(() => '');
        throw new Error(`Chainstack 429 Too Many Requests. ${text || ''}`.trim());
      }
      if (res.status === 403) {
        const text = await res.text().catch(() => '');
        throw new Error(`Chainstack 403 Forbidden. ${text || ''}`.trim());
      }
      const data = await res.json().catch(() => ({}));
      if (data.Error) throw new Error(data.Error);
      return data;
    });
  });
}

/* ===================== TronWeb Setup (wrap requests) ===================== */
async function initializeTronWeb() {
  const initDelay = 1500; // Consistent delay for detection
  await delay(initDelay);
  if (!window.tronLink || !window.tronWeb) {
    showToast({ title: 'Auto-connect failed', body: 'TronLink is not detected. Install or unlock TronLink.', variant: 'danger' });
    return;
  }
  if (!window.tronLink.ready) {
    showToast({ title: 'Auto-connect failed', body: 'TronLink is not ready. Unlock TronLink and select mainnet.', variant: 'danger' });
    return;
  }
  tronWeb = window.tronWeb; // Injected for signing
  // Load TronWeb library if not available
  const loadTronWebScript = () => new Promise((resolve, reject) => {
    if (window.TronWeb) {
      resolve();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tronweb@latest/dist/TronWeb.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
  await loadTronWebScript();
// Use TronLink's TronWeb class if the global isn't a constructor
const TronWebCtor = (typeof window.TronWeb === 'function')
  ? window.TronWeb
  : window.tronWeb?.constructor;
if (!TronWebCtor) {
  throw new Error('TronWeb is not available as a constructor. Reload, unlock TronLink, or use a different TronWeb CDN build.');
}
readTronWeb = new TronWebCtor({ fullHost: CHAINSTACK_BASE_URL });
  // Throttle requests on readTronWeb
  const originalReadRequest = readTronWeb.request;
  readTronWeb.request = async function(endpoint, params = {}, method = 'POST') {
    return throttle(async () => {
      return originalReadRequest.call(this, endpoint, serializeBigInt(params), method);
    });
  };
  userAddress = tronWeb.defaultAddress.base58;
if (!userAddress) {
  showToast({ title: 'Auto-connect failed', body: 'No user address found. Ensure TronLink is connected to mainnet.', variant: 'danger' });
  return;
}
// ✅ IMPORTANT: make readTronWeb have a default "from" address for .call()
readTronWeb.setAddress(userAddress);
  const cb = document.getElementById('connect-button');
  if (cb) cb.innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
  // Init contracts: signing versions with injected, read versions with readTronWeb
  const key = 'cft_rwd';
  const details = tokenDetails[key];
  if (!isValidTronAddress(details.tokenAddress)) throw new Error(`Invalid token address for ${key}`);
  if (!isValidTronAddress(details.stakingAddress)) throw new Error(`Invalid staking address for ${key}`);
  tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
  readTokenContracts[key] = await readTronWeb.contract(tokenContractAbi, details.tokenAddress);
  await delay(CONTRACT_CALL_DELAY_MS);
  stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
  readStakingContracts[key] = await readTronWeb.contract(stakingContractAbi, details.stakingAddress);
  // sanity for ABI variants
  if (!readStakingContracts[key].methods.getTotalStaked && !readStakingContracts[key].methods.totalStaked) {
    throw new Error('Neither getTotalStaked nor totalStaked found. Check ABI or address.');
  }
  setStatus('Connected', true);
  // Force clear all caches on init/load for latest data
  ['top', 'action', 'stats', `user_${key}_${userAddress}`].forEach(section => localStorage.removeItem(`tokenUI_${section}_${key}_${userAddress}`));
  // Fetch user data once and reuse (use read)
  let userData;
  try {
    userData = await retryWithBackoff(() => readStakingContracts[key].methods.users(userAddress).call());
    console.debug('initializeTronWeb: users call successful, userData:', userData);
  } catch (error) {
    console.error('initializeTronWeb: users call failed:', error);
    userData = {
      stakedAmount: '0',
      isActive: false,
      lastClaimTimestamp: '0',
      totalClaimed: '0',
      rewards: '0',
      userRewardPerTokenPaid: '0'
    };
    showToast({ title: 'Contract Error', body: 'Failed to fetch user data; using fallback data.', variant: 'warning' });
  }
  // Cache user data immediately
  const initialCache = {
    data: {
      stakedAmount: userData.stakedAmount,
      isActive: userData.isActive,
      lastClaimTimestamp: userData.lastClaimTimestamp,
      totalClaimed: userData.totalClaimed,
      rewards: userData.rewards,
      userRewardPerTokenPaid: userData.userRewardPerTokenPaid
    },
    timestamp: Date.now()
  };
  localStorage.setItem(`tokenUI_user_${key}_${userAddress}`, JSON.stringify(serializeBigInt(initialCache)));
  // Update UI with prioritized calls
  await updateUI(key, true, userData);
  // Show admin if owner (use read)
  try {
    const owner = await retryWithBackoff(() => readStakingContracts[key].methods.owner().call());
    if (userAddress === owner) {
      const admin = document.getElementById('admin-section');
      if (admin) admin.style.display = 'block';
    }
  } catch {}
  setInterval(() => updateUI(key, false, userData), 60000);
}

/* ===================== Energy helpers (aligned with staking.js) ===================== */
async function checkUserEnergy(address, token, action, extraEnergy = 0) {
  try {
    const resources = await retryWithBackoff(() => readTronWeb.trx.getAccountResources(address));
    const energyLimit = resources.EnergyLimit || 0;
    const energyUsed = resources.EnergyUsed || 0;
    const availableEnergy = energyLimit - energyUsed;
    const baseRequiredEnergy = tokenDetails[token].energyCosts[action];
    const requiredEnergy = baseRequiredEnergy + extraEnergy;
    const shortfall = Math.max(0, requiredEnergy - availableEnergy);
    return { availableEnergy, shortfall, requiredEnergy };
  } catch (error) {
    const baseRequiredEnergy = tokenDetails[token].energyCosts[action];
    const requiredEnergy = baseRequiredEnergy + extraEnergy;
    return { availableEnergy: 0, shortfall: requiredEnergy, requiredEnergy };
  }
}
async function checkDelegatorEnergy(requiredAmount) {
  try {
    const response = await fetch(`${SERVER_URL}/api/available-energy`, { method: 'GET' });
    const data = await response.json();
    if (data.success) {
      const availableEnergy = Number(data.availableEnergy);
      return availableEnergy >= requiredAmount;
    }
    throw new Error('Failed to fetch delegator energy');
  } catch {
    return false;
  }
}
async function requestEnergyRental(rentalEnergy, rentalCostTrx) {
  let processingModal = null;
  try {
    processingModal = showProcessingModal('(1/2)');
    if (!userAddress) {
      throw new Error('Please connect your wallet first.');
    }
    const rentalCostSun = Math.round(rentalEnergy * ENERGY_PRICE_SUN);
    const paymentRes = await tronWeb.trx.sendTransaction(PAYMENT_ADDRESS, rentalCostSun);
    if (!paymentRes?.result) {
      throw new Error('Transaction was rejected or failed.');
    }
    const totalEnergy = rentalEnergy + SAFETY_ENERGY;
    const response = await fetch(`${SERVER_URL}/api/request-energy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        energyAmount: totalEnergy,
        receiverAddress: userAddress,
        trxPrice: rentalCostSun / SUN_PER_TRX,
        userAddress,
        paymentTxId: paymentRes.txid,
        delegationDuration: ENERGY_RENTAL_DURATION
      })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(`Server error: ${data.message || 'Unknown'}`);
    }
    const delegated = await pollDelegationStatus(data.requestId);
    hideProcessingModal(processingModal);
    return delegated;
  } catch (error) {
    hideProcessingModal(processingModal);
    throw error;
  }
}
async function pollDelegationStatus(requestId) {
  const maxPollAttempts = 30;
  let pollAttempts = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      pollAttempts++;
      try {
        const response = await fetch(`${SERVER_URL}/api/delegation-status?requestId=${requestId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.status === 'delegated') {
          clearInterval(interval);
          resolve(true);
        } else if (data.status === 'failed' || data.status === 'expired') {
          clearInterval(interval);
          reject(new Error(`Delegation failed: ${data.message || 'Unknown error'}`));
        } else if (pollAttempts >= maxPollAttempts) {
          clearInterval(interval);
          reject(new Error('Delegation timed out after 60 seconds.'));
        }
      } catch (err) {
        if (pollAttempts >= maxPollAttempts) {
          clearInterval(interval);
          reject(new Error(`Error polling delegation status: ${err.message}`));
        }
      }
    }, 2000);
  });
}
function showEnergyRentalModal(userEnergy, shortfall, requiredEnergy, message = '') {
  return new Promise((resolve, reject) => {
    const modalElement = document.getElementById('energy-rental-modal');
    if (!modalElement) {
      console.error('Energy rental modal not found.');
      return reject(new Error('Energy rental modal not found.'));
    }
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
    for (const [id, value] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (!el) return reject(new Error(`Modal element ${id} not found.`));
      el.textContent = value;
    }
    const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
    modalElement.addEventListener('shown.bs.modal', () => modalElement.removeAttribute('aria-hidden'), { once: true });
    const confirmButton = document.getElementById('rent-energy-confirm');
    if (!confirmButton) return reject(new Error('Rent energy confirm button not found.'));
    const confirmHandler = () => {
      modal.hide();
      resolve({ rent: true, rentalEnergy, rentalCostTrx });
      confirmButton.removeEventListener('click', confirmHandler);
    };
    confirmButton.addEventListener('click', confirmHandler);
    const cancelHandler = () => {
      modal.hide();
      resolve({ rent: false });
    };
    modalElement.addEventListener('hidden.bs.modal', cancelHandler, { once: true });
    try { modal.show(); } catch { reject(new Error('Failed to show energy rental modal.')); }
  });
}
function showRewardWarningModal(rewardUnits, rewardDisplayName) {
  return new Promise((resolve, reject) => {
    const modalElement = document.getElementById('reward-warning-modal');
    if (!modalElement) {
      console.error('Reward warning modal not found.');
      return reject(new Error('Reward warning modal not found.'));
    }
    const rewardDisplay = document.getElementById('pending-rewards-amount');
    if (rewardDisplay) {
      rewardDisplay.textContent = `${rewardUnits.toFixed(2)} ${rewardDisplayName}`;
    } else {
      return reject(new Error('Pending rewards display element not found.'));
    }
    const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
    modalElement.addEventListener('shown.bs.modal', () => modalElement.removeAttribute('aria-hidden'), { once: true });
    const confirmButton = document.getElementById('withdraw-confirm');
    if (!confirmButton) return reject(new Error('Withdraw confirm button not found.'));
    const confirmHandler = () => {
      modal.hide();
      resolve(true);
      confirmButton.removeEventListener('click', confirmHandler);
    };
    confirmButton.addEventListener('click', confirmHandler);
    const cancelHandler = () => {
      modal.hide();
      resolve(false);
    };
    modalElement.addEventListener('hidden.bs.modal', cancelHandler, { once: true });
    try { modal.show(); } catch { reject(new Error('Failed to show reward warning modal.')); }
  });
}

/* ===================== Utils ===================== */
const TEN = 10n;
function toUnits(raw, decimals = 6) {
  try {
    const bi = BigInt(raw);
    const denom = TEN ** BigInt(decimals);
    const integer = bi / denom;
    const frac = bi % denom;
    return Number(integer) + Number(frac) / Number(denom);
  } catch {
    return 0;
  }
}
const fmt = (n, max=6) => Number(n ?? 0).toLocaleString('en-US', { maximumFractionDigits: max });
const fmtPct = (n) => `${(Number(n) || 0).toFixed(2)}%`;
const fmtCft = (n) => `${fmt(n)} CFT`;
function isValidTronAddress(address) {
  return !!(address && typeof address === 'string' && address.startsWith('T') && address.length === 34 && /^[A-Za-z1-9]+$/.test(address));
}
function toWei(amt, decimals = 6) {
  const n = Number(amt || 0);
  if (!isFinite(n) || n <= 0) return 0n;
  const base = BigInt(Math.round(n * 1e6));
  const pow = BigInt(Math.max(0, decimals - 6));
  return base * (TEN ** pow);
}

/* ===================== UI helpers ===================== */
function showToast({ title='Notification', body='', variant='dark', autohide=true }) {
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
function withLoading(btn, label='Processing', fn) {
  return async (...args) => {
    if (!btn) return fn(...args);
    btn.disabled = true; const old = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${label}`;
    try { return await fn(...args); }
    finally { btn.disabled = false; btn.innerHTML = old; }
  };
}
function setStatus(text, ok=true) {
  const chip = document.getElementById('status-chip');
  const txt = document.getElementById('status-text');
  if (chip && txt) { txt.textContent = text; chip.querySelector('.dot').style.background = ok ? '#00ff88' : '#ff4d4d'; }
}
function setSkeleton(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  if (on) { el.classList.add('skeleton'); el.textContent = ''; el.style.minHeight = el.style.minHeight || '22px'; }
  else { el.classList.remove('skeleton'); }
}
function showProcessingModal(step='') {
  const modalElement = document.getElementById('transaction-processing-modal');
  if (!modalElement) throw new Error('Processing modal not found.');
  const titleElement = document.getElementById('transactionProcessingModalLabel');
  if (titleElement) titleElement.textContent = `Processing Transaction ${step}`;
  const modal = new bootstrap.Modal(modalElement, { backdrop:'static', keyboard:false });
  modalElement.addEventListener('shown.bs.modal', () => modalElement.removeAttribute('aria-hidden'), { once: true });
  modal.show();
  return modal;
}
function hideProcessingModal(modal) { if (modal) modal.hide(); }
function calculateAPY(stakedUnits, totalActiveStaked, poolSizeReward) {
  if (stakedUnits <= 0 || totalActiveStaked <= 0 || poolSizeReward <= 0) return 0;
  const yourShare = stakedUnits / totalActiveStaked;
  const dailyReward = yourShare * (poolSizeReward * DAILY_PAYOUT_PERCENTAGE / 100);
  const yearlyReward = dailyReward * 365;
  const yearlyValueUSDT = yearlyReward * REWARD_PRICE_USDT;
  const stakedValueUSDT = stakedUnits * CFT_PRICE_USDT; // Uses manual daily price
  return stakedValueUSDT > 0 ? (yearlyValueUSDT / stakedValueUSDT) * 100 : 0;
}
function calculateROI(userTotalClaimedReward, stakedUnits) {
  const totalClaimedValueUSDT = userTotalClaimedReward * REWARD_PRICE_USDT;
  const stakedValueUSDT = stakedUnits * CFT_PRICE_USDT;
  return stakedValueUSDT > 0 ? (totalClaimedValueUSDT / stakedValueUSDT) * 100 : 0;
}

/* ===================== UI (pacing between calls) ===================== */
async function updateTopBarUI(token, first = false, userData) {
  const cacheKey = `tokenUI_top_${token}_${userAddress}`;
  const cached = localStorage.getItem(cacheKey);
  let cacheData = cached ? JSON.parse(cached) : null;
  if (cacheData && Date.now() - cacheData.timestamp < CACHE_TIMEOUT_MS && !first) {
    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement(`staked-amount-${token}`, fmt(cacheData.data.stakedUnits), `staked-amount-${token}`);
    updateElement(`projected-rewards-${token}`, fmtPct(cacheData.data.apyPct), `projected-rewards-${token}`);
    updateElement(`roi-cft`, fmtPct(cacheData.data.roiPct), `roi-cft`);
    updateElement(`user-total-claimed-${token}`, `${fmt(cacheData.data.userTotalClaimed)} ${tokenDetails[token].rewardDisplayName}`, `user-total-claimed-${token}`);
    return;
  }
  try {
    if (first) {
      ['staked-amount-cft_rwd', 'projected-rewards-cft_rwd', 'roi-cft', 'user-total-claimed-cft_rwd']
        .forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    const [userTotalClaimedRaw, poolSizeRaw, totalStakedRaw, totalActiveStakedRaw] = await Promise.all([
      retryWithBackoff(() => readStakingContracts[token].methods.viewUserTotalClaimed(userAddress).call().catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.poolSize().call().catch(() => '0')),
      retryWithBackoff(() => (readStakingContracts[token].methods.getTotalStaked || readStakingContracts[token].methods.totalStaked)().call().catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.totalActiveStaked().call().catch(() => '0'))
    ]);
    await delay(CONTRACT_CALL_DELAY_MS);
    const poolSizeReward = toUnits(poolSizeRaw, d.rewardDecimals); // Reward token in pool
    const totalActiveStaked = toUnits(totalActiveStakedRaw, d.decimals); // CFT actively staked
    const stakedUnits = toUnits(userData.stakedAmount, d.decimals); // User's staked CFT
    const userTotalClaimedReward = toUnits(userTotalClaimedRaw, d.rewardDecimals); // User's total claimed reward units
    // === Accurate APY using real USD value ===
    let apyPct = 0;
    if (userData.isActive && stakedUnits > 0 && totalActiveStaked > 0 && poolSizeReward > 0) {
      apyPct = calculateAPY(stakedUnits, totalActiveStaked, poolSizeReward);
    }
    // === Accurate ROI: Reward earned / USD value of staked CFT ===
    const roiPct = calculateROI(userTotalClaimedReward, stakedUnits);
    // Cache data
    cacheData = {
      data: {
        stakedUnits: Number(stakedUnits),
        apyPct: Number(apyPct.toFixed(2)),
        roiPct: Number(roiPct.toFixed(2)),
        userTotalClaimed: Number(userTotalClaimedReward),
        isActive: Boolean(userData.isActive),
        lastClaimTimestamp: Number(userData.lastClaimTimestamp)
      },
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    // Update UI elements
    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement(`staked-amount-${token}`, fmt(stakedUnits), `staked-amount-${token}`);
    updateElement(`projected-rewards-${token}`, fmtPct(apyPct), `projected-rewards-${token}`);
    updateElement(`roi-cft`, fmtPct(roiPct), `roi-cft`);
    updateElement(`user-total-claimed-${token}`, `${fmt(userTotalClaimedReward)} ${d.rewardDisplayName}`, `user-total-claimed-${token}`);
  } catch (e) {
    console.error('updateTopBarUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['staked-amount-cft_rwd', 'projected-rewards-cft_rwd', 'roi-cft', 'user-total-claimed-cft_rwd']
      .forEach(id => {
        setSkeleton(id, false);
        const el = document.getElementById(id);
        if (el) el.textContent = id.includes('claimed') ? `0 ${tokenDetails[token].rewardDisplayName}` : '0';
      });
  }
}
async function updateActionGridUI(token, first = false, userData) {
  const cacheKey = `tokenUI_action_${token}_${userAddress}`;
  const cached = localStorage.getItem(cacheKey);
  let cacheData = cached ? JSON.parse(cached) : null;
  if (cacheData && Date.now() - cacheData.timestamp < CACHE_TIMEOUT_MS && !first) {
    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (id === `available-tokens-${token}`) el.dataset.raw = String(cacheData.data.balanceUnits);
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement(`available-tokens-${token}`, fmt(cacheData.data.balanceUnits), `available-tokens-${token}`);
    updateElement(`claimable-rewards-${token}`, `${Number(cacheData.data.isExpired ? 0 : cacheData.data.rewardUnits).toFixed(2)} ${tokenDetails[token].rewardDisplayName}`);

    const activateButton = document.getElementById(`activate-tokens-button-${token}`);
    const claimButton = document.getElementById(`claim-rewards-button-${token}`);
    if (activateButton && claimButton) {
      if (cacheData.data.isExpired || (!cacheData.data.isActive && Number(cacheData.data.stakedUnits) > 0)) {
        activateButton.style.display = 'block';
        claimButton.style.display = 'none';
        claimButton.disabled = true;
      } else {
        activateButton.style.display = 'none';
        claimButton.style.display = 'block';
        claimButton.disabled = Number(cacheData.data.rewardUnits) === 0 || Number(cacheData.data.contractBalance) < Number(cacheData.data.rewardUnits);
      }
    }
    updateClaimTimer(token, cacheData.data.timeoutSec, cacheData.data.lastClaimTimestamp, cacheData.data.isActive, cacheData.data.isWhitelisted, cacheData.data.rewardUnits, cacheData.data.contractBalance);
    return;
  }
  try {
    if (first) {
      ['available-tokens-cft_rwd', 'claimable-rewards-cft_rwd'].forEach(id => setSkeleton(id, true)); // Updated IDs
    }
    const d = tokenDetails[token];
    let pendingRewardsRaw;
    try {
      pendingRewardsRaw = await retryWithBackoff(() => readStakingContracts[token].methods.earned(userAddress).call());
      if (pendingRewardsRaw == null || isNaN(Number(pendingRewardsRaw))) {
        console.warn('Invalid pendingRewardsRaw:', pendingRewardsRaw);
        pendingRewardsRaw = '0';
      }
    } catch (error) {
      console.error('updateActionGridUI: earned call failed:', error);
      pendingRewardsRaw = '0';
      showToast({ title: 'Contract Error', body: 'Failed to fetch earned rewards; using fallback data.', variant: 'warning' });
    }
    const [timeout, contractBalanceRaw, isWhitelisted, balanceRaw] = await Promise.all([
      retryWithBackoff(() => readStakingContracts[token].methods.claimTimeout().call().catch(() => '1209600')),
      retryWithBackoff(() => readTokenContracts[token].methods.balanceOf(tokenDetails[token].stakingAddress).call().catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.whitelist(userAddress).call().catch(() => false)),
      retryWithBackoff(() => readTokenContracts[token].methods.balanceOf(userAddress).call().catch(() => '0'))
    ]);
    await delay(CONTRACT_CALL_DELAY_MS);
    const balanceUnits = toUnits(balanceRaw, d.decimals);
    let rewardUnits = toUnits(pendingRewardsRaw, d.rewardDecimals);
    const now = Math.floor(Date.now() / 1000);
    const nextClaim = (Number(userData.lastClaimTimestamp) || 0) + Number(timeout);
    const isExpired = Number(timeout) > 0 && nextClaim <= now && !userData.isActive && !isWhitelisted;
    if (isExpired) {
      rewardUnits = 0;
    }
    cacheData = {
      data: {
        balanceUnits: Number(balanceUnits),
        rewardUnits: Number(rewardUnits),
        contractBalance: Number(toUnits(contractBalanceRaw, d.rewardDecimals)),
        isWhitelisted: Boolean(isWhitelisted),
        timeoutSec: Number(timeout),
        isExpired: Boolean(isExpired),
        isActive: Boolean(userData.isActive),
        lastClaimTimestamp: Number(userData.lastClaimTimestamp),
        stakedUnits: Number(toUnits(userData.stakedAmount, d.decimals))
      },
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (id === `available-tokens-${token}`) el.dataset.raw = String(cacheData.data.balanceUnits);
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement(`available-tokens-${token}`, fmt(balanceUnits), `available-tokens-${token}`);
    updateElement(`claimable-rewards-${token}`, `${Number(isExpired ? 0 : rewardUnits).toFixed(2)} ${d.rewardDisplayName}`);
      const claimButton = document.getElementById(`claim-rewards-button-${token}`);
    const rewardsDisplay = document.getElementById(`claimable-rewards-${token}`);
    const energyHint = document.querySelector('#claimable-rewards-cft_rwd + span'); // Updated ID selector
    if (rewardsDisplay && claimButton) {
      if (isExpired) {
        rewardsDisplay.innerHTML = `<strong>0.00 ${d.rewardDisplayName}</strong><br><small style="color:#ff5b73; font-weight:600;">Rewards Expired – Stake more CFT to resume earning ${d.rewardDisplayName}.</small>`;
        claimButton.style.display = 'none';
        if (energyHint) energyHint.style.display = 'none';
      } else {
        rewardsDisplay.textContent = `${Number(rewardUnits).toFixed(2)} ${d.rewardDisplayName}`;
        claimButton.style.display = 'block';
claimButton.disabled = Number(pendingRewardsRaw) === 0;
        if (energyHint) energyHint.style.display = 'block';
      }
    }
    updateClaimTimer(token, Number(timeout), Number(userData.lastClaimTimestamp), userData.isActive, isWhitelisted, rewardUnits, toUnits(contractBalanceRaw, d.rewardDecimals));
  } catch (e) {
    console.error('updateActionGridUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['available-tokens-cft_rwd', 'claimable-rewards-cft_rwd']
      .forEach(id => {
        setSkeleton(id, false);
        const el = document.getElementById(id);
        if (el) el.textContent = id.includes('claimable') ? `0 ${tokenDetails[token].rewardDisplayName}` : '0';
      });
  }
}
async function updateStatsGridUI(token, first = false, userData) {
  const cacheKey = `tokenUI_stats_${token}_${userAddress}`;
  const cached = localStorage.getItem(cacheKey);
  let cacheData = cached ? JSON.parse(cached) : null;
  if (cacheData && Date.now() - cacheData.timestamp < CACHE_TIMEOUT_MS && !first) {
    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement('pool-size', `${fmt(cacheData.data.poolSize)} ${tokenDetails[token].rewardDisplayName}`, 'pool-size');
    updateElement('daily-payout', '1.00% / day', 'daily-payout');
    updateElement('your-next-payout', `${fmt(cacheData.data.yourNextPayout)} ${tokenDetails[token].rewardDisplayName}`, 'your-next-payout');
    return;
  }
  try {
    if (first) {
      ['pool-size', 'daily-payout', 'your-next-payout'].forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    const [poolSizeRaw, totalStakedRaw, totalActiveStakedRaw] = await Promise.all([
      retryWithBackoff(() => readStakingContracts[token].methods.poolSize().call().catch(() => '0')),
      retryWithBackoff(() => (readStakingContracts[token].methods.getTotalStaked || readStakingContracts[token].methods.totalStaked)().call().catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.totalActiveStaked().call().catch(() => '0'))
    ]);
    await delay(CONTRACT_CALL_DELAY_MS);
    const poolSize = toUnits(poolSizeRaw, d.rewardDecimals);
    const totalStaked = toUnits(totalStakedRaw, d.decimals);
    const totalActiveStaked = toUnits(totalActiveStakedRaw, d.decimals);
    const stakedUnits = toUnits(userData.stakedAmount, d.decimals);
    const dailyPayoutPct = DAILY_PAYOUT_PERCENTAGE; // Use constant
    let yourNextPayout = stakedUnits > 0 && totalActiveStaked > 0 && userData.isActive ? (stakedUnits / totalActiveStaked) * (poolSize * dailyPayoutPct / 100) : 0;
    if (!userData.isActive) yourNextPayout = 0;
    cacheData = {
      data: {
        poolSize: Number(poolSize),
        dailyPctRaw: 100, // Store as 100 for 1% to maintain consistency
        yourNextPayout: Number(yourNextPayout),
        stakedUnits: Number(stakedUnits),
        isActive: Boolean(userData.isActive)
      },
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(serializeBigInt(cacheData)));
    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement('pool-size', `${fmt(poolSize)} ${d.rewardDisplayName}`, 'pool-size');
    updateElement('daily-payout', '1.00% / day', 'daily-payout');
    updateElement('your-next-payout', `${fmt(yourNextPayout)} ${d.rewardDisplayName}`, 'your-next-payout');
  } catch (e) {
    console.error('updateStatsGridUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['pool-size', 'daily-payout', 'your-next-payout'].forEach(id => {
      setSkeleton(id, false);
      const el = document.getElementById(id);
      if (el) el.textContent = id.includes('daily-payout') ? '1.00% / day' : `0 ${tokenDetails[token].rewardDisplayName}`;
    });
  }
}
async function updateUI(token, first = false, userData) {
  // Prioritize action grid and top bar for faster initial render
  await Promise.all([
    updateTopBarUI(token, first, userData),
    updateActionGridUI(token, first, userData)
  ]);
  await delay(CONTRACT_CALL_DELAY_MS * 2); // Longer delay before stats to spread load
  await updateStatsGridUI(token, first, userData);
}
function updateClaimTimer(token, timeoutSec, lastClaimTs, isActive, isWhitelisted, initialRewards = '0', initialBalance = '0') {
  const timerEl = document.getElementById('next-claim-timer');
  const claimBtn = document.getElementById('claim-rewards-button-cft_rwd');
  const rewardsDisplay = document.getElementById('claimable-rewards-cft_rwd');
  if (!timerEl || !claimBtn) {
    console.warn('updateClaimTimer: Required elements not found in DOM');
    return;
  }
  // Clear any existing interval
  if (timerEl._claimInterval) {
    clearInterval(timerEl._claimInterval);
    timerEl._claimInterval = null;
  }
  let cachedRewards = initialRewards;
  let cachedBalance = initialBalance;
  let cacheTimestamp = Date.now();
  // === Whitelisted users: no timer, always claimable ===
  if (isWhitelisted) {
    timerEl.textContent = 'Whitelisted';
    timerEl.classList.remove('inactive');
    claimBtn.disabled = Number(cachedRewards) === 0 || toUnits(cachedBalance, tokenDetails[token].rewardDecimals) < toUnits(cachedRewards, tokenDetails[token].rewardDecimals);
    claimBtn.style.display = 'block';
    return;
  }
  // === Inactive staker: no rewards accruing ===
  if (!isActive) {
    timerEl.textContent = 'Inactive';
    timerEl.classList.add('inactive');
    claimBtn.disabled = true;
    claimBtn.style.display = 'none';
    return;
  }
  // === No timeout set (should not happen) ===
  if (!timeoutSec || timeoutSec <= 0) {
    timerEl.textContent = '—';
    timerEl.classList.add('inactive');
    claimBtn.disabled = true;
    claimBtn.style.display = 'none';
    return;
  }
  const nextClaimTime = (Number(lastClaimTs) || 0) + Number(timeoutSec);
  const d = tokenDetails[token];
  const formatTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${days ? days + 'd ' : ''}${(hours || days) ? hours + 'h ' : ''}${minutes}m ${secs}s`;
  };
  const tick = async () => {
    if (timerEl._paused) return;
    const now = Math.floor(Date.now() / 1000);
    const remaining = Math.max(0, nextClaimTime - now);
    let pendingRewards = cachedRewards;
    let contractBalanceRaw = cachedBalance;
    // Refresh from chain every CACHE_TIMEOUT_MS (120 seconds)
    if (Date.now() - cacheTimestamp >= CACHE_TIMEOUT_MS) {
      try {
        pendingRewards = await retryWithBackoff(() =>
          readStakingContracts[token].earned(userAddress).call()
        );
        if (pendingRewards == null || isNaN(Number(pendingRewards))) {
          pendingRewards = '0';
        }
      } catch (err) {
        console.warn('Failed to refresh earned rewards:', err);
        pendingRewards = '0';
      }
      try {
        contractBalanceRaw = await retryWithBackoff(() =>
          readTokenContracts[token].balanceOf(d.stakingAddress).call()
        ).catch(() => '0');
      } catch (err) {
        console.warn('Failed to refresh contract balance:', err);
        contractBalanceRaw = '0';
      }
      cachedRewards = pendingRewards;
      cachedBalance = contractBalanceRaw;
      cacheTimestamp = Date.now();
    }
    const pendingUnits = toUnits(pendingRewards, d.rewardDecimals);
    const contractBalanceUnits = toUnits(contractBalanceRaw, d.rewardDecimals);
    if (remaining === 0) {
      // Timer expired
      clearInterval(timerEl._claimInterval);
      timerEl._claimInterval = null;
      timerEl.textContent = 'Expired';
      timerEl.classList.add('inactive');
      claimBtn.style.display = 'none';
      if (rewardsDisplay) {
        rewardsDisplay.innerHTML = `
          <strong>0.00 ${d.rewardDisplayName}</strong><br>
          <small style="color:#ff5b73; font-weight:600;">
            Rewards Expired – Stake more CFT to resume earning ${d.rewardDisplayName}.
          </small>`;
      }
      // Reset APY and next payout
      const apyEl = document.getElementById('projected-rewards-cft_rwd');
      if (apyEl) apyEl.textContent = '0.00%';
      const nextPayoutEl = document.getElementById('your-next-payout');
      if (nextPayoutEl) nextPayoutEl.textContent = `0 ${d.rewardDisplayName}`;
    } else {
      // Still counting down
      timerEl.textContent = formatTime(remaining);
      timerEl.classList.remove('inactive');
      claimBtn.disabled = pendingUnits === 0 || contractBalanceUnits < pendingUnits;
      claimBtn.style.display = 'block';
    }
  };
  // Initial tick
  tick();
  // Update every 5 seconds
  timerEl._claimInterval = setInterval(tick, 5000);
}

/* ===================== Core ===================== */
async function initialize() {
  const connectButton = document.getElementById('connect-button');
  if (connectButton) { connectButton.addEventListener('click', connectWallet); }
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(t => new bootstrap.Tooltip(t));
  document.querySelectorAll('[data-fill]')?.forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = Number(btn.dataset.fill || '0');
      const availEl = document.getElementById('available-tokens-cft_rwd');
      const input = document.getElementById('stake-amount-cft_rwd');
      const available = Number((availEl?.dataset.raw) || availEl?.textContent?.replace(/[^0-9.]/g,'') || '0');
      if (input) input.value = (available * pct).toFixed(6);
    });
  });
  const isTronLinkInstalled = await checkTronLinkInstalled();
  if (isTronLinkInstalled && window.tronLink && window.tronLink.ready) {
    try { await initializeTronWeb(); } catch (e) { showToast({ title:'Auto-connect failed', body:e.message, variant:'danger' }); }
  }
}
function checkTronLinkInstalled() {
  return new Promise(resolve => {
    let attempts = 0; const maxAttempts = 5;
    const interval = setInterval(() => {
      attempts++;
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) { clearInterval(interval); resolve(true); }
      else if (attempts >= maxAttempts) { clearInterval(interval); resolve(false); }
    }, 500);
  });
}
async function connectWallet() {
  try {
    if (!window.tronLink) throw new Error('TronLink is not detected. Install or unlock TronLink.');
    if (!window.tronLink.ready) throw new Error('TronLink is not ready. Unlock TronLink and select mainnet.');
    await window.tronLink.request({ method:'tron_requestAccounts' });
    await initializeTronWeb();
  } catch (e) { showToast({ title:'Wallet', body:e.message, variant:'danger' }); }
}

/* ===================== Actions (stake/unstake/claim/activate) ===================== */
async function stakeTokens(token, amount) {
  let processingModal = null;
  const stakeBtn = document.getElementById(`stake-button-${token}`);
  const timerEl = document.getElementById('next-claim-timer');
  const run = async () => {
    try {
      if (timerEl) timerEl._paused = true;
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
      const balanceRaw = await retryWithBackoff(() => tokenContract.methods.balanceOf(userAddress).call());
      await delay(CONTRACT_CALL_DELAY_MS);
      if (BigInt(balanceRaw) < amountToStake) throw new Error('Insufficient balance to stake.');
      const allowanceRaw = await retryWithBackoff(() => tokenContract.methods.allowance(userAddress, stakingContractAddress).call());
      await delay(CONTRACT_CALL_DELAY_MS);
      const allowance = BigInt(allowanceRaw);
      const approvalRequired = allowance < amountToStake;
      let energyCheckResult = approvalRequired
        ? await checkUserEnergy(userAddress, token, 'stake', 30000)
        : await checkUserEnergy(userAddress, token, 'stake');
      let { availableEnergy, shortfall, requiredEnergy } = energyCheckResult;
      if (shortfall > 0) {
        const totalRequired = shortfall + SAFETY_ENERGY;
        if (await checkDelegatorEnergy(totalRequired)) {
          const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy, approvalRequired ? ' (incl. ~30,000 for approval)' : '');
          if (modalResult.rent) {
            processingModal = showProcessingModal('(1/2)');
            await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
            await delay(5000);
            hideProcessingModal(processingModal);
          }
        }
      }
      processingModal = showProcessingModal('(2/2)');
      if (approvalRequired) {
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
      // Clear caches and fetch fresh user data
      ['top', 'action', 'stats', `user_${token}_${userAddress}`].forEach(section => localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`));
      let newUserData;
      try {
        newUserData = await retryWithBackoff(() => stakingContracts[token].methods.users(userAddress).call());
        console.debug('stakeTokens: new userData fetched:', newUserData);
      } catch (error) {
        console.error('stakeTokens: failed to fetch new userData:', error);
        newUserData = {
          stakedAmount: '0',
          isActive: false,
          lastClaimTimestamp: '0',
          totalClaimed: '0',
          rewards: '0',
          userRewardPerTokenPaid: '0'
        };
        showToast({ title: 'Data Fetch Error', body: 'Failed to fetch updated user data; using fallback.', variant: 'warning' });
      }
      // Update cache with new user data
      const updatedCache = {
        data: {
          stakedAmount: newUserData.stakedAmount,
          isActive: newUserData.isActive,
          lastClaimTimestamp: newUserData.lastClaimTimestamp,
          totalClaimed: newUserData.totalClaimed,
          rewards: newUserData.rewards,
          userRewardPerTokenPaid: newUserData.userRewardPerTokenPaid
        },
        timestamp: Date.now()
      };
      localStorage.setItem(`tokenUI_user_${token}_${userAddress}`, JSON.stringify(serializeBigInt(updatedCache)));
      // Force UI refresh after delay
      await delay(UI_REFRESH_DELAY_MS);
      await updateUI(token, true, newUserData);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({ title:'Stake error', body:e.message, variant:'danger' });
    } finally {
      if (timerEl) timerEl._paused = false;
    }
  };
  return withLoading(stakeBtn, 'Staking...', run)();
}
async function unstakeTokens(token) {
  let processingModal = null;
  const btn = document.getElementById(`unstake-button-${token}`);
  const timerEl = document.getElementById('next-claim-timer');
  const run = async () => {
    try {
      if (timerEl) timerEl._paused = true;
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
      if (!unstakeAmount || isNaN(unstakeAmount) || Number(unstakeAmount) <= 0) throw new Error('Enter a valid amount to withdraw.');
      // Check for pending rewards
      let pendingRewardsRaw;
      try {
        pendingRewardsRaw = await retryWithBackoff(() => {
          const contract = tronWeb.contract(stakingContractAbi, tokenDetails[token].stakingAddress);
          return contract.methods.earned(userAddress).call();
        });
        if (pendingRewardsRaw == null || isNaN(Number(pendingRewardsRaw))) {
          pendingRewardsRaw = '0';
        }
      } catch (error) {
        console.error('unstakeTokens: earned call failed:', error);
        pendingRewardsRaw = '0';
      }
      const rewardUnits = toUnits(pendingRewardsRaw, tokenDetails[token].rewardDecimals);
      if (rewardUnits > 0) {
        const proceed = await showRewardWarningModal(rewardUnits, tokenDetails[token].rewardDisplayName);
        if (!proceed) {
          throw new Error('Withdrawal cancelled. Please claim your rewards first.');
        }
      }
      const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'unstake');
      if (shortfall > 0) {
        const totalRequired = shortfall + SAFETY_ENERGY;
        if (await checkDelegatorEnergy(totalRequired)) {
          const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
          if (modalResult.rent) {
            processingModal = showProcessingModal('(1/2)');
            await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
            await delay(5000);
            hideProcessingModal(processingModal);
          }
        }
      }
      processingModal = showProcessingModal('(2/2)');
      const amountToUnstake = toWei(unstakeAmount, tokenDetails[token].decimals);
      const stakingContract = stakingContracts[token];
      const userData = await retryWithBackoff(() => stakingContract.methods.users(userAddress).call());
      await delay(CONTRACT_CALL_DELAY_MS);
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
      // Clear caches and fetch fresh user data
      ['top', 'action', 'stats', `user_${token}_${userAddress}`].forEach(section => localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`));
      let newUserData;
      try {
        newUserData = await retryWithBackoff(() => stakingContracts[token].methods.users(userAddress).call());
        console.debug('unstakeTokens: new userData fetched:', newUserData);
      } catch (error) {
        console.error('unstakeTokens: failed to fetch new userData:', error);
        newUserData = {
          stakedAmount: '0',
          isActive: false,
          lastClaimTimestamp: '0',
          totalClaimed: '0',
          rewards: '0',
          userRewardPerTokenPaid: '0'
        };
        showToast({ title: 'Data Fetch Error', body: 'Failed to fetch updated user data; using fallback.', variant: 'warning' });
      }
      // Update cache with new user data
      const updatedCache = {
        data: {
          stakedAmount: newUserData.stakedAmount,
          isActive: newUserData.isActive,
          lastClaimTimestamp: newUserData.lastClaimTimestamp,
          totalClaimed: newUserData.totalClaimed,
          rewards: newUserData.rewards,
          userRewardPerTokenPaid: newUserData.userRewardPerTokenPaid
        },
        timestamp: Date.now()
      };
      localStorage.setItem(`tokenUI_user_${token}_${userAddress}`, JSON.stringify(serializeBigInt(updatedCache)));
      // Force UI refresh after delay
      await delay(UI_REFRESH_DELAY_MS);
      await updateUI(token, true, newUserData);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({ title:'Withdraw error', body:e.message, variant:'danger' });
    } finally {
      if (timerEl) timerEl._paused = false;
    }
  };
  return withLoading(btn, 'Withdrawing...', run)();
}
async function claimRewards(token) {
  let processingModal = null;
  const btn = document.getElementById('claim-rewards-button-cft_rwd');
  const timerEl = document.getElementById('next-claim-timer');
  const run = async () => {
    try {
      if (timerEl) timerEl._paused = true;
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) {
        throw new Error('Invalid staking address');
      }
      if (!userAddress || !isValidTronAddress(userAddress)) {
        throw new Error('Invalid user address. Please reconnect your wallet.');
      }
      // Energy check for claim
      const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'claimRewards');
      if (shortfall > 0) {
        const totalRequired = shortfall + SAFETY_ENERGY;
        const hasDelegatorEnergy = await checkDelegatorEnergy(totalRequired);
        if (hasDelegatorEnergy) {
          const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
          if (modalResult.rent) {
            processingModal = showProcessingModal('(1/2)');
            await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
            await delay(5000); // Wait for energy delegation
            hideProcessingModal(processingModal);
          } else {
            throw new Error('Energy rental cancelled.');
          }
        } else {
          throw new Error('Insufficient energy and no rental available.');
        }
      }
      processingModal = showProcessingModal('(2/2)');
      // Use pre-initialized contract instance for better reliability
      const stakingContract = stakingContracts[token];
      // Fetch pending rewards (use initialized contract)
      let pendingRewards;
      try {
        pendingRewards = await retryWithBackoff(() => stakingContract.earned(userAddress).call());
        if (pendingRewards == null || isNaN(Number(pendingRewards))) {
          pendingRewards = '0';
        }
      } catch (err) {
        console.error('Failed to fetch earned rewards:', err);
        pendingRewards = '0';
      }
      if (BigInt(pendingRewards) === 0n) {
        throw new Error('No rewards available to claim.');
      }
     
      // Check contract's reward token balance
const d = tokenDetails[token]; // ← Add this line


      // Build and send claim transaction
      const claimTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress,
        'claimRewards()',
        {},
        [],
        userAddress
      );
      if (!claimTx.result || !claimTx.transaction) {
        throw new Error('Failed to create claim transaction.');
      }
      const signedClaimTx = await tronWeb.trx.sign(claimTx.transaction);
      const broadcastClaim = await tronWeb.trx.sendRawTransaction(signedClaimTx);
      if (!broadcastClaim.result) {
        throw new Error('Failed to broadcast claim transaction. Please try again.');
      }
      showToast({
        title: 'Rewards Claimed Successfully!',
        body: `<a href="https://tronscan.org/#/transaction/${broadcastClaim.txid}" target="_blank" rel="noopener">View on Tronscan</a>`,
        variant: 'success'
      });
      hideProcessingModal(processingModal);
      // === Post-claim: Refresh data and UI ===
      // Clear all relevant caches
      ['top', 'action', 'stats', `user_${token}_${userAddress}`].forEach(section =>
        localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`)
      );
      // Fetch fresh user data from contract
      let newUserData;
      try {
        newUserData = await retryWithBackoff(() => stakingContract.users(userAddress).call());
        console.debug('claimRewards: fresh userData fetched:', newUserData);
      } catch (error) {
        console.error('claimRewards: failed to fetch new userData:', error);
        newUserData = {
          stakedAmount: '0',
          isActive: false,
          lastClaimTimestamp: '0',
          totalClaimed: '0',
          rewards: '0',
          userRewardPerTokenPaid: '0'
        };
        showToast({
          title: 'Data Refresh Warning',
          body: 'Claim successful, but failed to update user data. UI may be slightly outdated.',
          variant: 'warning'
        });
      }
      // Update user cache
      const updatedCache = {
        data: {
          stakedAmount: newUserData.stakedAmount,
          isActive: newUserData.isActive,
          lastClaimTimestamp: newUserData.lastClaimTimestamp,
          totalClaimed: newUserData.totalClaimed,
          rewards: newUserData.rewards,
          userRewardPerTokenPaid: newUserData.userRewardPerTokenPaid
        },
        timestamp: Date.now()
      };
      localStorage.setItem(
        `tokenUI_user_${token}_${userAddress}`,
        JSON.stringify(serializeBigInt(updatedCache))
      );
      // Force full UI refresh after short delay
      await delay(UI_REFRESH_DELAY_MS);
      await updateUI(token, true, newUserData);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({
        title: 'Claim Failed',
        body: e.message || 'An unknown error occurred.',
        variant: 'danger'
      });
      console.error('claimRewards error:', e);
    } finally {
      if (timerEl) timerEl._paused = false;
    }
  };
  return withLoading(btn, 'Claiming...', run)();
}
/* ===================== Events ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const key = 'cft_rwd';
  const stakeButton = document.getElementById(`stake-button-${key}`);
  if (stakeButton) {
    stakeButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const amount = document.getElementById(`stake-amount-${key}`).value;
      await stakeTokens(key, amount);
    });
  }
  const unstakeButton = document.getElementById(`unstake-button-${key}`);
  if (unstakeButton) {
    unstakeButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await unstakeTokens(key);
    });
  }
  const claimButton = document.getElementById('claim-rewards-button-cft_rwd'); // Fixed ID
  if (claimButton) {
    claimButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await claimRewards(key);
    });
  }
  initialize();
});
