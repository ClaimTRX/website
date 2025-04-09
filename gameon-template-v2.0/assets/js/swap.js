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


const swapContractAbi = [
    {
        "inputs": [
            {"internalType": "contract ITRC20", "name": "_cftV1", "type": "address"},
            {"internalType": "contract ITRC20", "name": "_cftV2", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
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
        "name": "cftV1",
        "outputs": [{"internalType": "contract ITRC20", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "cftV2",
        "outputs": [{"internalType": "contract ITRC20", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
        ],
        "name": "swapV1toV2",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getContractBalances",
        "outputs": [
            {"internalType": "uint256", "name": "trxBalance", "type": "uint256"},
            {"internalType": "uint256", "name": "cftV1Balance", "type": "uint256"},
            {"internalType": "uint256", "name": "cftV2Balance", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];

// Replace with your actual contract addresses
const cftV1ContractAddress = 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA';
const swapContractAddress = 'TTCz5cWur7gFzdZThJH6ZR1tyHoTdMTUXf';

let tronWeb, userAddress, cftV1Contract, swapContract;

document.addEventListener('DOMContentLoaded', async () => {
    if (await checkTronLinkInstalled()) {
        await connectWallet();
    } else {
        alert("Please install TronLink to use this page.");
    }

    // Event listeners for swap functionality
    document.getElementById('cft-v1-amount').addEventListener('input', calculateCFTV2);
    document.getElementById('swap-button').addEventListener('click', async (e) => {
        e.preventDefault();
        await swapTokens(document.getElementById('cft-v1-amount').value);
    });
});

async function checkTronLinkInstalled() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(() => {
            if (window.tronLink || window.tronWeb) {
                clearInterval(interval);
                resolve(true);
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                resolve(false);
            }
            attempts++;
        }, 1000);
    });
}

async function connectWallet() {
    if (!window.tronLink || !window.tronWeb) {
        alert("TronLink not found. Please install the TronLink extension.");
        return;
    }

    try {
        await window.tronLink.request({ method: "tron_requestAccounts" });
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;

        if (!userAddress) {
            throw new Error("No account selected or TronLink not logged in.");
        }

        await initializeContracts();
        await updateUI();
    } catch (error) {
        console.error("Connection error:", error);
        alert("Failed to connect to TronLink. Please ensure it’s installed and logged in.");
    }
}

async function initializeContracts() {
    try {
        cftV1Contract = await tronWeb.contract(tokenContractAbi, cftV1ContractAddress); // For approve
        swapContract = await tronWeb.contract(swapContractAbi, swapContractAddress); // For swap and balances
    } catch (error) {
        console.error("Error initializing contracts:", error);
    }
}

async function updateUI() {
    try {
        const balances = await swapContract.getContractBalances().call();
        const cftV2Balance = tronWeb.fromSun(balances[2]); // CFT V2 balance
        const cftV1Balance = tronWeb.fromSun(balances[1]); // CFT V1 balance
        const totalSupply = 10000000; // 10M total supply
        const swappedPercentage = (cftV1Balance / totalSupply) * 100;

        document.getElementById('available-cft-v2').innerText = `${formatNumber(cftV2Balance, 0)}`;
        document.getElementById('collected-cft-v1').innerText = `${formatNumber(cftV1Balance, 0)}`;
        document.getElementById('swap-progress').innerText = `${swappedPercentage.toFixed(2)}%`;
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

async function swapTokens(amount) {
    try {
        const amountSun = tronWeb.toSun(amount);
        
        // Approve the swap contract to spend CFT V1
        await cftV1Contract.approve(swapContractAddress, amountSun).send({
            from: userAddress
        });

        // Perform the swap
        await swapContract.swapV1toV2(amountSun).send({
            from: userAddress
        });

        alert('Swap completed successfully!');
        await updateUI();
    } catch (error) {
        console.error('Error swapping tokens:', error);
        alert('Swap failed: ' + error.message);
    }
}

function calculateCFTV2() {
    const cftV1Amount = parseFloat(document.getElementById('cft-v1-amount').value) || 0;
    // 1:1 swap rate
    document.getElementById('calculated-cft-v2').innerText = `CFT V2 you will get: ${formatNumber(cftV1Amount, 0)}`;
}

function formatNumber(num, decimals = 0) {
    return Number(num).toLocaleString('en-US', { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
    });
}
