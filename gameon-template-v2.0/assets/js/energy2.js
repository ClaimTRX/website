let tronWeb, userAddress;

// Hardcoded price mapping (energy amount to TRX)
const priceMap = {
    "32000": 2,
    "50000": 3,
    "100000": 6,
    "150000": 9,
    "200000": 12,
    "250000": 15
};

// Your Tron address for receiving payments
const PAYMENT_ADDRESS = "TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn";

// Server address for API calls
const SERVER_URL = "https://api.cftecosystem.com";

// Minimum energy threshold to enable the buy button
const MIN_ENERGY_THRESHOLD = 2500000;

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

// Fetch available energy from the server with retry logic and button control
async function fetchAvailableEnergy() {
    const maxRetries = 3;
    let retries = 0;
    const buyEnergyButton = document.getElementById("buy-energy-button");

    if (!buyEnergyButton) {
        console.error("Buy Energy button not found in DOM. Check ID 'buy-energy-button'.");
        return;
    }

    while (retries < maxRetries) {
        try {
            const response = await fetch(`${SERVER_URL}/api/available-energy`);
            const data = await response.json();
            if (data.success) {
                const availableEnergy = Number(data.availableEnergy);
                console.log(`Available energy fetched: ${availableEnergy}`);
                document.getElementById("available-energy").textContent = availableEnergy.toLocaleString();

                // Enable/disable the buy button based on energy threshold
                if (availableEnergy < MIN_ENERGY_THRESHOLD) {
                    buyEnergyButton.disabled = true;
                    buyEnergyButton.title = "Not enough energy available (minimum 500,000 required)";
                    buyEnergyButton.style.opacity = "0.5";
                    console.log("Buy button disabled: Energy below 500,000");
                } else {
                    buyEnergyButton.disabled = false;
                    buyEnergyButton.title = "Buy energy now";
                    buyEnergyButton.style.opacity = "1";
                    console.log("Buy button enabled: Energy sufficient");
                }
                return;
            } else {
                throw new Error("Failed to fetch available energy");
            }
        } catch (error) {
            console.error(`Error fetching available energy (attempt ${retries + 1}):`, error);
            retries++;
            if (retries === maxRetries) {
                document.getElementById("available-energy").textContent = "Error fetching available energy";
                buyEnergyButton.disabled = true;
                buyEnergyButton.title = "Energy availability check failed";
                buyEnergyButton.style.opacity = "0.5";
                console.log("Buy button disabled: Max retries reached");
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
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
    const buyEnergyButton = document.getElementById("buy-energy-button");
    if (buyEnergyButton.disabled) {
        console.log("Buy Energy button is disabled; transaction prevented.");
        return;
    }

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
        document.getElementById("delegation-status").style.display = "block";
        document.getElementById("delegation-message").textContent = `Sending payment of ${trxPrice} TRX to ${PAYMENT_ADDRESS}...`;
        const result = await tronWeb.trx.sendTransaction(PAYMENT_ADDRESS, trxPrice * 1e6);
        console.log("Transaction sent:", result);
        console.log("Payment transaction ID:", result.txid);

        if (!result.result) {
            document.getElementById("delegation-message").textContent = `Transaction was rejected or failed.`;
            return;
        }

        document.getElementById("delegation-message").textContent = `Notifying server of your request...`;
        const response = await fetch(`${SERVER_URL}/api/request-energy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ energyAmount, receiverAddress, trxPrice, userAddress, paymentTxId: result.txid })
        });

        const data = await response.json();

        if (!data.success) {
            document.getElementById("delegation-message").textContent = `Error: ${data.message}`;
            return;
        }

        document.getElementById("delegation-message").textContent = `Waiting for server to process payment...`;
        await new Promise(resolve => setTimeout(resolve, 3000));

        document.getElementById("delegation-message").textContent = `Waiting for energy delegation...`;
        pollDelegationStatus(data.requestId);
    } catch (error) {
        console.error("Error requesting energy:", error);
        document.getElementById("delegation-message").textContent = `Error: ${error.message}`;
    }
}

// Poll for delegation status
async function pollDelegationStatus(requestId) {
    console.log(`Starting to poll delegation status for request ${requestId}...`);
    const maxPollAttempts = 30;
    let pollAttempts = 0;

    const interval = setInterval(async () => {
        pollAttempts++;

        try {
            console.log(`Polling delegation status for request ${requestId}, attempt ${pollAttempts}...`);
            const response = await fetch(`${SERVER_URL}/api/delegation-status?requestId=${requestId}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} (${response.statusText})`);
            }

            const data = await response.json();
            console.log(`Received delegation status for request ${requestId}:`, data);

            if (data.status === "delegated") {
                clearInterval(interval);
                const statusElement = document.getElementById("delegation-status");
                const messageElement = document.getElementById("delegation-message");
                const hashElement = document.getElementById("delegation-hash");

                if (statusElement && messageElement && hashElement) {
                    statusElement.style.display = "block";
                    messageElement.textContent = `Energy delegated successfully!`;
                    hashElement.textContent = data.txId;
                    hashElement.href = `https://tronscan.org/#/transaction/${data.txId}`;
                    hashElement.style.display = "block";
                } else {
                    console.error("UI elements not found:", { statusElement, messageElement, hashElement });
                }
            } else if (data.status === "failed" || data.status === "expired") {
                clearInterval(interval);
                const statusElement = document.getElementById("delegation-status");
                const messageElement = document.getElementById("delegation-message");
                if (statusElement && messageElement) {
                    statusElement.style.display = "block";
                    messageElement.textContent = `Delegation failed: ${data.message}`;
                } else {
                    console.error("UI elements not found:", { statusElement, messageElement });
                }
            } else if (pollAttempts >= maxPollAttempts) {
                clearInterval(interval);
                const statusElement = document.getElementById("delegation-status");
                const messageElement = document.getElementById("delegation-message");
                if (statusElement && messageElement) {
                    statusElement.style.display = "block";
                    messageElement.textContent = `Delegation timed out after 60 seconds.`;
                } else {
                    console.error("UI elements not found:", { statusElement, messageElement });
                }
            }
        } catch (error) {
            console.error(`Error polling delegation status for request ${requestId}:`, error);
            if (pollAttempts >= maxPollAttempts) {
                clearInterval(interval);
                const statusElement = document.getElementById("delegation-status");
                const messageElement = document.getElementById("delegation-message");
                if (statusElement && messageElement) {
                    statusElement.style.display = "block";
                    messageElement.textContent = `Error polling delegation status: ${error.message}`;
                } else {
                    console.error("UI elements not found:", { statusElement, messageElement });
                }
            }
        }
    }, 2000);
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
    if (buyEnergyButton) {
        buyEnergyButton.addEventListener("click", buyEnergy);
    } else {
        console.error("Buy Energy button not found during initialization. Check ID 'buy-energy-button'.");
    }

    // Initial fetch of available energy to set button state
    fetchAvailableEnergy();
});
