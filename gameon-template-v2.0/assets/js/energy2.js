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
const PAYMENT_ADDRESS = "TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn";

// Server address for API calls
const SERVER_URL = "https://api.cftecosystem.com";

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
        // Step 1: Notify the server of the request
        document.getElementById("delegation-status").style.display = "block";
        document.getElementById("delegation-message").textContent = `Notifying server of your request...`;
        const response = await fetch(`${SERVER_URL}/api/request-energy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ energyAmount, receiverAddress, trxPrice, userAddress })
        });

        const data = await response.json();

        if (!data.success) {
            document.getElementById("delegation-message").textContent = `Error: ${data.message}`;
            return;
        }

        // Step 2: Send the payment
        document.getElementById("delegation-message").textContent = `Sending payment of ${trxPrice} TRX to ${PAYMENT_ADDRESS}...`;
        const result = await tronWeb.trx.sendTransaction(PAYMENT_ADDRESS, trxPrice * 1e6);
        console.log("Transaction sent:", result);

        if (result.result) {
            // Step 3: Wait for the transaction to be confirmed
            document.getElementById("delegation-message").textContent = `Waiting for transaction confirmation...`;
            let confirmed = false;
            let attempts = 0;
            const maxAttempts = 12; // 12 x 5s = 60s

            while (!confirmed && attempts < maxAttempts) {
                try {
                    const txInfo = await tronWeb.trx.getTransactionInfo(result.txid);
                    if (txInfo && txInfo.receipt && txInfo.receipt.result === "SUCCESS") {
                        confirmed = true;
                    }
                } catch (error) {
                    console.error("Error checking transaction status:", error);
                }
                if (!confirmed) {
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
                }
            }

            if (confirmed) {
                // Step 4: Wait an additional 5 seconds to ensure the server detects the payment
                document.getElementById("delegation-message").textContent = `Transaction confirmed! Waiting for server to process payment...`;
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

                // Step 5: Start polling for delegation status
                document.getElementById("delegation-message").textContent = `Waiting for energy delegation...`;
                pollDelegationStatus(data.requestId);
            } else {
                document.getElementById("delegation-message").textContent = `Transaction was not confirmed within 60 seconds.`;
            }
        } else {
            document.getElementById("delegation-message").textContent = `Transaction was rejected or failed.`;
        }
    } catch (error) {
        console.error("Error requesting energy:", error);
        document.getElementById("delegation-message").textContent = `Error: ${error.message}`;
    }
}

// Poll for delegation status
async function pollDelegationStatus(requestId) {
    const maxPollAttempts = 12; // 12 x 5s = 60s
    let pollAttempts = 0;

    const interval = setInterval(async () => {
        pollAttempts++;

        try {
            const response = await fetch(`${SERVER_URL}/api/delegation-status?requestId=${requestId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });
            const data = await response.json();
            if (data.status === "delegated") {
                clearInterval(interval);
                document.getElementById("delegation-status").style.display = "block";
                document.getElementById("delegation-message").textContent = `Energy delegated successfully!`;
                document.getElementById("delegation-hash").textContent = data.txId;
                document.getElementById("delegation-hash").href = `https://tronscan.org/#/transaction/${data.txId}`;
            } else if (data.status === "failed" || data.status === "expired") {
                clearInterval(interval);
                document.getElementById("delegation-status").style.display = "block";
                document.getElementById("delegation-message").textContent = `Delegation failed: ${data.message}`;
            } else if (pollAttempts >= maxPollAttempts) {
                clearInterval(interval);
                document.getElementById("delegation-status").style.display = "block";
                document.getElementById("delegation-message").textContent = `Delegation timed out after 60 seconds.`;
            }
        } catch (error) {
            console.error("Error polling delegation status:", error);
            if (pollAttempts >= maxPollAttempts) {
                clearInterval(interval);
                document.getElementById("delegation-status").style.display = "block";
                document.getElementById("delegation-message").textContent = `Error polling delegation status: ${error.message}`;
            }
        }
    }, 5000); // Check every 5 seconds
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
