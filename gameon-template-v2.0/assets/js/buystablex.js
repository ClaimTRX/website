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
 
let tronWeb, readTronWeb, userAddress, tokenContract, readTokenContract, swapContract, readSwapContract, usdtContract, readUsdtContract, usddContract, readUsddContract;
const CHAINSTACK_BASE_URL = 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299';
const CONTRACT_CALL_DELAY_MS = 300; // Increased to 1000ms for safer pacing
const THROTTLE_GAP_MS = 500; // Adjust if needed for Chainstack's 25 RPS limit

const throttle = (() => {
  let queue = Promise.resolve();
  let last = 0;
  const gap = THROTTLE_GAP_MS;
  return async function run(fn) {
    const exec = async () => {
      const now = Date.now();
      const wait = Math.max(0, gap - (now - last));
      if (wait) await new Promise(r => setTimeout(r, wait));
      last = Date.now();
      return await fn();
    };
    queue = queue.then(exec, exec);
    return queue;
  };
})();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, maxRetries = 5, baseDelay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('429') && i < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, i);
        console.warn(`429 error, retrying after ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
}

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
        await initializeTronWeb();
        document.getElementById("connect-button").innerText = "Wallet Connected";
        console.log("✅ Connected to TronLink:", userAddress);
    } catch (e) {
        console.error("❌ Failed to connect to TronLink:", e);
        alert("❌ Failed to connect. Ensure TronLink is installed, unlocked, and logged in.");
    }
}
async function initializeTronWeb() {
    const initDelay = 1500; // Consistent delay for detection
    await delay(initDelay);
    if (!window.tronLink || !window.tronWeb) {
      console.log('TronLink is not detected. Install or unlock TronLink.');
      return;
    }
    if (!window.tronLink.ready) {
      console.log('TronLink is not ready. Unlock TronLink and select mainnet.');
      return;
    }
    tronWeb = window.tronWeb; // Injected for signing
    // Load TronWeb library if not available
    const loadTronWebScript = () => new Promise((resolve, reject) => {
      if (window.TronWeb) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tronweb@latest/dist/TronWeb.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      }
    });
    await loadTronWebScript();
  // Use TronLink's TronWeb class if the global isn't a constructor
  const TronWebCtor = (typeof window.TronWeb === 'function')
    ? window.TronWeb
    : window.tronWeb?.constructor;
  if (!TronWebCtor) {
    throw new Error('TronWeb is not available as a constructor. Reload, unlock TronLink, or use a different TronWeb CDN build.');
  }
  readTronWeb = new TronWebCtor({ fullHost: CHAINSTACK_BASE_URL });
    // Throttle requests on readTronWeb
    const originalReadRequest = readTronWeb.request;
    readTronWeb.request = async function(endpoint, params = {}, method = 'POST') {
      return throttle(async () => {
        return originalReadRequest.call(this, endpoint, params, method);
      });
    };
    userAddress = tronWeb.defaultAddress.base58;
  if (!userAddress) {
    console.log('No user address found. Ensure TronLink is connected to mainnet.');
    return;
  }
  // ✅ IMPORTANT: make readTronWeb have a default "from" address for .call()
  readTronWeb.setAddress(userAddress);
    try {
        tokenContract = await tronWeb.contract(trc20Abi, tokenContractAddress);
        readTokenContract = await readTronWeb.contract(trc20Abi, tokenContractAddress);
        await delay(CONTRACT_CALL_DELAY_MS);
        usdtContract = await tronWeb.contract(trc20Abi, usdtContractAddress);
        readUsdtContract = await readTronWeb.contract(trc20Abi, usdtContractAddress);
        await delay(CONTRACT_CALL_DELAY_MS);
        usddContract = await tronWeb.contract(trc20Abi, usddContractAddress);
        readUsddContract = await readTronWeb.contract(trc20Abi, usddContractAddress);
        await delay(CONTRACT_CALL_DELAY_MS);
        swapContract = await tronWeb.contract(contractAbi, swapContractAddress);
        readSwapContract = await readTronWeb.contract(contractAbi, swapContractAddress);
        await updateUI();
    } catch (error) {
        console.error("❌ Error initializing TronWeb or Contracts:", error);
    }
}
async function buyTokensWithUSDT(amount) {
    try {
        const usdtBalanceRaw = await retryWithBackoff(() => readUsdtContract.methods.balanceOf(userAddress).call());
        await delay(CONTRACT_CALL_DELAY_MS);
        const usdtBalance = Number(usdtBalanceRaw) / (10 ** usdtDecimals);
        const usdtSmallestUnits = BigInt(Math.floor(amount * (10 ** usdtDecimals)));
        if (usdtBalance < amount) {
            alert("❌ Insufficient USDT balance.");
            return;
        }
        const trxBalance = await retryWithBackoff(() => tronWeb.trx.getBalance(userAddress));
        await delay(CONTRACT_CALL_DELAY_MS);
        if (trxBalance / 1e6 < 1) {
            alert("❌ Insufficient TRX for transaction fees.");
            return;
        }
        // Fetch and validate allowance
        let currentAllowance;
        try {
            currentAllowance = await retryWithBackoff(() => readUsdtContract.methods.allowance(userAddress, swapContractAddress).call());
            await delay(CONTRACT_CALL_DELAY_MS);
            console.log("📊 Current Allowance:", currentAllowance.toString(), "Required:", usdtSmallestUnits.toString());
        } catch (error) {
            console.error("❌ Error fetching allowance:", error);
            alert("❌ Failed to check allowance. Please try again.");
            return;
        }
        // Ensure allowance is a valid number and compare strictly
        const allowanceBN = BigInt(currentAllowance || 0);
        if (allowanceBN < usdtSmallestUnits) {
            console.log("✅ Approving USDT for amount:", usdtSmallestUnits);
            try {
                const approvalTx = await usdtContract.methods.approve(swapContractAddress, usdtSmallestUnits.toString()).send();
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
        const swapTx = await swapContract.methods.buyWithUSDT(usdtSmallestUnits.toString()).send();
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
        const usddBalanceRaw = await retryWithBackoff(() => readUsddContract.methods.balanceOf(userAddress).call());
        await delay(CONTRACT_CALL_DELAY_MS);
        const usddBalance = Number(usddBalanceRaw) / (10 ** usddDecimals);
        const usddSmallestUnits = BigInt(Math.floor(amount * (10 ** usddDecimals)));
        if (usddBalance < amount) {
            alert("❌ Insufficient USDD balance.");
            return;
        }
        const trxBalance = await retryWithBackoff(() => tronWeb.trx.getBalance(userAddress));
        await delay(CONTRACT_CALL_DELAY_MS);
        if (trxBalance / 1e6 < 1) {
            alert("❌ Insufficient TRX for transaction fees.");
            return;
        }
        // Fetch and validate allowance
        let currentAllowance;
        try {
            currentAllowance = await retryWithBackoff(() => readUsddContract.methods.allowance(userAddress, swapContractAddress).call());
            await delay(CONTRACT_CALL_DELAY_MS);
            console.log("📊 Current Allowance:", currentAllowance.toString(), "Required:", usddSmallestUnits.toString());
        } catch (error) {
            console.error("❌ Error fetching allowance:", error);
            alert("❌ Failed to check allowance. Please try again.");
            return;
        }
        // Ensure allowance is a valid number and compare strictly
        const allowanceBN = BigInt(currentAllowance || 0);
        if (allowanceBN < usddSmallestUnits) {
            console.log("✅ Approving USDD for amount:", usddSmallestUnits);
            try {
                const approvalTx = await usddContract.methods.approve(swapContractAddress, usddSmallestUnits.toString()).send();
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
        const swapTx = await swapContract.methods.buyWithUSDD(usddSmallestUnits.toString()).send();
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
        const stblxBalanceRaw = await retryWithBackoff(() => readTokenContract.methods.balanceOf(userAddress).call());
        await delay(CONTRACT_CALL_DELAY_MS);
        const stblxDecimals = await retryWithBackoff(() => readTokenContract.methods.decimals().call());
        await delay(CONTRACT_CALL_DELAY_MS);
        const stblxBalance = Number(stblxBalanceRaw) / (10 ** Number(stblxDecimals));
        if (document.getElementById("stblx-balance")) {
            document.getElementById("stblx-balance").innerText = `STBLX Balance: ${formatNumber(stblxBalance)}`;
        }
    } catch (error) {
        console.error("❌ Error updating UI:", error);
    }
}
