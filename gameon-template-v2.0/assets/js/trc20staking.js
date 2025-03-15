let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Define contracts for StableX and CFT
const tokenDetails = {
    turu: {
        tokenAddress: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
        stakingAddress: 'TLQPUiSeCHZ92UcphkesN46XtPN55MkNcm',
        decimals: 8,
    },
    king: {
        tokenAddress: 'TMFNzkJaj573F62s4bWmfonKwGcosAA8fE',
        stakingAddress: 'TFVU3oMF8HTnLPds4emfk7JNhVfF2mUHYT',
        decimals: 6,
    },
  fym: {
        tokenAddress: 'TCTvRkt5kVndeGKWJmMUxEc2rovdrGNoK3',
        stakingAddress: 'TQBcpWPi53FzuTtqVvT1uLd18N1P7X3UL2',
        decimals: 6,
    },
  hos: {
        tokenAddress: 'TDQKZTG7oj6UsYjSdxNS5QAuMGMat2XLEB',
        stakingAddress: 'TXrR6vcxhVmw53CDXqqEqjD2NWepQk6RYP',
        decimals: 6,
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
]
;


;

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
    }
}

// Initialize TronWeb and Contracts
async function initializeTronWeb() {
    try {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        
        document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;

        
        for (let key in tokenDetails) {
            let details = tokenDetails[key];
            tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
            stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
            if (!details.decimals) {
                tokenDetails[key].decimals = await tokenContracts[key].methods.decimals().call();
            }
        }
        
        await updateAllUI();
    } catch (error) {
        console.error('Error initializing TronWeb or Contracts:', error);
    }
}

// Update UI for all tokens
async function updateAllUI() {
    for (let key in tokenDetails) {
        await updateTokenUI(key);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// Update UI for a specific token
async function updateTokenUI(token) {
    await updateAvailableTokens(token);
    await delay(400);
    await updateStakedAmount(token);
    await delay(400);
    await updateProjectedRewards(token);  // Replaces APR function
    await delay(400);
    await updateClaimableRewards(token);
    await delay(400);
    await updateTotalClaimedRewards(token);
    await delay(400);
}

// Update available tokens
async function updateAvailableTokens(token) {
    try {
        const balanceRaw = await tokenContracts[token].methods.balanceOf(userAddress).call();
        const balance = Number(balanceRaw) / Math.pow(10, tokenDetails[token].decimals);
        document.getElementById(`available-tokens-${token}`).innerText = balance.toFixed(2);
    } catch (error) {
        console.error(`Error updating available tokens for ${token}:`, error);
    }
}

// Update staked amount
async function updateStakedAmount(token) {
    try {
        const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
        const stakedAmount = Number(stakedAmountRaw) / Math.pow(10, tokenDetails[token].decimals);
        document.getElementById(`staked-amount-${token}`).innerText = stakedAmount.toFixed(2);
    } catch (error) {
        console.error(`Error updating staked amount for ${token}:`, error);
    }
}

async function updateProjectedRewards(token) {
    try {
        const projectedRewardsRaw = await stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call();
        const projectedRewards = Number(projectedRewardsRaw) / Math.pow(10, tokenDetails[token].decimals);

        // Display the projected rewards
        document.getElementById(`projected-rewards-${token}`).innerText = projectedRewards.toFixed(2) + ' Tokens/Year';
    } catch (error) {
        console.error(`Error updating projected rewards for ${token}:`, error);
    }
}


// Update claimable rewards
async function updateClaimableRewards(token) {
    try {
        const claimableRewardsRaw = await stakingContracts[token].methods.viewPendingReward(userAddress).call();
        const claimableRewards = claimableRewardsRaw / Math.pow(10, tokenDetails[token].decimals);
        document.getElementById(`claimable-rewards-${token}`).innerText = claimableRewards.toFixed(2);
    } catch (error) {
        console.error(`Error updating claimable rewards for ${token}:`, error);
    }
}

// Update total claimed rewards
async function updateTotalClaimedRewards(token) {
    try {
        const totalClaimedRewardsRaw = await stakingContracts[token].methods.viewTotalClaimedRewards(userAddress).call();
        const totalClaimedRewards = totalClaimedRewardsRaw / Math.pow(10, tokenDetails[token].decimals);
        document.getElementById(`total-claimed-rewards-${token}`).innerText = totalClaimedRewards.toFixed(2);
    } catch (error) {
        console.error(`Error updating total claimed rewards for ${token}:`, error);
    }
}

// Staking function
async function stakeTokens(token, amount) {
    try {
        // Adjust amount based on token decimals
        const amountToStake = BigInt(amount) * BigInt(10 ** tokenDetails[token].decimals);

        const stakingContractAddress = tokenDetails[token].stakingAddress;
        const tokenContract = tokenContracts[token];

        // Check Current Allowance
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
    }
}


// Claim rewards function
async function claimRewards(token) {
    try {
        await stakingContracts[token].methods.claimReward().send();
        await updateTokenUI(token);
    } catch (error) {
        console.error(`Error claiming rewards for ${token}:`, error);
    }
}

// Attach event listeners dynamically
for (let key in tokenDetails) {
    document.getElementById(`stake-button-${key}`).addEventListener('click', async () => {
        const amount = document.getElementById(`stake-amount-${key}`).value;
        await stakeTokens(key, amount);
    });
    document.getElementById(`unstake-button-${key}`).addEventListener('click', async () => {
        await unstakeTokens(key);
    });
    document.getElementById(`claim-rewards-button-${key}`).addEventListener('click', async () => {
        await claimRewards(key);
    });
}
