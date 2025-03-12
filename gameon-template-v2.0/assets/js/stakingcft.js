
    
    
    <script>
       let tronWeb, userAddress;
let stakingContracts = [];
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Contract Addresses
const tokenContracts = {
    'token1': 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA',
};

const stakingContractAddresses = {
    'token1': 'TMsZX72oWscpd3QmmT6NRq6JWiY5QzFju2',
};

// ABIs (unchanged from your provided code)
const stakingContractAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_stakingToken",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_rewardToken",
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
        "name": "RewardDeposited",
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
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "depositReward",
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
        "name": "stake",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "viewStakedPercentage",
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
        "name": "viewTotalAccumulatedRewards",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

;
const tokenContractAbi = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "symbol",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "totalSupply",
                "type": "uint256"
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
        "inputs": [],
        "name": "MODE_NORMAL",
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
        "name": "MODE_TRANSFER_CONTROLLED",
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
        "name": "MODE_TRANSFER_RESTRICTED",
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
        "name": "_mode",
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
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
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
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
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
                "name": "account",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
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
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
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
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "v",
                "type": "uint256"
            }
        ],
        "name": "setMode",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
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
                "name": "from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
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
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);

    if (await checkTronLinkInstalled()) {
        await initializeTronWeb();
        setInterval(updateAllUI, 60000); // Update UI every minute
    } else {
        console.error('TronLink is not installed.');
    }

    // Add event listeners for staking actions
    document.getElementById('stake-button-token1').addEventListener('click', async () => {
        const stakeAmount = document.getElementById('stake-amount-token1').value;
        if (stakeAmount) {
            await stakeTokens('token1', stakeAmount);
            setTimeout(updateAllUI, 4000);
        }
    });

    document.getElementById('unstake-button-token1').addEventListener('click', async () => {
        await unstakeTokens('token1');
        setTimeout(updateAllUI, 4000);
    });

    document.getElementById('claim-rewards-button-token1').addEventListener('click', async () => {
        await claimRewards('token1');
        setTimeout(updateAllUI, 4000);
    });

    // "Max" button functionality
    document.getElementById('max-stake-token1').addEventListener('click', async (e) => {
        e.preventDefault();
        const token = 'token1';
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
        const decimals = await tokenContract.methods.decimals().call();
        const balance = balanceRaw / Math.pow(10, decimals);
        document.getElementById('stake-amount-token1').value = balance;
    });

    document.getElementById('max-withdraw-token1').addEventListener('click', async (e) => {
        e.preventDefault();
        const token = 'token1';
        const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const stakedAmount = stakedAmountRaw / Math.pow(10, decimals);
        document.getElementById('withdraw-amount-token1').value = stakedAmount;
    });
});

// Check if TronLink is installed
async function checkTronLinkInstalled() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
                clearInterval(interval);
                resolve(true);
            }
        }, 1000);
    });
}

	    document.addEventListener("DOMContentLoaded", async function () {
    const connectButton = document.getElementById("connect-button");

    async function connectWallet() {
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
            userAddress = window.tronWeb.defaultAddress.base58;
            console.log("Connected to TronLink:", userAddress);

            connectButton.innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
        } else {
            
        }
    }

    connectButton.addEventListener("click", async () => {
        if (window.tronLink) {
            try {
                await window.tronLink.request({ method: "tron_requestAccounts" });
                connectWallet();
            } catch (e) {
                console.error("Failed to connect to TronLink:", e);
            }
        } else {
            
        }
    });

    // Check connection status on page load
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        connectWallet();
    }
});



// Connect wallet
async function connectWallet() {
    try {
        await tronLink.request({ method: 'tron_requestAccounts' });
        await initializeTronWeb();
    } catch (e) {
        console.error('Failed to connect to TronLink:', e);
    }
}

// Initialize TronWeb and contracts
async function initializeTronWeb() {
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    console.log('Connected to TronLink. User Address:', userAddress);
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;


    for (let token in stakingContractAddresses) {
        stakingContracts[token] = await tronWeb.contract(stakingContractAbi, stakingContractAddresses[token]);
    }

    await updateAllUI();
}

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Update all UI elements
async function updateAllUI() {
    for (let token in stakingContracts) {
        await updateTokenUI(token);
    }
}

async function updateTokenUI(token) {
    await delay(400); await updateAvailableTokens(token);
    await delay(400); await updateStakedAmount(token);
    await delay(400); await updateEstimatedAPR(token);
    await delay(400); await updateClaimableRewards(token);
    await delay(400); await updateTotalClaimedRewards();
	await delay(400);await updateProjectedYearlyEarnings(token);
}

async function updateAvailableTokens(token) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
        const decimals = await tokenContract.methods.decimals().call();
        const balance = balanceRaw / Math.pow(10, decimals);
        document.getElementById(`available-tokens-${token}`).innerText = formatNumber(balance) + ' ';
    } catch (error) {
        console.error(`Error fetching available tokens for ${token}:`, error);
    }
}

async function updateStakedAmount(token) {
    try {
        const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const stakedAmount = stakedAmountRaw / Math.pow(10, decimals);
        document.getElementById(`staked-amount-${token}`).innerText = formatWholeNumber(stakedAmount) + ' ';
    } catch (error) {
        console.error(`Error fetching staked amount for ${token}:`, error);
    }
}

async function updateEstimatedAPR(token) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const dailyRewardRaw = await stakingContracts[token].methods.viewDailyReward().call();
        const totalStakedRaw = await stakingContracts[token].methods.viewTotalStaked().call();
        const dailyReward = parseFloat(dailyRewardRaw) / Math.pow(10, decimals);
        const totalStaked = parseFloat(totalStakedRaw) / Math.pow(10, decimals);
        let apr = totalStaked > 0 ? ((dailyReward / totalStaked) * 365 * 100).toFixed(2) + '%' : 'N/A';
        document.getElementById(`estimated-apr-${token}`).innerText = apr;
    } catch (error) {
        console.error(`Error fetching APR for ${token}:`, error);
    }
}

async function updateClaimableRewards(token) {
    try {
        const claimableRewardsRaw = await stakingContracts[token].methods.viewPendingReward(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const claimableRewards = claimableRewardsRaw / Math.pow(10, decimals);
        document.getElementById(`claimable-rewards-${token}`).innerText = formatNumber(claimableRewards) + ' ';
        document.getElementById(`earned-rewards-${token}`).innerText = formatNumber(claimableRewards) + ' ';
    } catch (error) {
        console.error(`Error fetching claimable rewards for ${token}:`, error);
    }
}

	    async function updateProjectedYearlyEarnings(token) {
    try {
        const projectedYearlyEarningsRaw = await stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();

        const projectedYearlyEarnings = projectedYearlyEarningsRaw / Math.pow(10, decimals);
        document.getElementById(`projected-yearly-earnings-${token}`).innerText = formatNumber(projectedYearlyEarnings) + ' ';
    } catch (error) {
        console.error(`Error fetching projected yearly earnings for ${token}:`, error);
    }
}

async function updateTotalClaimedRewards() {
    try {
        const totalClaimedRewardsRaw = await stakingContracts['token1'].methods.viewTotalClaimedRewards(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts['token1']);
        const decimals = await tokenContract.methods.decimals().call();
        const totalClaimedRewards = totalClaimedRewardsRaw / Math.pow(10, decimals);
        document.getElementById('total-claimed-rewards').innerText = formatNumber(totalClaimedRewards) + ' ';
    } catch (error) {
        console.error('Error fetching total claimed rewards:', error);
    }
}

async function stakeTokens(token, amount) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const stakingContractAddress = stakingContractAddresses[token];
        const decimals = await tokenContract.methods.decimals().call();
        const amountToStake = BigInt(amount) * BigInt(Math.pow(10, decimals));

        // Step 1: Check Current Allowance
        const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
        const allowance = BigInt(allowanceRaw);

        if (allowance >= amountToStake) {
            // Step 2: If approved, stake directly
            console.log(`Sufficient approval detected: ${allowance}`);
            await stakingContracts[token].methods.stake(amountToStake.toString()).send();
            console.log("Tokens staked successfully!");
        } else {
            // Step 3: If not approved, request approval first
            console.log("Approval is too low. Requesting approval...");
            await tokenContract.methods.approve(stakingContractAddress, maxUint256).send();
            console.log("Approval granted. Proceeding with staking...");

            // Step 4: Stake after approval
            await stakingContracts[token].methods.stake(amountToStake.toString()).send();
            console.log("Tokens staked successfully after approval!");
        }

        // Update UI after staking
        await updateStakedAmount(token);
    } catch (error) {
        console.error(`Error staking tokens for ${token}:`, error);
    }
}


async function unstakeTokens(token) {
    try {
        const unstakeAmount = document.getElementById('withdraw-amount-token1').value;
        if (unstakeAmount) {
            const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
            const decimals = await tokenContract.methods.decimals().call();
            const amountToUnstake = BigInt(unstakeAmount) * BigInt(Math.pow(10, decimals));
            await stakingContracts[token].methods.withdraw(amountToUnstake.toString()).send();
            await updateStakedAmount(token);
        }
    } catch (error) {
        console.error(`Error unstaking tokens for ${token}:`, error);
    }
}

async function claimRewards(token) {
    try {
        await stakingContracts[token].methods.claimReward().send();
        await updateClaimableRewards(token);
    } catch (error) {
        console.error(`Error claiming rewards for ${token}:`, error);
    }
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatWholeNumber(num) {
    return Math.floor(parseFloat(num)).toLocaleString('en-US');
}
    </script>

