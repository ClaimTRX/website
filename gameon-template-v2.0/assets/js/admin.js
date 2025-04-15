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

// Token Contract ABI
const tokenContractAbi = [
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
];

// Configuration for multiple staking contracts
const stakingConfigs = [
    {
        name: 'CFT/CFT Staking',
        tokenContractAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
        stakingContractAddress: 'TMrDKEu6vSBSwstToiiooAiwB5xKNghEy8',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'CFT',
        isSameToken: true // Staking and reward tokens are the same
    },
    {
        name: 'Turu/Turu Staking',
        tokenContractAddress: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
        stakingContractAddress: 'TLQPUiSeCHZ92UcphkesN46XtPN55MkNcm',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'TURU',
        isSameToken: true // Staking and reward tokens are the same
    },
    {
        name: 'TuruCFT',
        tokenContractAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
        stakingContractAddress: 'TXgt8nXRDTbYxbhDbkZyqs9cgjoBikQa72',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'CFT',
        isSameToken: false // Staking and reward tokens are different
    }
    {
        name: 'KING',
        tokenContractAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
        stakingContractAddress: 'TEppqmC7mb2wF4ExBYbQF6LraqD6qXW5Aj',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'CFT',
        isSameToken: false // Staking and reward tokens are different
    }
{
        name: 'FYM',
        tokenContractAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
        stakingContractAddress: 'TP4HhAWv2WbSMCH2CRhdSsiwBP6JzViouq',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'CFT',
        isSameToken: false // Staking and reward tokens are different
    }
{
        name: 'StableX/Stablex',
        tokenContractAddress: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS',
        stakingContractAddress: 'TRVn2h65VrbGb7zkASz3escJiHJWMSy7pV',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'StableX',
        isSameToken: true // Staking and reward tokens are different
    }
{
        name: 'StableX/CFT',
        tokenContractAddress: 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA',
        stakingContractAddress: 'TUvHH8QtyXvMubLJRgKBdwfG7Y2TRLGSE6',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'CFT',
        isSameToken: false // Staking and reward tokens are different
    }
    // Add more configurations as needed
];

const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const adminWallet = 'THNiVH2i5gqgTXR3PMYFaMKdygiXrzJPrk';
let tronWeb, userAddress;
let contracts = [];

// Check if TronLink is installed
async function checkTronLinkInstalled() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
                clearInterval(interval);
                resolve(true);
            }
        }, 100);
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

    // Initialize contracts
    contracts = await Promise.all(stakingConfigs.map(async config => {
        const stakingContract = await tronWeb.contract(config.stakingContractAbi, config.stakingContractAddress);
        const tokenContract = await tronWeb.contract(config.tokenContractAbi, config.tokenContractAddress);
        return { config, stakingContract, tokenContract };
    }));

    // Check if the connected wallet is the admin wallet
    if (userAddress === adminWallet) {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('access-denied').style.display = 'none';
        await renderContracts();
        setInterval(() => updateAdminUI(), 60000);
        await updateAdminUI();
    } else {
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('access-denied').style.display = 'block';
    }
}

// Render contract cards
async function renderContracts() {
    const container = document.getElementById('contracts-container');
    container.innerHTML = ''; // Clear existing content

    contracts.forEach((contract, index) => {
        const cardHtml = `
            <div class="card mb-4" data-contract-index="${index}">
                <div class="card-body">
                    <h4 class="card-title">Deposit Rewards ${contract.config.name}</h4>
                    <div class="row">
                        <div class="col-12 col-md-6 single-item">
                            <span class="d-block mb-2">Available ${contract.config.rewardUnit}: <span id="available-tokens-admin-${index}"></span></span>
                            <div class="input-area d-flex flex-column">
                                <div class="input-text">
                                    <input type="text" placeholder="0" id="deposit-amount-${index}">
                                </div>
                                <button class="btn input-btn mt-2 deposit-button" data-contract-index="${index}">Deposit Rewards</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card mb-4" data-contract-index="${index}">
                <div class="card-body">
                    <h4 class="card-title">Rewards Information</h4>
                    <div class="row">
                        <div class="col-12 col-md-4 single-item">
                            <span id="rewards-left-${index}"></span>
                            <span>Rewards Left (${contract.config.rewardUnit})</span>
                        </div>
                        <div class="col-12 col-md-4 single-item">
                            <span id="daily-rewards-${index}"></span>
                            <span>Daily Rewards (${contract.config.rewardUnit})</span>
                        </div>
                        <div class="col-12 col-md-4 single-item">
                            <span id="days-left-${index}"></span>
                            <span>Days of Rewards Left</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Add event listeners for deposit buttons
    document.querySelectorAll('.deposit-button').forEach(button => {
        button.addEventListener('click', async () => {
            const contractIndex = button.getAttribute('data-contract-index');
            await depositRewards(contractIndex);
        });
    });
}

// Update Admin UI for all contracts
async function updateAdminUI() {
    await Promise.all(contracts.map((contract, index) => updateContractUI(index)));
}

// Update UI for a single contract
async function updateContractUI(contractIndex) {
    const contract = contracts[contractIndex];
    await updateAvailableTokens(contractIndex);
    await delay(400);
    await updateRewardsInfo(contractIndex);
}

// Utility delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// UI update functions
async function updateAvailableTokens(contractIndex) {
    const contract = contracts[contractIndex];
    const balanceRaw = await contract.tokenContract.methods.balanceOf(userAddress).call();
    const decimals = await contract.tokenContract.methods.decimals().call();
    document.getElementById(`available-tokens-admin-${contractIndex}`).innerText = formatNumber(Number(balanceRaw) / 10 ** decimals);
}

async function updateRewardsInfo(contractIndex) {
    const contract = contracts[contractIndex];
    const decimals = await contract.tokenContract.methods.decimals().call();

    // Get total reward tokens in the contract (contract's balance of reward token)
    const contractBalanceRaw = await contract.tokenContract.methods.balanceOf(contract.config.stakingContractAddress).call();
    const contractBalance = Number(contractBalanceRaw) / 10 ** decimals;

    // Get total unclaimed rewards
    const totalUnclaimedRaw = await contract.stakingContract.methods.viewTotalUnclaimedRewards().call();
    const totalUnclaimed = Number(totalUnclaimedRaw) / 10 ** decimals;

    let rewardsLeft;
    if (contract.config.isSameToken) {
        // For contracts where staking and reward tokens are the same (e.g., CFT/CFT, Turu/Turu)
        const totalStakedRaw = await contract.stakingContract.methods.viewTotalStaked().call();
        const totalStaked = Number(totalStakedRaw) / 10 ** decimals;
        rewardsLeft = contractBalance - totalStaked - totalUnclaimed;
    } else {
        // For contracts where staking and reward tokens are different
        rewardsLeft = contractBalance - totalUnclaimed;
    }

    // Ensure rewardsLeft is not negative
    rewardsLeft = Math.max(rewardsLeft, 0);
    document.getElementById(`rewards-left-${index}`).innerText = formatNumber(rewardsLeft);

    // Get current daily rewards
    const dailyRewardsRaw = await contract.stakingContract.methods.viewDailyReward().call();
    const dailyRewards = Number(dailyRewardsRaw) / 10 ** decimals;
    document.getElementById(`daily-rewards-${index}`).innerText = formatNumber(dailyRewards);

    // Calculate days of rewards left
    const daysLeft = dailyRewards > 0 ? (rewardsLeft / dailyRewards).toFixed(2) : '0.00';
    document.getElementById(`days-left-${index}`).innerText = daysLeft;
}

// Deposit rewards for a specific contract
async function depositRewards(contractIndex) {
    const contract = contracts[contractIndex];
    const amount = document.getElementById(`deposit-amount-${contractIndex}`).value;
    const decimals = await contract.tokenContract.methods.decimals().call();
    const amountToDeposit = BigInt(Math.floor(parseFloat(amount) * (10 ** decimals)));

    const allowance = await contract.tokenContract.methods.allowance(userAddress, contract.config.stakingContractAddress).call();
    const allowanceBigInt = BigInt(allowance);

    if (allowanceBigInt < amountToDeposit) {
        await contract.tokenContract.methods.approve(contract.config.stakingContractAddress, maxUint256).send();
        await delay(1000);
    }

    await contract.stakingContract.methods.depositReward(amountToDeposit.toString()).send();
    setTimeout(() => updateContractUI(contractIndex), 3000);
}

// Utility functions
function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);
    if (await checkTronLinkInstalled()) await initializeTronWeb();
});
