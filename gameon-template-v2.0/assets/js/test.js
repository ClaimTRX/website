const unifiedStakingContractAbi = [
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
        "inputs": [
            {"internalType": "address", "name": "account", "type": "address"}
        ],
        "name": "viewProjectedRewardsForYear",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const stakingConfigs = {
    cft: {
        tokenContractAddress: 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA',
        stakingContractAddress: 'TMsZX72oWscpd3QmmT6NRq6JWiY5QzFju2',
        stakingContractAbi: unifiedStakingContractAbi,
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
            {
                "inputs": [],
                "name": "MODE_NORMAL",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "MODE_TRANSFER_CONTROLLED",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "MODE_TRANSFER_RESTRICTED",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "_mode",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "owner", "type": "address"},
                    {"internalType": "address", "name": "spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "subtractedValue", "type": "uint256"}
                ],
                "name": "decreaseAllowance",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "addedValue", "type": "uint256"}
                ],
                "name": "increaseAllowance",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "name",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
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
                "inputs": [{"internalType": "uint256", "name": "v", "type": "uint256"}],
                "name": "setMode",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "from", "type": "address"},
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "transferFrom",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
                "name": "transferOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ],
        rewardUnit: 'CFT',
        aprCalculation: 'dailyRewardBased'
    },
    trx: {
        tokenContractAddress: 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA',
        stakingContractAddress: 'TPLECu1WkQnQS5Hnm97TwxsWJYpr6ZeGcA',
        stakingContractAbi: unifiedStakingContractAbi,
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
            {
                "inputs": [],
                "name": "MODE_NORMAL",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "MODE_TRANSFER_CONTROLLED",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "MODE_TRANSFER_RESTRICTED",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "_mode",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "owner", "type": "address"},
                    {"internalType": "address", "name": "spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "subtractedValue", "type": "uint256"}
                ],
                "name": "decreaseAllowance",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "addedValue", "type": "uint256"}
                ],
                "name": "increaseAllowance",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "name",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
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
                "inputs": [{"internalType": "uint256", "name": "v", "type": "uint256"}],
                "name": "setMode",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "from", "type": "address"},
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "transferFrom",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
                "name": "transferOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ],
        rewardUnit: 'TRX',
        aprCalculation: 'projectedRewardsBased',
        priceCFT: 1,
        priceTRX: 1
    },
    usdt: {
        tokenContractAddress: 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA',
        stakingContractAddress: 'TP5y4Ga9DsihuWzWcWaWJqMk6WWTzeYyMg',
        stakingContractAbi: unifiedStakingContractAbi,
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
            {
                "inputs": [],
                "name": "MODE_NORMAL",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "MODE_TRANSFER_CONTROLLED",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "MODE_TRANSFER_RESTRICTED",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "_mode",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "owner", "type": "address"},
                    {"internalType": "address", "name": "spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "subtractedValue", "type": "uint256"}
                ],
                "name": "decreaseAllowance",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "addedValue", "type": "uint256"}
                ],
                "name": "increaseAllowance",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "name",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "owner",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
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
                "inputs": [{"internalType": "uint256", "name": "v", "type": "uint256"}],
                "name": "setMode",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "symbol",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "totalSupply",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "transfer",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "from", "type": "address"},
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "transferFrom",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
                "name": "transferOwnership",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ],
        rewardUnit: 'USDT',
        aprCalculation: 'projectedRewardsBased',
        priceCFT: 0.24
    }
};

const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
let tronWeb, userAddress;
let stakingContracts = {};
let tokenContracts = {};

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

async function connectWallet() {
    try {
        await window.tronLink.request({ method: 'tron_requestAccounts' });
        await initializeTronWeb();
    } catch (e) {
        console.error('Failed to connect to TronLink:', e);
        alert('Failed to connect to TronLink. Please ensure TronLink is installed and unlocked.');
    }
}

async function initializeTronWeb() {
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;

    for (let type in stakingConfigs) {
        const config = stakingConfigs[type];
        try {
            stakingContracts[type] = await tronWeb.contract(config.stakingContractAbi, config.stakingContractAddress);
            tokenContracts[type] = await tronWeb.contract(config.tokenContractAbi, config.tokenContractAddress);
        } catch (e) {
            console.error(`Failed to initialize contracts for ${type}:`, e);
            alert(`Error loading ${type} contracts. Check contract addresses and network.`);
        }
    }

    setInterval(() => updateAllUI(), 60000);
    await updateAllUI();
}

async function updateAllUI() {
    for (let type in stakingConfigs) {
        try {
            await updateAvailableTokens(type);
            await delay(400);
            await updateStakedAmount(type);
            await delay(400);
            await updateEstimatedAPR(type);
            await delay(400);
            await updateClaimableRewards(type);
            await delay(400);
            await updateTotalClaimedRewards(type);
            await delay(400);
        } catch (e) {
            console.error(`Error updating UI for ${type}:`, e);
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function updateAvailableTokens(type) {
    try {
        const tokenContract = tokenContracts[type];
        const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
        const decimals = await tokenContract.methods.decimals().call();
        // Handle 0n as valid balance
        const balance = balanceRaw === 0n ? 0 : Number(balanceRaw) / 10 ** Number(decimals);
        document.getElementById(`available-tokens-${type}`).innerText = formatNumber(balance);
    } catch (e) {
        console.error(`Error updating available tokens for ${type}:`, e);
        document.getElementById(`available-tokens-${type}`).innerText = '0';
    }
}

async function updateStakedAmount(type) {
    try {
        const stakingContract = stakingContracts[type];
        const stakedAmountRaw = await stakingContract.methods.viewStakedAmount(userAddress).call();
        const tokenContract = tokenContracts[type];
        const decimals = await tokenContract.methods.decimals().call();
        // Handle 0n as valid staked amount
        const stakedAmount = stakedAmountRaw === 0n ? 0 : Number(stakedAmountRaw) / 10 ** Number(decimals);
        document.getElementById(`staked-amount-${type}`).innerText = formatWholeNumber(stakedAmount);
    } catch (e) {
        console.error(`Error updating staked amount for ${type}:`, e);
        document.getElementById(`staked-amount-${type}`).innerText = '0';
    }
}

async function updateEstimatedAPR(type) {
    try {
        const config = stakingConfigs[type];
        const stakingContract = stakingContracts[type];
        const tokenContract = tokenContracts[type];
        const decimals = await tokenContract.methods.decimals().call();
        if (decimals === undefined) {
            throw new Error(`Invalid decimals for ${type}`);
        }

        if (config.aprCalculation === 'dailyRewardBased') {
            const dailyRewardRaw = await stakingContract.methods.viewDailyReward().call();
            const totalStakedRaw = await stakingContract.methods.viewTotalStaked().call();
            const dailyReward = dailyRewardRaw === 0n ? 0 : Number(dailyRewardRaw) / 10 ** Number(decimals);
            const totalStaked = totalStakedRaw === 0n ? 0 : Number(totalStakedRaw) / 10 ** Number(decimals);
            const apr = totalStaked > 0 ? ((dailyReward / totalStaked) * 365 * 100).toFixed(2) + '%' : 'N/A';
            document.getElementById(`estimated-apr-${type}`).innerText = apr;
        } else if (config.aprCalculation === 'projectedRewardsBased') {
            const projectedRewardsRaw = await stakingContract.methods.viewProjectedRewardsForYear(userAddress).call();
            const stakedAmountRaw = await stakingContract.methods.viewStakedAmount(userAddress).call();
            const projectedRewards = projectedRewardsRaw === 0n ? 0 : Number(tronWeb.fromSun(projectedRewardsRaw));
            const stakedAmountCFT = stakedAmountRaw === 0n ? 0 : Number(stakedAmountRaw) / 10 ** Number(decimals);
            let apr;
            if (type === 'trx') {
                const yearlyRewardsUSD = projectedRewards * config.priceTRX;
                const stakedValueUSD = stakedAmountCFT * config.priceCFT;
                apr = stakedValueUSD > 0 ? (yearlyRewardsUSD / stakedValueUSD * 100).toFixed(2) + '%' : 'N/A';
            } else if (type === 'usdt') {
                const stakedValueUSD = stakedAmountCFT * config.priceCFT;
                apr = stakedValueUSD > 0 ? (projectedRewards / stakedValueUSD * 100).toFixed(2) + '%' : 'N/A';
            }
            document.getElementById(`estimated-apr-${type}`).innerText = apr;
        }
    } catch (e) {
        console.error(`Error updating estimated APR for ${type}:`, e);
        document.getElementById(`estimated-apr-${type}`).innerText = 'N/A';
    }
}

async function updateClaimableRewards(type) {
    try {
        const stakingContract = stakingContracts[type];
        const claimableRewardsRaw = await stakingContract.methods.viewPendingReward(userAddress).call();
        const config = stakingConfigs[type];
        let claimableRewards;
        if (type === 'cft') {
            const decimals = await tokenContracts[type].methods.decimals().call();
            claimableRewards = claimableRewardsRaw === 0n ? 0 : Number(claimableRewardsRaw) / 10 ** Number(decimals);
        } else {
            claimableRewards = claimableRewardsRaw === 0n ? 0 : Number(tronWeb.fromSun(claimableRewardsRaw));
        }
        document.getElementById(`claimable-rewards-${type}`).innerText = formatNumber(claimableRewards) + ' ' + config.rewardUnit;
    } catch (e) {
        console.error(`Error updating claimable rewards for ${type}:`, e);
        document.getElementById(`claimable-rewards-${type}`).innerText = `0 ${stakingConfigs[type].rewardUnit}`;
    }
}

async function updateTotalClaimedRewards(type) {
    try {
        const stakingContract = stakingContracts[type];
        const totalClaimedRaw = await stakingContract.methods.viewTotalClaimedRewards(userAddress).call();
        const config = stakingConfigs[type];
        let totalClaimed;
        if (type === 'cft') {
            const decimals = await tokenContracts[type].methods.decimals().call();
            totalClaimed = totalClaimedRaw === 0n ? 0 : Number(totalClaimedRaw) / 10 ** Number(decimals);
        } else {
            totalClaimed = totalClaimedRaw === 0n ? 0 : Number(tronWeb.fromSun(totalClaimedRaw));
        }
        document.getElementById(`total-claimed-rewards-${type}`).innerText = formatNumber(totalClaimed);
    } catch (e) {
        console.error(`Error updating total claimed rewards for ${type}:`, e);
        document.getElementById(`total-claimed-rewards-${type}`).innerText = '0';
    }
}

async function stakeTokens(type) {
    try {
        const amount = document.getElementById(`stake-amount-${type}`).value;
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount to stake.');
            return;
        }
        const tokenContract = tokenContracts[type];
        const stakingContract = stakingContracts[type];
        const decimals = await tokenContract.methods.decimals().call();
        const amountToStake = BigInt(Math.floor(parseFloat(amount) * (10 ** Number(decimals))));

        const allowance = await tokenContract.methods.allowance(userAddress, stakingConfigs[type].stakingContractAddress).call();
        const allowanceBigInt = BigInt(allowance);

        if (allowanceBigInt < amountToStake) {
            await tokenContract.methods.approve(stakingConfigs[type].stakingContractAddress, maxUint256).send();
            await delay(1000);
        }

        await stakingContract.methods.stake(amountToStake.toString()).send();
        alert(`Successfully staked ${amount} ${type.toUpperCase()}`);
        setTimeout(() => updateAllUI(), 3000);
    } catch (e) {
        console.error(`Error staking tokens for ${type}:`, e);
        alert(`Failed to stake ${type.toUpperCase()}. Check console for details.`);
    }
}

async function unstakeTokens(type) {
    try {
        const amount = document.getElementById(`withdraw-amount-${type}`).value;
        if (!amount || parseFloat(amount) <= 0) {
            alert('Please enter a valid amount to withdraw.');
            return;
        }
        const tokenContract = tokenContracts[type];
        const stakingContract = stakingContracts[type];
        const decimals = await tokenContract.methods.decimals().call();
        const parsedAmount = parseFloat(amount);
        const amountToUnstake = BigInt(Math.floor(parsedAmount * (10 ** Number(decimals))));

        // Check staked balance
        const stakedAmountRaw = await stakingContract.methods.viewStakedAmount(userAddress).call();
        const stakedAmount = BigInt(stakedAmountRaw);
        if (stakedAmount < amountToUnstake) {
            alert(`Insufficient staked balance. You have ${Number(stakedAmount) / 10 ** Number(decimals)} ${type.toUpperCase()} staked.`);
            return;
        }

        await stakingContract.methods.withdraw(amountToUnstake.toString()).send();
        alert(`Successfully withdrew ${amount} ${type.toUpperCase()}`);
        setTimeout(() => updateAllUI(), 3000);
    } catch (e) {
        console.error(`Error unstaking tokens for ${type}:`, e);
        alert(`Failed to withdraw ${type.toUpperCase()}. Check console for details.`);
    }
}

async function claimRewards(type) {
    try {
        const stakingContract = stakingContracts[type];
        await stakingContract.methods.claimReward().send();
        alert(`Successfully claimed rewards for ${type.toUpperCase()}`);
        setTimeout(() => updateAllUI(), 3000);
    } catch (e) {
        console.error(`Error claiming rewards for ${type}:`, e);
        alert(`Failed to claim rewards for ${type.toUpperCase()}. Check console for details.`);
    }
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatWholeNumber(num) {
    return Math.floor(parseFloat(num)).toLocaleString('en-US');
}

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);
    if (await checkTronLinkInstalled()) await initializeTronWeb();

    for (let type of ['cft', 'trx', 'usdt']) {
        document.getElementById(`stake-button-${type}`).addEventListener('click', () => stakeTokens(type));
        document.getElementById(`unstake-button-${type}`).addEventListener('click', () => unstakeTokens(type));
        document.getElementById(`claim-rewards-button-${type}`).addEventListener('click', () => claimRewards(type));
    }
});
