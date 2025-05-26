let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// TronGrid API configuration
const TRONGRID_API_KEY = 'd0abc8e9-5d3d-420d-88dd-60f4f1bd95ca'; // Replace with your TronGrid API key
const TRONGRID_API_URL = 'https://api.trongrid.io';

// Define contracts for StableX and CFT
const tokenDetails = {
  cft: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    stakingAddress: 'TMrDKEu6vSBSwstToiiooAiwB5xKNghEy8',
    decimals: 6,
    displayName: 'CFT'
  },
  cftx: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    stakingAddress: 'THLETrCqWHVJNURBQNKLBYJTLBGpUnDatp',
    decimals: 6,
    displayName: 'STABLEX'
  },
  cftturu: {
    tokenAddress: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    stakingAddress: 'TXgt8nXRDTbYxbhDbkZyqs9cgjoBikQa72',
    decimals: 8,
    rewardDecimals: 6,
    displayName: 'CFT'
  },
  turu: {
    tokenAddress: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    stakingAddress: 'TLQPUiSeCHZ92UcphkesN46XtPN55MkNcm',
    decimals: 8,
    displayName: 'BBT'
  },
  king: {
    tokenAddress: 'TMFNzkJaj573F62s4bWmfonKwGcosAA8fE',
    stakingAddress: 'TEppqmC7mb2wF4ExBYbQF6LraqD6qXW5Aj',
    decimals: 6,
    displayName: 'CFT'
  },
  fym: {
    tokenAddress: 'TCTvRkt5kVndeGKWJmMUxEc2rovdrGNoK3',
    stakingAddress: 'TP4HhAWv2WbSMCH2CRhdSsiwBP6JzViouq',
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
    console.log('User Address:', userAddress); // Debug log
    
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;

    for (let key in tokenDetails) {
      let details = tokenDetails[key];
      tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
      stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
      console.log(`Token contract for ${key}:`, tokenContracts[key]); // Debug log
      if (!details.decimals) {
        tokenDetails[key].decimals = await tokenContracts[key].methods.decimals().call();
        console.log(`Decimals for ${key}:`, tokenDetails[key].decimals); // Debug log
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
    // Fetch all required data in parallel
    const [balanceRaw, stakedAmount, projectedRewards, claimableRewards, totalClaimedRewards] = await Promise.all([
      // Token balance directly from contract
      tokenContracts[token].methods.balanceOf(userAddress).call().then(balance => {
        console.log(`Raw balance for ${token}:`, balance); // Debug log
        return balance;
      }).catch(error => {
        console.error(`Error fetching balance for ${token}:`, error);
        return '0';
      }),
      
      // Staked amount
      stakingContracts[token].methods.viewStakedAmount(userAddress).call().catch(() => '0'),
      
      // Projected rewards
      stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call().catch(() => '0'),
      
      // Claimable rewards
      stakingContracts[token].methods.viewPendingReward(userAddress).call().catch(() => '0'),
      
      // Total claimed rewards
      stakingContracts[token].methods.viewTotalClaimedRewards(userAddress).call().catch(() => '0')
    ]);

    const decimals = tokenDetails[token].decimals;
    const rewardDecimals = tokenDetails[token].rewardDecimals || decimals;
    const tokenName = tokenDetails[token].displayName || token.toUpperCase();

    // Update available tokens
    const balance = BigInt(balanceRaw) / BigInt(10 ** decimals);
    const balanceElement = document.getElementById(`available-tokens-${token}`);
    if (balanceElement) {
      balanceElement.innerText = balance.toLocaleString('en-US');
      console.log(`Formatted balance for ${token}:`, balance.toString()); // Debug log
    } else {
      console.error(`Element available-tokens-${token} not found`);
    }
    await delay(200);

    // Update staked amount
    const staked = BigInt(stakedAmount) / BigInt(10 ** decimals);
    const stakedElement = document.getElementById(`staked-amount-${token}`);
    if (stakedElement) {
      stakedElement.innerText = staked.toLocaleString('en-US');
    } else {
      console.error(`Element staked-amount-${token} not found`);
    }
    await delay(200);

    // Update projected rewards
    const projected = BigInt(projectedRewards) / BigInt(10 ** rewardDecimals);
    const projectedElement = document.getElementById(`projected-rewards-${token}`);
    if (projectedElement) {
      projectedElement.innerText = projected.toLocaleString('en-US');
    } else {
      console.error(`Element projected-rewards-${token} not found`);
    }
    await delay(200);

    // Update claimable rewards
    const claimable = BigInt(claimableRewards) / BigInt(10 ** rewardDecimals);
    const claimableElement = document.getElementById(`claimable-rewards-${token}`);
    if (claimableElement) {
      claimableElement.innerText = claimable.toLocaleString('en-US') + " " + tokenName;
    } else {
      console.error(`Element claimable-rewards-${token} not found`);
    }
    await delay(200);

    // Update total claimed rewards
    const claimed = BigInt(totalClaimedRewards) / BigInt(10 ** rewardDecimals);
    const claimedElement = document.getElementById(`total-claimed-rewards-${token}`);
    if (claimedElement) {
      claimedElement.innerText = claimed.toLocaleString('en-US');
    } else {
      console.error(`Element total-claimed-rewards-${token} not found`);
    }

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

    const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
    const allowance = BigInt(allowanceRaw);

    if (allowance >= amountToStake) {
      console.log(`Sufficient approval detected: ${allowance}`);
      await stakingContracts[token].methods.stake(amountToStake.toString()).send();
      console.log("Tokens staked successfully!");
    } else {
      console.log("Approval is too low. Requesting approval...");
      await tokenContract.methods.approve(stakingContractAddress, maxUint256).send();
      console.log("Approval granted. Proceeding with staking...");
      await stakingContracts[token].methods.stake(amountToStake.toString()).send();
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
    const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
    const amountToUnstake = BigInt(unstakeAmount) * BigInt(10 ** tokenDetails[token].decimals);
    await stakingContracts[token].methods.withdraw(amountToUnstake.toString()).send();
    await updateTokenUI(token);
  } catch (error) {
    console.error(`Error unstaking tokens for ${token}:`, error);
    alert(`Error unstaking tokens for ${token}. Please check the console for details.`);
  }
}

// Claim rewards function
async function claimRewards(token) {
  try {
    await stakingContracts[token].methods.claimReward().send();
    await updateTokenUI(token);
  } catch (error) {
    console.error(`Error claiming rewards for ${token}:`, error);
    alert(`Error claiming rewards for ${token}. Please check the console for details.`);
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

  const claimButton = document.getElementById(`claim-rewards-button-${key}`);
  if (claimButton) {
    claimButton.addEventListener('click', async () => {
      await claimRewards(key);
    });
  } else {
    console.error(`Claim rewards button for ${key} not found`);
  }
}
