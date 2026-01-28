let tronWeb, readTronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const readStakingContracts = {};
const readTokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
/* ===================== Config ===================== */
const CHAINSTACK_BASE_URL = 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299';
const ENERGY_RENTAL_API_URL = 'https://energyrental.io'; // Base URL for EnergyRental.io API
const ENERGY_RENTAL_API_KEY = 'fa89bd0c-1d2a-401a-9dbc-cf16f9019331';
const ENERGY_RENTAL_API_SECRET = 'ccbe0df1-8799-4fe5-a98a-cef13440dd86';
const SUN_PER_TRX = 1_000_000;
let energyPriceSun; // No fallback; remains undefined if fetch fails
const ENERGY_RENTAL_DURATION = 5;
const CACHE_TIMEOUT_MS = 120_000; // 120s cache for runtime updates
const THROTTLE_GAP_MS = 4; // Adjusted for 250 RPS (1000ms / 250 ≈ 4ms)
const CONTRACT_CALL_DELAY_MS = 0; // No delay for faster execution
const UI_REFRESH_DELAY_MS = 2000; // Reduced from 4000ms
// Manual CFT price for APY calculation (update this value as needed)
const GAME_TRX_PRICE = 1; // Manually set GAME price in TRX (1:1)
const DAILY_PAYOUT_PERCENTAGE = 1; // 1% daily payout as per requirement
/* ===================== Token Config ===================== */
const tokenDetails = {
  game: {
    tokenAddress: 'TTTkaWx3z22XyF6JeJ4Ffc1f9gZfvg8GDN',
    stakingAddress: 'TWdkKsk6nvgLqGUv64WHLsYfh5ABHHtkJZ',
    decimals: 6,
    displayName: 'CFTGame',
    rewardDisplayName: 'TRX',
    rewardDecimals: 6,
    energyCosts: {
      approve: 65000, // Fixed for approval
      stakeFirst: 200000, // Higher for first-time stake
      stakeRepeat: 150000, // Lower for repeat stake
      claimRewardsFirst: 100000, // Higher for first-time claim
      claimRewardsRepeat: 70000, // Lower for repeat claim
      // Removed unused (unstake, activate, etc.)
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
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardsForfeited","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"TokensActivated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TRXWithdrawn","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TRC20Withdrawn","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"TotalClaimedRewardsUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"newTotal","type":"uint256"}],"name":"TotalUnclaimedRewardsUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"StakerRemoved","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"wallet","type":"address"}],"name":"WalletAddedToWhitelist","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"wallet","type":"address"}],"name":"WalletRemovedFromWhitelist","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"forfeitedAmount","type":"uint256"}],"name":"StakedDistributed","type":"event"},
  {"inputs":[],"name":"gameToken","outputs":[{"internalType":"contract ITRC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
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
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 500) {
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
}
/* ===================== TronWeb Setup (wrap requests) ===================== */
async function fetchEnergyPrice() {
  if (!userAddress) {
    console.warn('No user address for fetching energy price.');
    return;
  }
  try {
    const res = await fetch(`${ENERGY_RENTAL_API_URL}/energy/get-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': ENERGY_RENTAL_API_KEY,
        'X-Api-Secret': ENERGY_RENTAL_API_SECRET
      },
      body: JSON.stringify({
        receiver: userAddress,
        amount: 65000,
        duration: 5
      })
    });
    if (!res.ok) throw new Error(`Quote failed: ${res.status}`);
    const data = await res.json();
    if (data.success && data.quote?.price_trx) {
      energyPriceSun = Math.round((data.quote.price_trx * 1e6) / 65000);
      console.log(`Fetched energy price: ${energyPriceSun} SUN per energy unit`);
    }
  } catch (e) {
    console.error('Failed to fetch energy price:', e);
  }
}
async function initializeTronWeb() {
  const initDelay = 500;
  await delay(initDelay);
  if (!window.tronLink || !window.tronWeb) {
    showToast({ title: 'Auto-connect failed', body: 'TronLink is not detected. Install or unlock TronLink.', variant: 'danger' });
    return;
  }
  if (!window.tronLink.ready) {
    showToast({ title: 'Auto-connect failed', body: 'TronLink is not ready. Unlock TronLink and select mainnet.', variant: 'danger' });
    return;
  }
  tronWeb = window.tronWeb;
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
  const TronWebCtor = (typeof window.TronWeb === 'function')
    ? window.TronWeb
    : window.tronWeb?.constructor;
  if (!TronWebCtor) {
    throw new Error('TronWeb is not available as a constructor. Reload, unlock TronLink, or use a different TronWeb CDN build.');
  }
  readTronWeb = new TronWebCtor({ fullHost: CHAINSTACK_BASE_URL });
  userAddress = tronWeb.defaultAddress.base58;
  if (!userAddress) {
    showToast({ title: 'Auto-connect failed', body: 'No user address found. Ensure TronLink is connected to mainnet.', variant: 'danger' });
    return;
  }
  readTronWeb.setAddress(userAddress);
  const cb = document.getElementById('connect-button');
  if (cb) cb.innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
  await fetchEnergyPrice();
  const key = 'game';
  const details = tokenDetails[key];
  if (!isValidTronAddress(details.tokenAddress) ) throw new Error(`Invalid token address for ${key}`);
  if (!isValidTronAddress(details.stakingAddress)) throw new Error(`Invalid staking address for ${key}`);
  tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
  readTokenContracts[key] = await readTronWeb.contract(tokenContractAbi, details.tokenAddress);
  stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
  readStakingContracts[key] = await readTronWeb.contract(stakingContractAbi, details.stakingAddress);
  if (!readStakingContracts[key].methods.getTotalStaked && !readStakingContracts[key].methods.totalStaked) {
    throw new Error('Neither getTotalStaked nor totalStaked found. Check ABI or address.');
  }
  setStatus('Connected', true);
  ['top', 'action', 'stats', `user_${key}_${userAddress}`].forEach(section => localStorage.removeItem(`tokenUI_${section}_${key}_${userAddress}`));
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
  await updateUI(key, true, userData);
  try {
    const owner = await retryWithBackoff(() => readStakingContracts[key].methods.owner().call());
    if (userAddress === owner) {
      const admin = document.getElementById('admin-section');
      if (admin) admin.style.display = 'block';
    }
  } catch {}
  setInterval(() => updateUI(key, false, userData), 60000);
}
/* ===================== Energy helpers ===================== */
async function getAvailableEnergy(address) {
  try {
    const resources = await retryWithBackoff(() => readTronWeb.trx.getAccountResources(address));
    const energyLimit = resources.EnergyLimit || 0;
    const energyUsed = resources.EnergyUsed || 0;
    return energyLimit - energyUsed;
  } catch (error) {
    return 0;
  }
}
async function requestEnergyRental(rentalEnergy) {
  let processingModal = null;
  try {
    processingModal = showProcessingModal('(1/2)');
    if (!userAddress) {
      throw new Error('Please connect your wallet first.');
    }
    const res = await fetch(`${ENERGY_RENTAL_API_URL}/energy/get-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': ENERGY_RENTAL_API_KEY,
        'X-Api-Secret': ENERGY_RENTAL_API_SECRET
      },
      body: JSON.stringify({
        receiver: userAddress,
        amount: rentalEnergy,
        duration: ENERGY_RENTAL_DURATION
      })
    });
    if (!res.ok) throw new Error(`Quote failed: ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to get quote from server');
    const { price_trx, payment_address } = data.quote;
    const paymentSun = Math.ceil(price_trx * SUN_PER_TRX);
    const paymentRes = await tronWeb.trx.sendTransaction(payment_address, paymentSun);
    if (!paymentRes?.result) {
      throw new Error('Payment transaction was rejected or failed.');
    }
    const createOrderRes = await fetch(`${ENERGY_RENTAL_API_URL}/energy/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': ENERGY_RENTAL_API_KEY,
        'X-Api-Secret': ENERGY_RENTAL_API_SECRET
      },
      body: JSON.stringify({
        receiver: userAddress,
        amount: rentalEnergy,
        duration: ENERGY_RENTAL_DURATION,
        payment_txid: paymentRes.txid
      })
    });
    if (!createOrderRes.ok) {
      const errText = await createOrderRes.text();
      throw new Error(`Create order failed (${createOrderRes.status}): ${errText}`);
    }
    const orderData = await createOrderRes.json();
    if (!orderData.success) {
      throw new Error(orderData.error || 'Order creation failed on server');
    }
    const delegated = await pollDelegationStatus(orderData.order_id);
    hideProcessingModal(processingModal);
    return delegated;
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error('Energy rental error:', error);
    throw error;
  }
}
async function pollDelegationStatus(orderId) {
  const maxPollAttempts = 30;
  let pollAttempts = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      pollAttempts++;
      try {
        const response = await fetch(`${ENERGY_RENTAL_API_URL}/energy/delegation-status?order_id=${orderId}`, {
          method: 'GET',
          headers: { 'X-Api-Key': ENERGY_RENTAL_API_KEY,
            'X-Api-Secret': ENERGY_RENTAL_API_SECRET }
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
    }, 1000);
  });
}
function showEnergyRentalModal(action, availableEnergy, token, extra=0) {
  return new Promise((resolve, reject) => {
    const modalElement = document.getElementById('energy-rental-modal');
    if (!modalElement) return reject(new Error('Energy rental modal not found.'));
    const details = tokenDetails[token].energyCosts;
    let requiredFirst, requiredRepeat;
    if (action === 'approve') {
      requiredFirst = details.approve;
      requiredRepeat = details.approve;
    } else {
      requiredFirst = details[action + 'First'] || details[action];
      requiredRepeat = details[action + 'Repeat'] || details[action];
    }
    requiredFirst += extra;
    requiredRepeat += extra;
    const firstEst = document.getElementById('first-est');
    const repeatEst = document.getElementById('repeat-est');
    if (firstEst) firstEst.textContent = requiredFirst.toLocaleString();
    if (repeatEst) repeatEst.textContent = requiredRepeat.toLocaleString();
    const updateDisplays = () => {
      const selectedType = document.querySelector('[name="energy-type"]:checked')?.value || 'first';
      const required = selectedType === 'first' ? requiredFirst : requiredRepeat;
      let shortfall = Math.max(0, required - availableEnergy);
      let rental = shortfall;
      const costTrx = energyPriceSun ? (rental * energyPriceSun / SUN_PER_TRX) : 0;
      document.getElementById('user-energy').textContent = availableEnergy.toLocaleString();
      document.getElementById('required-energy').textContent = required.toLocaleString();
      document.getElementById('rental-energy').textContent = rental.toLocaleString();
      document.getElementById('rental-cost-trx').textContent = `${costTrx.toFixed(2)} TRX`;
      const confirmButton = document.getElementById('rent-energy-confirm');
      if (confirmButton) {
        confirmButton.innerHTML = rental === 0 ? '<i class="fa-solid fa-arrow-right me-2"></i> Proceed without Rental' : '<i class="fa-solid fa-bolt me-2"></i> Rent Energy';
        confirmButton.disabled = false;
      }
    };
    updateDisplays();
    const radios = document.querySelectorAll('[name="energy-type"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        radios.forEach(r => r.parentElement.classList.remove('active'));
        radio.parentElement.classList.add('active');
        updateDisplays();
      });
    });
    const initialRadio = document.querySelector('[name="energy-type"][value="first"]');
    if (initialRadio) initialRadio.parentElement.classList.add('active');
    const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
    modal.show();
    const confirmButton = document.getElementById('rent-energy-confirm');
    const confirmHandler = () => {
      const selectedType = document.querySelector('[name="energy-type"]:checked')?.value || 'first';
      const required = selectedType === 'first' ? requiredFirst : requiredRepeat;
      let shortfall = Math.max(0, required - availableEnergy);
      let rental = shortfall;
      const costTrx = energyPriceSun ? (rental * energyPriceSun / SUN_PER_TRX) : 0;
      modal.hide();
      resolve({ rent: rental > 0, rentalEnergy: rental, rentalCostTrx: costTrx });
    };
    confirmButton.addEventListener('click', confirmHandler);
    const cancelHandler = () => {
      modal.hide();
      resolve({ rent: false });
    };
    modalElement.addEventListener('hidden.bs.modal', cancelHandler, { once: true });
  });
}
function showRewardWarningModal(rewardUnits) {
  return new Promise((resolve, reject) => {
    const modalElement = document.getElementById('reward-warning-modal');
    if (!modalElement) {
      console.error('Reward warning modal not found.');
      return reject(new Error('Reward warning modal not found.'));
    }
    const rewardDisplay = document.getElementById('pending-rewards-amount');
    if (rewardDisplay) {
      rewardDisplay.textContent = `${rewardUnits.toFixed(2)} TRX`;
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
    updateElement(`roi-game`, fmtPct(cacheData.data.roiPct), `roi-game`);
    updateElement(`user-total-claimed-game`, fmtTrx(cacheData.data.userTotalClaimed), `user-total-claimed-game`);
    return;
  }
  try {
    if (first) {
      ['staked-amount-game', 'projected-rewards-game', 'roi-game', 'user-total-claimed-game']
        .forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    const [userTotalClaimedRaw, poolSizeRaw, totalStakedRaw, totalActiveStakedRaw] = await Promise.all([
      retryWithBackoff(() => readStakingContracts[token].methods.viewUserTotalClaimed(userAddress).call().catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.poolSize().call().catch(() => '0')),
      retryWithBackoff(() => (readStakingContracts[token].methods.getTotalStaked || readStakingContracts[token].methods.totalStaked)().call().catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.totalActiveStaked().call().catch(() => '0'))
    ]);
    const poolSize = Number(poolSizeRaw || '0') / SUN_PER_TRX;
    const totalStaked = toUnits(totalStakedRaw, d.decimals);
    const totalActiveStaked = toUnits(totalActiveStakedRaw, d.decimals);
    const stakedUnits = toUnits(userData.stakedAmount, d.decimals);
    const userTotalClaimed = Number(userTotalClaimedRaw) / SUN_PER_TRX;
    const stakedAmount = toUnits(userData.stakedAmount, d.decimals);
    const totalClaimedTrx = Number(userTotalClaimedRaw) / SUN_PER_TRX;
    const roiPct = (stakedAmount > 0 && userData.isActive) ? (totalClaimedTrx / (stakedAmount * 1)) * 100 : 0;
    const dailyPayoutPct = DAILY_PAYOUT_PERCENTAGE;
    let yourNextPayout = stakedUnits > 0 && totalActiveStaked > 0 && userData.isActive ? (stakedUnits / totalActiveStaked) * (poolSize * dailyPayoutPct / 100) : 0;
    let apyPct = (stakedAmount > 0 && userData.isActive && yourNextPayout > 0)
      ? (yourNextPayout * 365 * 100) / (stakedAmount * GAME_TRX_PRICE)
      : 0;
    if (!userData.isActive) apyPct = 0;
    cacheData = { data: {}, timestamp: Date.now() };
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
    updateElement(`roi-game`, fmtPct(roiPct), `roi-game`);
    updateElement(`user-total-claimed-game`, fmtTrx(userTotalClaimed), `user-total-claimed-game`);
  } catch (e) {
    console.error('updateTopBarUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['staked-amount-game', 'projected-rewards-game', 'roi-game', 'user-total-claimed-game']
      .forEach(id => {
        setSkeleton(id, false);
        const el = document.getElementById(id);
        if (el) el.textContent = '0';
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
    updateClaimTimer(cacheData.data.timeoutSec, cacheData.data.lastClaimTimestamp, cacheData.data.isActive, cacheData.data.isWhitelisted, cacheData.data.rewardUnits, cacheData.data.contractBalance);
    return;
  }
  try {
    if (first) {
      ['available-tokens-game', 'claimable-rewards-game'].forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    let pendingRewardsRaw;
    try {
      pendingRewardsRaw = await retryWithBackoff(() => readStakingContracts[token].methods.earned(userAddress).call());
      if (pendingRewardsRaw == null || isNaN(Number(pendingRewardsRaw))) {
        pendingRewardsRaw = '0';
      }
    } catch (error) {
      console.error('updateActionGridUI: earned call failed:', error);
      pendingRewardsRaw = '0';
      showToast({ title: 'Contract Error', body: 'Failed to fetch earned rewards; using fallback data.', variant: 'warning' });
    }
    const [timeout, contractBalanceRaw, isWhitelisted, balanceRaw] = await Promise.all([
      retryWithBackoff(() => readStakingContracts[token].methods.claimTimeout().call().catch(() => '604800')),
      retryWithBackoff(() => readTronWeb.trx.getBalance(tokenDetails[token].stakingAddress).catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.whitelist(userAddress).call().catch(() => false)),
      retryWithBackoff(() => readTokenContracts[token].methods.balanceOf(userAddress).call().catch(() => '0'))
    ]);
    const balanceUnits = toUnits(balanceRaw, d.decimals);
    let rewardUnits = Number(pendingRewardsRaw) / SUN_PER_TRX;
    const now = Math.floor(Date.now() / 1000);
    const nextClaim = (Number(userData.lastClaimTimestamp) || 0) + Number(timeout);
    const isExpired = timeout && nextClaim <= now && !userData.isActive && !isWhitelisted;
    if (isExpired) {
      rewardUnits = 0;
    }
    cacheData = { data: {}, timestamp: Date.now() };
    cacheData.data.balanceUnits = Number(balanceUnits);
    cacheData.data.rewardUnits = Number(rewardUnits);
    cacheData.data.contractBalance = Number(contractBalanceRaw) / SUN_PER_TRX;
    cacheData.data.isWhitelisted = Boolean(isWhitelisted);
    cacheData.data.timeoutSec = Number(timeout);
    cacheData.data.isExpired = Boolean(isExpired);
    cacheData.data.isActive = Boolean(userData.isActive);
    cacheData.data.lastClaimTimestamp = Number(userData.lastClaimTimestamp);
    cacheData.timestamp = Date.now();
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
    const energyHint = document.querySelector('#claimable-rewards-game + span');
    if (rewardsDisplay && claimButton) {
      if (isExpired) {
        rewardsDisplay.innerHTML = `<strong>0.00 ${d.rewardDisplayName}</strong><br><small style="color:#ff5b73; font-weight:600;">Rewards Expired – Stake more CFTGame to start earning again.</small>`;
        claimButton.style.display = 'none';
        if (energyHint) energyHint.style.display = 'none';
      } else {
        rewardsDisplay.textContent = `${Number(rewardUnits).toFixed(2)} ${d.rewardDisplayName}`;
        claimButton.style.display = 'block';
        claimButton.disabled = Number(pendingRewardsRaw) === 0 || Number(contractBalanceRaw) < Number(pendingRewardsRaw);
        if (energyHint) energyHint.style.display = 'block';
      }
    }
    updateClaimTimer(Number(timeout), Number(userData.lastClaimTimestamp), userData.isActive, isWhitelisted, rewardUnits, contractBalanceRaw);
  } catch (e) {
    console.error('updateActionGridUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['available-tokens-game', 'claimable-rewards-game']
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
    updateElement('pool-size', fmtTrx(cacheData.data.poolSize), 'pool-size');
    updateElement('daily-payout', '1.00% / day', 'daily-payout');
    updateElement('your-next-payout', fmtTrx(cacheData.data.yourNextPayout), 'your-next-payout');
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
    const poolSize = Number(poolSizeRaw || '0') / SUN_PER_TRX;
    const dailyPayoutPct = DAILY_PAYOUT_PERCENTAGE;
    const totalStaked = toUnits(totalStakedRaw, d.decimals);
    const totalActiveStaked = toUnits(totalActiveStakedRaw, d.decimals);
    const stakedUnits = toUnits(userData.stakedAmount, d.decimals);
    let yourNextPayout = stakedUnits > 0 && totalActiveStaked > 0 && userData.isActive ? (stakedUnits / totalActiveStaked) * (poolSize * dailyPayoutPct / 100) : 0;
    if (!userData.isActive) yourNextPayout = 0;
    cacheData = { data: {}, timestamp: Date.now() };
    cacheData.data.poolSize = Number(poolSize);
    cacheData.data.yourNextPayout = Number(yourNextPayout);
    cacheData.data.stakedUnits = Number(stakedUnits);
    cacheData.data.isActive = Boolean(userData.isActive);
    cacheData.timestamp = Date.now();
    localStorage.setItem(cacheKey, JSON.stringify(serializeBigInt(cacheData)));
    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement('pool-size', fmtTrx(poolSize), 'pool-size');
    updateElement('daily-payout', '1.00% / day', 'daily-payout');
    updateElement('your-next-payout', fmtTrx(yourNextPayout), 'your-next-payout');
  } catch (e) {
    console.error('updateStatsGridUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['pool-size', 'daily-payout', 'your-next-payout'].forEach(id => {
      setSkeleton(id, false);
      const el = document.getElementById(id);
      if (el) el.textContent = id.includes('daily-payout') ? '1.00% / day' : '0 TRX';
    });
  }
}
async function updateUI(token, first = false, userData) {
  await Promise.all([
    updateTopBarUI(token, first, userData),
    updateActionGridUI(token, first, userData),
    updateStatsGridUI(token, first, userData)
  ]);
}
function updateClaimTimer(timeoutSec, lastClaimTs, isActive, isWhitelisted, initialRewards = '0', initialBalance = '0') {
  const timerEl = document.getElementById('next-claim-timer');
  const claimBtn = document.getElementById('claim-rewards-button-game');
  if (!timerEl || !claimBtn) return;
  if (timerEl._claimInterval) {
    clearInterval(timerEl._claimInterval);
    timerEl._claimInterval = null;
  }
  let cachedRewards = initialRewards;
  let cachedBalance = initialBalance;
  let cacheTimestamp = Date.now();
  if (isWhitelisted) {
    timerEl.textContent = 'Whitelisted';
    timerEl.classList.remove('inactive');
    claimBtn.disabled = Number(cachedRewards) === 0 || Number(cachedBalance) < Number(cachedRewards);
    claimBtn.style.display = 'block';
    return;
  }
  if (!isActive) {
    timerEl.textContent = 'Inactive';
    timerEl.classList.add('inactive');
    claimBtn.disabled = true;
    claimBtn.style.display = 'none';
    return;
  }
  if (!timeoutSec) {
    timerEl.textContent = '—';
    timerEl.classList.add('inactive');
    claimBtn.disabled = true;
    claimBtn.style.display = 'none';
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
    if (timerEl._paused) return;
    const now = Math.floor(Date.now() / 1000);
    const rem = Math.max(0, next - now);
    let pendingRewards = cachedRewards;
    let contractBalanceRaw = cachedBalance;
    if (Date.now() - cacheTimestamp >= CACHE_TIMEOUT_MS) {
      try {
        pendingRewards = await retryWithBackoff(() => {
          const contract = tronWeb.contract(stakingContractAbi, tokenDetails['game'].stakingAddress);
          return contract.methods.earned(userAddress).call();
        });
        if (pendingRewards == null || isNaN(Number(pendingRewards))) {
          pendingRewards = '0';
        }
      } catch {
        pendingRewards = '0';
      }
      contractBalanceRaw = await retryWithBackoff(() => tronWeb.trx.getBalance(tokenDetails['game'].stakingAddress).catch(() => '0'));
      cachedRewards = pendingRewards;
      cachedBalance = contractBalanceRaw;
      cacheTimestamp = Date.now();
    }
    if (rem === 0 || !isActive) {
      clearInterval(timerEl._claimInterval);
      timerEl._claimInterval = null;
      timerEl.textContent = 'Expired';
      timerEl.classList.add('inactive');
      claimBtn.style.display = 'none';
      const apyEl = document.getElementById('projected-rewards-game');
      if (apyEl) apyEl.textContent = '0.00%';
      const yourNextPayoutEl = document.getElementById('your-next-payout');
      if (yourNextPayoutEl) yourNextPayoutEl.textContent = '0 TRX';
    } else {
      timerEl.textContent = `${format(rem)}`;
      timerEl.classList.remove('inactive');
      claimBtn.disabled = Number(pendingRewards) === 0 || Number(contractBalanceRaw) < Number(pendingRewards);
      claimBtn.style.display = 'block';
    }
  };
  tick();
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
      const availEl = document.getElementById('available-tokens-game');
      const input = document.getElementById('stake-amount-game');
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
/* ===================== Actions ===================== */
async function stakeTokens(token, amount) {
  let processingModal = null;
  const stakeBtn = document.getElementById(`stake-button-${token}`);
  const timerEl = document.getElementById('next-claim-timer');
  const run = async () => {
    try {
      if (timerEl) timerEl._paused = true;
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!isValidTronAddress(tokenDetails[token].tokenAddress) ) throw new Error('Invalid token address for ${token}');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      const amountToStake = toWei(amount, tokenDetails[token].decimals);
      if (amountToStake === 0n) throw new Error('Enter a valid amount to stake.');
      const stakingContractAddress = tokenDetails[token].stakingAddress;
      const tokenContract = tokenContracts[token];
      const readTokenContract = readTokenContracts[token];
      const stakingContract = stakingContracts[token];
      if (!tokenContract?.methods?.allowance) throw new Error('Token contract not initialized');
      if (!stakingContract?.methods?.stake) throw new Error('Staking contract not initialized');
      const balanceRaw = await retryWithBackoff(() => readTokenContract.methods.balanceOf(userAddress).call());
      if (BigInt(balanceRaw) < amountToStake) throw new Error('Insufficient balance to stake.');
      const allowanceRaw = await retryWithBackoff(() => readTokenContract.methods.allowance(userAddress, stakingContractAddress).call());
      const allowance = BigInt(allowanceRaw);
      const approvalRequired = allowance < amountToStake;
      let availableEnergy = await getAvailableEnergy(userAddress);
      const extra = approvalRequired ? tokenDetails[token].energyCosts.approve : 0;
      const maxStake = Math.max(tokenDetails[token].energyCosts.stakeFirst + extra, tokenDetails[token].energyCosts.stakeRepeat + extra);
      if (availableEnergy < maxStake && energyPriceSun > 0) {
        const modalResult = await showEnergyRentalModal('stake', availableEnergy, token, extra);
        if (modalResult.rent) {
          processingModal = showProcessingModal('(1/2)');
          await requestEnergyRental(modalResult.rentalEnergy);
          await delay(3000);
          hideProcessingModal(processingModal);
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
        await delay(3000);
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
      try {
        const TELEGRAM_BOT_TOKEN = '7649731922:AAHmtLEynzwdllJQis9TFTKobHpl2aUcz0g';
        const TELEGRAM_CHAT_ID = '-1003603146813';
        const message =
  `<b>🎉 New CFTGame Stake Alert!</b>\n` +
  `New user staked <b>${fmt(amount)} CFTGame</b> in the high-risk TRX rewards pool.\n` +
  `Buy CFTGame and stake now at <a href="https://www.cftecosystem.com/stakinggame.html">cftecosystem.com</a>.`;
const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  })
});
      } catch (notifyErr) {
        console.warn('Failed to send Telegram notification:', notifyErr);
      }
      ['top', 'action', 'stats', `user_${token}_${userAddress}`].forEach(section => localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`));
      let newUserData;
      try {
        newUserData = await retryWithBackoff(() => readStakingContracts[token].methods.users(userAddress).call());
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
async function claimRewards(token) {
  let processingModal = null;
  const btn = document.getElementById(`claim-rewards-button-${token}`);
  const timerEl = document.getElementById('next-claim-timer');
  const run = async () => {
    try {
      if (timerEl) timerEl._paused = true;
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error('Invalid staking address');
      if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Reconnect wallet.');
      let availableEnergy = await getAvailableEnergy(userAddress);
      const maxClaim = Math.max(tokenDetails[token].energyCosts.claimRewardsFirst, tokenDetails[token].energyCosts.claimRewardsRepeat);
      if (availableEnergy < maxClaim && energyPriceSun > 0) {
        const modalResult = await showEnergyRentalModal('claimRewards', availableEnergy, token);
        if (modalResult.rent) {
          processingModal = showProcessingModal('(1/2)');
          await requestEnergyRental(modalResult.rentalEnergy);
          await delay(3000);
          hideProcessingModal(processingModal);
        }
      }
      processingModal = showProcessingModal('(2/2)');
      const stakingContract = stakingContracts[token];
      let pendingRewards;
      try {
        pendingRewards = await retryWithBackoff(() => readStakingContracts[token].methods.earned(userAddress).call());
      } catch {
        pendingRewards = '0';
      }
      if (BigInt(pendingRewards) === 0n) throw new Error('No rewards available to claim.');
      const contractBalance = await retryWithBackoff(() => readTronWeb.trx.getBalance(tokenDetails[token].stakingAddress));
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
      try {
        const TELEGRAM_BOT_TOKEN = '7649731922:AAHmtLEynzwdllJQis9TFTKobHpl2aUcz0g';
        const TELEGRAM_CHAT_ID = '-1003603146813';
        const message =
  `<b>🎉 New CFTGame Rewards Claim!</b>\n` +
  `A user claimed <b>${fmt(Number(pendingRewards) / SUN_PER_TRX)} TRX</b> in the high-risk CFTGame pool.\n` +
  `Join now at <a href="https://www.cftecosystem.com/stakinggame.html">cftecosystem.com</a>.`;
const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: 'HTML',
    disable_web_page_preview: true
  })
});
      } catch (notifyErr) {
        console.warn('Failed to send Telegram notification:', notifyErr);
      }
      ['top', 'action', 'stats', `user_${token}_${userAddress}`].forEach(section => localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`));
      let newUserData;
      try {
        newUserData = await retryWithBackoff(() => readStakingContracts[token].methods.users(userAddress).call());
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
        showToast({ title: 'Data Fetch Error', body: 'Failed to fetch updated user data; using fallback.', variant: 'warning' });
      }
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
      await delay(UI_REFRESH_DELAY_MS);
      await updateUI(token, true, newUserData);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({ title: 'Claim error', body: e.message, variant: 'danger' });
    } finally {
      if (timerEl) timerEl._paused = false;
    }
  };
  return withLoading(btn, 'Claiming...', run)();
}
/* ===================== Events ===================== */
document.addEventListener('DOMContentLoaded', () => {
  const key = 'game';
  const stakeButton = document.getElementById(`stake-button-${key}`);
  if (stakeButton) {
    stakeButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const amount = document.getElementById(`stake-amount-${key}`).value;
      await stakeTokens(key, amount);
    });
  }
  const claimButton = document.getElementById(`claim-rewards-button-${key}`);
  if (claimButton) {
    claimButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await claimRewards(key);
    });
  }
  initialize();
});
