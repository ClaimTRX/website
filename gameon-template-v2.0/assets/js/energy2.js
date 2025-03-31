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
const PAYMENT_ADDRESS = "TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn"; // Replace with your actual Tron address

// Server address for API calls
const SERVER_URL = "http://144.126.169.238:3000";

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
            fetchAvailableEnergy();
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
        fetchAvailableEnergy();
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

// Fetch available energy from the server with retry logic
async function fetchAvailableEnergy() {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            const response = await fetch(`${SERVER_URL}/api/available-energy`);
            const data = await response.json();
            if (data.success) {
                document.getElementById("available-energy").textContent = data.availableEnergy;
                return;
            } else {
                throw new Error("Failed to fetch available energy");
            }
        } catch (error) {
            console.error(`Error fetching available energy (attempt ${retries + 1}):`, error);
            retries++;
            if (retries === maxRetries) {
                document.getElementById("available-energy").textContent = "Error fetching available energy";
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
        }
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
        const response = await fetch(`${SERVER_URL}/api/request-energy`, {
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
            // Poll for delegation status
            pollDelegationStatus(data.requestId);
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Error requesting energy:", error);
        alert("An error occurred. Please try again.");
    }
}

// Poll for delegation status
async function pollDelegationStatus(requestId) {
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/delegation-status?requestId=${requestId}`);
            const data = await response.json();
            if (data.status === "delegated") {
                clearInterval(interval);
                document.getElementById("delegation-status").style.display = "block";
                document.getElementById("delegation-message").textContent = `Energy delegated successfully!`;
                document.getElementById("delegation-hash").textContent = data.txId;
                document.getElementById("delegation-hash").href = `https://tronscan.org/#/transaction/${data.txId}`;
            } else if (data.status === "failed") {
                clearInterval(interval);
                document.getElementById("delegation-status").style.display = "block";
                document.getElementById("delegation-message").textContent = `Delegation failed: ${data.message}`;
            }
        } catch (error) {
            console.error("Error polling delegation status:", error);
        }
    }, 10000); // Check every 10 seconds
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
