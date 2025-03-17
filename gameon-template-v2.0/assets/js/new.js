let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Define contracts for StableX and CFT
const tokenDetails = {
    stablex: {
        tokenAddress: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS',
        stakingAddress: 'TRVn2h65VrbGb7zkASz3escJiHJWMSy7pV',
        decimals: null
        displayName: 'StableX' // Adding display name
    },
    cft: {
        tokenAddress: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS',
        stakingAddress: 'TUvHH8QtyXvMubLJRgKBdwfG7Y2TRLGSE6',
        decimals: 6,
        price: 0.27
        displayName: 'StableX' // Adding display name
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
    await updateAPR(token);
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

async function updateAPR(token) {
    try {
        // Only StableX has viewAPR in its smart contract
        if (token === "stablex") {
            if (!stakingContracts[token].methods.viewAPR) {
                console.error(`viewAPR function is missing in ${token} staking contract.`);
                return;
            }
            const aprRaw = await stakingContracts[token].methods.viewAPR().call();
            document.getElementById(`estimated-apr-${token}`).innerText = (aprRaw / 1e4).toFixed(2) + ' %';
        } else if (token === "cft") {
            // Manually calculate APR for CFT staking
            const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
            const projectedRewardsRaw = await stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call();

            if (stakedAmountRaw == 0) {
                document.getElementById(`estimated-apr-${token}`).innerText = '0.00 %';
                return;
            }

            const stakedTokens = Number(stakedAmountRaw) / Math.pow(10, tokenDetails[token].decimals);
            const annualRewardTokens = Number(projectedRewardsRaw) / Math.pow(10, tokenDetails[token].decimals);
            const stakedValueUSD = stakedTokens * 1; // Assuming StableX is $1
            const annualRewardValueUSD = annualRewardTokens * tokenDetails[token].price; // Use predefined CFT price

            const apr = (annualRewardValueUSD / stakedValueUSD) * 100;
            document.getElementById(`estimated-apr-${token}`).innerText = apr.toFixed(2) + ' %';
        }
    } catch (error) {
        console.error(`Error updating APR for ${token}:`, error);
    }
}


async function updateClaimableRewards(token) {
    try {
        const claimableRewardsRaw = await stakingContracts[token].methods.viewPendingReward(userAddress).call();
        const claimableRewards = claimableRewardsRaw / Math.pow(10, tokenDetails[token].decimals);

        // Get the token's display name, default to uppercase key if not found
        const tokenName = tokenDetails[token].displayName || token.toUpperCase();

        // Update the UI with the correct token name
        document.getElementById(`claimable-rewards-${token}`).innerText =
            claimableRewards.toFixed(2) + " " + tokenName;
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
        const amountToStake = tronWeb.toSun(amount);
        const stakingContractAddress = tokenDetails[token].stakingAddress;
        const tokenContract = tokenContracts[token];

        // Step 1: Check Current Allowance
        const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
        const allowance = BigInt(allowanceRaw);

        if (allowance >= BigInt(amountToStake)) {
            // Step 2: If approved, stake directly
            console.log(`Sufficient approval detected: ${allowance}`);
            await stakingContracts[token].methods.stake(amountToStake).send();
            console.log("Tokens staked successfully!");
        } else {
            // Step 3: If not approved, request approval first
            console.log("Approval is too low. Requesting approval...");
            await tokenContract.methods.approve(stakingContractAddress, maxUint256).send();
            console.log("Approval granted. Proceeding with staking...");

            // Step 4: Stake after approval
            await stakingContracts[token].methods.stake(amountToStake).send();
            console.log("Tokens staked successfully after approval!");
        }

        // Update UI after staking
        await updateTokenUI(token);
    } catch (error) {
        console.error(`Error staking tokens for ${token}:`, error);
    }
}


// Unstaking function
async function unstakeTokens(token) {
    try {
        const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
        await stakingContracts[token].methods.withdraw(tronWeb.toSun(unstakeAmount)).send();
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
