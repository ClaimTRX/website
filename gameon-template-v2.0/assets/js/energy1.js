let tronWeb, userAddress;

// Hardcoded price mapping (energy amount to TRX)
const priceMap = {
    "100000": 2.5,
    "200000": 5,
    "300000": 7.5,
    "400000": 10,
    "500000": 12.5
};

// Your Tron address for receiving payments
const PAYMENT_ADDRESS = "YOUR_SPECIFIC_TRON_ADDRESS"; // Replace with your actual Tron address

// Check if TronLink is installed
async function checkTronLinkInstalled() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
                clearInterval(interval);
                resolve(true);
            }
        }, 1000);
        setTimeout(() => {
            clearInterval(interval);
            resolve(false);
        }, 10000);
    });
}

// Auto-connect wallet if authorized
async function autoConnectWallet() {
    if (window.tronWeb && window.tronLink) {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        if (userAddress && userAddress !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
            console.log("Auto-connected wallet:", userAddress);
            updateWalletUI(true);
        } else {
            console.log("TronLink detected, but wallet not connected.");
        }
    }
}

// Manually connect wallet
async function connectWallet() {
    if (!window.tronWeb || !window.tronLink) {
        alert("TronLink not found. Please install TronLink and log in.");
        return;
    }
    try {
        await window.tronLink.request({ method: "tron_requestAccounts" });
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        updateWalletUI(true);
        console.log("Wallet connected:", userAddress);
    } catch (e) {
        console.error("Wallet connection failed:", e);
    }
}

// Update wallet UI
function updateWalletUI(isConnected) {
    const connectButton = document.getElementById("connect-button");
    if (connectButton) {
        connectButton.innerHTML = isConnected
            ? `<i class="icon-wallet"></i> Wallet Connected`
            : `<i class="icon-wallet"></i> Connect Wallet`;
    }
}

// Update price display when energy amount changes
function updatePriceDisplay() {
    const energyAmount = document.getElementById("energy-amount").value;
    const trxPrice = priceMap[energyAmount];
    document.getElementById("trx-price").textContent = trxPrice;
}

// Initiate payment process
async function buyEnergy() {
    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    const energyAmount = document.getElementById("energy-amount").value;
    const receiverAddress = document.getElementById("receiver-address").value;
    const trxPrice = priceMap[energyAmount];

    if (!tronWeb.isAddress(receiverAddress)) {
        alert("Please enter a valid Tron wallet address.");
        return;
    }

    try {
        const response = await fetch("https://your-ubuntu-server.com/api/request-energy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ energyAmount, receiverAddress, trxPrice, userAddress })
        });
        const data = await response.json();

        if (data.success) {
            document.getElementById("payment-instructions").style.display = "block";
            document.getElementById("payment-message").innerHTML = `
                Send <strong>${trxPrice} TRX</strong> to <strong>${PAYMENT_ADDRESS}</strong> from your wallet.
                Energy delegation will begin once payment is confirmed.
            `;
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error requesting energy:", error);
        alert("An error occurred. Please try again.");
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded and parsed.");
    await autoConnectWallet();

    const connectButton = document.getElementById("connect-button");
    if (connectButton) connectButton.addEventListener("click", connectWallet);

    const energyAmountSelect = document.getElementById("energy-amount");
    if (energyAmountSelect) energyAmountSelect.addEventListener("change", updatePriceDisplay);

    const buyEnergyButton = document.getElementById("buy-energy-button");
    if (buyEnergyButton) buyEnergyButton.addEventListener("click", buyEnergy);
});
