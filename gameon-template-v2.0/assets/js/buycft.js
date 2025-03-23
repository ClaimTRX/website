
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
            {
                "internalType": "contract ITRC20",
                "name": "_token",
                "type": "address"
            },
            {
                "internalType": "contract ITRC20",
                "name": "_febToken",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_initialBuyPrice",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "_initialBuyPriceFEB",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "buyPrice",
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
        "name": "buyPriceFEB",
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
                "name": "_newBuyPrice",
                "type": "uint256"
            }
        ],
        "name": "setBuyPrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_newBuyPriceFEB",
                "type": "uint256"
            }
        ],
        "name": "setBuyPriceFEB",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "buyTokens",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "buyTokensAsFEBHolder",
        "outputs": [],
        "stateMutability": "payable",
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
        "name": "withdrawTRX",
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
        "name": "withdrawTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    },
    {
        "inputs": [],
        "name": "getTRXBalance",
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
        "name": "getTokenBalance",
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

    const tokenContractAddress = 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA';
const swapContractAddress = 'TSaGTyDQwFK2LPY99H6GcucqjQrQUGXnLF';

// Store contract instances globally
let tronWeb, userAddress, tokenContract, swapContract;

// Check if TronLink is installed and auto-connect on page load
document.addEventListener('DOMContentLoaded', async () => {
    if (await checkTronLinkInstalled()) {
        await connectWallet();  // Auto-connect
    }

    // Ensure the "Connect Wallet" button still works manually
    document.getElementById('connect-button').addEventListener('click', async function () {
        await connectWallet();
    });

    // Attach event listeners for buying tokens
    document.getElementById('trx-amount').addEventListener('input', calculateCFT);
    document.getElementById('buy-button').addEventListener('click', async () => {
        await buyTokens(document.getElementById('trx-amount').value);
    });

    document.getElementById('feb-trx-amount').addEventListener('input', calculateFebCFT);
    document.getElementById('buy-feb-button').addEventListener('click', async () => {
        await buyTokensAsFEB(document.getElementById('feb-trx-amount').value);
    });
});

// Function to check if TronLink is installed
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

// Function to connect to Tron wallet
async function connectWallet() {
    if (!window.tronWeb) {
        alert("TronLink not found. Please install and log in.");
        return;
    }

    try {
        await window.tronLink.request({ method: "tron_requestAccounts" });
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        document.getElementById('connect-button').innerHTML = '<i class="icon-wallet me-md-2"></i> Wallet Connected';
        console.log("Connected to TronLink:", userAddress);
        await initializeContracts();
        await updateUI();
    } catch (e) {
        console.error("Failed to connect:", e);
    }
}

// Initialize TronWeb and Contracts
async function initializeContracts() {
    try {
        tokenContract = await tronWeb.contract(tokenContractAbi, tokenContractAddress);
        swapContract = await tronWeb.contract(swapContractAbi, swapContractAddress);
    } catch (error) {
        console.error("Error initializing contracts:", error);
    }
}

// Update UI Elements
async function updateUI() {
    try {
        await updateTRXBalance();
        await updateAvailableCFT();
        await updateBuyPrice();
        await updateBuyPriceFEB();
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

// Fetch and update TRX balance
async function updateTRXBalance() {
    try {
        const trxBalance = await tronWeb.trx.getBalance(userAddress);
        const formattedBalance = formatNumber(tronWeb.fromSun(trxBalance), 0); // No decimals
        document.querySelectorAll("#available-trx").forEach(el => el.innerText = `${formattedBalance} `);
    } catch (error) {
        console.error("Error fetching TRX balance:", error);
    }
}

// Fetch available CFT tokens in the contract
async function updateAvailableCFT() {
    try {
        const tokenBalance = await tokenContract.methods.balanceOf(swapContractAddress).call();
        const formattedBalance = formatNumber(tronWeb.fromSun(tokenBalance), 0); // No decimals
        document.querySelectorAll("#available-cft").forEach(el => el.innerText = `${formattedBalance} `);
    } catch (error) {
        console.error("Error fetching available CFT:", error);
    }
}

// Fetch and update the buy price of CFT
async function updateBuyPrice() {
    try {
        const buyPriceElement = document.getElementById('buy-price');
        if (!buyPriceElement) return console.error("Error: Element 'buy-price' not found.");

        const buyPrice = await swapContract.methods.buyPrice().call();
        buyPriceElement.innerText = formatNumber(tronWeb.fromSun(buyPrice), 2); // 2 decimals
    } catch (error) {
        console.error('Error fetching buy price:', error);
    }
}

// Fetch and update the buy price of CFT for FEB holders
async function updateBuyPriceFEB() {
    try {
        const buyPriceFebElement = document.getElementById('buy-price-feb');
        if (!buyPriceFebElement) return console.error("Error: Element 'buy-price-feb' not found.");

        const buyPriceFEB = await swapContract.methods.buyPriceFEB().call();
        buyPriceFebElement.innerText = formatNumber(tronWeb.fromSun(buyPriceFEB), 2); // 2 decimals
    } catch (error) {
        console.error('Error fetching FEB buy price:', error);
    }
}

// Buy CFT tokens
async function buyTokens(trxAmount) {
    try {
        await swapContract.methods.buyTokens().send({
            from: userAddress,
            callValue: tronWeb.toSun(trxAmount)
        });
        alert('Tokens purchased successfully!');
        await updateUI();
    } catch (error) {
        console.error('Error buying tokens:', error);
    }
}

// Buy CFT tokens as a FEB holder
async function buyTokensAsFEB(trxAmount) {
    try {
        await swapContract.methods.buyTokensAsFEBHolder().send({
            from: userAddress,
            callValue: tronWeb.toSun(trxAmount)
        });
        alert('Tokens purchased successfully (FEB Holder)!');
        await updateUI();
    } catch (error) {
        console.error('Error buying tokens as FEB holder:', error);
    }
}

// Calculate CFT received for entered TRX
function calculateCFT() {
    const trxAmount = parseFloat(document.getElementById('trx-amount').value);
    const buyPrice = parseFloat(document.getElementById('buy-price').innerText);

    if (!trxAmount || trxAmount <= 0 || !buyPrice) {
        document.getElementById('calculated-cft').innerText = 'CFT tokens you will get: 0 CFT';
        return;
    }

    const cftAmount = trxAmount / buyPrice;
    document.getElementById('calculated-cft').innerText = `CFT tokens you will get: ${formatNumber(cftAmount, 0)}`;
}

// Calculate CFT received for entered TRX (FEB)
function calculateFebCFT() {
    const trxAmount = parseFloat(document.getElementById('feb-trx-amount').value);
    const buyPriceFEB = parseFloat(document.getElementById('buy-price-feb').innerText);

    if (!trxAmount || trxAmount <= 0 || !buyPriceFEB) {
        document.getElementById('calculated-feb-cft').innerText = 'CFT tokens you will get: 0 CFT';
        return;
    }

    const cftAmount = trxAmount / buyPriceFEB;
    document.getElementById('calculated-feb-cft').innerText = `CFT tokens you will get: ${formatNumber(cftAmount, 0)}`;
}

// Format numbers with commas, decimals controlled
function formatNumber(num, decimals = 0) {
    return Number(num).toLocaleString('en-US', { 
        minimumFractionDigits: decimals, 
        maximumFractionDigits: decimals 
    });
}


