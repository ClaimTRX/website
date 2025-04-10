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
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "depositReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "viewTotalUnclaimedRewards",
        "outputs": [
            {"internalType": "uint256", "name": "totalUnclaimedRewards", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "viewTotalDepositedRewards",
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
const adminWallet = 'THNiVH2i5gqgTXR3PMYFaMKdygiXrzJPrk';
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

    // Check if the connected wallet is the admin wallet
    if (userAddress === adminWallet) {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('access-denied').style.display = 'none';
        setInterval(() => updateAdminUI(), 60000);
        await updateAdminUI();
    } else {
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('access-denied').style.display = 'block';
    }
}

// Update Admin UI
async function updateAdminUI() {
    await updateAvailableTokens();
    await delay(400);
    await updateRewardsInfo();
}

// Utility delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// UI update functions
async function updateAvailableTokens() {
    const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
    const decimals = await tokenContract.methods.decimals().call();
    document.getElementById('available-tokens-admin').innerText = formatNumber(Number(balanceRaw) / 10 ** decimals);
}

async function updateRewardsInfo() {
    const decimals = await tokenContract.methods.decimals().call();
    
    // Get total deposited rewards (total amount of CFT)
    const totalDepositedRaw = await stakingContract.methods.viewTotalDepositedRewards().call();
    const totalDeposited = Number(totalDepositedRaw) / 10 ** decimals;

    // Get total staked CFT
    const totalStakedRaw = await stakingContract.methods.viewTotalStaked().call();
    const totalStaked = Number(totalStakedRaw) / 10 ** decimals;

    // Get total unclaimed rewards
    const totalUnclaimedRaw = await stakingContract.methods.viewTotalUnclaimedRewards().call();
    const totalUnclaimed = Number(totalUnclaimedRaw) / 10 ** decimals;

    // Calculate rewards left
    const rewardsLeft = totalDeposited - totalStaked - totalUnclaimed;
    document.getElementById('rewards-left').innerText = formatNumber(rewardsLeft);

    // Get current daily rewards
    const dailyRewardsRaw = await stakingContract.methods.viewDailyReward().call();
    const dailyRewards = Number(dailyRewardsRaw) / 10 ** decimals;
    document.getElementById('daily-rewards').innerText = formatNumber(dailyRewards);

    // Calculate days of rewards left
    const daysLeft = dailyRewards > 0 ? (rewardsLeft / dailyRewards).toFixed(2) : '0.00';
    document.getElementById('days-left').innerText = daysLeft;
}

// Deposit rewards
async function depositRewards() {
    const amount = document.getElementById('deposit-amount').value;
    const decimals = await tokenContract.methods.decimals().call();
    const amountToDeposit = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals)));

    const allowance = await tokenContract.methods.allowance(userAddress, stakingConfig.stakingContractAddress).call();
    const allowanceBigInt = BigInt(allowance);

    if (allowanceBigInt < amountToDeposit) {
        await tokenContract.methods.approve(stakingConfig.stakingContractAddress, maxUint256).send();
        await delay(1000);
    }

    await stakingContract.methods.depositReward(amountToDeposit.toString()).send();
    setTimeout(() => updateAdminUI(), 3000);
}

// Utility functions
function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);
    document.getElementById('deposit-button').addEventListener('click', depositRewards);
    if (await checkTronLinkInstalled()) await initializeTronWeb();
});
