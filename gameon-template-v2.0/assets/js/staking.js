// TronWeb Configuration
let tronWeb, userAddress;
let stakingContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Load Staking Contract Addresses from `index.html`
const stakingContractAddresses = JSON.parse(document.getElementById("staking-contracts-data").textContent);

const tokenContracts = {
    'token1': 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA'
};

// Staking Contract ABI
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

// Token Contract ABI
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
// Initialize TronWeb & Connect Wallet
async function initializeTronWeb() {
    if (!window.tronWeb) {
        console.error("TronWeb is not available. Please install TronLink.");
        return;
    }

    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    
    console.log('Connected to TronLink. User Address:', userAddress);
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;

    // Load Staking Contracts
    for (let token in stakingContractAddresses) {
        stakingContracts[token] = await tronWeb.contract(stakingContractAbi, stakingContractAddresses[token]);
    }

    updateAllUI();
}

// Delay function for smoother async operations
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Update all UI elements for each token
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
	await delay(400); await updateProjectedYearlyEarnings(token);
}

// ✅ Update available token balance
async function updateAvailableTokens(token) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
        const decimals = await tokenContract.methods.decimals().call();
        const balance = balanceRaw / Math.pow(10, decimals);

        document.getElementById(`available-tokens-${token}`).innerText = formatNumber(balance);
    } catch (error) {
        console.error(`Error fetching available tokens for ${token}:`, error);
    }
}

// ✅ Update staked amount
async function updateStakedAmount(token) {
    try {
        const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const stakedAmount = stakedAmountRaw / Math.pow(10, decimals);

        document.getElementById(`staked-amount-${token}`).innerText = formatWholeNumber(stakedAmount);
    } catch (error) {
        console.error(`Error fetching staked amount for ${token}:`, error);
    }
}

// ✅ Update estimated APR
async function updateEstimatedAPR(token) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const dailyRewardRaw = await stakingContracts[token].methods.viewDailyReward().call();
        const totalStakedRaw = await stakingContracts[token].methods.viewTotalStaked().call();

        const dailyReward = parseFloat(dailyRewardRaw) / Math.pow(10, decimals);
        const totalStaked = parseFloat(totalStakedRaw) / Math.pow(10, decimals);
        const apr = totalStaked > 0 ? ((dailyReward / totalStaked) * 365 * 100).toFixed(2) + '%' : 'N/A';

        document.getElementById(`estimated-apr-${token}`).innerText = apr;
    } catch (error) {
        console.error(`Error fetching APR for ${token}:`, error);
    }
}

// ✅ Update claimable rewards
async function updateClaimableRewards(token) {
    try {
        const claimableRewardsRaw = await stakingContracts[token].methods.viewPendingReward(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const claimableRewards = claimableRewardsRaw / Math.pow(10, decimals);

        document.getElementById(`claimable-rewards-${token}`).innerText = formatNumber(claimableRewards);
    } catch (error) {
        console.error(`Error fetching claimable rewards for ${token}:`, error);
    }
}

// ✅ Update projected yearly earnings
async function updateProjectedYearlyEarnings(token) {
    try {
        const projectedYearlyEarningsRaw = await stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const projectedYearlyEarnings = projectedYearlyEarningsRaw / Math.pow(10, decimals);

        document.getElementById(`projected-yearly-earnings-${token}`).innerText = formatNumber(projectedYearlyEarnings);
    } catch (error) {
        console.error(`Error fetching projected yearly earnings for ${token}:`, error);
    }
}

// ✅ Update total claimed rewards
async function updateTotalClaimedRewards() {
    try {
        const totalClaimedRewardsRaw = await stakingContracts['token1'].methods.viewTotalClaimedRewards(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts['token1']);
        const decimals = await tokenContract.methods.decimals().call();
        const totalClaimedRewards = totalClaimedRewardsRaw / Math.pow(10, decimals);

        document.getElementById('total-claimed-rewards').innerText = formatNumber(totalClaimedRewards);
    } catch (error) {
        console.error('Error fetching total claimed rewards:', error);
    }
}

// ✅ Stake Tokens
async function stakeTokens(token, amount) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const stakingContractAddress = stakingContractAddresses[token];
        const decimals = await tokenContract.methods.decimals().call();
        const amountToStake = BigInt(amount) * BigInt(Math.pow(10, decimals));

        // Check allowance before staking
        const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
        const allowance = BigInt(allowanceRaw);

        if (allowance < amountToStake) {
            console.log("Approval needed. Requesting...");
            await tokenContract.methods.approve(stakingContractAddress, maxUint256).send();
            console.log("Approval granted!");
        }

        console.log("Staking tokens...");
        await stakingContracts[token].methods.stake(amountToStake.toString()).send();
        console.log("Tokens staked successfully!");

        updateStakedAmount(token);
    } catch (error) {
        console.error(`Error staking tokens for ${token}:`, error);
    }
}

// ✅ Unstake Tokens
async function unstakeTokens(token) {
    try {
        const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
        if (!unstakeAmount) return;

        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const amountToUnstake = BigInt(unstakeAmount) * BigInt(Math.pow(10, decimals));

        await stakingContracts[token].methods.withdraw(amountToUnstake.toString()).send();
        updateStakedAmount(token);
    } catch (error) {
        console.error(`Error unstaking tokens for ${token}:`, error);
    }
}

// ✅ Claim Rewards
async function claimRewards(token) {
    try {
        await stakingContracts[token].methods.claimReward().send();
        updateClaimableRewards(token);
    } catch (error) {
        console.error(`Error claiming rewards for ${token}:`, error);
    }
}

// ✅ Format Numbers for UI
function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatWholeNumber(num) {
    return Math.floor(parseFloat(num)).toLocaleString('en-US');
}

