let tronWeb, userAddress;

// Constants
const SERVER_URL = "https://bulk.cftecosystem.com";
const ESCROW_ADDRESS = "TWzsvYAurZoKojdyrszU6aR94JEXQkL1jr";
const CFT_CONTRACT_ADDRESS = "THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK";
const PRICE_PER_ENERGY = 10; // 10 SUN per energy unit per day
const SUN_PER_TRX = 1e6;
const CFT_PER_TRX = 1;
const ENERGY_BUFFER = 100;
const BLOCK_INTERVAL_SECONDS = 3;
const MAX_LOCK_BLOCKS = 864000;
const DEFAULT_LOCK_BLOCKS = 86400;
const ONE_HOUR_BLOCKS = 1200;

// ABI for CFT TRC-20 Token (retained for potential future use)
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
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
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
    },
    {
        "constant": true,
        "inputs": [
            {"name": "_owner", "type": "address"},
            {"name": "_spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "remaining", "type": "uint256"}],
        "type": "function"
    }
];

// Check if TronLink is installed and ready
async function checkTronLinkInstalled() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(() => {
            attempts++;
            if (window.tronWeb && window.tronWeb.ready && window.tronWeb.defaultAddress.base58 && window.tronWeb.trx && window.tronWeb.contract) {
                tronWeb = window.tronWeb;
                userAddress = tronWeb.defaultAddress.base58;
                console.log("TronLink initialized, address:", userAddress);
                clearInterval(interval);
                resolve(true);
            } else if (attempts >= maxAttempts) {
                console.error("TronLink check failed after", maxAttempts, "attempts");
                clearInterval(interval);
                reject(new Error("TronLink not installed, not logged in, or not fully initialized"));
            }
        }, 1000);
    });
}

// Auto-connect wallet
async function autoConnectWallet() {
    try {
        if (window.tronLink && window.tronLink.ready) {
            await checkTronLinkInstalled();
            updateWalletUI(true);
            await fetchOpenOrders();
            await fetchSellerFulfillments();
        } else {
            console.log("TronLink not ready, skipping auto-connect.");
            updateWalletUI(false);
        }
    } catch (error) {
        console.error("Auto-connect failed:", error.message);
        updateWalletUI(false);
        alert("Please ensure TronLink is installed and logged in.");
    }
}

// Manually connect wallet
async function connectWallet() {
    if (!window.tronLink) {
        alert("TronLink not found. Please install TronLink and log in.");
        return;
    }
    try {
        await window.tronLink.request({ method: "tron_requestAccounts" });
        await checkTronLinkInstalled();
        console.log("Wallet connected:", userAddress);
        updateWalletUI(true);
        await fetchOpenOrders();
        await fetchSellerFulfillments();
    } catch (error) {
        console.error("Wallet connection failed:", error.message);
        alert("Failed to connect wallet: " + error.message);
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
    const lockDuration = parseInt(document.getElementById("lock-duration").value);
    const totalPaymentDisplay = document.getElementById("total-payment");

    if (isNaN(energyAmount) || energyAmount < 100000 || isNaN(lockDuration) || lockDuration <= 0) {
        totalPaymentDisplay.textContent = "Enter valid amount (min 100,000) and lock duration";
        return;
    }

    const sunRequired = energyAmount * PRICE_PER_ENERGY * lockDuration;
    const payment = sunRequired / SUN_PER_TRX;

    totalPaymentDisplay.textContent = `${payment.toFixed(6)} TRX`;
}

// Get total staked TRX for energy
async function getTotalStakedTrxForEnergy() {
    try {
        console.log('Fetching total staked TRX for energy via TronGrid...');
        const parameters = await tronWeb.trx.getChainParameters();
        const totalEnergyWeightParam = parameters.find(p => p.key === 'getTotalEnergyWeight');
        if (!totalEnergyWeightParam) {
            throw new Error('Total energy weight parameter not found');
        }
        const totalEnergyWeight = totalEnergyWeightParam.value;
        console.log(`Total staked TRX for energy: ${totalEnergyWeight} SUN`);
        return totalEnergyWeight;
    } catch (e) {
        console.error('Error fetching total staked TRX for energy:', e.message);
        throw e;
    }
}

// Calculate SUN required for desired energy
async function calculateSunForEnergy(desiredEnergy) {
    try {
        console.log(`Calculating SUN for ${desiredEnergy} energy units...`);
        const adjustedEnergy = desiredEnergy + ENERGY_BUFFER;

        const networkResources = await tronWeb.trx.getAccountResources('TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g');
        const totalEnergyLimit = networkResources.TotalEnergyLimit;
        const totalEnergyWeight = networkResources.TotalEnergyWeight;

        if (!totalEnergyLimit || !totalEnergyWeight) {
            throw new Error('Missing TotalEnergyLimit or TotalEnergyWeight');
        }

        const energyPerTRX = totalEnergyLimit / totalEnergyWeight;
        console.log(`Total Energy Limit: ${totalEnergyLimit.toLocaleString()} Energy`);
        console.log(`Total TRX Staked: ${totalEnergyWeight.toLocaleString()} TRX`);
        console.log(`Energy per TRX: ${energyPerTRX.toFixed(4)} Energy/TRX`);

        const trxRequired = adjustedEnergy / energyPerTRX;
        let sunRequired = Math.ceil(trxRequired * SUN_PER_TRX);

        const MIN_DELEGATION_SUN = 1000000;
        if (sunRequired < MIN_DELEGATION_SUN) {
            console.log(`Calculated sunRequired (${sunRequired} SUN) is less than 1 TRX. Adjusting to minimum.`);
            sunRequired = MIN_DELEGATION_SUN;
        }

        console.log(`Calculated ${sunRequired} SUN for ${adjustedEnergy} energy units (original: ${desiredEnergy})`);
        return sunRequired;
    } catch (e) {
        console.error('Error calculating SUN:', e.message);
        throw e;
    }
}

// Retry function for transactions and API calls
async function withRetry(fn, maxRetries = 3, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            console.warn(`Retry ${i + 1}/${maxRetries} failed:`, error.message);
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Wait for transaction confirmation
async function waitForTxConfirmation(txHash, maxAttempts = 30, interval = 3000) {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            const tx = await tronWeb.trx.getTransaction(txHash);
            console.log(`Transaction details for ${txHash}:`, JSON.stringify(tx));
            if (tx && tx.ret && tx.ret[0] && tx.ret[0].contractRet === 'SUCCESS') {
                console.log(`Transaction ${txHash} confirmed via getTransaction`);
                // Verify receipt for additional confirmation
                const receipt = await tronWeb.trx.getTransactionInfo(txHash);
                console.log(`Receipt for ${txHash}:`, JSON.stringify(receipt));
                return receipt || { id: txHash, confirmed: true };
            }
            console.warn(`Attempt ${i + 1}/${maxAttempts}: Transaction ${txHash} not confirmed yet.`);
        } catch (error) {
            console.warn(`Attempt ${i + 1}/${maxAttempts} error for ${txHash}: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Transaction ${txHash} not confirmed after ${maxAttempts} attempts`);
}

// Convert days to block intervals
function daysToBlocks(days) {
    return Math.floor(days * (86400 / BLOCK_INTERVAL_SECONDS));
}

// Check existing delegation
async function checkExistingDelegation(sellerAddress, receiverAddress) {
    const maxRetries = 3;
    let attempt = 0;
    while (attempt < maxRetries) {
        try {
            console.log(`Checking delegation from ${sellerAddress} to ${receiverAddress} (attempt ${attempt + 1}/${maxRetries})`);
            const response = await fetch(`${SERVER_URL}/api/check-delegation?sellerAddress=${sellerAddress}&receiverAddress=${receiverAddress}`, {
                headers: { "Accept": "application/json" }
            });
            if (!response.ok) {
                console.warn(`Delegation check failed with status: ${response.status}`);
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();
            if (!data.success) {
                console.warn(`Delegation check unsuccessful: ${data.message || "Unknown error"}`);
                throw new Error(data.message || "Server returned unsuccessful response");
            }
            console.log(`Delegation check response:`, JSON.stringify(data.delegation));
            return data.delegation;
        } catch (error) {
            console.error(`Error checking delegation (attempt ${attempt + 1}/${maxRetries}): ${error.message}`);
            attempt++;
            if (attempt >= maxRetries) {
                console.warn("Max retries reached for delegation check. Returning null.");
                return null;
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

// Create energy order
async function createOrder() {
    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    const energyAmount = parseInt(document.getElementById("energy-amount").value);
    const lockDuration = parseInt(document.getElementById("lock-duration").value);
    const receiverAddress = document.getElementById("receiver-address").value;

    if (isNaN(energyAmount) || energyAmount < 100000) {
        alert("Please enter a valid energy amount (minimum 100,000).");
        return;
    }

    if (isNaN(lockDuration) || lockDuration <= 0) {
        alert("Please enter a valid lock duration (minimum 1 day).");
        return;
    }

    if (!tronWeb.isAddress(receiverAddress)) {
        alert("Please enter a valid Tron wallet address for receiving energy.");
        return;
    }

    const sunRequired = energyAmount * PRICE_PER_ENERGY * lockDuration;
    const totalPayment = sunRequired / SUN_PER_TRX;
    const paymentInSun = Math.floor(totalPayment * SUN_PER_TRX);

    try {
        document.getElementById("order-status").style.display = "block";
        document.getElementById("order-message").textContent = "Creating order...";

        const orderId = Date.now();
        let txId;

        console.log(`Preparing transaction: ${totalPayment} TRX (${paymentInSun} SUN) to ${ESCROW_ADDRESS}`);

        if (!tronWeb.trx || typeof tronWeb.trx.sendTransaction !== "function") {
            throw new Error("TronWeb TRX module not initialized");
        }

        const result = await withRetry(async () => {
            const tx = await tronWeb.trx.sendTransaction(ESCROW_ADDRESS, paymentInSun, {
                feeLimit: 5000000 // 5 TRX for fees
            });
            console.log("TRX transaction sent:", JSON.stringify(tx));
            if (!tx.result || !tx.txid) {
                throw new Error("TRX transaction failed");
            }
            return tx;
        }, 3, 5000);

        txId = result.txid;
        console.log(`TRX payment sent, txID: ${txId}`);

        // Wait for transaction confirmation
        const receipt = await waitForTxConfirmation(txId);
        console.log(`TRX payment confirmed:`, JSON.stringify(receipt));

        console.log("Sending order to server:", { orderId, txId });

        const sendOrder = async () => {
            const response = await fetch(`${SERVER_URL}/api/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify({
                    orderId,
                    buyerAddress: userAddress,
                    energyAmount,
                    lockDuration,
                    currency: "TRX",
                    totalPayment,
                    receiverAddress,
                    txId
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error: ${response.status} - ${errorText}`);
            }

            return await response.json();
        };

        const data = await withRetry(sendOrder, 5, 3000);
        if (!data.success) {
            throw new Error(data.message || "Failed to create order");
        }

        document.getElementById("order-message").textContent = "Order created successfully!";
        document.getElementById("order-id").textContent = orderId;
        await fetchOpenOrders();
    } catch (error) {
        console.error("Error creating order:", error);
        document.getElementById("order-message").textContent = `Error: ${error.message}`;
    }
}

// Fetch and display open orders
async function fetchOpenOrders() {
    try {
        console.log("Fetching open orders from:", `${SERVER_URL}/api/open-orders`);
        const response = await fetch(`${SERVER_URL}/api/open-orders`, {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || "Failed to fetch orders");
        }

        const tableBody = document.getElementById("marketplace-table-body");
        tableBody.innerHTML = "";

        data.orders.forEach(order => {
            const payment = typeof order.total_payment === 'number' ? order.total_payment.toFixed(6) : (order.total_payment || "0").toFixed(6);
            const remainingCft = ((order.remaining_energy / order.energy_amount) * order.total_payment * CFT_PER_TRX).toFixed(2);
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.order_id}</td>
                <td>${order.energy_amount.toLocaleString()}</td>
                <td>${order.remaining_energy.toLocaleString()}</td>
                <td>${remainingCft} CFT</td>
                <td>${order.lock_duration} days</td>
                <td>${order.currency}</td>
                <td>${payment} ${order.currency}</td>
                <td><a href="#" class="fulfill-btn" data-order-id="${order.order_id}" data-remaining="${order.remaining_energy}" data-receiver="${order.receiver_address}" data-lock-duration="${order.lock_duration}" data-total-payment="${order.total_payment}" data-energy-amount="${order.energy_amount}">Fulfill</a></td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll(".fulfill-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                const orderId = btn.getAttribute("data-order-id");
                const remaining = parseInt(btn.getAttribute("data-remaining"));
                const receiverAddress = btn.getAttribute("data-receiver");
                const lockDuration = parseInt(btn.getAttribute("data-lock-duration"));
                const totalPayment = parseFloat(btn.getAttribute("data-total-payment"));
                const energyAmount = parseInt(btn.getAttribute("data-energy-amount"));
                document.getElementById("selected-order-id").textContent = orderId;
                document.getElementById("delegate-amount").max = remaining;
                document.getElementById("fulfillment-form").dataset.receiverAddress = receiverAddress;
                document.getElementById("fulfillment-form").dataset.lockDuration = lockDuration;
                document.getElementById("fulfillment-form").dataset.totalPayment = totalPayment;
                document.getElementById("fulfillment-form").dataset.energyAmount = energyAmount;
                document.getElementById("fulfillment-form").style.display = "block";
                document.getElementById("estimated-earnings").textContent = "0.00 CFT"; // Reset earnings
            });
        });
    } catch (error) {
        console.error("Error fetching open orders:", error);
    }
}

// Add this new function at the end of energytest.js (e.g., after fetchSellerFulfillments)
function updateEarnings() {
    const delegateAmount = parseInt(document.getElementById("delegate-amount").value) || 0;
    const orderId = document.getElementById("selected-order-id").textContent;
    if (delegateAmount < 1000 || !orderId) return;

    // Fetch order details to calculate earnings
    fetch(`${SERVER_URL}/api/open-orders`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const order = data.orders.find(o => o.order_id === parseInt(orderId));
                if (order) {
                    const cftPerEnergy = (order.total_payment * CFT_PER_TRX) / order.energy_amount;
                    const earnings = (delegateAmount * cftPerEnergy).toFixed(2);
                    document.getElementById("estimated-earnings").textContent = `${earnings} CFT`;
                }
            }
        })
        .catch(error => console.error("Error calculating earnings:", error));
}

// Fulfill an order
async function fulfillOrder() {
    if (!userAddress) {
        alert("Please connect your wallet first.");
        return;
    }

    const orderId = document.getElementById("selected-order-id").textContent;
    const energyAmount = parseInt(document.getElementById("delegate-amount").value);
    const receiverAddress = document.getElementById("fulfillment-form").dataset.receiverAddress;
    const originalLockDuration = parseInt(document.getElementById("fulfillment-form").dataset.lockDuration);
    const paymentAddressInput = document.getElementById("payment-address");
    let paymentAddress = paymentAddressInput ? paymentAddressInput.value.trim() : ESCROW_ADDRESS;

    if (isNaN(energyAmount) || energyAmount < 1000 || energyAmount > parseInt(document.getElementById("delegate-amount").max)) {
        alert("Please enter a valid energy amount (minimum 1,000, maximum available).");
        return;
    }

    if (!tronWeb.isAddress(receiverAddress)) {
        alert("Invalid receiver address.");
        return;
    }

    if (!tronWeb.isAddress(paymentAddress)) {
        console.warn("Invalid payment address provided. Falling back to escrow address.");
        paymentAddress = ESCROW_ADDRESS;
        alert("Invalid payment address. Using default escrow address.");
    }

    let lockPeriodBlocks = daysToBlocks(originalLockDuration);
    const existingDelegation = await checkExistingDelegation(userAddress, receiverAddress);
    if (existingDelegation && existingDelegation.expireTime > Date.now()) {
        const remainingMs = existingDelegation.expireTime - Date.now();
        const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
        const confirmMessage = `You already have ${existingDelegation.energy.toLocaleString()} energy staked to this address with ${remainingDays} days remaining. Do you want to stake ${energyAmount.toLocaleString()} more energy and lock for ${remainingDays} days?`;
        if (!window.confirm(confirmMessage)) {
            alert("Fulfillment cancelled.");
            return;
        }
        lockPeriodBlocks = Math.ceil(remainingMs / (BLOCK_INTERVAL_SECONDS * 1000)) + ONE_HOUR_BLOCKS;
    } else {
        console.warn("No active delegation detected or unable to verify. Proceeding with default lock duration.");
        const confirmMessage = `No active delegation detected to ${receiverAddress}, or verification failed. Proceed with a new delegation of ${energyAmount.toLocaleString()} energy for ${originalLockDuration} days?`;
        if (!window.confirm(confirmMessage)) {
            alert("Fulfillment cancelled.");
            return;
        }
    }

    if (lockPeriodBlocks > MAX_LOCK_BLOCKS) {
        console.warn(`Lock period ${lockPeriodBlocks} blocks exceeds maximum. Adjusting to ${MAX_LOCK_BLOCKS} blocks.`);
        lockPeriodBlocks = MAX_LOCK_BLOCKS;
        alert(`Lock period adjusted to maximum ${MAX_LOCK_BLOCKS / (86400 / BLOCK_INTERVAL_SECONDS)} days.`);
    } else if (lockPeriodBlocks <= 0) {
        console.warn(`Lock period ${lockPeriodBlocks} blocks is invalid. Setting to default ${DEFAULT_LOCK_BLOCKS} blocks.`);
        lockPeriodBlocks = DEFAULT_LOCK_BLOCKS;
        alert(`Lock period set to default 3 days.`);
    }

    const adjustedLockDuration = Math.ceil(lockPeriodBlocks * BLOCK_INTERVAL_SECONDS / 86400);

    try {
        document.getElementById("fulfillment-status").style.display = "block";
        document.getElementById("fulfillment-message").textContent = "Calculating energy delegation...";

        const sunRequired = await calculateSunForEnergy(energyAmount);
        document.getElementById("fulfillment-message").textContent = "Delegating energy...";

        const tx = await tronWeb.transactionBuilder.delegateResource(
            sunRequired,
            receiverAddress,
            "ENERGY",
            userAddress,
            true,
            lockPeriodBlocks
        );
        const signed = await tronWeb.trx.sign(tx);
        const result = await tronWeb.trx.broadcast(signed);
        console.log("Delegation sent:", JSON.stringify(result));

        if (!result.result || !result.txid) {
            throw new Error("Delegation failed");
        }

        const response = await fetch(`${SERVER_URL}/api/submit-fulfillment`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                orderId,
                sellerAddress: userAddress,
                energyAmount,
                receiverAddress,
                txId: result.txid,
                paymentAddress,
                lockDuration: adjustedLockDuration
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || "Failed to submit fulfillment");
        }

        document.getElementById("fulfillment-message").textContent = "Fulfillment submitted! Waiting for verification...";
        document.getElementById("fulfillment-hash").textContent = result.txid;
        document.getElementById("fulfillment-hash").href = `https://tronscan.org/#/transaction/${result.txid}`;
        document.getElementById("fulfillment-hash").style.display = "block";

        await pollFulfillmentStatus(data.fulfillmentId);
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
            const response = await fetch(`${SERVER_URL}/api/fulfillment-status?fulfillmentId=${fulfillmentId}`, {
                headers: { "Accept": "application/json" }
            });
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            const data = await response.json();

            if (data.status === "confirmed") {
                clearInterval(interval);
                document.getElementById("fulfillment-message").textContent = "Fulfillment confirmed! Payment released.";
                await fetchOpenOrders();
                await fetchSellerFulfillments();
            } else if (data.status === "failed") {
                clearInterval(interval);
                document.getElementById("fulfillment-message").textContent = `Fulfillment failed: ${data.message}`;
            } else if (pollAttempts >= maxPollAttempts) {
                clearInterval(interval);
                document.getElementById("fulfillment-message").textContent = "Fulfillment timed out. Check payment status.";
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
        console.log("Fetching fulfillments for:", userAddress);
        const response = await fetch(`${SERVER_URL}/api/seller-fulfillments?address=${userAddress}`, {
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || "Failed to fetch fulfillments");
        }

        const tableBody = document.getElementById("dashboard-table-body");
        tableBody.innerHTML = "";

        data.fulfillments.forEach(f => {
            const lockEnd = new Date(f.lock_end).toLocaleString();
            const orderResponse = await fetch(`${SERVER_URL}/api/open-orders`);
            const orderData = await orderResponse.json();
            let cftPaid = "0.00";
            if (orderData.success) {
                const order = orderData.orders.find(o => o.order_id === parseInt(f.order_id));
                if (order) {
                    const cftPerEnergy = (order.total_payment * CFT_PER_TRX) / order.energy_amount;
                    cftPaid = (f.energy_amount * cftPerEnergy).toFixed(2);
                }
            }
            const canUndelegate = new Date() > new Date(f.lock_end) && f.status === "confirmed";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${f.fulfillment_id}</td>
                <td>${f.order_id}</td>
                <td>${f.energy_amount.toLocaleString()}</td>
                <td>${lockEnd}</td>
                <td>${f.status}</td>
                <td>${cftPaid} CFT</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching seller fulfillments:", error);
    }
}

// Undelegate energy
async function undelegateEnergy(fulfillmentId, energyAmount, receiverAddress) {
    try {
        const sunRequired = energyAmount * PRICE_PER_ENERGY;
        const tx = await tronWeb.transactionBuilder.undelegateResource(
            sunRequired,
            receiverAddress,
            "ENERGY",
            userAddress
        );
        const signed = await tronWeb.trx.sign(tx);
        const result = await tronWeb.trx.broadcast(signed);
        console.log("Undelegation sent:", JSON.stringify(result));

        if (!result.result || !result.txid) {
            throw new Error("Undelegation failed");
        }

        const response = await fetch(`${SERVER_URL}/api/undelegate-energy`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ fulfillmentId, txId: result.txid })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        alert("Energy undelegated successfully!");
        await fetchSellerFulfillments();
    } catch (error) {
        console.error("Error undelegating energy:", error);
        alert(`Error undelegating energy: ${error.message}`);
    }
}

// Event listeners
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await autoConnectWallet();
        const connectButton = document.getElementById("connect-button");
        if (connectButton) connectButton.addEventListener("click", connectWallet);

        const energyAmountInput = document.getElementById("energy-amount");
        if (energyAmountInput) energyAmountInput.addEventListener("input", updateTotalPayment);

        const receiverAddressInput = document.getElementById("receiver-address");
        if (receiverAddressInput) receiverAddressInput.addEventListener("input", updateTotalPayment);

        const lockDurationInput = document.getElementById("lock-duration");
        if (lockDurationInput) lockDurationInput.addEventListener("input", updateTotalPayment);

        const createOrderButton = document.getElementById("create-order-button");
        if (createOrderButton) createOrderButton.addEventListener("click", createOrder);

        const fulfillOrderButton = document.getElementById("fulfill-order-button");
        if (fulfillOrderButton) fulfillOrderButton.addEventListener("click", fulfillOrder);

        updateTotalPayment();
        await fetchOpenOrders();
        await fetchSellerFulfillments();
    } catch (error) {
        console.error("Error in DOMContentLoaded:", error);
        alert("An error occurred during initialization. Please try refreshing the page.");
    }
});
