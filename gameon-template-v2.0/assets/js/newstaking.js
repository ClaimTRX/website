// CFT Staking Contract ABI
const cftStakingContractAbi = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
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
        "name": "viewTotalStaked",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "viewStakedAmount",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "viewPendingReward",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "viewDailyReward",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "viewTotalClaimedRewards",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "calculateAPR",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// Configuration for CFT staking contract
const stakingConfig = {
    tokenContractAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    stakingContractAddress: 'TFVjx6YBLSZWT1UkBqyfCwmf9TZKrUEAqu',
    stakingContractAbi: cftStakingContractAbi,
    tokenContractAbi: [
        {
            "inputs": [
                {"internalType": "string", "name": "name", "type": "string"},
                {"internalType": "string", "name": "symbol", "type": "string"},
                {"internalType": "uint256", "name": "totalSupply", "type": "uint256"}
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
                {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
                {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
            ],
            "name": "Approval",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
                {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
                {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
                {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
            ],
            "name": "Transfer",
            "type": "event"
        },
        {"inputs": [], "name": "MODE_NORMAL", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [], "name": "MODE_TRANSFER_CONTROLLED", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [], "name": "MODE_TRANSFER_RESTRICTED", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [], "name": "_mode", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "address", "name": "spender", "type": "address"}], "name": "allowance", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "approve", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
        {"inputs": [{"internalType": "address", "name": "account", "type": "address"}], "name": "balanceOf", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [], "name": "decimals", "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "subtractedValue", "type": "uint256"}], "name": "decreaseAllowance", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
        {"inputs": [{"internalType": "address", "name": "spender", "type": "address"}, {"internalType": "uint256", "name": "addedValue", "type": "uint256"}], "name": "increaseAllowance", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
        {"inputs": [], "name": "name", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
        {"inputs": [], "name": "owner", "outputs": [{"internalType": "address", "name": "", "type": "address"}], "stateMutability": "view", "type": "function"},
        {"inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
        {"inputs": [{"internalType": "uint256", "name": "v", "type": "uint256"}], "name": "setMode", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
        {"inputs": [], "name": "symbol", "outputs": [{"internalType": "string", "name": "", "type": "string"}], "stateMutability": "view", "type": "function"},
        {"inputs": [], "name": "totalSupply", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function"},
        {"inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "transfer", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
        {"inputs": [{"internalType": "address", "name": "from", "type": "address"}, {"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}], "name": "transferFrom", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}], "stateMutability": "nonpayable", "type": "function"},
        {"inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function"}
    ],
    rewardUnit: 'CFT'
};

const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
let tronWeb, userAddress;
let stakingContract;
let tokenContract;

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

// Connect to TronLink wallet
async function connectWallet() {
    try {
        await window.tronLink.request({ method: 'tron_requestAccounts' });
        await initializeTronWeb();
    } catch (e) {
        console.error('Failed to connect to TronLink:', e);
    }
}

// Initialize TronWeb and contracts
async function initializeTronWeb() {
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;

    stakingContract = await tronWeb.contract(stakingConfig.stakingContractAbi, stakingConfig.stakingContractAddress);
    tokenContract = await tronWeb.contract(stakingConfig.tokenContractAbi, stakingConfig.tokenContractAddress);

    setInterval(() => updateUI(), 60000);
    await updateUI();
}

// Update UI
async function updateUI() {
    await updateAvailableTokens();
    await delay(400);
    await updateStakedAmount();
    await delay(400);
    await updateEstimatedAPR();
    await delay(400);
    await updateClaimableRewards();
    await delay(400);
    await updateTotalClaimedRewards();
}

// Utility delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// UI update functions
async function updateAvailableTokens() {
    const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
    const decimals = await tokenContract.methods.decimals().call();
    document.getElementById('available-tokens-cft').innerText = formatNumber(Number(balanceRaw) / 10 ** decimals);
}

async function updateStakedAmount() {
    const stakedAmountRaw = await stakingContract.methods.viewStakedAmount(userAddress).call();
    const decimals = await tokenContract.methods.decimals().call();
    document.getElementById('staked-amount-cft').innerText = formatWholeNumber(Number(stakedAmountRaw) / 10 ** decimals);
}

async function updateEstimatedAPR() {
    const aprRaw = await stakingContract.methods.calculateAPR().call();
    const apr = Number(aprRaw) / 10**18; // Convert BigInt to Number and adjust for 1e18 precision
    const aprFormatted = apr.toFixed(2) + '%'; // No need to divide by 100
    document.getElementById('estimated-apr-cft').innerText = aprFormatted;
}

async function updateClaimableRewards() {
    const claimableRewardsRaw = await stakingContract.methods.viewPendingReward(userAddress).call();
    const decimals = await tokenContract.methods.decimals().call();
    const claimableRewards = Number(claimableRewardsRaw) / 10 ** decimals;
    document.getElementById('claimable-rewards-cft').innerText = formatNumber(claimableRewards) + ' CFT';
}

async function updateTotalClaimedRewards() {
    const totalClaimedRaw = await stakingContract.methods.viewTotalClaimedRewards(userAddress).call();
    const decimals = await tokenContract.methods.decimals().call();
    const totalClaimed = Number(totalClaimedRaw) / 10 ** decimals;
    document.getElementById('total-claimed-rewards-cft').innerText = formatNumber(totalClaimed);
}

// Staking actions
async function stakeTokens() {
    const amount = document.getElementById('stake-amount-cft').value;
    const decimals = await tokenContract.methods.decimals().call();
    const amountToStake = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals))); // Ensure integer value

    const allowance = await tokenContract.methods.allowance(userAddress, stakingConfig.stakingContractAddress).call();
    const allowanceBigInt = BigInt(allowance);

    if (allowanceBigInt < amountToStake) {
        await tokenContract.methods.approve(stakingConfig.stakingContractAddress, maxUint256).send();
        await delay(1000);
    }

    await stakingContract.methods.stake(amountToStake.toString()).send();
    setTimeout(() => updateUI(), 3000);
}

async function unstakeTokens() {
    const amount = document.getElementById('withdraw-amount-cft').value;
    const decimals = await tokenContract.methods.decimals().call();
    const amountToUnstake = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals))); // Ensure integer value
    await stakingContract.methods.withdraw(amountToUnstake.toString()).send();
    setTimeout(() => updateUI(), 3000);
}

async function claimRewards() {
    await stakingContract.methods.claimReward().send();
    setTimeout(() => updateUI(), 3000);
}

// Utility functions
function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatWholeNumber(num) {
    return Math.floor(parseFloat(num)).toLocaleString('en-US');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);
    if (await checkTronLinkInstalled()) await initializeTronWeb();

    document.getElementById('stake-button-cft').addEventListener('click', stakeTokens);
    document.getElementById('unstake-button-cft').addEventListener('click', unstakeTokens);
    document.getElementById('claim-rewards-button-cft').addEventListener('click', claimRewards);
});
