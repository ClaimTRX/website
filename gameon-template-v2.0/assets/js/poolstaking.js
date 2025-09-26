let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// TronGrid API configuration
const TRONGRID_API_KEY = 'd0abc8e9-5d3d-420d-88dd-60f4f1bd95ca'; // Replace with your TronGrid API key
const TRONGRID_API_URL = 'https://api.trongrid.io';
const PAYMENT_ADDRESS = 'TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn';
const SERVER_URL = 'https://api.cftecosystem.com';
const SAFETY_ENERGY = 20000;
const ENERGY_PRICE_SUN = 10;
const SUN_PER_TRX = 1000000;
const ENERGY_RENTAL_DURATION = 2;

// Define contract details for CFT
const tokenDetails = {
  cft: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK', // Replace with actual TRC20 CFT address
    stakingAddress: 'TFbHhLVmaiRgCNq3p9ojSTfKcuYetHaRBc', // Replace with actual staking contract address
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

// Staking contract ABI (from StakingContract.sol)
const stakingContractAbi = [
  {
    "inputs": [{"internalType": "address", "name": "_trc20Token", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "Staked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "Unstaked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "totalRewards", "type": "uint256"}],
    "name": "RewardsDistributed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "RewardsClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "newSize", "type": "uint256"}],
    "name": "PoolSizeUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "newPercentage", "type": "uint256"}],
    "name": "DailyPayoutPercentageUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "uint256", "name": "newTimeout", "type": "uint256"}],
    "name": "ClaimTimeoutUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": false, "internalType": "address", "name": "newWallet", "type": "address"}],
    "name": "AuthorizedWalletUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "RewardsForfeited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true, "internalType": "address", "name": "user", "type": "address"}],
    "name": "TokensActivated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "TRXWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "TRC20Withdrawn",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "trc20Token",
    "outputs": [{"internalType": "contract ITRC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "authorizedWallet",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poolSize",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dailyPayoutPercentage",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimTimeout",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastDistribution",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "users",
    "outputs": [
      {"internalType": "uint256", "name": "stakedAmount", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"},
      {"internalType": "uint256", "name": "pendingRewards", "type": "uint256"},
      {"internalType": "uint256", "name": "lastClaimTimestamp", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
    "name": "unstake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "claimRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "distributeRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "calculateAPY",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
    "name": "setPoolSize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "addToPool",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_percentage", "type": "uint256"}],
    "name": "setDailyPayoutPercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_timeout", "type": "uint256"}],
    "name": "setClaimTimeout",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_wallet", "type": "address"}],
    "name": "setAuthorizedWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "activateTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_amount", "type": "uint256"},
      {"internalType": "address", "name": "_to", "type": "address"}
    ],
    "name": "withdrawTRX",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_amount", "type": "uint256"},
      {"internalType": "address", "name": "_to", "type": "address"}
    ],
    "name": "withdrawTRC20",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
];

// Token contract ABI (standard TRC20)
const tokenContractAbi = [
  {
    "inputs": [
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "uint256", "name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_spender", "type": "address"},
      {"internalType": "uint256", "name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "_from", "type": "address"},
      {"internalType": "address", "name": "_to", "type": "address"},
      {"internalType": "uint256", "name": "_value", "type": "uint256"}
    ],
    "name": "transferFrom",
    "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "", "type": "address"},
      {"internalType": "address", "name": "", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Validate TRON address format
function isValidTronAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return address.startsWith('T') && address.length === 34 && /^[A-Za-z1-9]+$/.test(address);
}

// Show transaction processing modal
function showProcessingModal(transactionStep = '') {
  const modalElement = document.getElementById('transaction-processing-modal');
  if (!modalElement) {
    console.error('Transaction processing modal element not found');
    throw new Error('Transaction processing modal not found.');
  }
  const titleElement = document.getElementById('transactionProcessingModalLabel');
  if (titleElement) {
    titleElement.textContent = `Processing Transaction ${transactionStep}`;
  }
  const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
  modal.show();
  return modal;
}

// Hide transaction processing modal
function hideProcessingModal(modal) {
  if (modal) modal.hide();
}

// Check user's available energy
async function checkUserEnergy(address, token, action, extraEnergy = 0) {
  try {
    console.log(`Checking energy for address: ${address}, token: ${token}, action: ${action}, extraEnergy: ${extraEnergy}`);
    const resources = await tronWeb.trx.getAccountResources(address);
    const energyLimit = resources.EnergyLimit || 0;
    const energyUsed = resources.EnergyUsed || 0;
    const availableEnergy = energyLimit - energyUsed;
    const baseRequiredEnergy = tokenDetails[token].energyCosts[action];
    const requiredEnergy = baseRequiredEnergy + extraEnergy;
    const shortfall = Math.max(0, requiredEnergy - availableEnergy);
    console.log(`Energy: Limit=${energyLimit}, Used=${energyUsed}, Available=${availableEnergy}, Required=${requiredEnergy}, Shortfall=${shortfall}`);
    return { availableEnergy, shortfall, requiredEnergy };
  } catch (error) {
    console.error(`Error checking energy for ${address}:`, error);
    const baseRequiredEnergy = tokenDetails[token].energyCosts[action];
    const requiredEnergy = baseRequiredEnergy + extraEnergy;
    return { availableEnergy: 0, shortfall: requiredEnergy, requiredEnergy };
  }
}

// Check delegator's available energy
async function checkDelegatorEnergy(requiredAmount) {
  try {
    console.log(`Fetching delegator available energy for ${requiredAmount} units...`);
    const response = await fetch(`${SERVER_URL}/api/available-energy`);
    const data = await response.json();
    if (data.success) {
      const availableEnergy = Number(data.availableEnergy);
      console.log(`Delegator available energy: ${availableEnergy}`);
      return availableEnergy >= requiredAmount;
    }
    throw new Error('Failed to fetch delegator energy');
  } catch (error) {
    console.error('Error fetching delegator energy:', error);
    return false;
  }
}

// Request energy rental
async function requestEnergyRental(rentalEnergy, rentalCostTrx) {
  let processingModal = null;
  try {
    processingModal = showProcessingModal('(1/2)');
    if (!userAddress) throw new Error('Please connect your wallet first.');
    console.log(`Initiating payment of ${rentalCostTrx} TRX for ${rentalEnergy} energy...`);
    const result = await tronWeb.trx.sendTransaction(PAYMENT_ADDRESS, rentalCostTrx * SUN_PER_TRX);
    console.log('Payment transaction sent:', result);
    if (!result.result) throw new Error('Transaction was rejected or failed.');
    const totalEnergy = rentalEnergy + SAFETY_ENERGY;
    console.log(`Notifying server of energy request for ${totalEnergy} energy...`);
    const response = await fetch(`${SERVER_URL}/api/request-energy`, {
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
    const data = await response.json();
    if (!data.success) throw new Error(`Server error: ${data.message}`);
    console.log('Waiting for energy delegation...');
    const delegationResult = await pollDelegationStatus(data.requestId);
    hideProcessingModal(processingModal);
    return delegationResult;
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error('Error requesting energy rental:', error);
    throw error;
  }
}

// Poll for delegation status
async function pollDelegationStatus(requestId) {
  console.log(`Starting to poll delegation status for request ${requestId}...`);
  const maxPollAttempts = 30;
  let pollAttempts = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      pollAttempts++;
      try {
        console.log(`Polling delegation status, attempt ${pollAttempts}...`);
        const response = await fetch(`${SERVER_URL}/api/delegation-status?requestId=${requestId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.status === 'delegated') {
          clearInterval(interval);
          console.log(`Energy delegated successfully for request ${requestId}`);
          resolve(true);
        } else if (data.status === 'failed' || data.status === 'expired') {
          clearInterval(interval);
          console.error(`Delegation failed: ${data.message}`);
          reject(new Error(`Delegation failed: ${data.message}`));
        } else if (pollAttempts >= maxPollAttempts) {
          clearInterval(interval);
          console.error(`Delegation timed out for request ${requestId}`);
          reject(new Error('Delegation timed out after 60 seconds.'));
        }
      } catch (error) {
        console.error(`Error polling delegation status:`, error);
        if (pollAttempts >= maxPollAttempts) {
          clearInterval(interval);
          reject(new Error(`Error polling delegation status: ${error.message}`));
        }
      }
    }, 2000);
  });
}

// Show energy rental modal
function showEnergyRentalModal(userEnergy, shortfall, requiredEnergy, message = '') {
  return new Promise((resolve, reject) => {
    const modalElement = document.getElementById('energy-rental-modal');
    if (!modalElement) {
      console.error('Energy rental modal element not found');
      reject(new Error('Energy rental modal not found.'));
      return;
    }
    const rentalEnergy = shortfall;
    const rentalCostSun = rentalEnergy * ENERGY_PRICE_SUN;
    const rentalCostTrx = rentalCostSun / SUN_PER_TRX;
    const elements = {
      'user-energy': userEnergy.toLocaleString('en-US'),
      'required-energy': requiredEnergy.toLocaleString('en-US') + message,
      'rental-energy': rentalEnergy.toLocaleString('en-US'),
      'rental-cost-trx': rentalCostTrx.toFixed(2),
      'rental-duration': ENERGY_RENTAL_DURATION
    };
    for (const [id, value] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
      else {
        console.error(`Element ${id} not found in energy rental modal`);
        reject(new Error(`Modal element ${id} not found.`));
        return;
      }
    }
    const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
    const confirmButton = document.getElementById('rent-energy-confirm');
    if (!confirmButton) {
      console.error('Rent energy confirm button not found');
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
    } catch (error) {
      console.error('Error showing energy rental modal:', error);
      reject(new Error('Failed to show energy rental modal.'));
    }
  });
}

// Initialize
async function initialize() {
  const connectButton = document.getElementById('connect-button');
  if (!connectButton) {
    console.error('Connect button not found.');
    return;
  }
  connectButton.addEventListener('click', connectWallet);
  console.log('Initializing page...');
  const isTronLinkInstalled = await checkTronLinkInstalled();
  if (isTronLinkInstalled && window.tronLink && window.tronLink.ready) {
    console.log('TronLink detected. Attempting auto-connect...');
    try {
      await initializeTronWeb();
    } catch (error) {
      console.error('Auto-connect failed:', error);
      alert(`Auto-connect failed: ${error.message}. Please connect your wallet manually.`);
    }
  } else {
    console.log('TronLink not detected or not ready.');
  }
}

async function checkTronLinkInstalled() {
  return new Promise(resolve => {
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      attempts++;
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        clearInterval(interval);
        console.log('TronLink detected and ready.');
        resolve(true);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        console.log('TronLink not detected after 10 seconds.');
        resolve(false);
      }
    }, 1000);
  });
}

async function connectWallet() {
  try {
    if (!window.tronLink) throw new Error('TronLink is not detected. Please install or unlock TronLink.');
    if (!window.tronLink.ready) throw new Error('TronLink is not ready. Please unlock TronLink and set to mainnet.');
    console.log('Requesting TronLink account access...');
    await window.tronLink.request({ method: 'tron_requestAccounts' });
    await initializeTronWeb();
  } catch (e) {
    console.error('Failed to connect to TronLink:', e);
    alert(`Failed to connect to TronLink: ${e.message}. Please ensure TronLink is installed, unlocked, set to mainnet.`);
  }
}

async function initializeTronWeb() {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    if (!userAddress) throw new Error('No user address found. Ensure TronLink is connected and set to mainnet.');
    console.log('User Address:', userAddress);
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
    const key = 'cft';
    const details = tokenDetails[key];
    if (!isValidTronAddress(details.tokenAddress)) throw new Error(`Invalid token address for ${key}: ${details.tokenAddress}`);
    if (!isValidTronAddress(details.stakingAddress)) throw new Error(`Invalid staking address for ${key}: ${details.stakingAddress}`);
    tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
    stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
    console.log(`Token contract for ${key}:`, tokenContracts[key]);
    console.log(`Staking contract for ${key}:`, stakingContracts[key]);
    if (!details.decimals) {
      tokenDetails[key].decimals = await tokenContracts[key].methods.decimals().call();
      console.log(`Decimals for ${key}:`, tokenDetails[key].decimals);
    }
    await updateTokenUI(key);
    const owner = await stakingContracts[key].methods.owner().call();
    if (userAddress === owner) {
      document.getElementById('admin-section').style.display = 'block';
    }
    setInterval(() => updateTokenUI(key), 60000);
  } catch (error) {
    console.error('Error initializing TronWeb or Contracts:', error);
    alert(`Error initializing contracts: ${error.message}.`);
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateTokenUI(token) {
  try {
    const [balanceRaw, userData, apy] = await Promise.all([
      tokenContracts[token].methods.balanceOf(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.users(userAddress).call().catch(() => ({ stakedAmount: '0', pendingRewards: '0', isActive: false })),
      stakingContracts[token].methods.calculateAPY(userAddress).call().catch(() => '0')
    ]);
    const decimals = tokenDetails[token].decimals;
    const rewardDecimals = tokenDetails[token].rewardDecimals;
    const balance = BigInt(balanceRaw) / BigInt(10 ** decimals);
    const balanceElement = document.getElementById(`available-tokens-${token}`);
    if (balanceElement) balanceElement.innerText = balance.toLocaleString('en-US');
    else console.error(`Element available-tokens-${token} not found`);
    await delay(200);
    const staked = BigInt(userData.stakedAmount) / BigInt(10 ** decimals);
    const stakedElement = document.getElementById(`staked-amount-${token}`);
    if (stakedElement) stakedElement.innerText = staked.toLocaleString('en-US');
    else console.error(`Element staked-amount-${token} not found`);
    await delay(200);
    const apyPercentage = Number(apy) / 100;
    const projectedElement = document.getElementById(`projected-rewards-${token}`);
    if (projectedElement) projectedElement.innerText = apyPercentage.toFixed(2) + '%';
    else console.error(`Element projected-rewards-${token} not found`);
    await delay(200);
    const claimable = BigInt(userData.pendingRewards) / BigInt(10 ** rewardDecimals);
    const claimableElement = document.getElementById(`claimable-rewards-${token}`);
    if (claimableElement) claimableElement.innerText = claimable.toLocaleString('en-US') + " TRX";
    else console.error(`Element claimable-rewards-${token} not found`);
    await delay(200);
    const activateButton = document.getElementById(`activate-tokens-button-${token}`);
    if (activateButton) {
      activateButton.style.display = userData.isActive || Number(userData.stakedAmount) === 0 ? 'none' : 'block';
    }
  } catch (error) {
    console.error(`Error updating UI for ${token}:`, error);
    alert(`Error updating UI for ${token}: ${error.message}.`);
  }
}

async function tronGridApiCall(endpoint, params = {}) {
  try {
    const response = await fetch(`${TRONGRID_API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TRON-PRO-API-KEY': TRONGRID_API_KEY
      },
      body: JSON.stringify(params)
    });
    if (response.status === 403) {
      console.warn('TronGrid API key is invalid or rate-limited.');
      return { error: 'API key invalid or rate-limited' };
    }
    const data = await response.json();
    if (data.Error) throw new Error(data.Error);
    return data;
  } catch (error) {
    console.error(`TronGrid API error at ${endpoint}:`, error);
    return { error: error.message };
  }
}

async function stakeTokens(token, amount) {
  let processingModal = null;
  try {
    if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error(`Invalid staking address: ${tokenDetails[token].stakingAddress}`);
    if (!isValidTronAddress(tokenDetails[token].tokenAddress)) throw new Error(`Invalid token address: ${tokenDetails[token].tokenAddress}`);
    if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Please reconnect wallet.');
    const amountToStake = BigInt(amount) * BigInt(10 ** tokenDetails[token].decimals);
    const stakingContractAddress = tokenDetails[token].stakingAddress;
    const tokenContract = tokenContracts[token];
    const stakingContract = stakingContracts[token];
    if (!tokenContract || !tokenContract.methods.allowance) throw new Error(`Token contract for ${token} not properly initialized`);
    if (!stakingContract || !stakingContract.methods.stake) throw new Error(`Staking contract for ${token} not properly initialized`);
    const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
    if (BigInt(balanceRaw) < amountToStake) throw new Error('Insufficient balance to stake.');
    console.log('Checking allowance...');
    const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
    const allowance = BigInt(allowanceRaw);
    let approvalRequired = allowance < amountToStake;
    let energyCheckResult;
    if (approvalRequired) {
      console.log('Approval required. Checking energy...');
      energyCheckResult = await checkUserEnergy(userAddress, token, 'stake', 30000);
    } else {
      console.log('No approval needed. Checking energy...');
      energyCheckResult = await checkUserEnergy(userAddress, token, 'stake');
    }
    let { availableEnergy, shortfall, requiredEnergy } = energyCheckResult;
    if (shortfall > 0) {
      const totalRequired = shortfall + SAFETY_ENERGY;
      const hasEnoughEnergy = await checkDelegatorEnergy(totalRequired);
      if (hasEnoughEnergy) {
        const modalResult = await showEnergyRentalModal(
          availableEnergy,
          shortfall,
          requiredEnergy,
          approvalRequired ? ' (including 30,000 for token approval)' : ''
        );
        if (modalResult.rent) {
          processingModal = showProcessingModal('(1/2)');
          await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
          console.log('Energy rented successfully.');
          await delay(5000);
          hideProcessingModal(processingModal);
        } else {
          console.log('User declined energy rental.');
        }
      } else {
        console.log('Insufficient delegator energy.');
      }
    }
    processingModal = showProcessingModal('(2/2)');
    if (approvalRequired) {
      console.log('Requesting approval...');
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
      if (!approvalTx.result || !approvalTx.transaction) throw new Error('Failed to create approve transaction');
      const signedApprovalTx = await tronWeb.trx.sign(approvalTx.transaction);
      const broadcastApproval = await tronWeb.trx.sendRawTransaction(signedApprovalTx);
      if (!broadcastApproval.result) throw new Error('Failed to broadcast approve transaction');
      console.log('Approval transaction broadcasted:', broadcastApproval.txid);
      await delay(5000);
    }
    console.log('Sending stake transaction...');
    const stakeTx = await tronWeb.transactionBuilder.triggerSmartContract(
      stakingContractAddress,
      'stake(uint256)',
      {},
      [{ type: 'uint256', value: amountToStake.toString() }],
      userAddress
    );
    if (!stakeTx.result || !stakeTx.transaction) throw new Error('Failed to create stake transaction');
    const signedStakeTx = await tronWeb.trx.sign(stakeTx.transaction);
    const broadcastStake = await tronWeb.trx.sendRawTransaction(signedStakeTx);
    if (!broadcastStake.result) throw new Error('Failed to broadcast stake transaction');
    console.log('Stake transaction broadcasted:', broadcastStake.txid);
    hideProcessingModal(processingModal);
    await updateTokenUI(token);
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error(`Error staking tokens for ${token}:`, error);
    alert(`Error staking tokens: ${error.message}.`);
  }
}

async function unstakeTokens(token) {
  let processingModal = null;
  try {
    if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error(`Invalid staking address: ${tokenDetails[token].stakingAddress}`);
    if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Please reconnect wallet.');
    const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
    if (!unstakeAmount || isNaN(unstakeAmount) || Number(unstakeAmount) <= 0) throw new Error('Please enter a valid amount to unstake.');
    const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'unstake');
    if (shortfall > 0) {
      const totalRequired = shortfall + SAFETY_ENERGY;
      const hasEnoughEnergy = await checkDelegatorEnergy(totalRequired);
      if (hasEnoughEnergy) {
        const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
        if (modalResult.rent) {
          processingModal = showProcessingModal('(1/2)');
          await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
          console.log('Energy rented successfully.');
          await delay(5000);
          hideProcessingModal(processingModal);
        } else {
          console.log('User declined energy rental.');
        }
      } else {
        console.log('Insufficient delegator energy.');
      }
    }
    processingModal = showProcessingModal('(2/2)');
    const amountToUnstake = BigInt(unstakeAmount) * BigInt(10 ** tokenDetails[token].decimals);
    const stakingContract = stakingContracts[token];
    if (!stakingContract || !stakingContract.methods.unstake) throw new Error(`Staking contract for ${token} not properly initialized`);
    const userData = await stakingContract.methods.users(userAddress).call();
    if (BigInt(userData.stakedAmount) < amountToUnstake) throw new Error('Insufficient staked amount to withdraw.');
    console.log('Sending unstake transaction...');
    const withdrawTx = await tronWeb.transactionBuilder.triggerSmartContract(
      tokenDetails[token].stakingAddress,
      'unstake(uint256)',
      {},
      [{ type: 'uint256', value: amountToUnstake.toString() }],
      userAddress
    );
    if (!withdrawTx.result || !withdrawTx.transaction) throw new Error('Failed to create unstake transaction');
    const signedWithdrawTx = await tronWeb.trx.sign(withdrawTx.transaction);
    const broadcastWithdraw = await tronWeb.trx.sendRawTransaction(signedWithdrawTx);
    if (!broadcastWithdraw.result) throw new Error('Failed to broadcast unstake transaction');
    console.log('Unstake transaction broadcasted:', broadcastWithdraw.txid);
    hideProcessingModal(processingModal);
    await updateTokenUI(token);
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error(`Error unstaking tokens for ${token}:`, error);
    alert(`Error unstaking tokens: ${error.message}.`);
  }
}

async function claimRewards(token) {
  let processingModal = null;
  try {
    if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error(`Invalid staking address: ${tokenDetails[token].stakingAddress}`);
    if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Please reconnect wallet.');
    const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'claimRewards');
    if (shortfall > 0) {
      const totalRequired = shortfall + SAFETY_ENERGY;
      const hasEnoughEnergy = await checkDelegatorEnergy(totalRequired);
      if (hasEnoughEnergy) {
        const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
        if (modalResult.rent) {
          processingModal = showProcessingModal('(1/2)');
          await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
          console.log('Energy rented successfully.');
          await delay(5000);
          hideProcessingModal(processingModal);
        } else {
          console.log('User declined energy rental.');
        }
      } else {
        console.log('Insufficient delegator energy.');
      }
    }
    processingModal = showProcessingModal('(2/2)');
    const stakingContract = stakingContracts[token];
    if (!stakingContract || !stakingContract.methods.claimRewards) throw new Error(`Staking contract for ${token} not properly initialized`);
    const userData = await stakingContract.methods.users(userAddress).call();
    if (BigInt(userData.pendingRewards) === 0n) throw new Error('No rewards available to claim.');
    console.log('Sending claim reward transaction...');
    const claimTx = await tronWeb.transactionBuilder.triggerSmartContract(
      tokenDetails[token].stakingAddress,
      'claimRewards()',
      {},
      [],
      userAddress
    );
    if (!claimTx.result || !claimTx.transaction) throw new Error('Failed to create claim reward transaction');
    const signedClaimTx = await tronWeb.trx.sign(claimTx.transaction);
    const broadcastClaim = await tronWeb.trx.sendRawTransaction(signedClaimTx);
    if (!broadcastClaim.result) throw new Error('Failed to broadcast claim reward transaction');
    console.log('Claim reward transaction broadcasted:', broadcastClaim.txid);
    hideProcessingModal(processingModal);
    await updateTokenUI(token);
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error(`Error claiming rewards for ${token}:`, error);
    alert(`Error claiming rewards: ${error.message}.`);
  }
}

async function activateTokens(token) {
  let processingModal = null;
  try {
    if (!isValidTronAddress(tokenDetails[token].stakingAddress)) throw new Error(`Invalid staking address: ${tokenDetails[token].stakingAddress}`);
    if (!userAddress || !isValidTronAddress(userAddress)) throw new Error('Invalid user address. Please reconnect wallet.');
    const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'activateTokens');
    if (shortfall > 0) {
      const totalRequired = shortfall + SAFETY_ENERGY;
      const hasEnoughEnergy = await checkDelegatorEnergy(totalRequired);
      if (hasEnoughEnergy) {
        const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
        if (modalResult.rent) {
          processingModal = showProcessingModal('(1/2)');
          await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
          console.log('Energy rented successfully.');
          await delay(5000);
          hideProcessingModal(processingModal);
        } else {
          console.log('User declined energy rental.');
        }
      } else {
        console.log('Insufficient delegator energy.');
      }
    }
    processingModal = showProcessingModal('(2/2)');
    const stakingContract = stakingContracts[token];
    if (!stakingContract || !stakingContract.methods.activateTokens) throw new Error(`Staking contract for ${token} not properly initialized`);
    const userData = await stakingContract.methods.users(userAddress).call();
    if (userData.isActive || BigInt(userData.stakedAmount) === 0n) throw new Error('No inactive tokens to activate.');
    console.log('Sending activate tokens transaction...');
    const activateTx = await tronWeb.transactionBuilder.triggerSmartContract(
      tokenDetails[token].stakingAddress,
      'activateTokens()',
      {},
      [],
      userAddress
    );
    if (!activateTx.result || !activateTx.transaction) throw new Error('Failed to create activate tokens transaction');
    const signedActivateTx = await tronWeb.trx.sign(activateTx.transaction);
    const broadcastActivate = await tronWeb.trx.sendRawTransaction(signedActivateTx);
    if (!broadcastActivate.result) throw new Error('Failed to broadcast activate tokens transaction');
    console.log('Activate tokens transaction broadcasted:', broadcastActivate.txid);
    hideProcessingModal(processingModal);
    await updateTokenUI(token);
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error(`Error activating tokens for ${token}:`, error);
    alert(`Error activating tokens: ${error.message}.`);
  }
}







      

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  const key = 'cft';
  const stakeButton = document.getElementById(`stake-button-${key}`);
  if (stakeButton) {
    stakeButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const amount = document.getElementById(`stake-amount-${key}`).value;
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        alert('Please enter a valid amount to stake.');
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

  const activateButton = document.getElementById(`activate-tokens-button-${key}`);
  if (activateButton) {
    activateButton.addEventListener('click', async (e) => {
      e.preventDefault();
      await activateTokens(key);
    });
  } else {
    console.error(`Activate tokens button for ${key} not found`);
  }

  

  

  

  

  

  

  initialize();
});
