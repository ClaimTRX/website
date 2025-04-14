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

document.addEventListener("DOMContentLoaded", async () => {
    const connectButton = document.getElementById("connect-button");
    if (connectButton) {
        connectButton.addEventListener("click", connectWallet);
    } else {
        console.error("❌ Connect button not found in DOM.");
    }

    if (await checkTronLinkInstalled()) {
        console.log("✅ TronLink detected, attempting auto-connect...");
        await connectWallet();
    } else {
        console.error("❌ TronLink is not installed or not detected.");
        alert("⚠️ TronLink is not installed. Please install it to proceed.");
    }

    document.getElementById("usdt-amount")?.addEventListener("input", calculateTKNXUSDT);
    document.getElementById("usdd-amount")?.addEventListener("input", calculateTKNXUSDD);

    document.getElementById("buy-usdt-button")?.addEventListener("click", async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById("usdt-amount").value);
        if (isNaN(amount) || amount <= 0) {
            alert("❌ Please enter a valid positive USDT amount.");
            return;
        }
        await buyTokensWithUSDT(amount);
    });

    document.getElementById("buy-usdd-button")?.addEventListener("click", async (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById("usdd-amount").value);
        if (isNaN(amount) || amount <= 0) {
            alert("❌ Please enter a valid positive USDD amount.");
            return;
        }
        await buyTokensWithUSDD(amount);
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
        alert("⚠️ TronLink is not installed. Please install the TronLink extension.");
        return;
    }

    try {
        console.log("Attempting to connect to TronLink...");
        await window.tronLink.request({ method: "tron_requestAccounts" });
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;

        if (!userAddress) {
            throw new Error("No account selected or TronLink not logged in.");
        }

        await initializeTronWeb();
        document.getElementById("connect-button").innerText = "Wallet Connected";
        console.log("✅ Connected to TronLink:", userAddress);
    } catch (e) {
        console.error("❌ Failed to connect to TronLink:", e);
        alert("❌ Failed to connect. Ensure TronLink is installed, unlocked, and logged in.");
    }
}

async function initializeTronWeb() {
    try {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        if (!userAddress) throw new Error("User address not available");

        tokenContract = await tronWeb.contract(trc20Abi, tokenContractAddress);
        usdtContract = await tronWeb.contract(trc20Abi, usdtContractAddress);
        usddContract = await tronWeb.contract(trc20Abi, usddContractAddress);
        swapContract = await tronWeb.contract(contractAbi, swapContractAddress);

        await updateUI();
    } catch (error) {
        console.error("❌ Error initializing TronWeb or Contracts:", error);
    }
}

async function buyTokensWithUSDT(amount) {
    try {
        const usdtBalanceRaw = await usdtContract.methods.balanceOf(userAddress).call();
        const usdtBalance = new BigNumber(usdtBalanceRaw).div(new BigNumber(10).pow(usdtDecimals)).toNumber();
        const usdtSmallestUnits = new BigNumber(amount).times(new BigNumber(10).pow(usdtDecimals)).toFixed(0);

        if (usdtBalance < amount) {
            alert("❌ Insufficient USDT balance.");
            return;
        }

        const trxBalance = await tronWeb.trx.getBalance(userAddress) / 1e6;
        if (trxBalance < 1) {
            alert("❌ Insufficient TRX for transaction fees.");
            return;
        }

        // Fetch and validate allowance
        let currentAllowance;
        try {
            currentAllowance = await usdtContract.methods.allowance(userAddress, swapContractAddress).call();
            console.log("📊 Current Allowance:", currentAllowance.toString(), "Required:", usdtSmallestUnits.toString());
        } catch (error) {
            console.error("❌ Error fetching allowance:", error);
            alert("❌ Failed to check allowance. Please try again.");
            return;
        }

        // Ensure allowance is a valid number and compare strictly
        const allowanceBN = new BigNumber(currentAllowance || 0);
        const requiredBN = new BigNumber(usdtSmallestUnits);
        if (!allowanceBN.isFinite() || allowanceBN.lt(requiredBN)) {
            console.log("✅ Approving USDT for amount:", usdtSmallestUnits);
            try {
                const approvalTx = await usdtContract.methods.approve(swapContractAddress, usdtSmallestUnits).send();
                console.log("✅ Approval successful, TX:", approvalTx);
            } catch (error) {
                console.error("❌ Approval failed:", error);
                alert("❌ Approval transaction failed. Check console for details.");
                return;
            }
        } else {
            console.log("✅ Sufficient allowance:", allowanceBN.toString());
        }

        // Proceed with swap
        console.log("✅ Buying with USDT...");
        const swapTx = await swapContract.methods.buyWithUSDT(usdtSmallestUnits).send();
        console.log("✅ Swap successful, TX:", swapTx);

        await updateUI();
        setTimeout(() => location.reload(), 2000);
    } catch (error) {
        console.error("❌ Error buying tokens with USDT:", error);
        alert("❌ Swap failed. Check console for details.");
    }
}

async function buyTokensWithUSDD(amount) {
    try {
        const usddBalanceRaw = await usddContract.methods.balanceOf(userAddress).call();
        const usddBalance = new BigNumber(usddBalanceRaw).div(new BigNumber(10).pow(usddDecimals)).toNumber();
        const usddSmallestUnits = new BigNumber(amount).times(new BigNumber(10).pow(usddDecimals)).toFixed(0);

        if (usddBalance < amount) {
            alert("❌ Insufficient USDD balance.");
            return;
        }

        const trxBalance = await tronWeb.trx.getBalance(userAddress) / 1e6;
        if (trxBalance < 1) {
            alert("❌ Insufficient TRX for transaction fees.");
            return;
        }

        // Fetch and validate allowance
        let currentAllowance;
        try {
            currentAllowance = await usddContract.methods.allowance(userAddress, swapContractAddress).call();
            console.log("📊 Current Allowance:", currentAllowance.toString(), "Required:", usddSmallestUnits.toString());
        } catch (error) {
            console.error("❌ Error fetching allowance:", error);
            alert("❌ Failed to check allowance. Please try again.");
            return;
        }

        // Ensure allowance is a valid number and compare strictly
        const allowanceBN = new BigNumber(currentAllowance || 0);
        const requiredBN = new BigNumber(usddSmallestUnits);
        if (!allowanceBN.isFinite() || allowanceBN.lt(requiredBN)) {
            console.log("✅ Approving USDD for amount:", usddSmallestUnits);
            try {
                const approvalTx = await usddContract.methods.approve(swapContractAddress, usddSmallestUnits).send();
                console.log("✅ Approval successful, TX:", approvalTx);
            } catch (error) {
                console.error("❌ Approval failed:", error);
                alert("❌ Approval transaction failed. Check console for details.");
                return;
            }
        } else {
            console.log("✅ Sufficient allowance:", allowanceBN.toString());
        }

        // Proceed with swap
        console.log("✅ Buying with USDD...");
        const swapTx = await swapContract.methods.buyWithUSDD(usddSmallestUnits).send();
        console.log("✅ Swap successful, TX:", swapTx);

        await updateUI();
        setTimeout(() => location.reload(), 2000);
    } catch (error) {
        console.error("❌ Error buying tokens with USDD:", error);
        alert("❌ Swap failed. Check console for details.");
    }
}

function calculateTKNXUSDT() {
    const amount = document.getElementById("usdt-amount")?.value || 0;
    document.getElementById("calculated-tknx-usdt").innerText = `STBLX tokens you will get: ${formatNumber(amount)}`;
}

function calculateTKNXUSDD() {
    const amount = document.getElementById("usdd-amount")?.value || 0;
    document.getElementById("calculated-tknx-usdd").innerText = `STBLX tokens you will get: ${formatNumber(amount)}`;
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function updateUI() {
    try {
        const stblxBalanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
        const stblxDecimals = await tokenContract.methods.decimals().call();
        const stblxBalance = new BigNumber(stblxBalanceRaw).div(new BigNumber(10).pow(stblxDecimals)).toNumber();
        if (document.getElementById("stblx-balance")) {
            document.getElementById("stblx-balance").innerText = `STBLX Balance: ${formatNumber(stblxBalance)}`;
        }
    } catch (error) {
        console.error("❌ Error updating UI:", error);
    }
}
