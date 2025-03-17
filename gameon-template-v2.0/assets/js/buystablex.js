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

  



let tronWeb, userAddress, tokenContract, swapContract, usdtContract, usddContract;

// Wait for DOM to load
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🚀 DOM Loaded");

    const connectButton = document.getElementById("connect-button");
    if (connectButton) {
        connectButton.addEventListener("click", connectWallet);
    }

    if (await checkTronLinkInstalled()) {
        await initializeTronWeb();
    } else {
        console.error("❌ TronLink is not installed.");
    }

    // Event listeners for inputs & buy buttons
    document.getElementById("usdt-amount")?.addEventListener("input", calculateTKNXUSDT);
    document.getElementById("buy-usdt-button")?.addEventListener("click", async () => {
        const amount = parseFloat(document.getElementById("usdt-amount").value);
        if (isNaN(amount) || amount <= 0) {
            alert("❌ Please enter a valid positive USDT amount.");
            return;
        }
        await buyTokensWithUSDT(amount);
    });

    document.getElementById("usdd-amount")?.addEventListener("input", calculateTKNXUSDD);
    document.getElementById("buy-usdd-button")?.addEventListener("click", async () => {
        const amount = parseFloat(document.getElementById("usdd-amount").value);
        if (isNaN(amount) || amount <= 0) {
            alert("❌ Please enter a valid positive USDD amount.");
            return;
        }
        await buyTokensWithUSDD(amount);
    });
});

// Check if TronLink is installed
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

// Connect wallet
async function connectWallet() {
    if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
        alert("⚠️ TronLink is not installed or logged in. Please check your wallet.");
        return;
    }

    try {
        await tronLink.request({ method: "tron_requestAccounts" });
        await initializeTronWeb();
    } catch (e) {
        console.error("❌ Failed to connect to TronLink:", e);
        alert("❌ Failed to connect. Please try again.");
    }
}

// Initialize TronWeb & Contracts
async function initializeTronWeb() {
    try {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        if (!userAddress) throw new Error("User address not available");

        console.log(`✅ Connected as ${userAddress}`);

        // Load TRC20 contracts properly
        tokenContract = await tronWeb.contract().at(tokenContractAddress);
        usdtContract = await tronWeb.contract().at(usdtContractAddress);
        usddContract = await tronWeb.contract().at(usddContractAddress);
        swapContract = await tronWeb.contract().at(swapContractAddress);

        document.getElementById("connect-button").style.display = "none";
    } catch (error) {
        console.error("❌ Error initializing TronWeb or Contracts:", error);
    }
}

// Buy StableX with USDT
async function buyTokensWithUSDT(amount) {
    try {
        const usdtSmallestUnits = new BigNumber(amount).times(new BigNumber(10).pow(usdtDecimals)).toFixed(0);

        console.log("✅ Approving USDT...");
        await usdtContract.methods.approve(swapContractAddress, usdtSmallestUnits).send();

        console.log("✅ Buying with USDT...");
        await swapContract.methods.buyWithUSDT(usdtSmallestUnits).send();

        alert("✅ Purchase successful!");
    } catch (error) {
        console.error("❌ Error buying tokens with USDT:", error);
        alert("❌ Swap failed. Check console for details.");
    }
}

// Buy StableX with USDD
async function buyTokensWithUSDD(amount) {
    try {
        const usddSmallestUnits = new BigNumber(amount).times(new BigNumber(10).pow(usddDecimals)).toFixed(0);

        console.log("✅ Approving USDD...");
        await usddContract.methods.approve(swapContractAddress, usddSmallestUnits).send();

        console.log("✅ Buying with USDD...");
        await swapContract.methods.buyWithUSDD(usddSmallestUnits).send();

        alert("✅ Purchase successful!");
    } catch (error) {
        console.error("❌ Error buying tokens with USDD:", error);
        alert("❌ Swap failed. Check console for details.");
    }
}

// Calculate expected StableX tokens for USDT input
function calculateTKNXUSDT() {
    const amount = document.getElementById("usdt-amount")?.value || 0;
    const outputElement = document.getElementById("calculated-tknx-usdt");
    if (outputElement) {
        outputElement.innerText = `STBLX tokens you will get: ${formatNumber(amount)}`;
    }
}

function calculateTKNXUSDD() {
    const amount = document.getElementById("usdd-amount")?.value || 0;
    const outputElement = document.getElementById("calculated-tknx-usdd");
    if (outputElement) {
        outputElement.innerText = `STBLX tokens you will get: ${formatNumber(amount)}`;
    }
}

// Format numbers with commas & decimals
function formatNumber(num) {
    return parseFloat(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

