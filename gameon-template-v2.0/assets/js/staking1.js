
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
const CACHE_TIMEOUT_MS = 60_000;
const THROTTLE_GAP_MS = 200;
const CONTRACT_CALL_DELAY_MS = 200;

/* ===================== Token Config ===================== */
const tokenDetails = {
  cft: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    stakingAddress: 'TMrDKEu6vSBSwstToiiooAiwB5xKNghEy8',
    decimals: 6,
    displayName: 'CFT',
    rewardDisplayName: 'CFT',
    rewardDecimals: 6,
    energyCosts: {
      stake: 120000,
      unstake: 75000,
      claimRewards: 100000
    }
  },
  cftx: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    stakingAddress: 'THLETrCqWHVJNURBQNKLBYJTLBGpUnDatp',
    decimals: 6,
    displayName: 'STABLEX',
    rewardDisplayName: 'StableX',
    rewardDecimals: 6,
    energyCosts: {
      stake: 120000,
      unstake: 75000,
      claimRewards: 100000
    }
  },
  cftturu: {
    tokenAddress: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    stakingAddress: 'TXgt8nXRDTbYxbhDbkZyqs9cgjoBikQa72',
    decimals: 8,
    rewardDecimals: 6,
    displayName: 'CFT',
    rewardDisplayName: 'CFT',
    energyCosts: {
      stake: 120000,
      unstake: 75000,
      claimRewards: 100000
    }
  },
  turu: {
    tokenAddress: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    stakingAddress: 'TLQPUiSeCHZ92UcphkesN46XtPN55MkNcm',
    decimals: 8,
    displayName: 'BBT',
    rewardDisplayName: 'BBT',
    energyCosts: {
      stake: 120000,
      unstake: 75000,
      claimRewards: 100000
    }
  },
  king: {
    tokenAddress: 'TMFNzkJaj573F62s4bWmfonKwGcosAA8fE',
    stakingAddress: 'TEppqmC7mb2wF4ExBYbQF6LraqD6qXW5Aj',
    decimals: 6,
    displayName: 'CFT',
    rewardDisplayName: 'CFT',
    energyCosts: {
      stake: 120000,
      unstake: 75000,
      claimRewards: 100000
    }
  },
  fym: {
    tokenAddress: 'TCTvRkt5kVndeGKWJmMUxEc2rovdrGNoK3',
    stakingAddress: 'TP4HhAWv2WbSMCH2CRhdSsiwBP6JzViouq',
    decimals: 6,
    displayName: 'CFT',
    rewardDisplayName: 'CFT',
    energyCosts: {
      stake: 120000,
      unstake: 75000,
      claimRewards: 100000
    }
  }
};

/* ===================== Helpers: throttle, rotation, delay ===================== */
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

/* ===================== TronGrid helper ===================== */
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
}

/* ===================== TronWeb Setup ===================== */
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
  for (let key in tokenDetails) {
    let details = tokenDetails[key];
    if (!isValidTronAddress(details.tokenAddress)) throw new Error(`Invalid token address for ${key}: ${details.tokenAddress}`);
    if (!isValidTronAddress(details.stakingAddress)) throw new Error(`Invalid staking address for ${key}: ${details.stakingAddress}`);
    tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
    await delay(CONTRACT_CALL_DELAY_MS);
    stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
    await delay(CONTRACT_CALL_DELAY_MS);
    if (!details.decimals) {
      tokenDetails[key].decimals = await tokenContracts[key].methods.decimals().call();
    }
  }
  setStatus('Connected', true);
  await updateAllUI(true);
  rotateAdvertisements();
}

/* ===================== Energy Helpers ===================== */
async function checkUserEnergy(address, token, action, extraEnergy = 0) {
  try {
    const resources = await tronWeb.trx.getAccountResources(address);
    const energyLimit = resources.EnergyLimit || 0;
    const energyUsed = resources.EnergyUsed || 0;
    const availableEnergy = energyLimit - energyUsed;
    const baseRequiredEnergy = tokenDetails[token].energyCosts[action];
    const requiredEnergy = baseRequiredEnergy + extraEnergy;
    const shortfall = Math.max(0, requiredEnergy - availableEnergy);
    return { availableEnergy, shortfall, requiredEnergy };
  } catch (error) {
    console.error(`Error checking energy for ${address}:`, error);
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
  } catch (error) {
    console.error('Error fetching delegator energy:', error);
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
      reject(new Error('Energy rental modal not found.'));
      return;
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
      if (!el) {
        reject(new Error(`Modal element ${id} not found.`));
        return;
      }
      el.textContent = value;
    }
    const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
    modalElement.addEventListener('shown.bs.modal', () => modalElement.removeAttribute('aria-hidden'), { once: true });
    const confirmButton = document.getElementById('rent-energy-confirm');
    if (!confirmButton) {
      reject(new Error('Rent energy confirm button not found.'));
      return;
    }
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
    try {
      modal.show();
    } catch {
      reject(new Error('Failed to show energy rental modal.'));
    }
  });
}

/* ===================== ABIs ===================== */
const stakingContractAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_stakingToken",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_dailyReward",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "viewAPR",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "Withdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reward",
        "type": "uint256"
      }
    ],
    "name": "RewardClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "OwnerWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "OwnerStakedTokenWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardPerToken",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "earned",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "viewProjectedRewardsForYear",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewTotalUnclaimedRewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "totalUnclaimedRewards",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewTotalStaked",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "viewStakedAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "viewPendingReward",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "viewDailyReward",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "viewTotalClaimedRewards",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_dailyReward",
        "type": "uint256"
      }
    ],
    "name": "setDailyReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ownerWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "ownerWithdrawStakedTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

const tokenContractAbi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "taxAddress",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "taxRate",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "whitelist",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "success",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_taxRate",
        "type": "uint256"
      }
    ],
    "name": "setTaxRate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_taxAddress",
        "type": "address"
      }
    ],
    "name": "setTaxAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_isWhitelisted",
        "type": "bool"
      }
    ],
    "name": "updateWhitelist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "oldRate",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newRate",
        "type": "uint256"
      }
    ],
    "name": "TaxRateChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "oldAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "newAddress",
        "type": "address"
      }
    ],
    "name": "TaxAddressChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isWhitelisted",
        "type": "bool"
      }
    ],
    "name": "WhitelistUpdated",
    "type": "event"
  }
];

/* ===================== Utils ===================== */
const TEN = 10n;
const toUnits = (raw, decimals = 6) => {
  try {
    return Number(BigInt(raw) / (TEN ** BigInt(decimals)));
  } catch {
    return 0;
  }
};
const fmt = (n, max = 6) => Number(n ?? 0).toLocaleString('en-US', { maximumFractionDigits: max });
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

/* ===================== UI Helpers ===================== */
function showToast({ title = 'Notification', body = '', variant = 'dark', autohide = true }) {
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

function withLoading(btn, label = 'Processing', fn) {
  return async (...args) => {
    if (!btn) return fn(...args);
    btn.disabled = true;
    const old = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${label}`;
    try {
      return await fn(...args);
    } finally {
      btn.disabled = false;
      btn.innerHTML = old;
    }
  };
}

function setStatus(text, ok = true) {
  const chip = document.getElementById('status-chip');
  const txt = document.getElementById('status-text');
  if (chip && txt) {
    txt.textContent = text;
    chip.querySelector('.dot').style.background = ok ? '#00ff88' : '#ff4d4d';
  }
}

function setSkeleton(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  if (on) {
    el.classList.add('skeleton');
    el.textContent = '';
    el.style.minHeight = el.style.minHeight || '22px';
  } else {
    el.classList.remove('skeleton');
  }
}

function showProcessingModal(step = '') {
  const modalElement = document.getElementById('transaction-processing-modal');
  if (!modalElement) throw new Error('Processing modal not found.');
  const titleElement = document.getElementById('transactionProcessingModalLabel');
  if (titleElement) titleElement.textContent = `Processing Transaction ${step}`;
  const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
  modalElement.addEventListener('shown.bs.modal', () => modalElement.removeAttribute('aria-hidden'), { once: true });
  modal.show();
  return modal;
}

function hideProcessingModal(modal) {
  if (modal) modal.hide();
}

/* ===================== Core ===================== */
async function initialize() {
  const connectButton = document.getElementById('connect-button');
  if (!connectButton) {
    console.error('Connect button not found.');
    showToast({ title: 'Error', body: 'Connect button not found in HTML.', variant: 'danger' });
    return;
  }
  connectButton.addEventListener('click', connectWallet);
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(t => new bootstrap.Tooltip(t));
  document.querySelectorAll('[data-fill]')?.forEach(btn => {
    btn.addEventListener('click', () => {
      const pct = Number(btn.dataset.fill || '0');
      const availEl = document.getElementById(`available-tokens-${btn.closest('.panel').querySelector('input').id.split('-')[2]}`);
      const input = document.getElementById(`stake-amount-${btn.closest('.panel').querySelector('input').id.split('-')[2]}`);
      const available = Number((availEl?.dataset.raw) || availEl?.textContent?.replace(/[^0-9.]/g, '') || '0');
      if (input) input.value = (available * pct).toFixed(6);
    });
  });
  const isTronLinkInstalled = await checkTronLinkInstalled();
  if (isTronLinkInstalled && window.tronLink && window.tronLink.ready) {
    try {
      await initializeTronWeb();
    } catch (e) {
      showToast({ title: 'Auto-connect failed', body: e.message, variant: 'danger' });
    }
  }
}

async function checkTronLinkInstalled() {
  return new Promise(resolve => {
    let attempts = 0;
    const maxAttempts = 5;
    const interval = setInterval(() => {
      attempts++;
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        clearInterval(interval);
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        resolve(false);
      }
    }, 500);
  });
}

async function connectWallet() {
  try {
    if (!window.tronLink) throw new Error('TronLink is not detected. Install or unlock TronLink.');
    if (!window.tronLink.ready) throw new Error('TronLink is not ready. Unlock TronLink and select mainnet.');
    await window.tronLink.request({ method: 'tron_requestAccounts' });
    await initializeTronWeb();
  } catch (e) {
    showToast({ title: 'Wallet', body: e.message, variant: 'danger' });
  }
}

/* ===================== UI Updates ===================== */
async function updateAllUI(first = false) {
  for (let key in tokenDetails) {
    await updateTokenUI(key, first);
    await delay(CONTRACT_CALL_DELAY_MS);
  }
}

async function updateTokenUI(token, first = false) {
  const cacheKey = `tokenUI_${token}_${userAddress}`;
  if (!first) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIMEOUT_MS) {
        const { balanceUnits, stakedUnits, projectedUnits, claimableUnits, claimedUnits } = data;
        const d = tokenDetails[token];
        const updateElement = (id, value, skeletonId) => {
          const el = document.getElementById(id);
          if (el) {
            el.textContent = value;
            if (id === `available-tokens-${token}`) el.dataset.raw = String(balanceUnits);
            if (skeletonId) setSkeleton(skeletonId, false);
          }
        };
        updateElement(`available-tokens-${token}`, fmt(balanceUnits), `available-tokens-${token}`);
        updateElement(`staked-amount-${token}`, fmt(stakedUnits), `staked-amount-${token}`);
        updateElement(`projected-rewards-${token}`, fmt(projectedUnits), `projected-rewards-${token}`);
        updateElement(`claimable-rewards-${token}`, `${fmt(claimableUnits)} ${d.rewardDisplayName}`);
        updateElement(`total-claimed-rewards-${token}`, fmt(claimedUnits), `total-claimed-rewards-${token}`);
        return;
      }
    }
  }
  try {
    if (first) {
      [`available-tokens-${token}`, `staked-amount-${token}`, `projected-rewards-${token}`, `total-claimed-rewards-${token}`].forEach(id => setSkeleton(id, true));
    }
    const d = tokenDetails[token];
    const [balanceRaw, stakedAmount, projectedRewards, claimableRewards, totalClaimedRewards] = await Promise.all([
      tokenContracts[token].methods.balanceOf(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.viewStakedAmount(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.viewPendingReward(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.viewTotalClaimedRewards(userAddress).call().catch(() => '0')
    ]);
    await delay(CONTRACT_CALL_DELAY_MS);
    const decimals = d.decimals;
    const rewardDecimals = d.rewardDecimals || decimals;
    const balanceUnits = toUnits(balanceRaw, decimals);
    const stakedUnits = toUnits(stakedAmount, decimals);
    const projectedUnits = toUnits(projectedRewards, rewardDecimals);
    const claimableUnits = toUnits(claimableRewards, rewardDecimals);
    const claimedUnits = toUnits(totalClaimedRewards, rewardDecimals);
    const cacheData = {
      data: {
        balanceUnits: Number(balanceUnits),
        stakedUnits: Number(stakedUnits),
        projectedUnits: Number(projectedUnits),
        claimableUnits: Number(claimableUnits),
        claimedUnits: Number(claimedUnits)
      },
      timestamp: Date.now()
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    const updateElement = (id, value, skeletonId) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        if (id === `available-tokens-${token}`) el.dataset.raw = String(balanceUnits);
        if (skeletonId) setSkeleton(skeletonId, false);
      }
    };
    updateElement(`available-tokens-${token}`, fmt(balanceUnits), `available-tokens-${token}`);
    updateElement(`staked-amount-${token}`, fmt(stakedUnits), `staked-amount-${token}`);
    updateElement(`projected-rewards-${token}`, fmt(projectedUnits), `projected-rewards-${token}`);
    updateElement(`claimable-rewards-${token}`, `${fmt(claimableUnits)} ${d.rewardDisplayName}`);
    updateElement(`total-claimed-rewards-${token}`, fmt(claimedUnits), `total-claimed-rewards-${token}`);
  } catch (error) {
    console.error(`Error updating UI for ${token}:`, error);
    showToast({ title: `UI Update Error for ${token}`, body: error.message, variant: 'danger' });
    [`available-tokens-${token}`, `staked-amount-${token}`, `projected-rewards-${token}`, `total-claimed-rewards-${token}`].forEach(id => setSkeleton(id, false));
  }
}

/* ===================== Actions ===================== */
async function stakeTokens(token, amount) {
  let processingModal = null;
  const stakeBtn = document.getElementById(`stake-button-${token}`);
  const run = async () => {
    try {
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) {
        throw new Error(`Invalid staking address: ${tokenDetails[token].stakingAddress}`);
      }
      if (!isValidTronAddress(tokenDetails[token].tokenAddress)) {
        throw new Error(`Invalid token address: ${tokenDetails[token].tokenAddress}`);
      }
      if (!userAddress || !isValidTronAddress(userAddress)) {
        throw new Error('Invalid user address. Please reconnect wallet.');
      }
      const amountToStake = toWei(amount, tokenDetails[token].decimals);
      if (amountToStake === 0n) {
        throw new Error('Enter a valid amount to stake.');
      }
      const stakingContractAddress = tokenDetails[token].stakingAddress;
      const tokenContract = tokenContracts[token];
      const stakingContract = stakingContracts[token];
      if (!tokenContract || !tokenContract.methods.allowance) {
        throw new Error(`Token contract for ${token} not properly initialized`);
      }
      if (!stakingContract || !stakingContract.methods.stake) {
        throw new Error(`Staking contract for ${token} not properly initialized`);
      }
      const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
      await delay(CONTRACT_CALL_DELAY_MS);
      if (BigInt(balanceRaw) < amountToStake) {
        throw new Error('Insufficient balance to stake.');
      }
      const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
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
          'approve(address,uint256)',
          {},
          [
            { type: 'address', value: stakingContractAddress },
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
        await delay(5000);
      }
      const stakeTx = await tronWeb.transactionBuilder.triggerSmartContract(
        stakingContractAddress,
        'stake(uint256)',
        {},
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
      localStorage.removeItem(`tokenUI_${token}_${userAddress}`);
      await updateTokenUI(token, true);
    } catch (error) {
      hideProcessingModal(processingModal);
      showToast({ title: `Stake error for ${token}`, body: error.message, variant: 'danger' });
    }
  };
  return withLoading(stakeBtn, 'Staking...', run)();
}

async function unstakeTokens(token) {
  let processingModal = null;
  const btn = document.getElementById(`unstake-button-${token}`);
  const run = async () => {
    try {
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) {
        throw new Error(`Invalid staking address: ${tokenDetails[token].stakingAddress}`);
      }
      if (!userAddress || !isValidTronAddress(userAddress)) {
        throw new Error('Invalid user address. Please reconnect wallet.');
      }
      const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
      if (!unstakeAmount || isNaN(unstakeAmount) || Number(unstakeAmount) <= 0) {
        throw new Error('Please enter a valid amount to unstake.');
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
      if (!stakingContract || !stakingContract.methods.withdraw) {
        throw new Error(`Staking contract for ${token} not properly initialized`);
      }
      const stakedAmount = await stakingContract.methods.viewStakedAmount(userAddress).call();
      await delay(CONTRACT_CALL_DELAY_MS);
      if (BigInt(stakedAmount) < amountToUnstake) {
        throw new Error('Insufficient staked amount to withdraw.');
      }
      const withdrawTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress,
        'withdraw(uint256)',
        {},
        [{ type: 'uint256', value: amountToUnstake.toString() }],
        userAddress
      );
      if (!withdrawTx.result || !withdrawTx.transaction) {
        throw new Error('Failed to create withdraw transaction');
      }
      const signedWithdrawTx = await tronWeb.trx.sign(withdrawTx.transaction);
      const broadcastWithdraw = await tronWeb.trx.sendRawTransaction(signedWithdrawTx);
      if (!broadcastWithdraw.result) {
        throw new Error('Failed to broadcast withdraw transaction');
      }
      showToast({
        title: 'Withdraw submitted',
        body: `<a href="https://tronscan.org/#/transaction/${broadcastWithdraw.txid}" target="_blank" rel="noopener">View on Tronscan</a>`
      });
      hideProcessingModal(processingModal);
      localStorage.removeItem(`tokenUI_${token}_${userAddress}`);
      await updateTokenUI(token, true);
    } catch (error) {
      hideProcessingModal(processingModal);
      showToast({ title: `Withdraw error for ${token}`, body: error.message, variant: 'danger' });
    }
  };
  return withLoading(btn, 'Withdrawing...', run)();
}

async function claimRewards(token) {
  let processingModal = null;
  const btn = document.getElementById(`claim-rewards-button-${token}`);
  const run = async () => {
    try {
      if (!isValidTronAddress(tokenDetails[token].stakingAddress)) {
        throw new Error(`Invalid staking address: ${tokenDetails[token].stakingAddress}`);
      }
      if (!userAddress || !isValidTronAddress(userAddress)) {
        throw new Error('Invalid user address. Please reconnect wallet.');
      }
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
      if (!stakingContract || !stakingContract.methods.claimReward) {
        throw new Error(`Staking contract for ${token} not properly initialized`);
      }
      const pendingReward = await stakingContract.methods.viewPendingReward(userAddress).call();
      await delay(CONTRACT_CALL_DELAY_MS);
      if (BigInt(pendingReward) === 0n) {
        throw new Error('No rewards available to claim.');
      }
      const claimTx = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenDetails[token].stakingAddress,
        'claimReward()',
        {},
        [],
        userAddress
      );
      if (!claimTx.result || !claimTx.transaction) {
        throw new Error('Failed to create claim reward transaction');
      }
      const signedClaimTx = await tronWeb.trx.sign(claimTx.transaction);
      const broadcastClaim = await tronWeb.trx.sendRawTransaction(signedClaimTx);
      if (!broadcastClaim.result) {
        throw new Error('Failed to broadcast claim reward transaction');
      }
      showToast({
        title: 'Claim submitted',
        body: `<a href="https://tronscan.org/#/transaction/${broadcastClaim.txid}" target="_blank" rel="noopener">View on Tronscan</a>`
      });
      hideProcessingModal(processingModal);
      localStorage.removeItem(`tokenUI_${token}_${userAddress}`);
      await updateTokenUI(token, true);
    } catch (error) {
      hideProcessingModal(processingModal);
      showToast({ title: `Claim error for ${token}`, body: error.message, variant: 'danger' });
    }
  };
  return withLoading(btn, 'Claiming...', run)();
}

/* ===================== Events ===================== */
document.addEventListener('DOMContentLoaded', () => {
  for (let key in tokenDetails) {
    const stakeButton = document.getElementById(`stake-button-${key}`);
    if (stakeButton) {
      stakeButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const amount = document.getElementById(`stake-amount-${key}`).value;
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
          showToast({ title: 'Invalid Input', body: 'Please enter a valid amount to stake.', variant: 'danger' });
          return;
        }
        await stakeTokens(key, amount);
      });
    } else {
      console.error(`Stake button for ${key} not found`);
    }
    const unstakeButton = document.getElementById(`unstake-button-${key}`);
    if (unstakeButton) {
      unstakeButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await unstakeTokens(key);
      });
    } else {
      console.error(`Unstake button for ${key} not found`);
    }
    const claimButton = document.getElementById(`claim-rewards-button-${key}`);
    if (claimButton) {
      claimButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await claimRewards(key);
      });
    } else {
      console.error(`Claim rewards button for ${key} not found`);
    }
  }
  initialize();
});




