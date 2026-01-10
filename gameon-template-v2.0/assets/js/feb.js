// assets/js/feb.js - Updated with "Claim Available Now" emergency button

const API_BASE = "https://api.cftecosystem.com"; // adjust if your backend is on different domain/port

// Whitelist (consider moving this to backend-only in the future)
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
let requestFullButton;
let requestAvailableButton;

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

// Auto-connect wallet
async function autoConnectWallet() {
    if (window.tronWeb && window.tronLink) {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        if (userAddress && userAddress !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
            console.log("Auto-connected:", userAddress);
            updateWalletUI(true);
            await checkAllowedAddress();
        }
    }
}

// Manual connect wallet
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

// Update connect button UI
function updateWalletUI(isConnected) {
    const btn = document.getElementById("connect-button");
    if (btn) {
        btn.innerHTML = isConnected 
            ? `<i class="icon-wallet"></i> Wallet Connected` 
            : `<i class="icon-wallet"></i> Connect Wallet`;
    }
}

// Update displayed available energy (pool)
async function updateAvailableEnergy() {
    if (!availableEnergyElement) return;
    try {
        availableEnergyElement.textContent = "Loading...";
        const res = await fetch(`${API_BASE}/api/available-energy`);
        const data = await res.json();

        if (data.success && typeof data.availableEnergy === 'number') {
            const formatted = data.availableEnergy.toLocaleString();
            availableEnergyElement.textContent = `${formatted} units`;
            availableEnergyElement.style.color = 
                data.availableEnergy > 1000000 ? '#00e095' : 
                data.availableEnergy > 300000 ? '#ffd166' : '#ff5b73';

            // Also update short display for emergency button
            const shortEl = document.getElementById("available-short");
            if (shortEl) shortEl.textContent = formatted;
        } else {
            availableEnergyElement.textContent = "Unavailable";
            availableEnergyElement.style.color = '#ff5b73';
        }
    } catch (err) {
        console.error("Failed to fetch available energy:", err);
        availableEnergyElement.textContent = "Error";
        availableEnergyElement.style.color = '#ff5b73';
    }
}

// Update last claim info + cooldown logic
async function updateLastClaimInfo() {
    if (!userAddress || !lastClaimInfoElement) return;

    try {
        lastClaimInfoElement.textContent = "Loading claim history...";
        lastClaimInfoElement.style.color = "var(--muted)";

        const res = await fetch(`${API_BASE}/api/last-feb-claim`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address: userAddress })
        });

        const data = await res.json();

        if (!data.success) {
            lastClaimInfoElement.textContent = "Could not load claim history";
            return;
        }

        const canClaimNow = data.canClaimAgainIn === "Now" || !data.hasClaimed;

        if (!data.hasClaimed) {
            lastClaimInfoElement.textContent = "No previous claim — claim your free energy now!";
            lastClaimInfoElement.style.color = "#00e095";
        } else {
            lastClaimInfoElement.innerHTML = `
                Last claim: <strong>${data.timeSince}</strong><br>
                Next free claim: <strong style="color:${canClaimNow ? '#00e095' : '#ffd166'}">
                    ${data.canClaimAgainIn}
                </strong>
            `;
        }

        // Disable/enable both buttons based on cooldown
        if (requestFullButton) {
            requestFullButton.disabled = !canClaimNow;
            requestFullButton.style.opacity = canClaimNow ? "1" : "0.6";
            requestFullButton.textContent = canClaimNow ? "Request 200,000 Energy" : "Cooldown Active";
        }
        if (requestAvailableButton) {
            requestAvailableButton.disabled = !canClaimNow;
            requestAvailableButton.style.opacity = canClaimNow ? "1" : "0.6";
            requestAvailableButton.textContent = canClaimNow ? "Claim Available Now" : "Cooldown Active";
        }

    } catch (err) {
        console.error("Failed to load last claim info:", err);
        lastClaimInfoElement.textContent = "Error loading history";
    }
}

// Check allowed address & load info
async function checkAllowedAddress() {
    const energyCard = document.getElementById("energy-card");
    const denied = document.getElementById("access-denied");
    const connectMsg = document.getElementById("connect-wallet-message");

    if (!userAddress) return;

    if (allowedAddresses.includes(userAddress)) {
        energyCard.style.display = "block";
        denied.style.display = "none";
        connectMsg.style.display = "none";
        updateAvailableEnergy();
        updateLastClaimInfo();
    } else {
        energyCard.style.display = "none";
        denied.style.display = "block";
        connectMsg.style.display = "none";
    }
}

// Claim full 200,000 energy
async function claimFullEnergy() {
    const msg = document.getElementById("msg");
    msg.textContent = "Requesting 200,000 energy...";
    msg.style.color = "white";

    try {
        const res = await fetch(`${API_BASE}/api/request-feb-energy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer abc"
            },
            body: JSON.stringify({ AllocationAddress: userAddress })
        });
        const data = await res.json();

        if (data.success) {
            msg.textContent = data.Message || "Full energy claimed successfully!";
            msg.style.color = "#00e095";
            updateAvailableEnergy();
            updateLastClaimInfo();
        } else {
            msg.textContent = data.Message || "Error claiming full energy";
            msg.style.color = "#ff5b73";
        }
    } catch (err) {
        msg.textContent = "Network error";
        msg.style.color = "#ff5b73";
    }
}

// Claim whatever is currently available (emergency)
async function claimAvailableEnergy() {
    const msg = document.getElementById("msg");
    msg.textContent = "Requesting available energy...";
    msg.style.color = "white";

    try {
        const res = await fetch(`${API_BASE}/api/request-feb-energy-available`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer abc"
            },
            body: JSON.stringify({ AllocationAddress: userAddress })
        });
        const data = await res.json();

        if (data.success) {
            msg.textContent = data.Message || "Available energy claimed!";
            msg.style.color = "#00e095";
            updateAvailableEnergy();
            updateLastClaimInfo();
        } else {
            msg.textContent = data.Message || "Error claiming available energy";
            msg.style.color = "#ff5b73";
        }
    } catch (err) {
        msg.textContent = "Network error";
        msg.style.color = "#ff5b73";
    }
}

// =============================================
// Initialization
// =============================================
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM loaded");

    availableEnergyElement = document.getElementById("available-energy");
    lastClaimInfoElement = document.getElementById("last-claim-info");
    requestFullButton = document.getElementById("request-full-button");
    requestAvailableButton = document.getElementById("request-available-button");

    await autoConnectWallet();

    document.getElementById("connect-button")?.addEventListener("click", connectWallet);

    if (requestFullButton) {
        requestFullButton.addEventListener("click", claimFullEnergy);
    }
    if (requestAvailableButton) {
        requestAvailableButton.addEventListener("click", claimAvailableEnergy);
    }

    // Auto-refresh pool status
    setInterval(updateAvailableEnergy, 30000);
});
