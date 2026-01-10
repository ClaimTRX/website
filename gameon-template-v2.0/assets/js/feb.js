// assets/js/feb.js - Updated version with Available Energy & Last Claim Info

const API_BASE = "https://api.cftecosystem.com"; // Change if your backend is on different domain/port

// Keep the whitelist for now (recommended: move to backend-only later)
const allowedAddresses = [
    "TR2XJawheHUAcbxgzABVh1toDA59Eb4RbM",
    "TQLrSGjNtYwtUdttbm4HsXxD6vmbePWni4",
    "TL71zkkpC59dKmj8CeVf3woiXJuTNGBUfw",
    "TKsFvPSTxZhym26K3uscKbbt8K29UbpVZd",
    "TJDMQzjJSh5eC8WezVtnDXDuWXAwjV23eF",
    "TFUQ7aqaxoDVskZ9ucWCCaLBeLKSSLa5hS",
    "TCGsvNmNtezmeHZgnH2fd8gGa2KV5rUkHV",
    "TC56nRBaobbqPWMCgS3FhMf7EjqyYZ7StR",
    "TB6xoAXGdPY4D3j3cnojjkkcoWwrNGHox7",
    "TXgL1i4dF1vEhDYuVsMuo8ovcfdEE6tztA",
    "TB4euGueRixvU79TBbotkLtQ4ZtD2UJsy6"
];

let tronWeb, userAddress;
let availableEnergyElement;
let lastClaimInfoElement;
let requestButton;

// Helper: Format time difference nicely
function formatTimeDiff(ms) {
    if (ms <= 0) return "Now";
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
}

// ✅ Check if TronLink is installed
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

// ✅ Auto-Connect Wallet if already authorized
async function autoConnectWallet() {
    if (window.tronWeb && window.tronLink) {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        if (userAddress && userAddress !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
            console.log("Auto-connected wallet:", userAddress);
            updateWalletUI(true);
            await checkAllowedAddress();
        } else {
            console.log("TronLink detected, but wallet is not connected.");
        }
    }
}

// ✅ Connect Wallet (Manual Trigger)
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
        await checkAllowedAddress();
    } catch (e) {
        console.error("Wallet connection failed:", e);
    }
}

// ✅ Update Wallet UI
function updateWalletUI(isConnected) {
    const connectButton = document.getElementById("connect-button");
    if (connectButton) {
        connectButton.innerHTML = isConnected 
            ? `<i class="icon-wallet"></i> Wallet Connected` 
            : `<i class="icon-wallet"></i> Connect Wallet`;
    }
}

// ✅ Fetch and update available energy pool
async function updateAvailableEnergy() {
    if (!availableEnergyElement) return;

    try {
        availableEnergyElement.textContent = "Loading...";
        const response = await fetch(`${API_BASE}/api/available-energy`);
        const data = await response.json();

        if (data.success && typeof data.availableEnergy === 'number') {
            const formatted = data.availableEnergy.toLocaleString();
            availableEnergyElement.textContent = `${formatted} units`;
            availableEnergyElement.style.color = 
                data.availableEnergy > 1000000 ? '#00e095' : 
                data.availableEnergy > 300000 ? '#ffd166' : '#ff5b73';
        } else {
            availableEnergyElement.textContent = "Unavailable";
            availableEnergyElement.style.color = '#ff5b73';
        }
    } catch (err) {
        console.error("Failed to fetch available energy:", err);
        availableEnergyElement.textContent = "Error loading pool";
        availableEnergyElement.style.color = '#ff5b73';
    }
}

// ✅ Fetch and display last FEB claim info
async function updateLastClaimInfo() {
    if (!userAddress || !lastClaimInfoElement) return;

    try {
        lastClaimInfoElement.textContent = "Loading claim history...";
        lastClaimInfoElement.style.color = "var(--muted)";

        const response = await fetch(`${API_BASE}/api/last-feb-claim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: userAddress })
        });

        const data = await response.json();

        if (data.success) {
            if (data.hasClaimed) {
                const canClaimNow = data.canClaimAgainIn === "Now";
                lastClaimInfoElement.innerHTML = `
                    Last claim: <strong>${data.timeSince}</strong><br>
                    Next free claim: <strong style="color:${canClaimNow ? '#00e095' : '#ffd166'}">
                        ${data.canClaimAgainIn}
                    </strong>
                `;
                // Disable button if on cooldown
                if (requestButton) {
                    requestButton.disabled = !canClaimNow;
                    requestButton.textContent = canClaimNow ? "Request Free Energy" : "Cooldown Active";
                    requestButton.style.opacity = canClaimNow ? "1" : "0.6";
                }
            } else {
                lastClaimInfoElement.textContent = "No previous claim — claim your free energy now!";
                lastClaimInfoElement.style.color = "#00e095";
                if (requestButton) {
                    requestButton.disabled = false;
                    requestButton.textContent = "Request Free Energy";
                    requestButton.style.opacity = "1";
                }
            }
        } else {
            lastClaimInfoElement.textContent = "Could not load claim history";
        }
    } catch (err) {
        console.error("Failed to fetch last claim info:", err);
        lastClaimInfoElement.textContent = "Error loading history";
    }
}

// ✅ Check Allowed Address + trigger info updates
async function checkAllowedAddress() {
    const energyCard = document.getElementById("energy-card");
    const accessDenied = document.getElementById("access-denied");
    const connectWalletMessage = document.getElementById("connect-wallet-message");

    if (!userAddress) return;

    if (allowedAddresses.includes(userAddress)) {
        energyCard.style.display = "block";
        accessDenied.style.display = "none";
        connectWalletMessage.style.display = "none";

        // Load additional info when allowed
        updateAvailableEnergy();
        updateLastClaimInfo();
    } else {
        energyCard.style.display = "none";
        accessDenied.style.display = "block";
        connectWalletMessage.style.display = "none";
    }
}

// ✅ Call Delegation Endpoint for FEB Holders
async function callDelegationEndpoint() {
    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    if (!allowedAddresses.includes(userAddress)) {
        alert("Only FEB holders can claim free energy.");
        return;
    }

    // Optional: extra client-side check (but backend is authoritative)
    const msgElement = document.getElementById("msg");
    msgElement.textContent = "Requesting free energy...";
    msgElement.style.color = "white";

    const url = `${API_BASE}/api/request-feb-energy`;
    const payload = { AllocationAddress: userAddress };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer abc" // ← consider replacing with real auth later
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (data.success) {
            msgElement.textContent = data.Message || "Free energy claimed successfully!";
            msgElement.style.color = "#00e095";

            // Refresh info after successful claim
            updateAvailableEnergy();
            updateLastClaimInfo();
        } else {
            msgElement.textContent = data.Message || "Error claiming free energy.";
            msgElement.style.color = "#ff5b73";
        }
    } catch (error) {
        console.error("Network error:", error);
        msgElement.textContent = "Network error - please try again.";
        msgElement.style.color = "#ff5b73";
    }
}

// ✅ Main initialization
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded and parsed.");

    // Cache DOM elements
    availableEnergyElement = document.getElementById("available-energy");
    lastClaimInfoElement = document.getElementById("last-claim-info");
    requestButton = document.getElementById("request-energy-button");

    // Attempt auto-connect
    await autoConnectWallet();

    // Connect button listener
    const connectButton = document.getElementById("connect-button");
    if (connectButton) {
        connectButton.addEventListener("click", connectWallet);
    } else {
        console.error("Connect button not found.");
    }

    // Request energy button listener
    if (requestButton) {
        requestButton.addEventListener("click", callDelegationEndpoint);
    } else {
        console.error("Request Energy button not found.");
    }

    // Auto-refresh available energy every 30 seconds
    setInterval(updateAvailableEnergy, 30000);
});
