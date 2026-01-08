/* ==== energy.js (Full Fixed Version) ==== */
let tronWeb, userAddress;

/* ----- 1. NEW PRICE ENGINE (from energybot.js) ----- */
const BASE_PRICE_SUN_PER_ENERGY = 55;               // 55 SUN per 1 energy
const SUN_PER_TRX               = 1_000_000;
const DURATION_MULTIPLIERS = { 5: 1.0, 15: 1.10, 60: 1.20 };

function calculatePriceTRX(energy, minutes) {
    if (!DURATION_MULTIPLIERS[minutes]) return null;
    const sun = energy * BASE_PRICE_SUN_PER_ENERGY * DURATION_MULTIPLIERS[minutes];
    return Number((sun / SUN_PER_TRX).toFixed(6));
}

/* ----- 2. Hard-coded price map (fallback only) ----- */
const priceMap = {
    "32000": { 5: 1.60, 15: 1.68, 60: 1.76 },
    "50000": { 5: 2.50, 15: 2.63, 60: 2.75 },
    "65000": { 5: 3.25, 15: 3.41, 60: 3.58 },
    "100000": { 5: 5, 15: 5.25, 60: 5.50 },
    "135000": { 5: 6.75, 15: 7.09, 60: 7.42 },
    "150000": { 5: 7.50, 15: 7.88, 60: 8.25 },
    "200000": { 5: 10, 15: 10.05, 60: 11 },
    "250000": { 5: 12.50, 15: 13.13, 60: 13.75 }
};

/* ----- 3. Constants ----- */
const PAYMENT_ADDRESS = "TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn";
const SPECIAL_WALLET_ADDRESSES = [
    "TR4y25VA1muQJoonLA6JQRamRNpHw88cfa",
    "TPf7aDHu51f5UTFcUcU9XvttfViie4XRXw",
    "TEMkRpEAVu3yDdfbUVERyZNvHByTDJVse9"
];
const SERVER_URL = "https://api.cftecosystem.com";
const MIN_ENERGY_THRESHOLD = 400000;

/* ----- 4. Wallet connection ----- */
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

async function autoConnectWallet() {
    if (window.tronWeb && window.tronLink) {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        if (userAddress && userAddress !== "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb") {
            console.log("Auto-connected wallet:", userAddress);
            updateWalletUI(true);
            const receiverInput = document.getElementById("receiver-address");
            if (receiverInput) {
                receiverInput.value = userAddress;
            }
            fetchAvailableEnergy();
        }
    }
}

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
        const receiverInput = document.getElementById("receiver-address");
        if (receiverInput) {
            receiverInput.value = userAddress;
        }
        fetchAvailableEnergy();
    } catch (e) {
        console.error("Wallet connection failed:", e);
    }
}

function updateWalletUI(isConnected) {
    const connectButton = document.getElementById("connect-button");
    if (connectButton) {
        connectButton.innerHTML = isConnected
            ? `<i class="icon-wallet"></i> Wallet Connected`
            : `<i class="icon-wallet"></i> Connect Wallet`;
    }
}

/* ----- 5. Energy availability ----- */
async function fetchAvailableEnergy() {
    const maxRetries = 3;
    let retries = 0;
    const buyEnergyButton = document.getElementById("buy-energy-button");
    if (!buyEnergyButton) return;

    while (retries < maxRetries) {
        try {
            const response = await fetch(`${SERVER_URL}/api/available-energy`);
            const data = await response.json();
            if (data.success) {
                const availableEnergy = Number(data.availableEnergy);
                let displayText;
                if (availableEnergy < MIN_ENERGY_THRESHOLD) {
                    displayText = "No energy available";
                } else {
                    const displayEnergy = availableEnergy - MIN_ENERGY_THRESHOLD;
                    displayText = displayEnergy.toLocaleString();
                }
                document.getElementById("available-energy").textContent = displayText;

                if (availableEnergy < MIN_ENERGY_THRESHOLD) {
                    buyEnergyButton.disabled = true;
                    buyEnergyButton.title = "Not enough energy available (minimum 500,000 required)";
                    buyEnergyButton.style.opacity = "0.5";
                    buyEnergyButton.style.cursor = "not-allowed";
                    buyEnergyButton.style.pointerEvents = "none";
                } else {
                    buyEnergyButton.disabled = false;
                    buyEnergyButton.title = "Buy energy now";
                    buyEnergyButton.style.opacity = "1";
                    buyEnergyButton.style.cursor = "pointer";
                    buyEnergyButton.style.pointerEvents = "auto";
                }
                return;
            }
        } catch (error) {
            console.error(`Error fetching available energy (attempt ${retries + 1}):`, error);
            retries++;
            if (retries === maxRetries) {
                document.getElementById("available-energy").textContent = "Error fetching available energy";
                buyEnergyButton.disabled = true;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

/* ----- 6. PRICE DISPLAY – uses new engine ----- */
function updatePriceDisplay() {
    const energySel   = document.getElementById("energy-amount");
    const durationSel = document.getElementById("delegation-duration");
    const receiver    = document.getElementById("receiver-address").value.trim();
    const priceEl     = document.getElementById("trx-price");

    const energy   = parseInt(energySel?.value);
    const duration = parseInt(durationSel?.value);

    if (!energy || !duration) {
        priceEl.textContent = "Select options";
        return;
    }

    let trx = calculatePriceTRX(energy, duration);
    if (trx === null) {
        const old = priceMap[energy]?.[duration];
        trx = old ?? 0;
    }

    if (receiver && tronWeb.isAddress(receiver) && SPECIAL_WALLET_ADDRESSES.includes(receiver)) {
        trx *= 3;
    }

    priceEl.textContent = `${trx} TRX`;
}

/* ----- 7. BUY ENERGY – uses new price ----- */
async function buyEnergy() {
    const buyBtn = document.getElementById("buy-energy-button");
    if (buyBtn.disabled) return;

    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    const energySel   = document.getElementById("energy-amount");
    const durationSel = document.getElementById("delegation-duration");
    const receiver    = document.getElementById("receiver-address").value.trim();

    const energy   = parseInt(energySel.value);
    const duration = parseInt(durationSel.value);

    if (!tronWeb.isAddress(receiver)) {
        alert("Please enter a valid Tron wallet address.");
        return;
    }

    let trxPrice = calculatePriceTRX(energy, duration);
    if (trxPrice === null) {
        const old = priceMap[energy]?.[duration];
        trxPrice = old ?? 0;
    }

    if (SPECIAL_WALLET_ADDRESSES.includes(receiver)) {
        trxPrice *= 3;
    }

    try {
        document.getElementById("delegation-status").style.display = "block";
        document.getElementById("delegation-message").textContent =
            `Sending payment of ${trxPrice} TRX to ${PAYMENT_ADDRESS}...`;

        const result = await tronWeb.trx.sendTransaction(PAYMENT_ADDRESS, trxPrice * 1e6);
        if (!result.result) throw new Error("Transaction rejected");

        document.getElementById("delegation-message").textContent = "Notifying server...";

        const resp = await fetch(`${SERVER_URL}/api/request-energy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                energyAmount: energy,
                receiverAddress: receiver,
                trxPrice,
                userAddress,
                paymentTxId: result.txid,
                delegationDuration: duration
            })
        });
        const data = await resp.json();
        if (!data.success) throw new Error(data.message);

        document.getElementById("delegation-message").textContent = "Waiting for delegation...";
        pollDelegationStatus(data.requestId);
    } catch (e) {
        console.error(e);
        document.getElementById("delegation-message").textContent = `Error: ${e.message}`;
    }
}

/* ----- 8. Polling ----- */
async function pollDelegationStatus(requestId) {
    const maxPollAttempts = 30;
    let pollAttempts = 0;
    const interval = setInterval(async () => {
        pollAttempts++;
        try {
            const response = await fetch(`${SERVER_URL}/api/delegation-status?requestId=${requestId}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            if (data.status === "delegated") {
                clearInterval(interval);
                const statusEl = document.getElementById("delegation-status");
                const msgEl = document.getElementById("delegation-message");
                const hashEl = document.getElementById("delegation-hash");
                if (statusEl && msgEl && hashEl) {
                    statusEl.style.display = "block";
                    msgEl.textContent = "Energy delegated successfully!";
                    hashEl.textContent = data.txId;
                    hashEl.href = `https://tronscan.org/#/transaction/${data.txId}`;
                    hashEl.style.display = "block";
                }
            } else if (data.status === "failed" || data.status === "expired") {
                clearInterval(interval);
                document.getElementById("delegation-message").textContent = `Delegation failed: ${data.message}`;
            } else if (pollAttempts >= maxPollAttempts) {
                clearInterval(interval);
                document.getElementById("delegation-message").textContent = "Delegation timed out after 60 seconds.";
            }
        } catch (error) {
            console.error(`Polling error:`, error);
            if (pollAttempts >= maxPollAttempts) {
                clearInterval(interval);
                document.getElementById("delegation-message").textContent = `Error: ${error.message}`;
            }
        }
    }, 2000);
}

/* ----- 9. DOM ready ----- */
document.addEventListener("DOMContentLoaded", async () => {
    await autoConnectWallet();
    document.getElementById("connect-button")?.addEventListener("click", connectWallet);
    document.getElementById("energy-amount")?.addEventListener("change", updatePriceDisplay);
    document.getElementById("delegation-duration")?.addEventListener("change", updatePriceDisplay);
    document.getElementById("receiver-address")?.addEventListener("input", updatePriceDisplay);
    document.getElementById("buy-energy-button")?.addEventListener("click", buyEnergy);

    fetchAvailableEnergy();
    updatePriceDisplay();
});
