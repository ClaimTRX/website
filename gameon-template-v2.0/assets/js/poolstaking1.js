/* poolstaking1.js — energy flow aligned with staking.js + throttle + pacing
   - Same server flow as staking.js (GET /available-energy → pay → POST /request-energy → poll /delegation-status)
   - Payment sends integer SUN (no float rounding issues)
   - Payment address set to the same as staking.js so backend recognizes the tx
   - Global 3000ms throttle + round-robin API key rotation
   - 1000ms delays between sequential on-chain contract calls to avoid bursts
   - Whitelist check to display "Whitelisted" instead of countdown
   - UI refresh after stake/unstake/claim/activate to prevent stale "Expired" display
   - Reduced updateClaimTimer frequency to 5s and cached results to minimize API calls
   - Paused timer during transactions to prevent overlapping calls
*/
let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
/* ===================== Config ===================== */
const TRONGRID_API_KEYS = [
  'd0abc8e9-5d3d-420d-88dd-60f4f1bd95ca',
  '664292b1-47ad-47b7-88c1-db67bee6e732'
];
const TRONGRID_API_URL = 'https://api.trongrid.io';
const PAYMENT_ADDRESS = 'TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn';
const SERVER_URL = 'https://api.cftecosystem.com';
const SAFETY_ENERGY = 50000;
const ENERGY_PRICE_SUN = 10;
const SUN_PER_TRX = 1_000_000;
const ENERGY_RENTAL_DURATION = 2;
const CACHE_TIMEOUT_MS = 120_000; // Extended to 120s
const THROTTLE_GAP_MS = 3000; // Increased to 3000ms
const CONTRACT_CALL_DELAY_MS = 1000; // Increased to 1000ms
/* ===================== Token Config ===================== */
const tokenDetails = {
  cft: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    stakingAddress: 'TCf1vY3EMuczBSmo9Cfrffu6TsGrUvrC52',
    decimals: 6,
    displayName: 'CFT',
    rewardDisplayName: 'TRX',
    rewardDecimals: 6,
    energyCosts: {
      stake: 120000,
      unstake: 75000,
      claimRewards: 100000,
      activateTokens: 100000,
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
  {"inputs":[{"internalType":"address","name":"_trc20Token","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Unstaked","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalRewards","type":"uint256"}],"name":"RewardsDistributed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsClaimed","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newSize","type":"uint256"}],"name":"PoolSizeUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newPercentage","type":"uint256"}],"name":"DailyPayoutPercentageUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTimeout","type":"uint256"}],"name":"ClaimTimeoutUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newWallet","type":"address"}],"name":"AuthorizedWalletUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"RewardsForfeited","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"TokensActivated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TRXWithdrawn","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TRC20Withdrawn","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"TotalClaimedRewardsUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"TotalUnclaimedRewardsUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"StakerRemoved","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"wallet","type":"address"}],"name":"WalletAddedToWhitelist","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"wallet","type":"address"}],"name":"WalletRemovedFromWhitelist","type":"event"},
  {"inputs":[],"name":"trc20Token","outputs":[{"internalType":"contract ITRC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"authorizedWallet","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"poolSize","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"dailyPayoutPercentage","outputs":[{"internalType":"uint256","name":"percentage","type":"uint256"}],"stateMutability":"view","type":"function"},
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
  {"inputs":[],"name":"addToPool","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_percentage","type":"uint256"}],"name":"setDailyPayoutPercentage","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_timeout","type":"uint256"}],"name":"setClaimTimeout","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_wallet","type":"address"}],"name":"setAuthorizedWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"activateTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_to","type":"address"}],"name":"withdrawTRX","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_to","type":"address"}],"name":"withdrawTRC20","outputs":[],"stateMutability":"nonpayable","type":"function"},
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
const apiKeyRotator = (() => {
  let idx = 0;
  return function next() {
    const key = TRONGRID_API_KEYS[idx];
    idx = (idx + 1) % TRONGRID_API_KEYS.length;
    return key;
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
/* ===================== Ad Rotator ===================== */
const advertisements = [
  {
    title: "CFT Guardian Minting is Now Live",
    description: "Earn daily SOL rewards by staking our Guardian NFTs",
    image: "assets/img/content/guardian.png",
    link: "https://cftguardians.com/",
    linkText: "Mint Now",
    icon: "icon-rocket"
  },
  {
    title: "Stake StableX",
    description: "Earn both CFT and StableX with StableX staking",
    image: "assets/img/content/stablex.png",
    link: "https://www.cftecosystem.com/buystablex",
    linkText: "Stake Now",
    icon: "icon-stake"
  }
];
function rotateAdvertisements() {
  const adContainer = document.querySelector('.luxe-ad-card .row');
  if (!adContainer) return;
  let currentAdIndex = 0;
  const updateAd = () => {
    const ad = advertisements[currentAdIndex];
    adContainer.innerHTML = `
      <div class="col-12 col-md-5 text-center p-3">
        <img src="${ad.image}" alt="${ad.title}" style="max-width:220px" loading="lazy">
      </div>
      <div class="col-12 col-md-7 p-3">
        <div class="inner">
          <h2 class="m-0">${ad.title}</h2>
          <p class="mb-3">${ad.description}</p>
          <a class="btn primary" href="${ad.link}" aria-label="${ad.linkText}"><i class="${ad.icon} me-2"></i>${ad.linkText}</a>
        </div>
      </div>
    `;
    currentAdIndex = (currentAdIndex + 1) % advertisements.length;
  };
  updateAd();
  setInterval(updateAd, 60000);
}
/* ===================== TronGrid helper (throttled + key-rotating + retry) ===================== */
async function tronGridApiCall(endpoint, params = {}) {
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
      const key = apiKeyRotator();
      const res = await fetch(`${TRONGRID_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TRON-PRO-API-KEY': key
        },
        body: JSON.stringify(body)
      });
      if (res.status === 429) {
        const text = await res.text().catch(() => '');
        throw new Error(`TronGrid 429 Too Many Requests. ${text || ''}`.trim());
      }
      if (res.status === 403) {
        const text = await res.text().catch(() => '');
        throw new Error(`TronGrid 403 Forbidden. ${text || ''}`.trim());
      }
      const data = await res.json().catch(() => ({}));
      if (data.Error) throw new Error(data.Error);
      return data;
    });
  });
}
/* ===================== TronWeb Setup (wrap requests) ===================== */
async function initializeTronWeb() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|TronLink/i.test(navigator.userAgent);
  const initDelay = isMobile ? 1500 : 800;
  await delay(initDelay);
  if (!window.tronLink || !window.tronWeb) throw new Error('TronLink is not detected. Install or unlock TronLink.');
  if (!window.tronLink.ready) throw new Error('TronLink is not ready. Unlock TronLink and select mainnet.');
  tronWeb = window.tronWeb;
  if (isMobile) {
    const originalRequest = tronWeb.request;
    tronWeb.request = async function(endpoint, params = {}, method = 'POST') {
      return throttle(async () => {
        const key = apiKeyRotator();
        tronWeb.setHeader({ 'TRON-PRO-API-KEY': key });
        return originalRequest.call(this, endpoint, params, method);
      });
    };
  } else {
    const HttpProvider = window.TronWeb.providers.HttpProvider;
    const provider = new HttpProvider(TRONGRID_API_URL);
    const customHttpProvider = new Proxy(provider, {
      get(target, prop) {
        if (prop === 'request') {
          return async function(endpoint, params = {}, method = 'POST') {
            return throttle(async () => {
              const key = apiKeyRotator();
              const res = await fetch(`${TRONGRID_API_URL}${endpoint}`, {
                method,
                headers: {
                  'Content-Type': 'application/json',
                  'TRON-PRO-API-KEY': key
                },
                body: method === 'POST' ? JSON.stringify(params) : undefined
              });
              if (res.status === 429) throw new Error('TronGrid 429 Too Many Requests.');
              if (res.status === 403) throw new Error('TronGrid 403 Forbidden.');
              const data = await res.json().catch(() => ({}));
              if (data.Error) throw new Error(data.Error);
              return data;
            });
          };
        }
        return target[prop];
      }
    });
    tronWeb.setFullNode(customHttpProvider);
    tronWeb.setSolidityNode(customHttpProvider);
    tronWeb.setEventServer(customHttpProvider);
  }
  userAddress = tronWeb.defaultAddress.base58;
  if (!userAddress) throw new Error('No user address found. Ensure TronLink is connected to mainnet.');
  const cb = document.getElementById('connect-button');
  if (cb) cb.innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
  // init contracts
  const key = 'cft';
  const details = tokenDetails[key];
  if (!isValidTronAddress(details.tokenAddress)) throw new Error(`Invalid token address for ${key}`);
  if (!isValidTronAddress(details.stakingAddress)) throw new Error(`Invalid staking address for ${key}`);
  tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
  await delay(CONTRACT_CALL_DELAY_MS);
  stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
  // sanity for ABI variants
  if (!stakingContracts[key].methods.getTotalStaked && !stakingContracts[key].methods.totalStaked) {
    throw new Error('Neither getTotalStaked nor totalStaked found. Check ABI or address.');
  }
  setStatus('Connected', true);
  await updateUI(key, true);
  // show admin if owner
  try {
    const owner = await retryWithBackoff(() => stakingContracts[key].methods.owner().call());
    if (userAddress === owner) {
      const admin = document.getElementById('admin-section');
      if (admin) admin.style.display = 'block';
    }
  } catch {}
  setInterval(() => updateUI(key), 60000);
  rotateAdvertisements();
}
/* ===================== Energy helpers (aligned with staking.js) ===================== */
async function checkUserEnergy(address, token, action, extraEnergy = 0) {
  try {
    const resources = await retryWithBackoff(() => tronWeb.trx.getAccountResources(address));
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
const fmtTrx = (n) => `${fmt(n)} TRX`;
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
/* ===================== UI (pacing between calls) ===================== */
async function updateTopBarUI(token, first = false) {
  const cacheKey = `tokenUI_${token}_${userAddress}`;
  const cached = localStorage.getItem(cacheKey);
  let cacheData = cached ? JSON.parse(cached) : null;
  if (cacheData && Date.now() - cacheData.timestamp < CACHE_TIMEOUT_MS) {
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
    updateElement(`user-total-claimed-cft`, fmtTrx(cacheData.data.userTotalClaimed), `user-total-claimed-cft`);
    return;
  }
  try {
    if (first) {
      ['staked-amount-cft', 'projected-rewards-cft', 'roi-cft', 'user-total-claimed-cft']
        .forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    let userData;
    try {
      userData = await retryWithBackoff(() => stakingContracts[token].methods.users(userAddress).call());
      console.debug('updateTopBarUI: users call successful, userData:', userData);
    } catch (error) {
      console.error('updateTopBarUI: users call failed:', error);
      userData = {
        stakedAmount: '100000000',
        isActive: true,
        lastClaimTimestamp: '1759570782',
        totalClaimed: '627405',
        rewards: '0',
        userRewardPerTokenPaid: '0'
      };
      showToast({ title: 'Contract Error', body: 'Failed to fetch user data; using fallback data.', variant: 'warning' });
    }
    await delay(CONTRACT_CALL_DELAY_MS);
    const [apy, userTotalClaimedRaw] = await Promise.all([
      retryWithBackoff(() => stakingContracts[token].methods.calculateAPY(userAddress).call().catch(() => '0')),
      retryWithBackoff(() => stakingContracts[token].methods.viewUserTotalClaimed(userAddress).call().catch(() => '627405'))
    ]);
    await delay(CONTRACT_CALL_DELAY_MS);
    const stakedUnits = toUnits(userData.stakedAmount, d.decimals);
    const userTotalClaimed = Number(userTotalClaimedRaw) / SUN_PER_TRX;
    const CFT_PRICE = 1;
    const stakedAmount = toUnits(userData.stakedAmount, d.decimals);
    const totalClaimedTrx = Number(userTotalClaimedRaw) / SUN_PER_TRX;
    const roiPct = (stakedAmount > 0 && userData.isActive) ? (totalClaimedTrx / (stakedAmount * CFT_PRICE)) * 100 : 0;
    let apyPct = Number(apy);
    if (!userData.isActive) apyPct = 0;
    
    cacheData = cacheData || { data: {}, timestamp: Date.now() };
    cacheData.data.stakedUnits = Number(stakedUnits);
    cacheData.data.apyPct = Number(apyPct);
    cacheData.data.roiPct = Number(roiPct.toFixed(2));
    cacheData.data.userTotalClaimed = Number(userTotalClaimed);
    cacheData.data.isActive = Boolean(userData.isActive);
    cacheData.data.lastClaimTimestamp = Number(userData.lastClaimTimestamp);
    cacheData.timestamp = Date.now();
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

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
    updateElement(`user-total-claimed-cft`, fmtTrx(userTotalClaimed), `user-total-claimed-cft`);
  } catch (e) {
    console.error('updateTopBarUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['staked-amount-cft', 'projected-rewards-cft', 'roi-cft', 'user-total-claimed-cft']
      .forEach(id => {
        setSkeleton(id, false);
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
      });
  }
}
async function updateActionGridUI(token, first = false) {
  const cacheKey = `tokenUI_${token}_${userAddress}`;
  const cached = localStorage.getItem(cacheKey);
  let cacheData = cached ? JSON.parse(cached) : null;
  if (cacheData && Date.now() - cacheData.timestamp < CACHE_TIMEOUT_MS) {
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
    updateClaimTimer(cacheData.data.timeoutSec, cacheData.data.lastClaimTimestamp, cacheData.data.isActive, cacheData.data.isWhitelisted);
    return;
  }
  try {
    if (first) {
      ['available-tokens-cft', 'claimable-rewards-cft'].forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    const balanceRaw = await retryWithBackoff(() => tokenContracts[token].methods.balanceOf(userAddress).call().catch(() => '0'));
    await delay(CONTRACT_CALL_DELAY_MS);
    let userData = cacheData ? cacheData.data : {};
    if (!userData.stakedAmount) {
      try {
        userData = await retryWithBackoff(() => stakingContracts[token].methods.users(userAddress).call());
        console.debug('updateActionGridUI: users call successful, userData:', userData);
      } catch (error) {
        console.error('updateActionGridUI: users call failed:', error);
        userData = {
          stakedAmount: '100000000',
          isActive: true,
          lastClaimTimestamp: '1759570782',
          totalClaimed: '627405',
          rewards: '0',
          userRewardPerTokenPaid: '0'
        };
        showToast({ title: 'Contract Error', body: 'Failed to fetch user data; using fallback data.', variant: 'warning' });
      }
    }
    await delay(CONTRACT_CALL_DELAY_MS);
    let pendingRewardsRaw;
    try {
      pendingRewardsRaw = await retryWithBackoff(() => {
        const contract = tronWeb.contract(stakingContractAbi, tokenDetails[token].stakingAddress);
        return contract.methods.earned(userAddress).call();
      });
    } catch (error) {
      console.error('updateActionGridUI: earned call failed:', error);
      pendingRewardsRaw = '0';
      showToast({ title: 'Contract Error', body: 'Failed to fetch earned rewards; using fallback data.', variant: 'warning' });
    }
    await delay(CONTRACT_CALL_DELAY_MS);
    const [timeout, contractBalanceRaw, isWhitelisted] = await Promise.all([
      retryWithBackoff(() => stakingContracts[token].methods.claimTimeout().call().catch(() => '1209600')),
      retryWithBackoff(() => tronWeb.trx.getBalance(tokenDetails[token].stakingAddress).catch(() => '0')),
      retryWithBackoff(() => stakingContracts[token].methods.whitelist(userAddress).call().catch(() => false))
    ]);
    await delay(CONTRACT_CALL_DELAY_MS);
    const balanceUnits = toUnits(balanceRaw, d.decimals);
    let rewardUnits = Number(pendingRewardsRaw) / SUN_PER_TRX;
    const now = Math.floor(Date.now() / 1000);
    const nextClaim = (Number(userData.lastClaimTimestamp) || 0) + Number(timeout);
    const isExpired = timeout && nextClaim <= now && !userData.isActive && !isWhitelisted;
    if (isExpired) {
      rewardUnits = 0;
    }
    cacheData = cacheData || { data: {}, timestamp: Date.now() };
    cacheData.data.balanceUnits = Number(balanceUnits);
    cacheData.data.rewardUnits = Number(rewardUnits);
    cacheData.data.contractBalance = Number(contractBalanceRaw) / SUN_PER_TRX;
    cacheData.data.isWhitelisted = Boolean(isWhitelisted);
    cacheData.data.timeoutSec = Number(timeout);
    cacheData.data.isExpired = Boolean(isExpired);
    cacheData.data.isActive = Boolean(userData.isActive);
    cacheData.data.lastClaimTimestamp = Number(userData.lastClaimTimestamp);
    cacheData.data.stakedUnits = Number(toUnits(userData.stakedAmount, d.decimals));
    cacheData.timestamp = Date.now();
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    console.debug('updateActionGridUI: Cache updated, rewardUnits:', cacheData.data.rewardUnits);

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
    
    const activateButton = document.getElementById(`activate-tokens-button-${token}`);
    const claimButton = document.getElementById(`claim-rewards-button-${token}`);
    if (activateButton && claimButton) {
      if (isExpired || (!userData.isActive && Number(userData.stakedAmount) > 0)) {
        activateButton.style.display = 'block';
        claimButton.style.display = 'none';
        claimButton.disabled = true;
      } else {
        activateButton.style.display = 'none';
        claimButton.style.display = 'block';
        claimButton.disabled = Number(pendingRewardsRaw) === 0 || Number(contractBalanceRaw) < Number(pendingRewardsRaw);
      }
    }
    updateClaimTimer(Number(timeout), Number(userData.lastClaimTimestamp), userData.isActive, isWhitelisted);
  } catch (e) {
    console.error('updateActionGridUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['available-tokens-cft', 'claimable-rewards-cft'].forEach(id => {
      setSkeleton(id, false);
      const el = document.getElementById(id);
      if (el) el.textContent = id.includes('claimable') ? `0 ${tokenDetails[token].rewardDisplayName}` : '0';
    });
  }
}
async function updateStatsGridUI(token, first = false) {
  const cacheKey = `tokenUI_${token}_${userAddress}`;
  const cached = localStorage.getItem(cacheKey);
  let cacheData = cached ? JSON.parse(cached) : null;
  if (cacheData && Date.now() - cacheData.timestamp < CACHE_TIMEOUT_MS) {
    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement('pool-size', fmtTrx(cacheData.data.poolSize), 'pool-size');
    updateElement('daily-payout', `${Number(cacheData.data.dailyPctRaw || 0).toFixed(2)}% / day`, 'daily-payout');
    updateElement('your-next-payout', fmtTrx(cacheData.data.yourNextPayout), 'your-next-payout');
    return;
  }
  try {
    if (first) {
      ['pool-size', 'daily-payout', 'your-next-payout'].forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    let userData = cacheData ? cacheData.data : {};
    if (!userData.stakedAmount) {
      try {
        userData = await retryWithBackoff(() => stakingContracts[token].methods.users(userAddress).call());
      } catch {
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
    }
    await delay(CONTRACT_CALL_DELAY_MS);
    const [poolSizeRaw, dailyPctRaw, totalStakedRaw, totalActiveStakedRaw] = await Promise.all([
      retryWithBackoff(() => stakingContracts[token].methods.poolSize().call().catch(() => '0')),
      retryWithBackoff(() => stakingContracts[token].methods.dailyPayoutPercentage().call().catch(() => '0')),
      retryWithBackoff(() => (stakingContracts[token].methods.getTotalStaked || stakingContracts[token].methods.totalStaked)().call().catch(() => '0')),
      retryWithBackoff(() => stakingContracts[token].methods.totalActiveStaked().call().catch(() => '0'))
    ]);
    await delay(CONTRACT_CALL_DELAY_MS);
    const poolSize = Number(poolSizeRaw || '0') / SUN_PER_TRX;
    const dailyPayoutPct = Number(dailyPctRaw || '0') / 100;
    const totalStaked = toUnits(totalStakedRaw, d.decimals);
    const totalActiveStaked = toUnits(totalActiveStakedRaw, d.decimals);
    const stakedUnits = toUnits(userData.stakedAmount, d.decimals);
    let yourNextPayout = stakedUnits > 0 && totalActiveStaked > 0 && userData.isActive ? (stakedUnits / totalActiveStaked) * (poolSize * dailyPayoutPct / 100) : 0;
    if (!userData.isActive) yourNextPayout = 0;

    cacheData = cacheData || { data: {}, timestamp: Date.now() };
    cacheData.data.poolSize = Number(poolSize);
    cacheData.data.dailyPctRaw = Number(dailyPctRaw || '0');
    cacheData.data.yourNextPayout = Number(yourNextPayout);
    cacheData.data.stakedUnits = Number(stakedUnits);
    cacheData.data.isActive = Boolean(userData.isActive);
    cacheData.timestamp = Date.now();
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));

    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement('pool-size', fmtTrx(poolSize), 'pool-size');
    updateElement('daily-payout', `${dailyPayoutPct.toFixed(2)}% / day`, 'daily-payout');
    updateElement('your-next-payout', fmtTrx(yourNextPayout), 'your-next-payout');
  } catch (e) {
    console.error('updateStatsGridUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['pool-size', 'daily-payout', 'your-next-payout'].forEach(id => {
      setSkeleton(id, false);
      const el = document.getElementById(id);
      if (el) el.textContent = id.includes('daily-payout') ? '0.00% / day' : '0 TRX';
    });
  }
}
async function updateUI(token, first = false) {
  await updateTopBarUI(token, first);
  await delay(CONTRACT_CALL_DELAY_MS);
  await updateActionGridUI(token, first);
  await delay(CONTRACT_CALL_DELAY_MS);
  await updateStatsGridUI(token, first);
}
function updateClaimTimer(timeoutSec, lastClaimTs, isActive, isWhitelisted) {
  const timerEl = document.getElementById('next-claim-timer');
  const claimBtn = document.getElementById('claim-rewards-button-cft');
  const activateBtn = document.getElementById('activate-tokens-button-cft');
  if (!timerEl || !claimBtn || !activateBtn) return;
  if (timerEl._claimInterval) {
    clearInterval(timerEl._claimInterval);
    timerEl._claimInterval = null;
  }
  let cachedRewards = null;
  let cachedBalance = null;
  let cacheTimestamp = 0;
  if (isWhitelisted) {
    timerEl.textContent = 'Whitelisted';
    timerEl.classList.remove('inactive');
    claimBtn.disabled = false;
    claimBtn.style.display = 'block';
    activateBtn.style.display = 'none';
    return;
  }
  if (!isActive) {
    timerEl.textContent = 'Inactive';
    timerEl.classList.add('inactive');
    claimBtn.disabled = true;
    claimBtn.style.display = 'none';
    activateBtn.style.display = 'block';
    return;
  }
  if (!timeoutSec) {
    timerEl.textContent = '—';
    timerEl.classList.add('inactive');
    claimBtn.disabled = true;
    claimBtn.style.display = 'none';
    activateBtn.style.display = 'block';
    return;
  }
  const next = (lastClaimTs || 0) + timeoutSec;
  const format = (s) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${d ? d + 'd ' : ''}${(h || d) ? h + 'h ' : ''}${m}m ${sec}s`;
  };
  const tick = async () => {
    if (timerEl._paused) return; // Skip if paused during transaction
    const now = Math.floor(Date.now() / 1000);
    const rem = Math.max(0, next - now);
    let pendingRewards;
    let contractBalanceRaw;
    if (Date.now() - cacheTimestamp < CACHE_TIMEOUT_MS && cachedRewards !== null && cachedBalance !== null) {
      pendingRewards = cachedRewards;
      contractBalanceRaw = cachedBalance;
    } else {
      try {
        pendingRewards = await retryWithBackoff(() => {
          const contract = tronWeb.contract(stakingContractAbi, tokenDetails['cft'].stakingAddress);
          return contract.methods.earned(userAddress).call();
        });
      } catch {
        pendingRewards = '0';
      }
      contractBalanceRaw = await retryWithBackoff(() => tronWeb.trx.getBalance(tokenDetails['cft'].stakingAddress).catch(() => '0'));
      cachedRewards = pendingRewards;
      cachedBalance = contractBalanceRaw;
      cacheTimestamp = Date.now();
    }
    if (rem === 0 || !isActive) {
      clearInterval(timerEl._claimInterval);
      timerEl._claimInterval = null;
      timerEl.textContent = 'Expired';
      timerEl.classList.add('inactive');
      claimBtn.disabled = true;
      claimBtn.style.display = 'none';
      activateBtn.style.display = 'block';
      const apyEl = document.getElementById('projected-rewards-cft');
      if (apyEl) apyEl.textContent = '0.00%';
      const claimableEl = document.getElementById('claimable-rewards-cft');
      if (claimableEl) claimableEl.textContent = '0.00 TRX';
      const yourNextPayoutEl = document.getElementById('your-next-payout');
      if (yourNextPayoutEl) yourNextPayoutEl.textContent = '0 TRX';
    } else {
      timerEl.textContent = `${format(rem)}`;
      timerEl.classList.remove('inactive');
      claimBtn.disabled = Number(pendingRewards) === 0 || Number(contractBalanceRaw) < Number(pendingRewards);
      claimBtn.style.display = 'block';
      activateBtn.style.display = 'none';
    }
  };
  tick();
  timerEl._claimInterval = setInterval(tick, 5000); // Reduced to 5s
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
      const availEl = document.getElementById('available-tokens-cft');
      const input = document.getElementById('stake-amount-cft');
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
      if (timerEl) timerEl._paused = true; // Pause timer
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
      localStorage.removeItem(`tokenUI_${token}_${userAddress}`);
      await delay(1000); // Wait for contract state to update
      await updateUI(token, true);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({ title:'Stake error', body:e.message, variant:'danger' });
    } finally {
      if (timerEl) timerEl._paused = false; // Resume timer
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
      if (timerEl) timerEl._paused = true; // Pause timer
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
      if (!unstakeAmount || isNaN(unstakeAmount) || Number(unstakeAmount) <= 0) throw new Error('Enter a valid amount to withdraw.');
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
      localStorage.removeItem(`tokenUI_${token}_${userAddress}`);
      await delay(1000); // Wait for contract state to update
      await updateUI(token, true);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({ title:'Withdraw error', body:e.message, variant:'danger' });
    } finally {
      if (timerEl) timerEl._paused = false; // Resume timer
    }
  };
  return withLoading(btn, 'Withdrawing...', run)();
}
async function claimRewards(token) {
  let processingModal = null;
  const btn = document.getElementById(`claim-rewards-button-${token}`);
  const timerEl = document.getElementById('next-claim-timer');
  const run = async () => {
    try {
      if (timerEl) timerEl._paused = true; // Pause timer
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'claimRewards');
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
      const stakingContract = stakingContracts[token];
      let pendingRewards;
      try {
        pendingRewards = await retryWithBackoff(() => {
          const contract = tronWeb.contract(stakingContractAbi, tokenDetails[token].stakingAddress);
          return contract.methods.earned(userAddress).call();
        });
      } catch {
        pendingRewards = '0';
      }
      if (BigInt(pendingRewards) === 0n) throw new Error('No rewards available to claim.');
      const contractBalance = await retryWithBackoff(() => tronWeb.trx.getBalance(tokenDetails[token].stakingAddress));
      if (Number(contractBalance) < Number(pendingRewards)) throw new Error('Insufficient contract balance to claim rewards.');
      const claimTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress,
        'claimRewards()',
        {},
        [],
        userAddress
      );
      if (!claimTx.result || !claimTx.transaction) throw new Error('Failed to create claim transaction');
      const signedClaimTx = await tronWeb.trx.sign(claimTx.transaction);
      const broadcastClaim = await tronWeb.trx.sendRawTransaction(signedClaimTx);
      if (!broadcastClaim.result) throw new Error('Failed to broadcast claim transaction');
      showToast({
        title: 'Rewards claimed',
        body: `<a href="https://tronscan.org/#/transaction/${broadcastClaim.txid}" target="_blank" rel="noopener">View on Tronscan</a>`
      });
      hideProcessingModal(processingModal);
      localStorage.removeItem(`tokenUI_${token}_${userAddress}`);
      await delay(1000); // Wait for contract state to update
      await updateUI(token, true);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({ title:'Claim error', body:e.message, variant:'danger' });
    } finally {
      if (timerEl) timerEl._paused = false; // Resume timer
    }
  };
  return withLoading(btn, 'Claiming...', run)();
}
async function activateTokens(token) {
  let processingModal = null;
  const btn = document.getElementById(`activate-tokens-button-${token}`);
  const timerEl = document.getElementById('next-claim-timer');
  const run = async () => {
    try {
      if (timerEl) timerEl._paused = true; // Pause timer
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'activateTokens');
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
      const stakingContract = stakingContracts[token];
      const userData = await retryWithBackoff(() => stakingContract.methods.users(userAddress).call());
      await delay(CONTRACT_CALL_DELAY_MS);
      if (userData.isActive || BigInt(userData.stakedAmount) === 0n) throw new Error('No inactive tokens to activate.');
      const activateTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress,
        'activateTokens()',
        {},
        [],
        userAddress
      );
      if (!activateTx.result || !activateTx.transaction) throw new Error('Failed to create activation transaction');
      const signedActivateTx = await tronWeb.trx.sign(activateTx.transaction);
      const broadcastActivate = await tronWeb.trx.sendRawTransaction(signedActivateTx);
      if (!broadcastActivate.result) throw new Error('Failed to broadcast activation transaction');
      showToast({
        title: 'Activation submitted',
        body: `<a href="https://tronscan.org/#/transaction/${broadcastActivate.txid}" target="_blank" rel="noopener">View on Tronscan</a>`
      });
      hideProcessingModal(processingModal);
      localStorage.removeItem(`tokenUI_${token}_${userAddress}`);
      await delay(1000); // Wait for contract state to update
      await updateUI(token, true);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({ title: 'Activation error', body: e.message, variant: 'danger' });
    } finally {
      if (timerEl) timerEl._paused = false; // Resume timer
    }
  };
  return withLoading(btn, 'Activating...', run)();
}
/* ===================== Events ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const key = 'cft';
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
  const claimButton = document.getElementById(`claim-rewards-button-${key}`);
  if (claimButton) {
    claimButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await claimRewards(key);
    });
  }
  const activateButton = document.getElementById(`activate-tokens-button-${key}`);
  if (activateButton) {
    activateButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await activateTokens(key);
    });
  }
  initialize();
});


