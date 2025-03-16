const tokenContractAddress = 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA'; // Replace with your token contract address
    const swapContractAddress = 'TSaGTyDQwFK2LPY99H6GcucqjQrQUGXnLF'; // Replace with your swap contract address

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

    document.addEventListener('DOMContentLoaded', async () => {
        document.getElementById('connect-button').addEventListener('click', connectWallet);
        
        if (await checkTronLinkInstalled()) {
            await initializeTronWeb();
            setInterval(updateUI, 60000); // Update every minute
        } else {
            console.error('TronLink is not installed.');
        }

        // Regular buy tokens
        document.getElementById('trx-amount').addEventListener('input', calculateCFT);
        document.getElementById('buy-button').addEventListener('click', async () => {
            const trxAmount = document.getElementById('trx-amount').value;
            if (!trxAmount || trxAmount <= 0) {
                alert('Please enter a valid TRX amount.');
                return;
            }
            await buyTokens(trxAmount);
        });

        // FEB buy tokens
        document.getElementById('feb-trx-amount').addEventListener('input', calculateFebCFT);
        document.getElementById('buy-feb-button').addEventListener('click', async () => {
            const trxAmount = document.getElementById('feb-trx-amount').value;
            if (!trxAmount || trxAmount <= 0) {
                alert('Please enter a valid TRX amount.');
                return;
            }
            await buyTokensAsFEB(trxAmount);
        });
    });

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

    async function connectWallet() {
        try {
            await tronLink.request({ method: 'tron_requestAccounts' });
            await initializeTronWeb();
        } catch (e) {
            console.error('Failed to connect to TronLink:', e);
        }
    }

    async function initializeTronWeb() {
        try {
            tronWeb = window.tronWeb;
            userAddress = tronWeb.defaultAddress.base58;

            if (!userAddress) throw new Error('User address not available');

            tokenContract = await tronWeb.contract(tokenContractAbi, tokenContractAddress);
            swapContract = await tronWeb.contract(swapContractAbi, swapContractAddress);

            document.getElementById('connect-button').style.display = 'none';
            await updateUI();
        } catch (error) {
            console.error('Error initializing TronWeb or Contracts:', error);
        }
    }

    async function updateUI() {
        try {
            await updateTRXBalance();
            await updateAvailableCFT();
            await updateBuyPrice();
            await updateBuyPriceFEB();
        } catch (error) {
            console.error('Error updating UI:', error);
        }
    }

    async function updateTRXBalance() {
        try {
            const trxBalance = await tronWeb.trx.getBalance(userAddress);
            document.getElementById('user-trx-balance').innerText = 'TRX Balance: ' + formatNumber(tronWeb.fromSun(trxBalance)) + ' TRX';
        } catch (error) {
            console.error('Error fetching TRX balance:', error);
        }
    }

    async function updateAvailableCFT() {
        try {
            const tokenBalance = await tokenContract.methods.balanceOf(swapContractAddress).call();
            document.getElementById('available-cft').innerText = 'CFT available in contract: ' + formatNumber(tronWeb.fromSun(tokenBalance)) + ' CFT';
        } catch (error) {
            console.error('Error fetching available CFT:', error);
        }
    }

    async function updateBuyPrice() {
        try {
            const buyPrice = await swapContract.methods.buyPrice().call();
            document.getElementById('buy-price').innerText = tronWeb.fromSun(buyPrice);
        } catch (error) {
            console.error('Error fetching buy price:', error);
        }
    }

    async function updateBuyPriceFEB() {
        try {
            const buyPriceFEB = await swapContract.methods.buyPriceFEB().call();
            document.getElementById('buy-price-feb').innerText = tronWeb.fromSun(buyPriceFEB);
        } catch (error) {
            console.error('Error fetching FEB buy price:', error);
        }
    }

    async function buyTokens(trxAmount) {
        try {
            await swapContract.methods.buyTokens().send({
                from: userAddress,
                callValue: tronWeb.toSun(trxAmount)
            });
            console.log('Tokens purchased.');
            await updateUI();
        } catch (error) {
            console.error('Error buying tokens:', error);
        }
    }

    async function buyTokensAsFEB(trxAmount) {
        try {
            await swapContract.methods.buyTokensAsFEBHolder().send({
                from: userAddress,
                callValue: tronWeb.toSun(trxAmount)
            });
            console.log('Tokens purchased (FEB holder).');
            await updateUI();
        } catch (error) {
            console.error('Error buying tokens as FEB holder:', error);
        }
    }

    function calculateCFT() {
        const trxAmount = document.getElementById('trx-amount').value;
        const buyPrice = document.getElementById('buy-price').innerText;

        if (!trxAmount || trxAmount <= 0) {
            document.getElementById('calculated-cft').innerText = 'CFT tokens you will get: 0 CFT';
            return;
        }

        const cftAmount = trxAmount / buyPrice;
        document.getElementById('calculated-cft').innerText = 'CFT tokens you will get: ' + formatNumber(cftAmount) + ' CFT';
    }

    function calculateFebCFT() {
        const trxAmount = document.getElementById('feb-trx-amount').value;
        const buyPriceFEB = document.getElementById('buy-price-feb').innerText;

        if (!trxAmount || trxAmount <= 0) {
            document.getElementById('calculated-feb-cft').innerText = 'CFT tokens you will get: 0 CFT';
            return;
        }

        const cftAmount = trxAmount / buyPriceFEB;
        document.getElementById('calculated-feb-cft').innerText = 'CFT tokens you will get: ' + formatNumber(cftAmount) + ' CFT';
    }

    function formatNumber(num) {
        return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("active");
    });
});
  
