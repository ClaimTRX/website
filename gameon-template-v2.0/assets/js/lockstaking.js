let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// TronGrid API configuration
const TRONGRID_API_KEY = 'd0abc8e9-5d3d-420d-88dd-60f4f1bd95ca'; // REPLACE with your valid TronGrid API key
const TRONGRID_API_URL = 'https://api.trongrid.io'; // Mainnet

// Define contract for CFT with correct rewardDecimals
const tokenDetails = {
  cft: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK', // CFT token address (mainnet)
    stakingAddress: 'TFRaWd2qpgEVXi2mqNjV9sM6Uwx1gNB1fV', // CFTStaking address (mainnet)
    decimals: 6,
    rewardDecimals: 6, // Match token decimals, as rewards are scaled by 10^6
    displayName: 'CFT'
  }
};

// Validate TRON address format (base58, starts with 'T', 34 chars)
function isValidTronAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return address.startsWith('T') && address.length === 34 && /^[A-Za-z1-9]+$/.test(address);
}

const stakingContractAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_stakingToken",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
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
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "lockDuration",
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
        "name": "newAPR",
        "type": "uint256"
      }
    ],
    "name": "YearlyAPRUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newLockDuration",
        "type": "uint256"
      }
    ],
    "name": "LockDurationUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bool",
        "name": "enabled",
        "type": "bool"
      }
    ],
    "name": "EmergencyUnlockToggled",
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
        "name": "newRewards",
        "type": "uint256"
      }
    ],
    "name": "RewardsUpdated",
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
    "name": "RewardsDeposited",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newMax",
        "type": "uint256"
      }
    ],
    "name": "MaxStakePerWalletUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "newMax",
        "type": "uint256"
      }
    ],
    "name": "MaxTotalStakedUpdated",
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
    "name": "depositRewards",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxStakePerWallet",
        "type": "uint256"
      }
    ],
    "name": "setMaxStakePerWallet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxTotalStaked",
        "type": "uint256"
      }
    ],
    "name": "setMaxTotalStaked",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "inputs": [],
    "name": "getAllStakersAndAmounts",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      },
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
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
        "name": "_yearlyAPR",
        "type": "uint256"
      }
    ],
    "name": "setYearlyAPR",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_lockDuration",
        "type": "uint256"
      }
    ],
    "name": "setLockDuration",
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
    "name": "stake",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bool",
        "name": "_enabled",
        "type": "bool"
      }
    ],
    "name": "toggleEmergencyUnlock",
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
    "inputs": [],
    "name": "viewLockDuration",
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
    "name": "viewRemainingStakeableCFT",
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
    "name": "viewTotalBalance",
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
    "inputs": [],
    "name": "viewTotalDepositedRewards",
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
    "name": "viewTotalEarnedRewards",
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
    "inputs": [],
    "name": "viewTotalUnclaimedRewards",
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
    "name": "viewUserLockEndTime",
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
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const tokenContractAbi = [
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "name": "balance",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_owner",
        "type": "address"
      },
      {
        "name": "_spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "name": "remaining",
        "type": "uint256"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_spender",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {
        "name": "_from",
        "type": "address"
      },
      {
        "name": "_to",
        "type": "address"
      },
      {
        "name": "_value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
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
  }
];

// DOMContentLoaded Event Listener
async function initialize() {
  document.getElementById('connect-button').addEventListener('click', connectWallet);
  if (await checkTronLinkInstalled()) {
    await initializeTronWeb();
    setInterval(updateAllUI, 60000); // Update UI every minute
  } else {
    console.error('TronLink is not installed.');
    alert('TronLink is not installed. Please install TronLink to continue.');
  }
}

document.addEventListener('DOMContentLoaded', initialize);

// Check if TronLink is installed
async function checkTronLinkInstalled() {
  return new Promise(resolve => {
    const interval = setInterval(() => {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        clearInterval(interval);
        resolve(true);
      }
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
      resolve(false);
    }, 5000); // Timeout after 5 seconds
  });
}

// Connect Wallet
async function connectWallet() {
  try {
    await tronLink.request({ method: 'tron_requestAccounts' });
    await initializeTronWeb();
  } catch (e) {
    console.error('Failed to connect to TronLink:', e);
    alert('Failed to connect to TronLink. Please ensure TronLink is installed, set to mainnet, and try again.');
  }
}

// Initialize TronWeb and Contracts
async function initializeTronWeb() {
  try {
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    if (!userAddress) {
      throw new Error('No user address found. Ensure TronLink is connected and set to mainnet.');
    }
    console.log('User Address:', userAddress);
    
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;

    for (let key in tokenDetails) {
      let details = tokenDetails[key];
      if (!isValidTronAddress(details.tokenAddress)) {
        throw new Error(`Invalid token address for ${key}: ${details.tokenAddress}. Please update tokenDetails.cft.tokenAddress.`);
      }
      if (!isValidTronAddress(details.stakingAddress)) {
        throw new Error(`Invalid staking address for ${key}: ${details.stakingAddress}. Please update tokenDetails.cft.stakingAddress.`);
      }
      tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
      stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
      console.log(`Token contract for ${key}:`, tokenContracts[key]);
      console.log(`Staking contract for ${key}:`, stakingContracts[key]);
      if (!details.decimals) {
        tokenDetails[key].decimals = await tokenContracts[key].methods.decimals().call();
        console.log(`Decimals for ${key}:`, tokenDetails[key].decimals);
      }
    }
    
    await updateAllUI();
  } catch (error) {
    console.error('Error initializing TronWeb or Contracts:', error);
    alert(`Error initializing contracts: ${error.message}. Please ensure correct contract addresses and mainnet configuration.`);
  }
}

// Delay utility function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Update UI for all tokens
async function updateAllUI() {
  for (let key in tokenDetails) {
    await updateTokenUI(key);
  }
}

// Utility function to make TronGrid API calls (kept for future use)
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
    const data = await response.json();
    if (data.Error) {
      throw new Error(data.Error);
    }
    return data;
  } catch (error) {
    console.error(`TronGrid API error at ${endpoint}:`, error);
    throw error;
  }
}

// Retry contract call with exponential backoff
async function retryContractCall(fn, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      return result;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) throw error;
      await delay(delayMs * Math.pow(2, attempt - 1)); // Exponential backoff
    }
  }
}

// Update UI for a specific token
async function updateTokenUI(token) {
  try {
    const [
      balanceRaw,
      stakedAmount,
      totalBalance,
      lockEndTime,
      remainingStakeable,
      apr,
      pendingReward,
      totalDepositedRewards,
      totalEarnedRewards,
      totalClaimedRewards,
      totalUnclaimedRewards
    ] = await Promise.all([
      tokenContracts[token].methods.balanceOf(userAddress).call().catch(error => {
        console.error(`Error fetching balance for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].methods.viewStakedAmount(userAddress).call().catch(error => {
        console.error(`Error fetching staked amount for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].methods.viewTotalBalance(userAddress).call().catch(error => {
        console.error(`Error fetching total balance for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].methods.viewUserLockEndTime(userAddress).call().catch(error => {
        console.error(`Error fetching lock end time for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].methods.viewRemainingStakeableCFT().call().catch(error => {
        console.error(`Error fetching remaining stakeable for ${token}:`, error);
        return '400000000000'; // Default to 400,000 * 1e6
      }),
      stakingContracts[token].methods.viewAPR().call().catch(error => {
        console.error(`Error fetching APR for ${token}:`, error);
        return '30';
      }),
      retryContractCall(() => stakingContracts[token].methods.viewPendingReward(userAddress).call()).catch(error => {
        console.error(`Error fetching pending reward for ${token} after retries:`, error);
        return '0';
      }),
      stakingContracts[token].methods.viewTotalDepositedRewards().call().catch(error => {
        console.error(`Error fetching total deposited rewards for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].methods.viewTotalEarnedRewards().call().catch(error => {
        console.error(`Error fetching total earned rewards for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].methods.viewTotalClaimedRewards().call().catch(error => {
        console.error(`Error fetching total claimed rewards for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].methods.viewTotalUnclaimedRewards().call().catch(error => {
        console.error(`Error fetching total unclaimed rewards for ${token}:`, error);
        return '0';
      })
    ]);

    const decimals = tokenDetails[token].decimals;
    const rewardDecimals = tokenDetails[token].rewardDecimals || decimals;
    const tokenName = tokenDetails[token].displayName || token.toUpperCase();

    // Calculate remaining lock time from lock end time
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const remainingLockTime = Number(lockEndTime) > 0 ? Math.max(0, Number(lockEndTime) - currentTimestamp) : 0;

    // Log raw values for debugging
    console.log(`Raw pendingReward for ${token}:`, pendingReward);
    console.log(`Raw totalBalance for ${token}:`, totalBalance);
    console.log(`Raw stakedAmount for ${token}:`, stakedAmount);
    console.log(`Raw lockEndTime for ${token}:`, lockEndTime);
    console.log(`Raw totalDepositedRewards for ${token}:`, totalDepositedRewards);
    console.log(`Raw totalEarnedRewards for ${token}:`, totalEarnedRewards);
    console.log(`Raw totalClaimedRewards for ${token}:`, totalClaimedRewards);
    console.log(`Raw totalUnclaimedRewards for ${token}:`, totalUnclaimedRewards);
    console.log(`Calculated remainingLockTime for ${token}:`, remainingLockTime);

    // Update available tokens (wallet balance)
    const balance = (Number(balanceRaw) / Math.pow(10, decimals)).toFixed(6);
    const balanceElement = document.getElementById(`available-tokens-${token}`);
    if (balanceElement) {
      balanceElement.innerText = balance;
      console.log(`Formatted balance for ${token}:`, balance);
    } else {
      console.error(`Element available-tokens-${token} not found`);
    }
    await delay(200);

    // Update initial stake
    const staked = (Number(stakedAmount) / Math.pow(10, decimals)).toFixed(6);
    const initialStakeElement = document.getElementById(`initial-stake-${token}`);
    if (initialStakeElement) {
      initialStakeElement.innerText = staked;
    } else {
      console.error(`Element initial-stake-${token} not found`);
    }
    await delay(200);

    // Update earned rewards
    const rewards = (Number(pendingReward) / Math.pow(10, rewardDecimals)).toFixed(6);
    const rewardsElement = document.getElementById(`earned-rewards-${token}`);
    if (rewardsElement) {
      rewardsElement.innerText = rewards;
      console.log(`Formatted rewards for ${token}:`, rewards);
    } else {
      console.error(`Element earned-rewards-${token} not found`);
    }
    await delay(200);

    // Update total balance (staked + rewards)
    const total = (Number(totalBalance) / Math.pow(10, decimals)).toFixed(6);
    const totalElement = document.getElementById(`total-balance-${token}`);
    if (totalElement) {
      totalElement.innerText = `${total} ${tokenName}`;
    } else {
      console.error(`Element total-balance-${token} not found`);
    }
    await delay(200);

    // Update remaining lock time
    const lockTimeDays = Math.floor(Number(remainingLockTime) / 86400);
    const lockTimeElement = document.getElementById(`remaining-lock-time-${token}`);
    if (lockTimeElement) {
      lockTimeElement.innerText = lockTimeDays > 0 ? `${lockTimeDays} days` : 'Unlocked';
    } else {
      console.error(`Element remaining-lock-time-${token} not found`);
    }
    await delay(200);

    // Update remaining stakeable CFT
    const stakeable = (Number(remainingStakeable) / Math.pow(10, decimals)).toFixed(6);
    const stakeableElement = document.getElementById(`remaining-stakeable-${token}`);
    if (stakeableElement) {
      stakeableElement.innerText = stakeable;
    } else {
      console.error(`Element remaining-stakeable-${token} not found`);
    }
    await delay(200);

    // Update APR
    const aprElement = document.getElementById(`staking-apr-${token}`);
    if (aprElement) {
      aprElement.innerText = `${Number(apr)}%`;
    } else {
      console.error(`Element staking-apr-${token} not found`);
    }
    await delay(200);

    // Update total deposited rewards
    const depositedRewards = (Number(totalDepositedRewards) / Math.pow(10, rewardDecimals)).toFixed(6);
    const depositedRewardsElement = document.getElementById(`total-deposited-rewards-${token}`);
    if (depositedRewardsElement) {
      depositedRewardsElement.innerText = depositedRewards;
    } else {
      console.warn(`Element total-deposited-rewards-${token} not found`);
    }
    await delay(200);

    // Update total earned rewards
    const earnedRewards = (Number(totalEarnedRewards) / Math.pow(10, rewardDecimals)).toFixed(6);
    const earnedRewardsElement = document.getElementById(`total-earned-rewards-${token}`);
    if (earnedRewardsElement) {
      earnedRewardsElement.innerText = earnedRewards;
    } else {
      console.warn(`Element total-earned-rewards-${token} not found`);
    }
    await delay(200);

    

    

    // Toggle Deposit and Withdraw sections
    const hasStaked = BigInt(stakedAmount) > 0;
    const depositSection = document.getElementById(`deposit-section-${token}`);
    const withdrawSection = document.getElementById(`withdraw-section-${token}`);
    const isUnlocked = remainingLockTime === 0;

    if (depositSection) {
      depositSection.style.display = hasStaked ? 'none' : 'block';
    } else {
      console.error(`Element deposit-section-${token} not found`);
    }

    if (withdrawSection) {
      withdrawSection.style.display = hasStaked ? 'block' : 'none';
    } else {
      console.error(`Element withdraw-section-${token} not found`);
    }

    // Remove existing unstake button if present
    const existingUnstakeButton = document.getElementById(`unstake-button-${token}`);
    if (existingUnstakeButton) {
      existingUnstakeButton.remove();
    }

    // Add unstake button if staked
    const unstakeArea = document.getElementById(`unstake-area-${token}`);
    if (hasStaked && unstakeArea) {
      const unstakeButton = document.createElement('a');
      unstakeButton.id = `unstake-button-${token}`;
      unstakeButton.href = '#';
      unstakeButton.className = 'btn input-btn mt-2';
      unstakeButton.innerText = 'Unstake All';
      unstakeButton.disabled = !isUnlocked;
      unstakeButton.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!unstakeButton.disabled) {
          await unstakeTokens(token);
        }
      });
      unstakeArea.appendChild(unstakeButton);
    }

  } catch (error) {
    console.error(`Error updating UI for ${token}:`, error);
    alert(`Error updating UI for ${token}: ${error.message}. Please check the console for details.`);
  }
}

// Staking function
async function stakeTokens(token, amount) {
  try {
    if (!isValidTronAddress(tokenDetails[token].stakingAddress)) {
      throw new Error(`Invalid staking address: ${tokenDetails[token].stakingAddress}. Please update tokenDetails.cft.stakingAddress.`);
    }
    if (!isValidTronAddress(tokenDetails[token].tokenAddress)) {
      throw new Error(`Invalid token address: ${tokenDetails[token].tokenAddress}. Please update tokenDetails.cft.tokenAddress.`);
    }
    if (!userAddress || !isValidTronAddress(userAddress)) {
      throw new Error('Invalid user address. Please reconnect wallet.');
    }

    const amountToStake = BigInt(amount) * BigInt(10 ** tokenDetails[token].decimals);
    const stakingContractAddress = tokenDetails[token].stakingAddress;
    const tokenAddress = tokenDetails[token].tokenAddress;
    const tokenContract = tokenContracts[token];
    const stakingContract = stakingContracts[token];

    if (!tokenContract || !tokenContract.methods.allowance) {
      throw new Error(`Token contract for ${token} not properly initialized. Check token address.`);
    }
    if (!stakingContract || !stakingContract.methods.stake) {
      throw new Error(`Staking contract for ${token} not properly initialized. Check staking address.`);
    }

    // Check balance
    const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
    if (BigInt(balanceRaw) < amountToStake) {
      throw new Error('Insufficient balance to stake.');
    }

    console.log('Token Contract:', tokenContract);
    console.log('Staking Contract:', stakingContract);
    console.log('Staking Contract Address (Base58):', stakingContractAddress);
    console.log('Token Address (Base58):', tokenAddress);
    console.log('User Address:', userAddress);
    console.log('Amount to Stake:', amountToStake.toString());

    console.log('Checking allowance...');
    const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
    const allowance = BigInt(allowanceRaw);
    console.log('Current Allowance:', allowance.toString());

    if (allowance < amountToStake) {
      console.log('Approval is too low. Requesting approval...');
      const approvalAmount = maxUint256;
      const parameter = [
        { type: 'address', value: stakingContractAddress },
        { type: 'uint256', value: approvalAmount }
      ];

      const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
        tokenAddress,
        'approve(address,uint256)',
        {},
        parameter,
        userAddress
      );

      if (!transaction.result || !transaction.transaction) {
        throw new Error('Failed to create approve transaction');
      }

      const signedTx = await tronWeb.trx.sign(transaction.transaction);
      const broadcast = await tronWeb.trx.sendRawTransaction(signedTx);

      if (!broadcast.result) {
        throw new Error('Failed to broadcast approve transaction');
      }

      console.log('Approval transaction broadcasted:', broadcast.txid);
    }

    console.log('Sending stake transaction...');
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

    console.log('Stake transaction broadcasted:', broadcastStake.txid);
    await updateTokenUI(token);
  } catch (error) {
    console.error(`Error staking tokens for ${token}:`, error);
    alert(`Error staking tokens for ${token}: ${error.message}. Please ensure sufficient TRX for energy and correct contract addresses.`);
  }
}

// Unstaking function
async function unstakeTokens(token) {
  try {
    const stakingContract = stakingContracts[token];
    if (!stakingContract || !stakingContract.methods.withdraw) {
      throw new Error(`Staking contract for ${token} not properly initialized.`);
    }

    // Check if user has staked and if lock period has ended
    const [stakedAmount, lockEndTime] = await Promise.all([
      stakingContract.methods.viewStakedAmount(userAddress).call(),
      stakingContract.methods.viewUserLockEndTime(userAddress).call()
    ]);

    if (BigInt(stakedAmount) === 0n) {
      throw new Error('No staked tokens to withdraw.');
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (Number(lockEndTime) > currentTimestamp && !(await stakingContract.methods.emergencyUnlock().call())) {
      throw new Error('Tokens are still locked.');
    }

    console.log('Sending withdraw transaction...');
    const withdrawTx = await tronWeb.transactionBuilder.triggerSmartContract(
      tokenDetails[token].stakingAddress,
      'withdraw()',
      {},
      [],
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

    console.log('Withdraw transaction broadcasted:', broadcastWithdraw.txid);
    await updateTokenUI(token);
  } catch (error) {
    console.error(`Error unstaking tokens for ${token}:`, error);
    alert(`Error unstaking tokens for ${token}: ${error.message}. Please check the console for details.`);
  }
}



    



// Attach event listeners dynamically
for (let key in tokenDetails) {
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

  // Add event listener for deposit rewards button (owner only)
  const depositRewardsButton = document.getElementById(`deposit-rewards-button-${key}`);
  if (depositRewardsButton) {
    depositRewardsButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const amount = document.getElementById(`deposit-rewards-amount-${key}`).value;
      if (!amount || isNaN(amount) || Number(amount) <= 0) {
        alert('Please enter a valid amount to deposit.');
        return;
      }
      await depositRewards(key, amount);
    });
  }

  // Add event listener for set max stake per wallet button (owner only)
  const setMaxStakeButton = document.getElementById(`set-max-stake-button-${key}`);
  if (setMaxStakeButton) {
    setMaxStakeButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const maxStake = document.getElementById(`max-stake-amount-${key}`).value;
      if (!maxStake || isNaN(maxStake) || Number(maxStake) <= 0) {
        alert('Please enter a valid max stake amount.');
        return;
      }
      await setMaxStakePerWallet(key, maxStake);
    });
  }

  // Add event listener for set max total staked button (owner only)
  const setMaxTotalButton = document.getElementById(`set-max-total-button-${key}`);
  if (setMaxTotalButton) {
    setMaxTotalButton.addEventListener('click', async (e) => {
      e.preventDefault();
      const maxTotal = document.getElementById(`max-total-amount-${key}`).value;
      if (!maxTotal || isNaN(maxTotal) || Number(maxTotal) <= 0) {
        alert('Please enter a valid max total staked amount.');
        return;
      }
      await setMaxTotalStaked(key, maxTotal);
    });
  }
}
