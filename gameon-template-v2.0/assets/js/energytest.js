let tronWeb, userAddress;

// Constants
const SERVER_URL = "https://api.cftecosystem.com"; // Your server URL
const ESCROW_CONTRACT_ADDRESS = "TWzsvYAurZoKojdyrszU6aR94JEXQkL1jr"; // Replace with deployed contract address
const CFT_CONTRACT_ADDRESS = "THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK"; // Replace with CFT TRC-20 contract address
const PRICE_PER_ENERGY = 10; // 10 SUN per energy unit
const SUN_PER_TRX = 1e6; // 1 TRX = 1,000,000 SUN
const CFT_PER_TRX = 1; // 1 TRX = 1 CFT

// ABI for Escrow Contract (simplified)
const ESCROW_ABI = [
    {
        "inputs": [
            {"name": "orderId", "type": "uint256"},
            {"name": "energyAmount", "type": "uint256"},
            {"name": "lockDuration", "type": "uint256"},
            {"name": "currency", "type": "string"},
            {"name": "totalPayment", "type": "uint256"}
        ],
        "name": "createOrder",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "orderId", "type": "uint256"},
            {"name": "energyAmount", "type": "uint256"},
            {"name": "receiverAddress", "type": "address"}
        ],
        "name": "submitFulfillment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "fulfillmentId", "type": "uint256"}
        ],
        "name": "releasePayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// ABI for CFT TRC-20 Token
const CFT_ABI = [
    {
        "constant": false,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "success", "type": "bool"}],
        "type": "function"
    }
];

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
            console.log("Auto-connected wallet:", userAddress);
            updateWalletUI(true);
            fetchOpenOrders();
            fetchSellerFulfillments();
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
        fetchOpenOrders();
        fetchSellerFulfillments();
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

// Calculate and update total payment
function updateTotalPayment() {
    const energyAmount = parseInt(document.getElementById("energy-amount").value);
    const currency = document.getElementById("payment-currency").value;
    const totalPaymentDisplay = document.getElementById("total-payment");

    if (isNaN(energyAmount) || energyAmount < 100000) {
        totalPaymentDisplay.textContent = "Enter valid amount (min 100,000)";
        return;
    }

    // Calculate payment: 10 SUN per energy unit
    const sunRequired = energyAmount * PRICE_PER_ENERGY;
    const trxPayment = sunRequired / SUN_PER_TRX; // Convert SUN to TRX
    const payment = currency === "TRX" ? trxPayment : trxPayment * CFT_PER_TRX; // CFT = TRX 1:1
    const unit = currency === "TRX" ? "TRX" : "CFT";

    totalPaymentDisplay.textContent = `${payment.toFixed(6)} ${unit}`;
}

// Create energy order
async function createOrder() {
    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    const energyAmount = parseInt(document.getElementById("energy-amount").value);
    const lockDuration = parseInt(document.getElementById("lock-duration").value);
    const currency = document.getElementById("payment-currency").value;

    if (isNaN(energyAmount) || energyAmount < 100000) {
        alert("Please enter a valid energy amount (minimum 100,000).");
        return;
    }

    const sunRequired = energyAmount * PRICE_PER_ENERGY;
    const totalPayment = sunRequired / SUN_PER_TRX; // Payment in TRX or CFT
    const paymentInSun = totalPayment * SUN_PER_TRX; // Convert to SUN for contract

    try {
        document.getElementById("order-status").style.display = "block";
        document.getElementById("order-message").textContent = "Creating order...";

        // Generate order ID (timestamp-based)
        const orderId = Date.now();

        // Interact with escrow contract
        const contract = await tronWeb.contract(ESCROW_ABI, ESCROW_CONTRACT_ADDRESS);

        if (currency === "CFT") {
            // Approve CFT transfer
            const cftContract = await tronWeb.contract(CFT_ABI, CFT_CONTRACT_ADDRESS);
            const approveResult = await cftContract.approve(
                ESCROW_CONTRACT_ADDRESS,
                paymentInSun
            ).send({
                feeLimit: 100000000,
                callValue: 0
            });
            console.log("CFT approval sent:", approveResult);
        }

        // Create order in escrow contract
        const result = await contract.createOrder(
            orderId,
            energyAmount,
            lockDuration * 24 * 60 * 60, // Convert days to seconds
            currency,
            paymentInSun
        ).send({
            feeLimit: 100000000,
            callValue: currency === "TRX" ? paymentInSun : 0
        });
        console.log("Order creation sent:", result);

        // Notify server
        const response = await fetch(`${SERVER_URL}/api/create-order`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                orderId,
                buyerAddress: userAddress,
                energyAmount,
                lockDuration,
                currency,
                totalPayment,
                txId: result
            })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }

        document.getElementById("order-message").textContent = "Order created successfully!";
        document.getElementById("order-id").textContent = orderId;
        fetchOpenOrders();
    } catch (error) {
        console.error("Error creating order:", error);
        document.getElementById("order-message").textContent = `Error: ${error.message}`;
    }
}

// Fetch and display open orders
async function fetchOpenOrders() {
    try {
        const response = await fetch(`${SERVER_URL}/api/open-orders`);
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }

        const tableBody = document.getElementById("marketplace-table-body");
        tableBody.innerHTML = "";

        data.orders.forEach(order => {
            const payment = order.totalPayment.toFixed(6);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.orderId}</td>
                <td>${order.energyAmount.toLocaleString()}</td>
                <td>${order.remainingEnergy.toLocaleString()}</td>
                <td>${order.lockDuration} days</td>
                <td>${order.currency}</td>
                <td>${payment} ${order.currency}</td>
                <td><a href="#" class="fulfill-btn" data-order-id="${order.orderId}" data-remaining="${order.remainingEnergy}">Fulfill</a></td>
            `;
            tableBody.appendChild(row);
        });

        // Add click listeners to fulfill buttons
        document.querySelectorAll(".fulfill-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const orderId = btn.getAttribute("data-order-id");
                const remaining = parseInt(btn.getAttribute("data-remaining"));
                document.getElementById("selected-order-id").textContent = orderId;
                document.getElementById("delegate-amount").max = remaining;
                document.getElementById("fulfillment-form").style.display = "block";
            });
        });
    } catch (error) {
        console.error("Error fetching open orders:", error);
    }
}

// Fulfill an order
async function fulfillOrder() {
    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    const orderId = document.getElementById("selected-order-id").textContent;
    const energyAmount = parseInt(document.getElementById("delegate-amount").value);
    const receiverAddress = userAddress; // Seller delegates to themselves for verification

    if (isNaN(energyAmount) || energyAmount < 1000) {
        alert("Please enter a valid energy amount (minimum 1,000).");
        return;
    }

    try {
        document.getElementById("fulfillment-status").style.display = "block";
        document.getElementById("fulfillment-message").textContent = "Delegating energy...";

        // Calculate SUN required
        const sunRequired = energyAmount * PRICE_PER_ENERGY;

        // Delegate energy
        const tx = await tronWeb.transactionBuilder.delegateResource(
            sunRequired,
            receiverAddress,
            "ENERGY",
            userAddress,
            false
        );
        const signed = await tronWeb.trx.sign(tx);
        const result = await tronWeb.trx.broadcast(signed);
        console.log("Delegation sent:", result);

        if (!result.result || !result.txid) {
            throw new Error("Delegation failed");
        }

        // Notify server
        const response = await fetch(`${SERVER_URL}/api/submit-fulfillment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                orderId,
                sellerAddress: userAddress,
                energyAmount,
                receiverAddress,
                txId: result.txid
            })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }

        document.getElementById("fulfillment-message").textContent = "Fulfillment submitted! Waiting for verification...";
        document.getElementById("fulfillment-hash").textContent = result.txid;
        document.getElementById("fulfillment-hash").href = `https://tronscan.org/#/transaction/${result.txid}`;
        document.getElementById("fulfillment-hash").style.display = "block";

        // Poll for fulfillment status
        pollFulfillmentStatus(data.fulfillmentId);
    } catch (error) {
        console.error("Error fulfilling order:", error);
        document.getElementById("fulfillment-message").textContent = `Error: ${error.message}`;
    }
}

// Poll fulfillment status
async function pollFulfillmentStatus(fulfillmentId) {
    const maxPollAttempts = 30;
    let pollAttempts = 0;

    const interval = setInterval(async () => {
        pollAttempts++;
        try {
            const response = await fetch(`${SERVER_URL}/api/fulfillment-status?fulfillmentId=${fulfillmentId}`);
            const data = await response.json();

            if (data.status === "confirmed") {
                clearInterval(interval);
                document.getElementById("fulfillment-message").textContent = "Fulfillment confirmed! Payment released.";
                fetchOpenOrders();
                fetchSellerFulfillments();
            } else if (data.status === "failed") {
                clearInterval(interval);
                document.getElementById("fulfillment-message").textContent = `Fulfillment failed: ${data.message}`;
            } else if (pollAttempts >= maxPollAttempts) {
                clearInterval(interval);
                document.getElementById("fulfillment-message").textContent = "Fulfillment timed out.";
            }
        } catch (error) {
            console.error("Error polling fulfillment status:", error);
            if (pollAttempts >= maxPollAttempts) {
                clearInterval(interval);
                document.getElementById("fulfillment-message").textContent = "Error polling fulfillment status.";
            }
        }
    }, 2000);
}

// Fetch and display seller fulfillments
async function fetchSellerFulfillments() {
    if (!userAddress) return;

    try {
        const response = await fetch(`${SERVER_URL}/api/seller-fulfillments?address=${userAddress}`);
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message);
        }

        const tableBody = document.getElementById("dashboard-table-body");
        tableBody.innerHTML = "";

        data.fulfillments.forEach(f => {
            const lockEnd = new Date(f.lockEnd).toLocaleString();
            const canUndelegate = new Date() > new Date(f.lockEnd) && f.status === "confirmed";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${f.fulfillmentId}</td>
                <td>${f.orderId}</td>
                <td>${f.energyAmount.toLocaleString()}</td>
                <td>${lockEnd}</td>
                <td>${f.status}</td>
                <td>
                    ${canUndelegate ? `<a href="#" class="undelegate-btn" data-fulfillment-id="${f.fulfillmentId}" data-amount="${f.energyAmount}">Undelegate</a>` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add click listeners to undelegate buttons
        document.querySelectorAll(".undelegate-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const fulfillmentId = btn.getAttribute("data-fulfillment-id");
                const energyAmount = parseInt(btn.getAttribute("data-amount"));
                await undelegateEnergy(fulfillmentId, energyAmount);
            });
        });
    } catch (error) {
        console.error("Error fetching seller fulfillments:", error);
    }
}

// Undelegate energy
async function undelegateEnergy(fulfillmentId, energyAmount) {
    try {
        const sunRequired = energyAmount * PRICE_PER_ENERGY;
        const tx = await tronWeb.transactionBuilder.undelegateResource(
            sunRequired,
            userAddress,
            "ENERGY",
            userAddress
        );
        const signed = await tronWeb.trx.sign(tx);
        const result = await tronWeb.trx.broadcast(signed);
        console.log("Undelegation sent:", result);

        if (!result.result || !result.txid) {
            throw new Error("Undelegation failed");
        }

        // Notify server
        await fetch(`${SERVER_URL}/api/undelegate-energy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fulfillmentId, txId: result.txid })
        });

        alert("Energy undelegated successfully!");
        fetchSellerFulfillments();
    } catch (error) {
        console.error("Error undelegating energy:", error);
        alert(`Error undelegating energy: ${error.message}`);
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", async () => {
    await autoConnectWallet();

    const connectButton = document.getElementById("connect-button");
    if (connectButton) connectButton.addEventListener("click", connectWallet);

    const energyAmountInput = document.getElementById("energy-amount");
    if (energyAmountInput) energyAmountInput.addEventListener("input", updateTotalPayment);

    const currencySelect = document.getElementById("payment-currency");
    if (currencySelect) currencySelect.addEventListener("change", updateTotalPayment);

    const createOrderButton = document.getElementById("create-order-button");
    if (createOrderButton) createOrderButton.addEventListener("click", createOrder);

    const fulfillOrderButton = document.getElementById("fulfill-order-button");
    if (fulfillOrderButton) fulfillOrderButton.addEventListener("click", fulfillOrder);

    updateTotalPayment();
    fetchOpenOrders();
    fetchSellerFulfillments();
});
