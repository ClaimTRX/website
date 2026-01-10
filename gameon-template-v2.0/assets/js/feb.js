// assets/js/feb.js - Updated with correct 48h cooldown logic

const API_BASE = "https://api.cftecosystem.com"; // ← adjust if needed

// Whitelist (still here for now — consider moving to backend-only later)
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

// ✅ Auto-Connect Wallet
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

// ✅ Manual Connect Wallet
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

// ✅ Update Wallet Button UI
function updateWalletUI(isConnected) {
    const btn = document.getElementById("connect-button");
    if (btn) {
        btn.innerHTML = isConnected 
            ? `<i class="icon-wallet"></i> Wallet Connected` 
            : `<i class="icon-wallet"></i> Connect Wallet`;
    }
}

// ✅ Fetch & display available energy pool
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
        } else {
            availableEnergyElement.textContent = "Unavailable";
            availableEnergyElement.style.color = '#ff5b73';
        }
    } catch (err) {
        console.error("Failed to fetch available energy:", err);
        availableEnergyElement.textContent = "Error loading";
        availableEnergyElement.style.color = '#ff5b73';
    }
}

// ✅ Fetch & display last FEB claim + correct cooldown calculation
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

        if (!data.hasClaimed) {
            lastClaimInfoElement.textContent = "No previous claim — claim your free energy now!";
            lastClaimInfoElement.style.color = "#00e095";
            if (requestButton) {
                requestButton.disabled = false;
                requestButton.textContent = "Request Free Energy";
                requestButton.style.opacity = "1";
            }
            return;
        }

        // Correct cooldown calculation (client-side safety net)
        const lastClaimDate = new Date(data.lastClaim);
        const now = new Date();
        const diffMs = now - lastClaimDate;
        const diffHours = diffMs / (1000 * 60 * 60);
        const COOLDOWN_HOURS = 48;

        let canClaimAgainIn = "Now";
        let canClaimNow = true;

        if (diffHours < COOLDOWN_HOURS) {
            const hoursLeft = Math.ceil(COOLDOWN_HOURS - diffHours);
            canClaimAgainIn = `${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''}`;
            canClaimNow = false;
        }

        lastClaimInfoElement.innerHTML = `
            Last claim: <strong>${data.timeSince}</strong><br>
            Next free claim: <strong style="color:${canClaimNow ? '#00e095' : '#ffd166'}">
                ${canClaimAgainIn}
            </strong>
        `;

        // Control request button state
        if (requestButton) {
            requestButton.disabled = !canClaimNow;
            requestButton.textContent = canClaimNow ? "Request Free Energy" : "Cooldown Active";
            requestButton.style.opacity = canClaimNow ? "1" : "0.6";
        }

    } catch (err) {
        console.error("Failed to load last claim info:", err);
        lastClaimInfoElement.textContent = "Error loading history";
    }
}

// ✅ Check if address is allowed + load extra info
async function checkAllowedAddress() {
    const energyCard = document.getElementById("energy-card");
    const denied = document.getElementById("access-denied");
    const connectMsg = document.getElementById("connect-wallet-message");

    if (!userAddress) return;

    if (allowedAddresses.includes(userAddress)) {
        energyCard.style.display = "block";
        denied.style.display = "none";
        connectMsg.style.display = "none";

        // Load dynamic info
        updateAvailableEnergy();
        updateLastClaimInfo();
    } else {
        energyCard.style.display = "none";
        denied.style.display = "block";
        connectMsg.style.display = "none";
    }
}

// ✅ Claim free energy
async function callDelegationEndpoint() {
    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    if (!allowedAddresses.includes(userAddress)) {
        alert("Only FEB holders can claim free energy.");
        return;
    }

    const msg = document.getElementById("msg");
    msg.textContent = "Requesting free energy...";
    msg.style.color = "white";

    try {
        const res = await fetch(`${API_BASE}/api/request-feb-energy`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer abc" // ← replace with real auth when ready
            },
            body: JSON.stringify({ AllocationAddress: userAddress })
        });

        const data = await res.json();

        if (data.success) {
            msg.textContent = data.Message || "Free energy claimed successfully!";
            msg.style.color = "#00e095";
            // Refresh info after success
            updateAvailableEnergy();
            updateLastClaimInfo();
        } else {
            msg.textContent = data.Message || "Error claiming free energy";
            msg.style.color = "#ff5b73";
        }
    } catch (err) {
        console.error("Claim failed:", err);
        msg.textContent = "Network error - please try again";
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
    requestButton = document.getElementById("request-energy-button");

    // Auto-connect attempt
    await autoConnectWallet();

    // Event listeners
    document.getElementById("connect-button")?.addEventListener("click", connectWallet);
    requestButton?.addEventListener("click", callDelegationEndpoint);

    // Refresh energy pool every 30 seconds
    setInterval(updateAvailableEnergy, 30000);
});
