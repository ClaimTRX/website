let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// TronGrid API configuration
const TRONGRID_API_KEY = 'd0abc8e9-5d3d-420d-88dd-60f4f1bd95ca'; // Replace with your TronGrid API key
const TRONGRID_API_URL = 'https://api.trongrid.io';

// Payment wallet for energy rental
const PAYMENT_ADDRESS = 'TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn';
const SERVER_URL = 'https://api.cftecosystem.com';
const SAFETY_ENERGY = 5000; // Extra energy for safety
const ENERGY_PRICE_SUN = 10; // Price per energy unit in SUN
const SUN_PER_TRX = 1000000; // 1 TRX = 1,000,000 SUN
const ENERGY_RENTAL_DURATION = 5; // Duration in minutes

// Define contracts for StableX and CFT with energy costs
const tokenDetails = {
  cft: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    stakingAddress: 'TMrDKEu6vSBSwstToiiooAiwB5xKNghEy8',
    decimals: 6,
    displayName: 'CFT',
    energyCosts: {
      stake: 170000,
      unstake: 150000,
      claimRewards: 100000
    }
  },
  cftx: {
    tokenAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    stakingAddress: 'THLETrCqWHVJNURBQNKLBYJTLBGpUnDatp',
    decimals: 6,
    displayName: 'STABLEX',
    energyCosts: {
      stake: 180000,
      unstake: 160000,
      claimRewards: 110000
    }
  },
  cftturu: {
    tokenAddress: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    stakingAddress: 'TXgt8nXRDTbYxbhDbkZyqs9cgjoBikQa72',
    decimals: 8,
    rewardDecimals: 6,
    displayName: 'CFT',
    energyCosts: {
      stake: 175000,
      unstake: 155000,
      claimRewards: 105000
    }
  },
  turu: {
    tokenAddress: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    stakingAddress: 'TLQPUiSeCHZ92UcphkesN46XtPN55MkNcm',
    decimals: 8,
    displayName: 'BBT',
    energyCosts: {
      stake: 165000,
      unstake: 145000,
      claimRewards: 95000
    }
  },
  king: {
    tokenAddress: 'TMFNzkJaj573F62s4bWmfonKwGcosAA8fE',
    stakingAddress: 'TEppqmC7mb2wF4ExBYbQF6LraqD6qXW5Aj',
    decimals: 6,
    displayName: 'CFT',
    energyCosts: {
      stake: 170000,
      unstake: 150000,
      claimRewards: 100000
    }
  },
  fym: {
    tokenAddress: 'TCTvRkt5kVndeGKWJmMUxEc2rovdrGNoK3',
    stakingAddress: 'TP4HhAWv2WbSMCH2CRhdSsiwBP6JzViouq',
    decimals: 6,
    displayName: 'CFT',
    energyCosts: {
      stake: 172000,
      unstake: 152000,
      claimRewards: 102000
    }
  }
};

// Validate TRON address format
function isValidTronAddress(address) {
  if (!address || typeof address !== 'string') return false;
  return address.startsWith('T') && address.length === 34 && /^[A-Za-z1-9]+$/.test(address);
}

// Staking and token contract ABIs (unchanged from original)
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

// Show transaction processing modal
function showProcessingModal() {
  const modalElement = document.getElementById('transaction-processing-modal');
  if (!modalElement) {
    console.error('Transaction processing modal element not found');
    throw new Error('Transaction processing modal not found in the page.');
  }
  const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
  modal.show();
  return modal;
}

// Hide transaction processing modal
function hideProcessingModal(modal) {
  if (modal) {
    modal.hide();
  }
}

// Check user's available energy
async function checkUserEnergy(address, token, action) {
  try {
    console.log(`Checking energy for address: ${address}, token: ${token}, action: ${action}`);
    const resources = await tronWeb.trx.getAccountResources(address);
    const energyLimit = resources.EnergyLimit || 0;
    const energyUsed = resources.EnergyUsed || 0;
    const availableEnergy = energyLimit - energyUsed;
    const requiredEnergy = tokenDetails[token].energyCosts[action];
    const shortfall = Math.max(0, requiredEnergy - availableEnergy);
    console.log(`Energy for ${address}: Limit=${energyLimit}, Used=${energyUsed}, Available=${availableEnergy}, Required=${requiredEnergy}, Shortfall=${shortfall}`);
    return { availableEnergy, shortfall, requiredEnergy };
  } catch (error) {
    console.error(`Error checking energy for ${address}:`, error);
    const requiredEnergy = tokenDetails[token].energyCosts[action];
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
    } else {
      throw new Error('Failed to fetch delegator energy');
    }
  } catch (error) {
    console.error('Error fetching delegator energy:', error);
    return false;
  }
}

// Request energy rental
async function requestEnergyRental(rentalEnergy, rentalCostTrx) {
  let processingModal = null;
  try {
    processingModal = showProcessingModal();
    if (!userAddress) {
      throw new Error('Please connect your wallet first.');
    }

    console.log(`Initiating payment of ${rentalCostTrx} TRX for ${rentalEnergy} energy rental...`);
    const result = await tronWeb.trx.sendTransaction(PAYMENT_ADDRESS, rentalCostTrx * SUN_PER_TRX);
    console.log('Payment transaction sent:', result);
    console.log('Payment transaction ID:', result.txid);

    if (!result.result) {
      throw new Error('Transaction was rejected or failed.');
    }

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
    if (!data.success) {
      throw new Error(`Server error: ${data.message}`);
    }

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
        console.log(`Polling delegation status for request ${requestId}, attempt ${pollAttempts}...`);
        const response = await fetch(`${SERVER_URL}/api/delegation-status?requestId=${requestId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`Delegation status for request ${requestId}:`, data);

        if (data.status === 'delegated') {
          clearInterval(interval);
          console.log(`Energy delegated successfully for request ${requestId}`);
          resolve(true);
        } else if (data.status === 'failed' || data.status === 'expired') {
          clearInterval(interval);
          console.error(`Delegation failed for request ${requestId}: ${data.message}`);
          reject(new Error(`Delegation failed: ${data.message}`));
        } else if (pollAttempts >= maxPollAttempts) {
          clearInterval(interval);
          console.error(`Delegation timed out for request ${requestId}`);
          reject(new Error('Delegation timed out after 60 seconds.'));
        }
      } catch (error) {
        console.error(`Error polling delegation status for request ${requestId}:`, error);
        if (pollAttempts >= maxPollAttempts) {
          clearInterval(interval);
          reject(new Error(`Error polling delegation status: ${error.message}`));
        }
      }
    }, 2000);
  });
}

// Show energy rental modal and return user decision
function showEnergyRentalModal(userEnergy, shortfall, requiredEnergy) {
  return new Promise((resolve, reject) => {
    const modalElement = document.getElementById('energy-rental-modal');
    if (!modalElement) {
      console.error('Energy rental modal element not found');
      reject(new Error('Energy rental modal not found in the page. Please check the HTML.'));
      return;
    }

    const rentalEnergy = shortfall;
    const rentalCostSun = rentalEnergy * ENERGY_PRICE_SUN;
    const rentalCostTrx = rentalCostSun / SUN_PER_TRX;

    const elements = {
      'user-energy': userEnergy.toLocaleString('en-US'),
      'required-energy': requiredEnergy.toLocaleString('en-US'),
      'rental-energy': rentalEnergy.toLocaleString('en-US'),
      'rental-cost-trx': rentalCostTrx.toFixed(2),
      'rental-duration': ENERGY_RENTAL_DURATION
    };

    for (const [id, value] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      } else {
        console.error(`Element with ID ${id} not found in energy rental modal`);
        reject(new Error(`Modal element ${id} not found. Please check the modal HTML structure.`));
        return;
      }
    }

    const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });

    const confirmButton = document.getElementById('rent-energy-confirm');
    if (!confirmButton) {
      console.error('Rent energy confirm button not found');
      reject(new Error('Rent energy confirm button not found in modal.'));
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

async function connectWallet() {
  try {
    await tronLink.request({ method: 'tron_requestAccounts' });
    await initializeTronWeb();
  } catch (e) {
    console.error('Failed to connect to TronLink:', e);
    alert('Failed to connect to TronLink. Please ensure TronLink is installed, set to mainnet, and try again.');
  }
}

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
        throw new Error(`Invalid token address for ${key}: ${details.tokenAddress}`);
      }
      if (!isValidTronAddress(details.stakingAddress)) {
        throw new Error(`Invalid staking address for ${key}: ${details.stakingAddress}`);
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateAllUI() {
  for (let key in tokenDetails) {
    await updateTokenUI(key);
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
    if (data.Error) {
      throw new Error(data.Error);
    }
    return data;
  } catch (error) {
    console.error(`TronGrid API error at ${endpoint}:`, error);
    return { error: error.message };
  }
}

async function updateTokenUI(token) {
  try {
    const [balanceRaw, stakedAmount, projectedRewards, claimableRewards, totalClaimedRewards] = await Promise.all([
      tokenContracts[token].methods.balanceOf(userAddress).call().then(balance => {
        console.log(`Raw balance for ${token}:`, balance);
        return balance;
      }).catch(error => {
        console.error(`Error fetching balance for ${token}:`, error);
        return '0';
      }),
      stakingContracts[token].methods.viewStakedAmount(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.viewPendingReward(userAddress).call().catch(() => '0'),
      stakingContracts[token].methods.viewTotalClaimedRewards(userAddress).call().catch(() => '0')
    ]);

    const decimals = tokenDetails[token].decimals;
    const rewardDecimals = tokenDetails[token].rewardDecimals || decimals;
    const tokenName = tokenDetails[token].displayName || token.toUpperCase();

    const balance = BigInt(balanceRaw) / BigInt(10 ** decimals);
    const balanceElement = document.getElementById(`available-tokens-${token}`);
    if (balanceElement) {
      balanceElement.innerText = balance.toLocaleString('en-US');
      console.log(`Formatted balance for ${token}:`, balance.toString());
    } else {
      console.error(`Element available-tokens-${token} not found`);
    }
    await delay(200);

    const staked = BigInt(stakedAmount) / BigInt(10 ** decimals);
    const stakedElement = document.getElementById(`staked-amount-${token}`);
    if (stakedElement) {
      stakedElement.innerText = staked.toLocaleString('en-US');
    } else {
      console.error(`Element staked-amount-${token} not found`);
    }
    await delay(200);

    const projected = BigInt(projectedRewards) / BigInt(10 ** rewardDecimals);
    const projectedElement = document.getElementById(`projected-rewards-${token}`);
    if (projectedElement) {
      projectedElement.innerText = projected.toLocaleString('en-US');
    } else {
      console.error(`Element projected-rewards-${token} not found`);
    }
    await delay(200);

    const claimable = BigInt(claimableRewards) / BigInt(10 ** rewardDecimals);
    const claimableElement = document.getElementById(`claimable-rewards-${token}`);
    if (claimableElement) {
      claimableElement.innerText = claimable.toLocaleString('en-US') + " " + tokenName;
    } else {
      console.error(`Element claimable-rewards-${token} not found`);
    }
    await delay(200);

    const claimed = BigInt(totalClaimedRewards) / BigInt(10 ** rewardDecimals);
    const claimedElement = document.getElementById(`total-claimed-rewards-${token}`);
    if (claimedElement) {
      claimedElement.innerText = claimed.toLocaleString('en-US');
    } else {
      console.error(`Element total-claimed-rewards-${token} not found`);
    }
  } catch (error) {
    console.error(`Error updating UI for ${token}:`, error);
    alert(`Error updating UI for ${token}: ${error.message}. Please check the console for details.`);
  }
}

async function stakeTokens(token, amount) {
  let processingModal = null;
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

    const { availableEnergy, shortfall, requiredEnergy } = await checkUserEnergy(userAddress, token, 'stake');
    if (shortfall > 0) {
      const totalRequired = shortfall + SAFETY_ENERGY;
      const hasEnoughEnergy = await checkDelegatorEnergy(totalRequired);
      if (hasEnoughEnergy) {
        const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
        if (modalResult.rent) {
          try {
            await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
            console.log('Energy rented successfully. Proceeding with staking...');
            await delay(5000);
          } catch (error) {
            throw new Error(`Failed to rent energy: ${error.message}`);
          }
        } else {
          console.log('User declined energy rental. Proceeding with available energy...');
        }
      } else {
        console.log('Insufficient delegator energy. Proceeding with available energy...');
      }
    }

    processingModal = showProcessingModal();

    const amountToStake = BigInt(amount) * BigInt(10 ** tokenDetails[token].decimals);
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
    if (BigInt(balanceRaw) < amountToStake) {
      throw new Error('Insufficient balance to stake.');
    }

    console.log('Checking allowance...');
    const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
    const allowance = BigInt(allowanceRaw);
    console.log('Current Allowance:', allowance.toString());

    if (allowance < amountToStake) {
      console.log('Approval is too low. Requesting approval...');
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
      console.log('Approval transaction broadcasted:', broadcastApproval.txid);
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

    hideProcessingModal(processingModal);
    await updateTokenUI(token);
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error(`Error staking tokens for ${token}:`, error);
    alert(`Error staking tokens for ${token}: ${error.message}. Please ensure sufficient TRX for energy and correct contract addresses.`);
  }
}

async function unstakeTokens(token) {
  let processingModal = null;
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
      const hasEnoughEnergy = await checkDelegatorEnergy(totalRequired);
      if (hasEnoughEnergy) {
        const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
        if (modalResult.rent) {
          try {
            await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
            console.log('Energy rented successfully. Proceeding with unstaking...');
            await delay(5000);
          } catch (error) {
            throw new Error(`Failed to rent energy: ${error.message}`);
          }
        } else {
          console.log('User declined energy rental. Proceeding with available energy...');
        }
      } else {
        console.log('Insufficient delegator energy. Proceeding with available energy...');
      }
    }

    processingModal = showProcessingModal();

    const amountToUnstake = BigInt(unstakeAmount) * BigInt(10 ** tokenDetails[token].decimals);
    const stakingContract = stakingContracts[token];

    if (!stakingContract || !stakingContract.methods.withdraw) {
      throw new Error(`Staking contract for ${token} not properly initialized`);
    }

    const stakedAmount = await stakingContract.methods.viewStakedAmount(userAddress).call();
    if (BigInt(stakedAmount) < amountToUnstake) {
      throw new Error('Insufficient staked amount to withdraw.');
    }

    console.log('Sending withdraw transaction...');
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
    console.log('Withdraw transaction broadcasted:', broadcastWithdraw.txid);

    hideProcessingModal(processingModal);
    await updateTokenUI(token);
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error(`Error unstaking tokens for ${token}:`, error);
    alert(`Error unstaking tokens for ${token}: ${error.message}. Please check the console for details.`);
  }
}

async function claimRewards(token) {
  let processingModal = null;
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
      const hasEnoughEnergy = await checkDelegatorEnergy(totalRequired);
      if (hasEnoughEnergy) {
        const modalResult = await showEnergyRentalModal(availableEnergy, shortfall, requiredEnergy);
        if (modalResult.rent) {
          try {
            await requestEnergyRental(modalResult.rentalEnergy, modalResult.rentalCostTrx);
            console.log('Energy rented successfully. Proceeding with claiming rewards...');
            await delay(5000);
          } catch (error) {
            throw new Error(`Failed to rent energy: ${error.message}`);
          }
        } else {
          console.log('User declined energy rental. Proceeding with available energy...');
        }
      } else {
        console.log('Insufficient delegator energy. Proceeding with available energy...');
      }
    }

    processingModal = showProcessingModal();

    const stakingContract = stakingContracts[token];
    if (!stakingContract || !stakingContract.methods.claimReward) {
      throw new Error(`Staking contract for ${token} not properly initialized`);
    }

    const pendingReward = await stakingContract.methods.viewPendingReward(userAddress).call();
    if (BigInt(pendingReward) === 0n) {
      throw new Error('No rewards available to claim.');
    }

    console.log('Sending claim reward transaction...');
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
    console.log('Claim reward transaction broadcasted:', broadcastClaim.txid);

    hideProcessingModal(processingModal);
    await updateTokenUI(token);
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error(`Error claiming rewards for ${token}:`, error);
    alert(`Error claiming rewards for ${token}: ${error.message}. Please check the console for details.`);
  }
}

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
