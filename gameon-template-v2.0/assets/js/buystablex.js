const tokenContractAddress = 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS'; // STBLX token
const swapContractAddress = 'TUGprGUNtszQgc3pGwMcC9R3z3sDT31G9W'; // Swap contract
const usdtContractAddress = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'; // TRC20 USDT
const usddContractAddress = 'TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz'; // TRC20 USDD

const usdtDecimals = 6;
const usddDecimals = 18;

    const contractAbi = [
      {"inputs":[{"internalType":"contract ITRC20","name":"_token","type":"address"},{"internalType":"contract ITRC20","name":"_usdt","type":"address"},{"internalType":"contract ITRC20","name":"_usdd","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
      {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"paymentToken","type":"string"}],"name":"TokensPurchased","type":"event"},
      {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"address","name":"tokenAddress","type":"address"}],"name":"WithdrawnTokens","type":"event"},
      {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"buyWithUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"buyWithUSDD","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"token","outputs":[{"internalType":"contract ITRC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"usdd","outputs":[{"internalType":"contract ITRC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"usdt","outputs":[{"internalType":"contract ITRC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"withdrawAllUSDD","outputs":[],"stateMutability":"nonpayable","type":"function"},
      {"inputs":[],"name":"withdrawAllUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"}
    ];

    const trc20Abi = [
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

  

let tronWeb, userAddress, tokenContract, usdtContract, usddContract, swapContract;

document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM Loaded");

    const connectButton = document.getElementById("connect-button");
    if (connectButton) {
        connectButton.addEventListener("click", connectWallet);
    }

    if (await checkTronLinkInstalled()) {
        await initializeTronWeb();
        await updateUI();
    } else {
        console.error("TronLink is not installed.");
    }

    // Input validations and event listeners
    const usdtAmountInput = document.getElementById("usdt-amount");
    const buyUsdtButton = document.getElementById("buy-usdt-button");
    const usddAmountInput = document.getElementById("usdd-amount");
    const buyUsddButton = document.getElementById("buy-usdd-button");

    if (usdtAmountInput) usdtAmountInput.addEventListener("input", calculateTKNXUSDT);
    if (buyUsdtButton) {
        buyUsdtButton.addEventListener("click", async () => {
            const amount = parseFloat(usdtAmountInput.value);
            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid positive USDT amount.");
                return;
            }
            await buyTokensWithUSDT(amount);
        });
    }

    if (usddAmountInput) usddAmountInput.addEventListener("input", calculateTKNXUSDD);
    if (buyUsddButton) {
        buyUsddButton.addEventListener("click", async () => {
            const amount = parseFloat(usddAmountInput.value);
            if (isNaN(amount) || amount <= 0) {
                alert("Please enter a valid positive USDD amount.");
                return;
            }
            await buyTokensWithUSDD(amount);
        });
    }
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
    if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
        alert("TronLink is not installed or not logged in. Please install TronLink and log in.");
        return;
    }

    try {
        await tronLink.request({ method: "tron_requestAccounts" });
        await initializeTronWeb();
    } catch (e) {
        console.error("Failed to connect to TronLink:", e);
        alert("Failed to connect to TronLink. Please try again.");
    }
}

async function initializeTronWeb() {
    try {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        if (!userAddress) throw new Error("User address not available");

        tokenContract = await tronWeb.contract().at(tokenContractAddress);
        usdtContract = await tronWeb.contract().at(usdtContractAddress);
        usddContract = await tronWeb.contract().at(usddContractAddress);
        swapContract = await tronWeb.contract().at(swapContractAddress);

        document.getElementById("connect-button").style.display = "none";
        await updateUI();
    } catch (error) {
        console.error("Error initializing TronWeb or Contracts:", error);
    }
}

async function updateUI() {
    try {
        await updateAvailableTokens();
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

async function updateAvailableTokens() {
    try {
        if (!userAddress) return;

        const tokenBalanceRaw = await tokenContract.balanceOf(userAddress).call();
        const usdtBalanceRaw = await usdtContract.balanceOf(userAddress).call();
        const usddBalanceRaw = await usddContract.balanceOf(userAddress).call();

        const tokenBalance = new BigNumber(tokenBalanceRaw).div(new BigNumber(10).pow(usdtDecimals)).toNumber();
        const usdtBalance = new BigNumber(usdtBalanceRaw).div(new BigNumber(10).pow(usdtDecimals)).toNumber();
        const usddBalance = new BigNumber(usddBalanceRaw).div(new BigNumber(10).pow(usddDecimals)).toNumber();

        document.getElementById("available-stablex").innerText = formatNumber(tokenBalance) + " STBLX";
        document.getElementById("available-usdt").innerText = formatNumber(usdtBalance) + " USDT";
        document.getElementById("available-usdd").innerText = formatNumber(usddBalance) + " USDD";
    } catch (error) {
        console.error("Error fetching balances:", error);
    }
}

async function buyTokensWithUSDT(amount) {
    try {
        const usdtBalanceRaw = await usdtContract.balanceOf(userAddress).call();
        const usdtBalance = new BigNumber(usdtBalanceRaw).div(new BigNumber(10).pow(usdtDecimals)).toNumber();
        const usdtSmallestUnits = new BigNumber(amount).times(new BigNumber(10).pow(usdtDecimals)).toFixed(0);

        if (usdtBalance < amount) {
            alert("Insufficient USDT balance.");
            return;
        }

        await usdtContract.approve(swapContractAddress, usdtSmallestUnits).send();
        await swapContract.buyWithUSDT(usdtSmallestUnits).send();

        await updateUI();
    } catch (error) {
        console.error("Error buying tokens with USDT:", error);
        alert("Swap failed. Check console for details.");
    }
}

async function buyTokensWithUSDD(amount) {
    try {
        const usddBalanceRaw = await usddContract.balanceOf(userAddress).call();
        const usddBalance = new BigNumber(usddBalanceRaw).div(new BigNumber(10).pow(usddDecimals)).toNumber();
        const usddSmallestUnits = new BigNumber(amount).times(new BigNumber(10).pow(usddDecimals)).toFixed(0);

        if (usddBalance < amount) {
            alert("Insufficient USDD balance.");
            return;
        }

        await usddContract.approve(swapContractAddress, usddSmallestUnits).send();
        await swapContract.buyWithUSDD(usddSmallestUnits).send();

        await updateUI();
    } catch (error) {
        console.error("Error buying tokens with USDD:", error);
        alert("Swap failed. Check console for details.");
    }
}

function calculateTKNXUSDT() {
    const amount = document.getElementById("usdt-amount").value;
    document.getElementById("calculated-tknx-usdt").innerText = 
        "STBLX tokens you will get: " + formatNumber(amount || 0) + " STBLX";
}

function calculateTKNXUSDD() {
    const amount = document.getElementById("usdd-amount").value;
    document.getElementById("calculated-tknx-usdd").innerText = 
        "STBLX tokens you will get: " + formatNumber(amount || 0) + " STBLX";
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

 // Import BigNumber.js if needed
if (typeof BigNumber === "undefined") {
    console.error("BigNumber.js is not loaded. Please check your script imports.");
}
