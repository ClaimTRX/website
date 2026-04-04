let tronWeb, readTronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const readStakingContracts = {};
const readTokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const CHAINSTACK_BASE_URL = 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299';
const ENERGY_RENTAL_API_URL = 'https://energyrental.io';
const ENERGY_RENTAL_API_KEY = 'fa89bd0c-1d2a-401a-9dbc-cf16f9019331';
const ENERGY_RENTAL_API_SECRET = 'ccbe0df1-8799-4fe5-a98a-cef13440dd86';
const SUN_PER_TRX = 1_000_000;
let energyPriceSun;
const ENERGY_RENTAL_DURATION = 5;
const CACHE_TIMEOUT_MS = 120_000;
const UI_REFRESH_DELAY_MS = 2000;

const CFT_PRICE_USDT = 0.0846;
const BTC_PRICE_USDT = 66950;
const CFT_PRICE_BTC = CFT_PRICE_USDT / BTC_PRICE_USDT;
const DAILY_PAYOUT_PERCENTAGE = 1;
let energyRentalAvailable = true;   // ← Add this

const tokenDetails = {
  cft_usdt: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    rewardTokenAddress: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
    stakingAddress: 'TQQuD8Lq37zmL2brsdrrqM5fA797T5dhVy',
    decimals: 6,
    rewardDecimals: 8,
    displayName: 'CFT',
    rewardDisplayName: 'BTC',
    energyCosts: {
      approve: 65000,
      stakeFirst: 150000,
      stakeRepeat: 65000,
      unstakeFirst: 95000,
      unstakeRepeat: 65000,
      claimRewardsFirst: 120000,
      claimRewardsRepeat: 65000,
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

function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

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
      throw new Error(`Chainstack 429 Too Many Requests`);
    }
    if (res.status === 403) {
      throw new Error(`Chainstack 403 Forbidden`);
    }
    const data = await res.json().catch(() => ({}));
    if (data.Error) throw new Error(data.Error);
    return data;
  });
}

async function fetchEnergyPrice() {
  if (!userAddress) {
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
  const key = 'cft_usdt';
  const details = tokenDetails[key];
  tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
  readTokenContracts[key] = await readTronWeb.contract(tokenContractAbi, details.tokenAddress);
  stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
  readStakingContracts[key] = await readTronWeb.contract(stakingContractAbi, details.stakingAddress);
  setStatus('Connected', true);
  ['top', 'action', 'stats', `user_${key}_${userAddress}`].forEach(section => localStorage.removeItem(`tokenUI_${section}_${key}_${userAddress}`));
  let userData;
  try {
    userData = await retryWithBackoff(() => readStakingContracts[key].methods.users(userAddress).call());
  } catch (error) {
    userData = {
      stakedAmount: '0',
      isActive: false,
      lastClaimTimestamp: '0',
      totalClaimed: '0',
      rewards: '0',
      userRewardPerTokenPaid: '0'
    };
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
    const quoteRes = await fetch(`${ENERGY_RENTAL_API_URL}/energy/get-quote`, {
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
    if (!quoteRes.ok) {
      const errText = await quoteRes.text();
      throw new Error(`Quote failed (${quoteRes.status}): ${errText}`);
    }
    const quoteData = await quoteRes.json();
    if (!quoteData.success) {
      throw new Error(quoteData.error || 'Failed to get quote from server');
    }
    const {
      price_trx,
      payment_address
    } = quoteData.quote;
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
      return reject(new Error('Reward warning modal not found.'));
    }
    const rewardDisplay = document.getElementById('pending-rewards-amount');
    if (rewardDisplay) {
      rewardDisplay.textContent = `${rewardUnits.toFixed(8)} BTC`;
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
const fmtBtc = (n) => `${fmt(n, 8)} BTC`;

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

function calculateAPY(stakedUnits, totalActiveStaked, poolSizeBTC) {
  if (stakedUnits <= 0 || totalActiveStaked <= 0 || poolSizeBTC <= 0) return 0;
  const yourShare = stakedUnits / totalActiveStaked;
  const dailyBTC = yourShare * (poolSizeBTC * DAILY_PAYOUT_PERCENTAGE / 100);
  const yearlyBTC = dailyBTC * 365;
  const stakedValueBTC = stakedUnits * CFT_PRICE_BTC;
  return stakedValueBTC > 0 ? (yearlyBTC / stakedValueBTC) * 100 : 0;
}

function calculateROI(userTotalClaimedBTC, stakedUnits) {
  const stakedValueBTC = stakedUnits * CFT_PRICE_BTC;
  return stakedValueBTC > 0 ? (userTotalClaimedBTC / stakedValueBTC) * 100 : 0;
}

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
    updateElement(`user-total-claimed-cft_usdt`, fmtBtc(cacheData.data.userTotalClaimed), `user-total-claimed-cft_usdt`);
    return;
  }
  try {
    if (first) {
      ['staked-amount-cft_usdt', 'projected-rewards-cft_usdt', 'roi-cft', 'user-total-claimed-cft_usdt']
        .forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    const [userTotalClaimedRaw, poolSizeRaw, totalStakedRaw, totalActiveStakedRaw] = await Promise.all([
      retryWithBackoff(() => readStakingContracts[token].methods.viewUserTotalClaimed(userAddress).call().catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.poolSize().call().catch(() => '0')),
      retryWithBackoff(() => (readStakingContracts[token].methods.getTotalStaked || readStakingContracts[token].methods.totalStaked)().call().catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.totalActiveStaked().call().catch(() => '0'))
    ]);
    const poolSizeBTC = toUnits(poolSizeRaw, d.rewardDecimals);
    const totalActiveStaked = toUnits(totalActiveStakedRaw, d.decimals);
    const stakedUnits = toUnits(userData.stakedAmount, d.decimals);
    const userTotalClaimedBTC = toUnits(userTotalClaimedRaw, d.rewardDecimals);
    const apyPct = calculateAPY(stakedUnits, totalActiveStaked, poolSizeBTC);
    const roiPct = calculateROI(userTotalClaimedBTC, stakedUnits);
    cacheData = { data: {}, timestamp: Date.now() };
    cacheData.data.stakedUnits = Number(stakedUnits);
    cacheData.data.apyPct = Number(apyPct);
    cacheData.data.roiPct = Number(roiPct);
    cacheData.data.userTotalClaimed = Number(userTotalClaimedBTC);
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
    updateElement(`user-total-claimed-cft_usdt`, fmtBtc(userTotalClaimedBTC), `user-total-claimed-cft_usdt`);
  } catch (e) {
    console.error('updateTopBarUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['staked-amount-cft_usdt', 'projected-rewards-cft_usdt', 'roi-cft', 'user-total-claimed-cft_usdt']
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
    const isExpired = cacheData.data.isExpired || false;
    updateElement(`available-tokens-${token}`, fmt(cacheData.data.balanceUnits), `available-tokens-${token}`);
    updateElement(`claimable-rewards-${token}`, fmtBtc(isExpired ? 0 : cacheData.data.rewardUnits));
    updateClaimTimer(
      cacheData.data.timeoutSec,
      cacheData.data.lastClaimTimestamp,
      cacheData.data.isActive,
      cacheData.data.isWhitelisted,
      cacheData.data.rewardUnits,
      cacheData.data.contractBalance
    );
    return;
  }
  try {
    if (first) {
      ['available-tokens-cft_usdt', 'claimable-rewards-cft_usdt'].forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    let pendingRewardsRaw;
    try {
      pendingRewardsRaw = await retryWithBackoff(() => readStakingContracts[token].methods.earned(userAddress).call());
      if (pendingRewardsRaw == null || isNaN(Number(pendingRewardsRaw))) {
        pendingRewardsRaw = '0';
      }
    } catch (error) {
      pendingRewardsRaw = '0';
    }
    const [timeout, contractBalanceRaw, isWhitelisted, balanceRaw] = await Promise.all([
      retryWithBackoff(() => readStakingContracts[token].methods.claimTimeout().call().catch(() => '1209600')),
      retryWithBackoff(() => readTokenContracts[token].methods.balanceOf(tokenDetails[token].stakingAddress).call().catch(() => '0')),
      retryWithBackoff(() => readStakingContracts[token].methods.whitelist(userAddress).call().catch(() => false)),
      retryWithBackoff(() => readTokenContracts[token].methods.balanceOf(userAddress).call().catch(() => '0'))
    ]);
    const balanceUnits = toUnits(balanceRaw, d.decimals);
    let rewardUnits = toUnits(pendingRewardsRaw, d.rewardDecimals);
    const now = Math.floor(Date.now() / 1000);
    const nextClaim = (Number(userData.lastClaimTimestamp) || 0) + Number(timeout);
    const isExpired = timeout && nextClaim <= now && !userData.isActive && !isWhitelisted;
    if (isExpired) {
      rewardUnits = 0;
    }
    cacheData = { data: {}, timestamp: Date.now() };
    cacheData.data.balanceUnits = Number(balanceUnits);
    cacheData.data.rewardUnits = Number(rewardUnits);
    cacheData.data.contractBalance = Number(toUnits(contractBalanceRaw, d.rewardDecimals));
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
    updateElement(`claimable-rewards-${token}`, fmtBtc(isExpired ? 0 : rewardUnits));
    const claimButton = document.getElementById(`claim-rewards-button-${token}`);
    const rewardsDisplay = document.getElementById(`claimable-rewards-${token}`);
    const energyHint = document.querySelector('#claimable-rewards-cft_usdt + span');
    if (rewardsDisplay && claimButton) {
      if (isExpired) {
        rewardsDisplay.innerHTML = `<strong>0.00000000 ${d.rewardDisplayName}</strong><br><small style="color:#ff5b73; font-weight:600;">Rewards Expired – Stake more CFT to start earning again.</small>`;
        claimButton.style.display = 'none';
        if (energyHint) energyHint.style.display = 'none';
            } else {
        rewardsDisplay.textContent = fmtBtc(rewardUnits);
        claimButton.style.display = 'block';
        claimButton.disabled = Number(pendingRewardsRaw) === 0 || toUnits(contractBalanceRaw, d.rewardDecimals) < rewardUnits;
        if (energyHint) energyHint.style.display = 'block';
      }
    }
    updateClaimTimer(Number(timeout), Number(userData.lastClaimTimestamp), userData.isActive, isWhitelisted, rewardUnits, toUnits(contractBalanceRaw, d.rewardDecimals));
  } catch (e) {
    console.error('updateActionGridUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['available-tokens-cft_usdt', 'claimable-rewards-cft_usdt']
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
    updateElement('pool-size', fmtBtc(cacheData.data.poolSize), 'pool-size');
    updateElement('daily-payout', '1.00% / day', 'daily-payout');
    updateElement('your-next-payout', fmtBtc(cacheData.data.yourNextPayout), 'your-next-payout');
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
    const poolSize = toUnits(poolSizeRaw, d.rewardDecimals);
    const totalActiveStaked = toUnits(totalActiveStakedRaw, d.decimals);
    const stakedUnits = toUnits(userData.stakedAmount, d.decimals);
    let yourNextPayout = stakedUnits > 0 && totalActiveStaked > 0 && userData.isActive ? (stakedUnits / totalActiveStaked) * (poolSize * DAILY_PAYOUT_PERCENTAGE / 100) : 0;
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
    updateElement('pool-size', fmtBtc(poolSize), 'pool-size');
    updateElement('daily-payout', '1.00% / day', 'daily-payout');
    updateElement('your-next-payout', fmtBtc(yourNextPayout), 'your-next-payout');
  } catch (e) {
    console.error('updateStatsGridUI error:', e);
    showToast({ title: 'UI update error', body: e.message || 'Unknown error', variant: 'danger' });
    ['pool-size', 'daily-payout', 'your-next-payout'].forEach(id => {
      setSkeleton(id, false);
      const el = document.getElementById(id);
      if (el) el.textContent = id.includes('daily-payout') ? '1.00% / day' : '0 BTC';
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
  const claimBtn = document.getElementById('claim-rewards-button-cft_usdt');
  const rewardsDisplay = document.getElementById('claimable-rewards-cft_usdt');
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
          const contract = tronWeb.contract(stakingContractAbi, tokenDetails['cft_usdt'].stakingAddress);
          return contract.methods.earned(userAddress).call();
        });
        if (pendingRewards == null || isNaN(Number(pendingRewards))) {
          pendingRewards = '0';
        }
      } catch {
        pendingRewards = '0';
      }
      contractBalanceRaw = await retryWithBackoff(() => readTokenContracts['cft_usdt'].methods.balanceOf(tokenDetails['cft_usdt'].stakingAddress).call().catch(() => '0'));
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
      if (rewardsDisplay) {
        rewardsDisplay.innerHTML = `<strong>0.00000000 BTC</strong><br><small style="color:#ff5b73; font-weight:600;">Rewards Expired – Stake more CFT to start earning again.</small>`;
      }
      const apyEl = document.getElementById('projected-rewards-cft_usdt');
      if (apyEl) apyEl.textContent = '0.00%';
      const yourNextPayoutEl = document.getElementById('your-next-payout');
      if (yourNextPayoutEl) yourNextPayoutEl.textContent = '0 BTC';
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

async function initialize() {
  const connectButton = document.getElementById('connect-button');
  if (connectButton) { connectButton.addEventListener('click', connectWallet); }
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(t => new bootstrap.Tooltip(t));
  document.querySelectorAll('[data-fill]')?.forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = Number(btn.dataset.fill || '0');
      const availEl = document.getElementById('available-tokens-cft_usdt');
      const input = document.getElementById('stake-amount-cft_usdt');
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
        const TELEGRAM_CHAT_ID = '-1002114533251';
        const message =
  `<b>🎉 New Stake Alert!</b>\n` +
  `New user staked <b>${fmt(amount)} CFT</b> in the BTC rewards pool.\n` +
  `Buy CFT and stake now at <a href="https://www.cftecosystem.com/index.html">cftecosystem.com</a>`;
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
        newUserData = {
          stakedAmount: '0',
          isActive: false,
          lastClaimTimestamp: '0',
          totalClaimed: '0',
          rewards: '0',
          userRewardPerTokenPaid: '0'
        };
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
      let pendingRewardsRaw;
      try {
        pendingRewardsRaw = await retryWithBackoff(() => readStakingContracts[token].methods.earned(userAddress).call());
        if (pendingRewardsRaw == null || isNaN(Number(pendingRewardsRaw))) {
          pendingRewardsRaw = '0';
        }
      } catch (error) {
        pendingRewardsRaw = '0';
      }
      const rewardUnits = toUnits(pendingRewardsRaw, tokenDetails[token].rewardDecimals);
      if (rewardUnits > 0) {
        const proceed = await showRewardWarningModal(rewardUnits);
        if (!proceed) {
          throw new Error('Withdrawal cancelled. Please claim your rewards first.');
        }
      }
      let availableEnergy = await getAvailableEnergy(userAddress);
      const maxUnstake = Math.max(tokenDetails[token].energyCosts.unstakeFirst, tokenDetails[token].energyCosts.unstakeRepeat);
      if (availableEnergy < maxUnstake && energyPriceSun > 0) {
        const modalResult = await showEnergyRentalModal('unstake', availableEnergy, token);
        if (modalResult.rent) {
          processingModal = showProcessingModal('(1/2)');
          await requestEnergyRental(modalResult.rentalEnergy);
          await delay(3000);
          hideProcessingModal(processingModal);
        }
      }
      processingModal = showProcessingModal('(2/2)');
      const amountToUnstake = toWei(unstakeAmount, tokenDetails[token].decimals);
      const stakingContract = stakingContracts[token];
      const readStakingContract = readStakingContracts[token];
      const userData = await retryWithBackoff(() => readStakingContract.methods.users(userAddress).call());
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
      ['top', 'action', 'stats', `user_${token}_${userAddress}`].forEach(section => localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`));
      let newUserData;
      try {
        newUserData = await retryWithBackoff(() => readStakingContracts[token].methods.users(userAddress).call());
      } catch (error) {
        newUserData = {
          stakedAmount: '0',
          isActive: false,
          lastClaimTimestamp: '0',
          totalClaimed: '0',
          rewards: '0',
          userRewardPerTokenPaid: '0'
        };
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
      showToast({ title:'Withdraw error', body:e.message, variant:'danger' });
    } finally {
      if (timerEl) timerEl._paused = false;
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
      if (timerEl) timerEl._paused = true;
      if (!isValidTronAddress(tokenDetails[token].stakingAddress))
        throw new Error('Invalid staking address');
      if (!userAddress || !isValidTronAddress(userAddress))
        throw new Error('Invalid user address. Reconnect wallet.');
      let availableEnergy = await getAvailableEnergy(userAddress);
      const maxClaim = Math.max(
        tokenDetails[token].energyCosts.claimRewardsFirst,
        tokenDetails[token].energyCosts.claimRewardsRepeat
      );
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
      let pendingRewards;
      try {
        pendingRewards = await retryWithBackoff(() =>
          readStakingContracts[token].methods.earned(userAddress).call()
        );
      } catch (err) {
        pendingRewards = '0';
      }
      if (BigInt(pendingRewards) === 0n) {
        throw new Error('No rewards available to claim.');
      }
      const claimTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress,
        'claimRewards()',
        {},
        [],
        userAddress
      );
      if (!claimTx.result || !claimTx.transaction)
        throw new Error('Failed to create claim transaction');
      const signedClaimTx = await tronWeb.trx.sign(claimTx.transaction);
      const broadcastClaim = await tronWeb.trx.sendRawTransaction(signedClaimTx);
      if (!broadcastClaim.result)
        throw new Error('Failed to broadcast claim transaction');
      showToast({
        title: 'Rewards claimed',
        body: `<a href="https://tronscan.org/#/transaction/${broadcastClaim.txid}" target="_blank" rel="noopener">View on Tronscan</a>`
      });
      hideProcessingModal(processingModal);
      try {
        const TELEGRAM_BOT_TOKEN = '7649731922:AAHmtLEynzwdllJQis9TFTKobHpl2aUcz0g';
        const TELEGRAM_CHAT_ID = '-1002114533251';
        const message =
          `<b>🎉 New Rewards Claim!</b>\n` +
          `A user claimed <b>${fmt(toUnits(pendingRewards, tokenDetails[token].rewardDecimals), 8)} BTC</b> in the BTC rewards pool.\n` +
          `Join now at <a href="https://www.cftecosystem.com/index.html">cftecosystem.com</a>`;
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
      ['top', 'action', 'stats', `user_${token}_${userAddress}`].forEach(section =>
        localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`)
      );
      let newUserData;
      try {
        newUserData = await retryWithBackoff(() =>
          readStakingContracts[token].methods.users(userAddress).call()
        );
      } catch (error) {
        newUserData = {
          stakedAmount: '0',
          isActive: false,
          lastClaimTimestamp: '0',
          totalClaimed: '0',
          rewards: '0',
          userRewardPerTokenPaid: '0'
        };
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

document.addEventListener('DOMContentLoaded', () => {
  const key = 'cft_usdt';
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
  initialize();
});
