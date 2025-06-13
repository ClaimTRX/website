let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// TronGrid API configuration
const TRONGRID_API_KEY = 'd0abc8e9-5d3d-420d-88dd-60f4f1bd95ca'; // REPLACE with your valid TronGrid API key
const TRONGRID_API_URL = 'https://api.trongrid.io'; // Mainnet

// Define contract for CFT
const tokenDetails = {
  cft: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK', // REPLACE with actual CFT token address (mainnet)
    stakingAddress: 'TBJrdmgoiw9oherVBwm22N8D9pB7ZQdxNo', // REPLACE with actual CFTStaking address (mainnet)
    decimals: 6,
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
        tokenDetails[key].decimals = await tokenContracts[key].decimals().call();
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

// Update UI for a specific token
async function updateTokenUI(token) {
  try {
    const [balanceRaw, stakedAmount, totalBalance, remainingLockTime, remainingStakeable, apr] = await Promise.all([
      tokenContracts[token].balanceOf(userAddress).call().catch(error => {
        console.error(`Error fetching balance for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].viewStakedAmount(userAddress).call().catch(error => {
        console.error(`Error fetching staked amount for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].viewTotalBalance(userAddress).call().catch(error => {
        console.error(`Error fetching total balance for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].viewRemainingLockTime(userAddress).call().catch(error => {
        console.error(`Error fetching remaining lock time for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].viewRemainingStakeableCFT().call().catch(error => {
        console.error(`Error fetching remaining stakeable for ${token}:`, error);
        return '400000000000'; // Default to 400,000 * 1e6
      }),
      stakingContracts[token].viewAPR().call().catch(error => {
        console.error(`Error fetching APR for ${token}:`, error);
        return '30';
      })
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

    // Toggle Stake/Unstake buttons
    const stakeButton = document.getElementById(`stake-button-${token}`);
    const unstakeArea = document.getElementById(`unstake-area-${token}`);
    const hasStaked = BigInt(stakedAmount) > 0;
    const isUnlocked = Number(remainingLockTime) === 0;

    if (stakeButton) {
      stakeButton.classList.toggle('d-none', hasStaked);
    }

    // Remove existing unstake button if present
    const existingUnstakeButton = document.getElementById(`unstake-button-${token}`);
    if (existingUnstakeButton) {
      existingUnstakeButton.remove();
    }

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
    const tokenContract = tokenContracts[token];
    const stakingContract = stakingContracts[token];

    if (!tokenContract || !tokenContract.allowance) {
      throw new Error(`Token contract for ${token} not properly initialized. Check token address.`);
    }
    if (!stakingContract || !stakingContract.stake) {
      throw new Error(`Staking contract for ${token} not properly initialized. Check staking address.`);
    }

    console.log('Token Contract:', tokenContract);
    console.log('Staking Contract:', stakingContract);
    console.log('Staking Contract Address (Base58):', stakingContractAddress);
    console.log('User Address:', userAddress);
    console.log('Amount to Stake:', amountToStake.toString());

    // Log hexadecimal address for reference
    const stakingContractAddressHex = tronWeb.address.toHex(stakingContractAddress);
    console.log('Staking Contract Address (Hex, for reference):', stakingContractAddressHex);

    // Test contract interaction
    console.log('Testing balanceOf call...');
    const balance = await tokenContract.balanceOf(userAddress).call();
    console.log('User Balance:', balance.toString());

    console.log('Checking allowance...');
    const allowanceRaw = await tokenContract.allowance(userAddress, stakingContractAddress).call();
    const allowance = BigInt(allowanceRaw);
    console.log('Current Allowance:', allowance.toString());

    if (allowance >= amountToStake) {
      console.log(`Sufficient approval detected: ${allowance}`);
      console.log('Sending stake transaction...');
      await stakingContract.stake(amountToStake.toString()).send({
        from: userAddress
      });
      console.log('Tokens staked successfully!');
    } else {
      console.log('Approval is too low. Requesting approval...');
      const approvalAmount = amountToStake.toString(); // Use exact amount for debugging
      console.log('Sending approve transaction with amount:', approvalAmount);
      console.log('Approve parameters:', {
        spender: stakingContractAddress,
        amount: approvalAmount,
        from: userAddress
      });
      try {
        // Use base58 address for approve
        const tx = await tokenContract.approve(stakingContractAddress, approvalAmount);
        console.log('Approve transaction object:', tx);
        await tx.send({ from: userAddress });
        console.log('Approval granted. Proceeding with staking...');
      } catch (approveError) {
        console.error('Approve transaction failed:', approveError);
        throw new Error(`Approve transaction failed: ${approveError.message}`);
      }
      console.log('Sending stake transaction after approval...');
      await stakingContract.stake(amountToStake.toString()).send({
        from: userAddress
      });
      console.log('Tokens staked successfully after approval!');
    }

    await updateTokenUI(token);
  } catch (error) {
    console.error(`Error staking tokens for ${token}:`, error);
    alert(`Error staking tokens for ${token}: ${error.message}. Please ensure correct contract addresses, sufficient TRX for energy, and mainnet configuration. Check the console for details.`);
  }
}

// Unstaking function
async function unstakeTokens(token) {
  try {
    const stakingContract = stakingContracts[token];
    if (!stakingContract || !stakingContract.withdraw) {
      throw new Error(`Staking contract for ${token} not properly initialized.`);
    }
    console.log('Sending withdraw transaction...');
    await stakingContract.withdraw().send();
    console.log('Unstake successful!');
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
}
