const allowedAddresses = [
    "TR2XJawheHUAcbxgzABVh1toDA59Eb4RbM",  // Replace with your actual Tron addresses
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

        // Ensure tronWeb is initialized
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
        if (isConnected) {
            connectButton.innerHTML = `<i class="icon-wallet"></i> Wallet Connected`;
        } else {
            connectButton.innerHTML = `<i class="icon-wallet"></i> Connect Wallet`;
        }
    }
}

// ✅ Check Allowed Address
async function checkAllowedAddress() {
    const energyCard = document.getElementById("energy-card");
    const accessDenied = document.getElementById("access-denied");
    const connectWalletMessage = document.getElementById("connect-wallet-message");

    if (!userAddress) return;

    if (allowedAddresses.includes(userAddress)) {
        energyCard.style.display = "block";
        accessDenied.style.display = "none";
        connectWalletMessage.style.display = "none";
    } else {
        energyCard.style.display = "none";
        accessDenied.style.display = "block";
        connectWalletMessage.style.display = "none";
    }
}

// ✅ Call Delegation Endpoint
async function callDelegationEndpoint() {
    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    const url = "https://0rtix684bi.execute-api.eu-west-1.amazonaws.com/claimfreetrxtwo/claimfreetrxtwo";
    const payload = { AllocationAddress: userAddress, IsDelegation: true };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer abc"
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        document.getElementById("msg").textContent = data.Message;
    } catch (error) {
        console.error("Network error:", error);
        document.getElementById("msg").textContent = "Error processing request.";
    }
}

// ✅ Ensure event listeners are properly set
document.addEventListener("DOMContentLoaded", async () => {
    console.log("DOM fully loaded and parsed.");

    // Attempt auto-connect
    await autoConnectWallet();

    // Add event listener for connect button
    const connectButton = document.getElementById("connect-button");
    if (connectButton) {
        connectButton.addEventListener("click", connectWallet);
    } else {
        console.error("Connect button not found.");
    }

    // Add event listener for energy request button
    const requestEnergyButton = document.getElementById("request-energy-button");
    if (requestEnergyButton) {
        requestEnergyButton.addEventListener("click", callDelegationEndpoint);
    } else {
        console.error("Request Energy button not found.");
    }
});
