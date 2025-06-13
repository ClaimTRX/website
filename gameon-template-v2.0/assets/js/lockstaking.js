let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// TronGrid API configuration
const TRONGRID_API_KEY = 'd0abc8e9-5d3d-420d-88dd-60f4f1bd95ca'; // Replace with your TronGrid API key
const TRONGRID_API_URL = 'https://nile.trongrid.io'; // Use Nile testnet for testing

// Define contract for CFT
const tokenDetails = {
  cft: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK', // Replace with actual CFT token address
    stakingAddress: 'TBJrdmgoiw9oherVBwm22N8D9pB7ZQdxNo', // Replace with actual CFTStaking address
    decimals: 6,
    displayName: 'CFT'
  }
};

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
    "name": "viewRemainingLockTime",
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
  });
}

// Connect Wallet
async function connectWallet() {
  try {
    await tronLink.request({ method: 'tron_requestAccounts' });
    await initializeTronWeb();
  } catch (e) {
    console.error('Failed to connect to TronLink:', e);
    alert('Failed to connect to TronLink. Please ensure TronLink is installed and try again.');
  }
}

// Initialize TronWeb and Contracts
async function initializeTronWeb() {
  try {
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    console.log('User Address:', userAddress);
    
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;

    for (let key in tokenDetails) {
      let details = tokenDetails[key];
      tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
      stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
      console.log(`Token contract for ${key}:`, tokenContracts[key]);
      if (!details.decimals) {
        tokenDetails[key].decimals = await tokenContracts[key].decimals().call();
        console.log(`Decimals for ${key}:`, tokenDetails[key].decimals);
      }
    }
    
    await updateAllUI();
  } catch (error) {
    console.error('Error initializing TronWeb or Contracts:', error);
    alert('Error initializing contracts. Please refresh and try again.');
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

// Update UI for a specific token
async function updateTokenUI(token) {
  try {
    const [balanceRaw, stakedAmount, totalBalance, remainingLockTime, remainingStakeable, apr] = await Promise.all([
      tokenContracts[token].balanceOf(userAddress).call().catch(error => {
        console.error(`Error fetching balance for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].viewStakedAmount(userAddress).call().catch(() => '0'),
      stakingContracts[token].viewTotalBalance(userAddress).call().catch(() => '0'),
      stakingContracts[token].viewRemainingLockTime(userAddress).call().catch(() => '0'),
      stakingContracts[token].viewRemainingStakeableCFT().call().catch(() => '0'),
      stakingContracts[token].viewAPR().call().catch(() => '30')
    ]);

    const decimals = tokenDetails[token].decimals;
    const tokenName = tokenDetails[token].displayName || token.toUpperCase();

    // Update available tokens (wallet balance)
    const balance = Number(BigInt(balanceRaw) / BigInt(10 ** decimals)).toLocaleString('en-US', { maximumFractionDigits: 4 });
    const balanceElement = document.getElementById(`available-tokens-${token}`);
    if (balanceElement) {
      balanceElement.innerText = balance;
      console.log(`Formatted balance for ${token}:`, balance);
    } else {
      console.error(`Element available-tokens-${token} not found`);
    }
    await delay(200);

    // Update staked amount
    const staked = Number(BigInt(stakedAmount) / BigInt(10 ** decimals)).toLocaleString('en-US', { maximumFractionDigits: 4 });
    const stakedElement = document.getElementById(`staked-amount-${token}`);
    if (stakedElement) {
      stakedElement.innerText = staked;
    } else {
      console.error(`Element staked-amount-${token} not found`);
    }
    await delay(200);

    // Update total balance (staked + rewards)
    const total = Number(BigInt(totalBalance) / BigInt(10 ** decimals)).toLocaleString('en-US', { maximumFractionDigits: 4 });
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
    const stakeable = Number(BigInt(remainingStakeable) / BigInt(10 ** decimals)).toLocaleString('en-US', { maximumFractionDigits: 4 });
    const stakeableElement = document.getElementById(`remaining-stakeable-${token}`);
    if (stakeableElement) {
      stakeableElement.innerText = `${stakeable} ${tokenName}`;
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

  } catch (error) {
    console.error(`Error updating UI for ${token}:`, error);
    alert(`Error updating UI for ${token}. Please check the console for details.`);
  }
}

// Staking function
async function stakeTokens(token, amount) {
  try {
    const amountToStake = BigInt(amount) * BigInt(10 ** tokenDetails[token].decimals);
    const stakingContractAddress = tokenDetails[token].stakingAddress;
    const tokenContract = tokenContracts[token];

    console.log('Token Contract:', tokenContract);
    console.log('Staking Contract Address:', stakingContractAddress);
    console.log('User Address:', userAddress);
    console.log('Amount to Stake:', amountToStake.toString());

    const allowanceRaw = await tokenContract.allowance(userAddress, stakingContractAddress).call();
    const allowance = BigInt(allowanceRaw);
    console.log('Current Allowance:', allowance.toString());

    if (allowance >= amountToStake) {
      console.log(`Sufficient approval detected: ${allowance}`);
      await stakingContracts[token].stake(amountToStake.toString()).send();
      console.log("Tokens staked successfully!");
    } else {
      console.log("Approval is too low. Requesting approval...");
      await tokenContract.approve(stakingContractAddress, maxUint256).send();
      console.log("Approval granted. Proceeding with staking...");
      await stakingContracts[token].stake(amountToStake.toString()).send();
      console.log("Tokens staked successfully after approval!");
    }

    await updateTokenUI(token);
  } catch (error) {
    console.error(`Error staking tokens for ${token}:`, error);
    alert(`Error staking tokens for ${token}. Please check the console for details.`);
  }
}

// Unstaking function
async function unstakeTokens(token) {
  try {
    await stakingContracts[token].withdraw().send();
    await updateTokenUI(token);
  } catch (error) {
    console.error(`Error unstaking tokens for ${token}:`, error);
    alert(`Error unstaking tokens for ${token}. Please check the console for details.`);
  }
}

// Attach event listeners dynamically
for (let key in tokenDetails) {
  const stakeButton = document.getElementById(`stake-button-${key}`);
  if (stakeButton) {
    stakeButton.addEventListener('click', async () => {
      const amount = document.getElementById(`stake-amount-${key}`).value;
      await stakeTokens(key, amount);
    });
  } else {
    console.error(`Stake button for ${key} not found`);
  }

  const unstakeButton = document.getElementById(`unstake-button-${key}`);
  if (unstakeButton) {
    unstakeButton.addEventListener('click', async () => {
      await unstakeTokens(key);
    });
  } else {
    console.error(`Unstake button for ${key} not found`);
  }
}
