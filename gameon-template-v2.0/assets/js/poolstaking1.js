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
const CFT_TRX_PRICE = 0.2679; // Manually set CFT price in TRX (update as needed)
const DAILY_PAYOUT_PERCENTAGE = 1; // 1% daily payout as per requirement
const ENERGY_SAFETY_MARGIN_PCT = 15;
const DEFAULT_FEE_LIMIT = 300_000_000; // 300 TRX max fee limit for simulation/building
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
      approve: 65000, // Fixed for approval
      stakeFirst: 150000, // Higher for first-time stake
      stakeRepeat: 65000, // Lower for repeat stake
      unstakeFirst: 95000, // Higher for first-time unstake
      unstakeRepeat: 65000, // Lower for repeat unstake
      claimRewardsFirst: 120000, // Higher for first-time claim
      claimRewardsRepeat: 65000, // Lower for repeat claim
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
  const key = 'cft';
  const details = tokenDetails[key];
  if (!isValidTronAddress(details.tokenAddress)) throw new Error(`Invalid token address for ${key}`);
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
async function simulateContractEnergy({
  contractAddress,
  functionSelector,
  parameters = [],
  ownerAddress = userAddress,
  callValue = 0,
  feeLimit = DEFAULT_FEE_LIMIT
}) {
  if (!tronWeb || !ownerAddress) {
    throw new Error('Wallet not connected.');
  }

  try {
    if (
      tronWeb.transactionBuilder &&
      typeof tronWeb.transactionBuilder.estimateEnergy === 'function'
    ) {
      const res = await retryWithBackoff(() =>
        tronWeb.transactionBuilder.estimateEnergy(
          contractAddress,
          functionSelector,
          { feeLimit, callValue },
          parameters,
          ownerAddress
        )
      );

      const ok = !!res?.result?.result;
      const energy = Number(res?.energy_required || 0);

      if (ok && energy > 0) {
        return {
          ok: true,
          method: 'estimateEnergy',
          energy,
          raw: res
        };
      }
    }
  } catch (err) {
    console.warn(`estimateEnergy failed for ${functionSelector}, falling back:`, err?.message || err);
  }

  const fallback = await retryWithBackoff(() =>
    tronWeb.transactionBuilder.triggerConstantContract(
      contractAddress,
      functionSelector,
      { feeLimit, callValue },
      parameters,
      ownerAddress
    )
  );

  const ok = !!fallback?.result?.result;
  const energy =
    Number(fallback?.energy_used || 0) ||
    Number(fallback?.energy_limit || 0) ||
    0;

  return {
    ok,
    method: 'triggerConstantContract',
    energy,
    raw: fallback
  };
}
function addEnergySafetyMargin(energy, pct = ENERGY_SAFETY_MARGIN_PCT) {
  return Math.ceil(Number(energy || 0) * (1 + pct / 100));
}

function toSun(amountTrx) {
  return Math.ceil(Number(amountTrx || 0) * SUN_PER_TRX);
}

function fromSun(amountSun) {
  return Number(amountSun || 0) / SUN_PER_TRX;
}

async function getCurrentAllowance(token, owner, spender) {
  const allowanceRaw = await retryWithBackoff(() =>
    readTokenContracts[token].methods.allowance(owner, spender).call()
  );
  return BigInt(allowanceRaw || '0');
}

async function getTokenBalanceRaw(token, owner) {
  return retryWithBackoff(() =>
    readTokenContracts[token].methods.balanceOf(owner).call()
  );
}
function addEnergySafetyMargin(energy, pct = ENERGY_SAFETY_MARGIN_PCT) {
  return Math.ceil(Number(energy || 0) * (1 + pct / 100));
}

function toSun(amountTrx) {
  return Math.ceil(Number(amountTrx || 0) * SUN_PER_TRX);
}

function fromSun(amountSun) {
  return Number(amountSun || 0) / SUN_PER_TRX;
}

async function getCurrentAllowance(token, owner, spender) {
  const allowanceRaw = await retryWithBackoff(() =>
    readTokenContracts[token].methods.allowance(owner, spender).call()
  );
  return BigInt(allowanceRaw || '0');
}

async function getTokenBalanceRaw(token, owner) {
  return retryWithBackoff(() =>
    readTokenContracts[token].methods.balanceOf(owner).call()
  );
}
async function estimateUnstakeEnergy(token, amountInput) {
  const details = tokenDetails[token];
  const amountWei = toWei(amountInput, details.decimals);

  if (amountWei <= 0n) {
    throw new Error('Enter a valid amount to withdraw.');
  }

  const userData = await retryWithBackoff(() =>
    readStakingContracts[token].methods.users(userAddress).call()
  );

  if (BigInt(userData?.stakedAmount || '0') < amountWei) {
    throw new Error('Insufficient staked amount.');
  }

  const unstakeEstimate = await simulateContractEnergy({
    contractAddress: details.stakingAddress,
    functionSelector: 'unstake(uint256)',
    parameters: [
      { type: 'uint256', value: amountWei.toString() }
    ]
  });

  return {
    action: 'unstake',
    rawTotalEnergy: unstakeEstimate.energy,
    totalEnergy: addEnergySafetyMargin(unstakeEstimate.energy),
    unstakeEnergy: unstakeEstimate.energy,
    unstakeMethod: unstakeEstimate.method
  };
}
async function estimateClaimRewardsEnergy(token) {
  const details = tokenDetails[token];

  let pendingRewards;
  try {
    pendingRewards = await retryWithBackoff(() =>
      readStakingContracts[token].methods.earned(userAddress).call()
    );
  } catch {
    pendingRewards = '0';
  }

  if (BigInt(pendingRewards || '0') === 0n) {
    throw new Error('No rewards available to claim.');
  }

  const contractBalance = await retryWithBackoff(() =>
    readTronWeb.trx.getBalance(details.stakingAddress)
  );

  if (Number(contractBalance || 0) < Number(pendingRewards || 0)) {
    throw new Error('Insufficient contract balance to claim rewards.');
  }

  const claimEstimate = await simulateContractEnergy({
    contractAddress: details.stakingAddress,
    functionSelector: 'claimRewards()',
    parameters: []
  });

  return {
    action: 'claimRewards',
    rawTotalEnergy: claimEstimate.energy,
    totalEnergy: addEnergySafetyMargin(claimEstimate.energy),
    claimEnergy: claimEstimate.energy,
    claimMethod: claimEstimate.method,
    pendingRewards
  };
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
function showEnergyRentalModal(action, availableEnergy, token, estimate) {
  return new Promise((resolve, reject) => {
    const modalElement = document.getElementById('energy-rental-modal');
    if (!modalElement) return reject(new Error('Energy rental modal not found.'));

    const required = Number(estimate?.totalEnergy || 0);
    const shortfall = Math.max(0, required - availableEnergy);
    const rental = shortfall;
    const costTrx = energyPriceSun ? (rental * energyPriceSun / SUN_PER_TRX) : 0;

    const firstEst = document.getElementById('first-est');
    const repeatEst = document.getElementById('repeat-est');

    if (firstEst) {
      firstEst.textContent = required.toLocaleString();
    }
    if (repeatEst) {
      repeatEst.textContent = required.toLocaleString();
    }

    const userEnergyEl = document.getElementById('user-energy');
    const requiredEnergyEl = document.getElementById('required-energy');
    const rentalEnergyEl = document.getElementById('rental-energy');
    const rentalCostEl = document.getElementById('rental-cost-trx');
    const confirmButton = document.getElementById('rent-energy-confirm');

    if (userEnergyEl) userEnergyEl.textContent = availableEnergy.toLocaleString();
    if (requiredEnergyEl) requiredEnergyEl.textContent = required.toLocaleString();
    if (rentalEnergyEl) rentalEnergyEl.textContent = rental.toLocaleString();
    if (rentalCostEl) rentalCostEl.textContent = `${costTrx.toFixed(2)} TRX`;

    const estimateInfo = document.getElementById('energy-estimate-info');
    if (estimateInfo) {
      estimateInfo.innerHTML = `
        <small>
          Estimated by: <strong>${estimate.action}</strong><br>
          ${estimate.approvalNeeded ? `Approve: <strong>${estimate.approveEnergy.toLocaleString()}</strong> + ` : ''}
          ${estimate.action === 'stake' ? `Stake: <strong>${estimate.stakeEnergy.toLocaleString()}</strong>` : ''}
          ${estimate.action === 'unstake' ? `Unstake: <strong>${estimate.unstakeEnergy.toLocaleString()}</strong>` : ''}
          ${estimate.action === 'claimRewards' ? `Claim: <strong>${estimate.claimEnergy.toLocaleString()}</strong>` : ''}
          <br>
          Safety-adjusted total: <strong>${required.toLocaleString()}</strong>
        </small>
      `;
    }

    if (confirmButton) {
      confirmButton.innerHTML =
        rental === 0
          ? '<i class="fa-solid fa-arrow-right me-2"></i> Proceed without Rental'
          : '<i class="fa-solid fa-bolt me-2"></i> Rent Energy';
      confirmButton.disabled = false;
    }

    const modal = new bootstrap.Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    });

    const cleanup = () => {
      if (confirmButton) {
        confirmButton.removeEventListener('click', confirmHandler);
      }
      modalElement.removeEventListener('hidden.bs.modal', hiddenHandler);
    };

    const confirmHandler = () => {
      cleanup();
      modal.hide();
      resolve({
        rent: rental > 0,
        rentalEnergy: rental,
        rentalCostTrx: costTrx,
        estimatedTotalEnergy: required
      });
    };

    const hiddenHandler = () => {
      cleanup();
      resolve({ rent: false });
    };

    if (confirmButton) {
      confirmButton.addEventListener('click', confirmHandler);
    }
    modalElement.addEventListener('hidden.bs.modal', hiddenHandler, { once: true });

    modal.show();
  });
}
async function ensureSufficientEnergyForEstimate(token, estimate) {
  const availableEnergy = await getAvailableEnergy(userAddress);

  if (availableEnergy >= estimate.totalEnergy) {
    return {
      rented: false,
      availableEnergy,
      estimatedTotalEnergy: estimate.totalEnergy
    };
  }

  if (!(energyPriceSun > 0)) {
    throw new Error(
      `Not enough energy. Need about ${estimate.totalEnergy.toLocaleString()} energy, but your wallet has ${availableEnergy.toLocaleString()}. Energy price is unavailable, so rental cannot be quoted right now.`
    );
  }

  const modalResult = await showEnergyRentalModal(
    estimate.action,
    availableEnergy,
    token,
    estimate
  );

  if (!modalResult.rent) {
    if (availableEnergy < estimate.totalEnergy) {
      throw new Error(
        `Transaction cancelled. Estimated energy required: ${estimate.totalEnergy.toLocaleString()}, available: ${availableEnergy.toLocaleString()}.`
      );
    }
    return {
      rented: false,
      availableEnergy,
      estimatedTotalEnergy: estimate.totalEnergy
    };
  }

  let processingModal = null;
  try {
    processingModal = showProcessingModal('(1/2)');
    await requestEnergyRental(modalResult.rentalEnergy);
    await delay(3000);
    return {
      rented: true,
      rentedEnergy: modalResult.rentalEnergy,
      estimatedTotalEnergy: estimate.totalEnergy
    };
  } finally {
    hideProcessingModal(processingModal);
  }
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
      ? (yourNextPayout * 365 * 100) / (stakedAmount * CFT_TRX_PRICE)
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
      ['available-tokens-cft', 'claimable-rewards-cft'].forEach(id => setSkeleton(id, true));
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
      retryWithBackoff(() => readStakingContracts[token].methods.claimTimeout().call().catch(() => '1209600')),
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
    cacheData.data.stakedUnits = Number(toUnits(userData.stakedAmount, d.decimals));
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
    const energyHint = document.querySelector('#claimable-rewards-cft + span');
    if (rewardsDisplay && claimButton) {
      if (isExpired) {
        rewardsDisplay.innerHTML = `<strong>0.00 ${d.rewardDisplayName}</strong><br><small style="color:#ff5b73; font-weight:600;">Rewards Expired – Stake more CFT to start earning again.</small>`;
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
    ['available-tokens-cft', 'claimable-rewards-cft']
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
  const claimBtn = document.getElementById('claim-rewards-button-cft');
  const rewardsDisplay = document.getElementById('claimable-rewards-cft');
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
          const contract = tronWeb.contract(stakingContractAbi, tokenDetails['cft'].stakingAddress);
          return contract.methods.earned(userAddress).call();
        });
        if (pendingRewards == null || isNaN(Number(pendingRewards))) {
          pendingRewards = '0';
        }
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
      claimBtn.style.display = 'none';
      if (rewardsDisplay) {
        rewardsDisplay.innerHTML = `<strong>0.00 TRX</strong><br><small style="color:#ff5b73; font-weight:600;">Rewards Expired – Stake more CFT to start earning again.</small>`;
      }
      const apyEl = document.getElementById('projected-rewards-cft');
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
/* ===================== Actions ===================== */
async function stakeTokens(token, amount) {
  let processingModal = null;
  const stakeBtn = document.getElementById(`stake-button-${token}`);
  const timerEl = document.getElementById('next-claim-timer');

  const run = async () => {
    try {
      if (timerEl) timerEl._paused = true;

      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) {
        throw new Error('Invalid staking address');
      }
      if (!isValidTronAddress(tokenDetails[token].tokenAddress)) {
        throw new Error('Invalid token address');
      }
      if (!userAddress || !isValidTronAddress(userAddress)) {
        throw new Error('Invalid user address. Reconnect wallet.');
      }

      const details = tokenDetails[token];
      const amountToStake = toWei(amount, details.decimals);
      if (amountToStake === 0n) {
        throw new Error('Enter a valid amount to stake.');
      }

      const estimate = await estimateStakeEnergy(token, amount);
      await ensureSufficientEnergyForEstimate(token, estimate);

      processingModal = showProcessingModal('(2/2)');

      if (estimate.approvalNeeded) {
        const approvalTx = await tronWeb.transactionBuilder.triggerSmartContract(
          details.tokenAddress,
          'approve(address,uint256)',
          { feeLimit: DEFAULT_FEE_LIMIT },
          [
            { type: 'address', value: details.stakingAddress },
            { type: 'uint256', value: maxUint256 }
          ],
          userAddress
        );

        if (!approvalTx.result || !approvalTx.transaction) {
          throw new Error('Failed to create approve transaction');
        }

        const signedApprovalTx = await tronWeb.trx.sign(approvalTx.transaction);
        const broadcastApproval = await tronWeb.trx.sendRawTransaction(signedApprovalTx);

        if (!broadcastApproval.result) {
          throw new Error('Failed to broadcast approve transaction');
        }

        showToast({
          title: 'Approve submitted',
          body: `<a href="https://tronscan.org/#/transaction/${broadcastApproval.txid}" target="_blank" rel="noopener">View on Tronscan</a>`
        });

        await delay(3000);
      }

      const stakeTx = await tronWeb.transactionBuilder.triggerSmartContract(
        details.stakingAddress,
        'stake(uint256)',
        { feeLimit: DEFAULT_FEE_LIMIT },
        [{ type: 'uint256', value: amountToStake.toString() }],
        userAddress
      );

      if (!stakeTx.result || !stakeTx.transaction) {
        throw new Error('Failed to create stake transaction');
      }

      const signedStakeTx = await tronWeb.trx.sign(stakeTx.transaction);
      const broadcastStake = await tronWeb.trx.sendRawTransaction(signedStakeTx);

      if (!broadcastStake.result) {
        throw new Error('Failed to broadcast stake transaction');
      }

      showToast({
        title: 'Stake submitted',
        body: `<a href="https://tronscan.org/#/transaction/${broadcastStake.txid}" target="_blank" rel="noopener">View on Tronscan</a>`
      });

      hideProcessingModal(processingModal);

      try {
        const TELEGRAM_BOT_TOKEN = 'REPLACE_THIS';
        const TELEGRAM_CHAT_ID = '-1002114533251';
        const message =
          `<b>🎉 New Stake Alert!</b>\n` +
          `New user staked <b>${fmt(amount)} CFT</b> in the TRX rewards pool.\n` +
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

      ['top', 'action', 'stats', `user_${token}_${userAddress}`]
        .forEach(section => localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`));

      let newUserData;
      try {
        newUserData = await retryWithBackoff(() =>
          readStakingContracts[token].methods.users(userAddress).call()
        );
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
        showToast({
          title: 'Data Fetch Error',
          body: 'Failed to fetch updated user data; using fallback.',
          variant: 'warning'
        });
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

      localStorage.setItem(
        `tokenUI_user_${token}_${userAddress}`,
        JSON.stringify(serializeBigInt(updatedCache))
      );

      await delay(UI_REFRESH_DELAY_MS);
      await updateUI(token, true, newUserData);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({ title: 'Stake error', body: e.message, variant: 'danger' });
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

      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) {
        throw new Error('Invalid staking address');
      }
      if (!userAddress || !isValidTronAddress(userAddress)) {
        throw new Error('Invalid user address. Reconnect wallet.');
      }

      const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
      if (!unstakeAmount || isNaN(unstakeAmount) || Number(unstakeAmount) <= 0) {
        throw new Error('Enter a valid amount to withdraw.');
      }

      let pendingRewardsRaw;
      try {
        pendingRewardsRaw = await retryWithBackoff(() =>
          readStakingContracts[token].methods.earned(userAddress).call()
        );
        if (pendingRewardsRaw == null || isNaN(Number(pendingRewardsRaw))) {
          pendingRewardsRaw = '0';
        }
      } catch (error) {
        console.error('unstakeTokens: earned call failed:', error);
        pendingRewardsRaw = '0';
      }

      const rewardUnits = Number(pendingRewardsRaw) / SUN_PER_TRX;
      if (rewardUnits > 0) {
        const proceed = await showRewardWarningModal(rewardUnits);
        if (!proceed) {
          throw new Error('Withdrawal cancelled. Please claim your rewards first.');
        }
      }

      const estimate = await estimateUnstakeEnergy(token, unstakeAmount);
      await ensureSufficientEnergyForEstimate(token, estimate);

      processingModal = showProcessingModal('(2/2)');

      const amountToUnstake = toWei(unstakeAmount, tokenDetails[token].decimals);

      const withdrawTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress,
        'unstake(uint256)',
        { feeLimit: DEFAULT_FEE_LIMIT },
        [{ type: 'uint256', value: amountToUnstake.toString() }],
        userAddress
      );

      if (!withdrawTx.result || !withdrawTx.transaction) {
        throw new Error('Failed to create unstake transaction');
      }

      const signedWithdrawTx = await tronWeb.trx.sign(withdrawTx.transaction);
      const broadcastWithdraw = await tronWeb.trx.sendRawTransaction(signedWithdrawTx);

      if (!broadcastWithdraw.result) {
        throw new Error('Failed to broadcast unstake transaction');
      }

      showToast({
        title: 'Withdraw submitted',
        body: `<a href="https://tronscan.org/#/transaction/${broadcastWithdraw.txid}" target="_blank" rel="noopener">View on Tronscan</a>`
      });

      hideProcessingModal(processingModal);

      ['top', 'action', 'stats', `user_${token}_${userAddress}`]
        .forEach(section => localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`));

      let newUserData;
      try {
        newUserData = await retryWithBackoff(() =>
          readStakingContracts[token].methods.users(userAddress).call()
        );
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
        showToast({
          title: 'Data Fetch Error',
          body: 'Failed to fetch updated user data; using fallback.',
          variant: 'warning'
        });
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

      localStorage.setItem(
        `tokenUI_user_${token}_${userAddress}`,
        JSON.stringify(serializeBigInt(updatedCache))
      );

      await delay(UI_REFRESH_DELAY_MS);
      await updateUI(token, true, newUserData);
    } catch (e) {
      hideProcessingModal(processingModal);
      showToast({ title: 'Withdraw error', body: e.message, variant: 'danger' });
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

      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) {
        throw new Error('Invalid staking address');
      }
      if (!userAddress || !isValidTronAddress(userAddress)) {
        throw new Error('Invalid user address. Reconnect wallet.');
      }

      const estimate = await estimateClaimRewardsEnergy(token);
      await ensureSufficientEnergyForEstimate(token, estimate);

      processingModal = showProcessingModal('(2/2)');

      const claimTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress,
        'claimRewards()',
        { feeLimit: DEFAULT_FEE_LIMIT },
        [],
        userAddress
      );

      if (!claimTx.result || !claimTx.transaction) {
        throw new Error('Failed to create claim transaction');
      }

      const signedClaimTx = await tronWeb.trx.sign(claimTx.transaction);
      const broadcastClaim = await tronWeb.trx.sendRawTransaction(signedClaimTx);

      if (!broadcastClaim.result) {
        throw new Error('Failed to broadcast claim transaction');
      }

      showToast({
        title: 'Rewards claimed',
        body: `<a href="https://tronscan.org/#/transaction/${broadcastClaim.txid}" target="_blank" rel="noopener">View on Tronscan</a>`
      });

      hideProcessingModal(processingModal);

      try {
        const TELEGRAM_BOT_TOKEN = 'REPLACE_THIS';
        const TELEGRAM_CHAT_ID = '-1002114533251';
        const pendingRewards = estimate.pendingRewards;

        const message =
          `<b>🎉 New Rewards Claim!</b>\n` +
          `A user claimed <b>${fmt(Number(pendingRewards) / SUN_PER_TRX)} TRX</b> in the TRX rewards pool.\n` +
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

      ['top', 'action', 'stats', `user_${token}_${userAddress}`]
        .forEach(section => localStorage.removeItem(`tokenUI_${section}_${token}_${userAddress}`));

      let newUserData;
      try {
        newUserData = await retryWithBackoff(() =>
          readStakingContracts[token].methods.users(userAddress).call()
        );
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
          title: 'Data Fetch Error',
          body: 'Failed to fetch updated user data; using fallback.',
          variant: 'warning'
        });
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

      localStorage.setItem(
        `tokenUI_user_${token}_${userAddress}`,
        JSON.stringify(serializeBigInt(updatedCache))
      );

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
  initialize();
}); 









