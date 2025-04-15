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
        isSameToken: true
    },
    {
        name: 'Turu/Turu Staking',
        tokenContractAddress: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
        stakingContractAddress: 'TLQPUiSeCHZ92UcphkesN46XtPN55MkNcm',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'TURU',
        isSameToken: true
    },
    {
        name: 'TuruCFT',
        tokenContractAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
        stakingContractAddress: 'TXgt8nXRDTbYxbhDbkZyqs9cgjoBikQa72',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'CFT',
        isSameToken: false
    },
    {
        name: 'KING',
        tokenContractAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
        stakingContractAddress: 'TEppqmC7mb2wF4ExBYbQF6LraqD6qXW5Aj',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'CFT',
        isSameToken: false
    },
    {
        name: 'FYM',
        tokenContractAddress: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
        stakingContractAddress: 'TP4HhAWv2WbSMCH2CRhdSsiwBP6JzViouq',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'CFT',
        isSameToken: false
    },
    {
        name: 'StableX/Stablex',
        tokenContractAddress: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS',
        stakingContractAddress: 'TRVn2h65VrbGb7zkASz3escJiHJWMSy7pV',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'StableX',
        isSameToken: true
    },
    {
        name: 'StableX/CFT',
        tokenContractAddress: 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA',
        stakingContractAddress: 'TUvHH8QtyXvMubLJRgKBdwfG7Y2TRLGSE6',
        stakingContractAbi: cftStakingContractAbi,
        tokenContractAbi: tokenContractAbi,
        rewardUnit: 'CFT',
        isSameToken: false
    }
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

    // Initialize contracts and load data sequentially
    contracts = [];
    for (const config of stakingConfigs) {
        try {
            const stakingContract = await tronWeb.contract(config.stakingContractAbi, config.stakingContractAddress);
            const tokenContract = await tronWeb.contract(config.tokenContractAbi, config.tokenContractAddress);
            contracts.push({ config, stakingContract, tokenContract });
            if (userAddress === adminWallet) {
                await updateContractUI(contracts.length - 1);
            }
            await delay(500); // 500ms delay before next contract
        } catch (error) {
            console.error(`Error initializing contract ${config.name}:`, error);
        }
    }

    if (userAddress === adminWallet) {
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('access-denied').style.display = 'none';
        await renderContracts();
        setInterval(() => updateAdminUI(), 60000);
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
    for (let index = 0; index < contracts.length; index++) {
        await updateContractUI(index);
        if (index < contracts.length - 1) {
            await delay(500); // 500ms delay before next contract
        }
    }
}

// Update UI for a single contract
async function updateContractUI(contractIndex) {
    const contract = contracts[contractIndex];
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds for retries on 403 errors

    // Helper function to execute a contract call with retries
    async function executeWithRetry(fn, operationName, retries = maxRetries) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (error.message.includes('403') && attempt < retries) {
                    console.warn(`403 error on ${operationName}, attempt ${attempt}/${retries}. Retrying after ${retryDelay}ms...`);
                    await delay(retryDelay);
                    continue;
                }
                throw error; // Rethrow if max retries reached or non-403 error
            }
        }
    }

    try {
        // Fetch decimals first (reused for all calculations)
        const decimals = await executeWithRetry(
            () => contract.tokenContract.methods.decimals().call(),
            `decimals-${contractIndex}`
        );
        await delay(500);

        // Fetch available tokens
        await executeWithRetry(async () => {
            const balanceRaw = await contract.tokenContract.methods.balanceOf(userAddress).call();
            document.getElementById(`available-tokens-admin-${contractIndex}`).innerText = formatNumber(Number(balanceRaw) / 10 ** decimals);
        }, `available-tokens-${contractIndex}`);
        await delay(500);

        // Fetch contract balance
        const contractBalanceRaw = await executeWithRetry(
            () => contract.tokenContract.methods.balanceOf(contract.config.stakingContractAddress).call(),
            `contract-balance-${contractIndex}`
        );
        const contractBalance = Number(contractBalanceRaw) / 10 ** decimals;
        await delay(500);

        // Fetch total unclaimed rewards
        const totalUnclaimedRaw = await executeWithRetry(
            () => contract.stakingContract.methods.viewTotalUnclaimedRewards().call(),
            `total-unclaimed-${contractIndex}`
        );
        const totalUnclaimed = Number(totalUnclaimedRaw) / 10 ** decimals;
        await delay(500);

        // Calculate rewards left
        let rewardsLeft;
        if (contract.config.isSameToken) {
            const totalStakedRaw = await executeWithRetry(
                () => contract.stakingContract.methods.viewTotalStaked().call(),
                `total-staked-${contractIndex}`
            );
            const totalStaked = Number(totalStakedRaw) / 10 ** decimals;
            rewardsLeft = contractBalance - totalStaked - totalUnclaimed;
            await delay(500);
        } else {
            rewardsLeft = contractBalance - totalUnclaimed;
        }
        rewardsLeft = Math.max(rewardsLeft, 0);
        document.getElementById(`rewards-left-${contractIndex}`).innerText = formatNumber(rewardsLeft);

        // Fetch daily rewards
        const dailyRewardsRaw = await executeWithRetry(
            () => contract.stakingContract.methods.viewDailyReward().call(),
            `daily-rewards-${contractIndex}`
        );
        const dailyRewards = Number(dailyRewardsRaw) / 10 ** decimals;
        document.getElementById(`daily-rewards-${contractIndex}`).innerText = formatNumber(dailyRewards);
        await delay(500);

        // Calculate days left
        const daysLeft = dailyRewards > 0 ? (rewardsLeft / dailyRewards).toFixed(2) : '0.00';
        document.getElementById(`days-left-${contractIndex}`).innerText = daysLeft;
    } catch (error) {
        console.error(`Error updating UI for contract ${contract.config.name}:`, error);
    }
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);
    if (await checkTronLinkInstalled()) await initializeTronWeb();
});
