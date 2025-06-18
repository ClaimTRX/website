let tronWeb, userAddress;

// Constants
const SERVER_URL = "https://api.cftecosystem.com";
const ESCROW_ADDRESS = "TWzsvYAurZoKojdyrszU6aR94JEXQkL1jr"; // Default escrow (can be overridden by seller)
const CFT_CONTRACT_ADDRESS = "THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK"; // Verify this contract
const PRICE_PER_ENERGY = 10; // 10 SUN per energy unit
const SUN_PER_TRX = 1e6; // 1 TRX = 1,000,000 SUN
const CFT_PER_TRX = 1; // 1 TRX = 1 CFT
const ENERGY_BUFFER = 100; // Buffer for energy calculation
const BLOCK_INTERVAL_SECONDS = 3; // Tron block time
const MAX_LOCK_BLOCKS = 864000; // 30 days in blocks
const DEFAULT_LOCK_BLOCKS = 86400; // 3 days in blocks

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
        await checkTronLinkInstalled();
        updateWalletUI(true);
        fetchOpenOrders();
        fetchSellerFulfillments();
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
        fetchOpenOrders();
        fetchSellerFulfillments();
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
    const currency = document.getElementById("payment-currency").value;
    const totalPaymentDisplay = document.getElementById("total-payment");

    if (isNaN(energyAmount) || energyAmount < 100000) {
        totalPaymentDisplay.textContent = "Enter valid amount (min 100,000)";
        return;
    }

    const sunRequired = energyAmount * PRICE_PER_ENERGY;
    const trxPayment = sunRequired / SUN_PER_TRX;
    const payment = currency === "TRX" ? trxPayment : trxPayment * CFT_PER_TRX;
    const unit = currency === "TRX" ? "TRX" : "CFT";

    totalPaymentDisplay.textContent = `${payment.toFixed(6)} ${unit}`;
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
        return totalEnergyWeight; // Returns value in SUN
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

        // Fetch network resources from a known active address
        const networkResources = await tronWeb.trx.getAccountResources('TZ4UXDV5ZhNW7fb2AMSbgfAEZ7hWsnYS2g');
        const totalEnergyLimit = networkResources.TotalEnergyLimit;
        const totalEnergyWeight = networkResources.TotalEnergyWeight;

        if (!totalEnergyLimit || !totalEnergyWeight) {
            throw new Error('Missing TotalEnergyLimit or TotalEnergyWeight in network resources');
        }

        // Calculate energy per TRX
        const energyPerTRX = totalEnergyLimit / totalEnergyWeight;
        console.log(`Total Energy Limit: ${totalEnergyLimit.toLocaleString()} Energy`);
        console.log(`Total TRX Staked: ${totalEnergyWeight.toLocaleString()} TRX`);
        console.log(`Energy per TRX: ${energyPerTRX.toFixed(4)} Energy/TRX`);

        // Calculate TRX required for adjusted energy
        const trxRequired = adjustedEnergy / energyPerTRX;
        let sunRequired = Math.ceil(trxRequired * SUN_PER_TRX);

        // Enforce minimum delegation of 1 TRX (1,000,000 SUN)
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

// Convert days to block intervals
function daysToBlocks(days) {
    return Math.floor(days * (86400 / BLOCK_INTERVAL_SECONDS)); // Convert days to seconds, then to blocks
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

    const sunRequired = energyAmount * PRICE_PER_ENERGY;
    const totalPayment = sunRequired / SUN_PER_TRX;
    const paymentInSun = Math.floor(totalPayment * SUN_PER_TRX);

    try {
        document.getElementById("order-status").style.display = "block";
        document.getElementById("order-message").textContent = "Creating order...";

        const orderId = Date.now();
        let txId;

        console.log(`Preparing transaction: ${totalPayment} ${currency} (${paymentInSun} SUN) to ${ESCROW_ADDRESS}`);

        if (currency === "TRX") {
            if (!tronWeb.trx || typeof tronWeb.trx.sendTransaction !== "function") {
                throw new Error("TronWeb TRX module not initialized");
            }
            const result = await withRetry(() => tronWeb.trx.sendTransaction(ESCROW_ADDRESS, paymentInSun));
            console.log("TRX payment sent:", result);
            if (!result.result || !result.txid) {
                throw new Error("TRX transaction failed");
            }
            txId = result.txid;
        } else {
            if (!tronWeb.isAddress(CFT_CONTRACT_ADDRESS)) {
                console.error("Invalid CFT contract address:", CFT_CONTRACT_ADDRESS);
                throw new Error("Invalid CFT contract address");
            }
            const cftContract = await withRetry(async () => {
                const contract = await tronWeb.contract(CFT_ABI, CFT_CONTRACT_ADDRESS);
                if (!contract || !contract.transfer) {
                    throw new Error("Failed to initialize CFT contract or transfer method missing");
                }
                return contract;
            });
            const result = await withRetry(() =>
                cftContract.transfer(ESCROW_ADDRESS, paymentInSun).send({
                    feeLimit: 100000000,
                    callValue: 0
                })
            );
            console.log("CFT payment sent:", result);
            if (!result) {
                throw new Error("CFT transaction failed");
            }
            txId = result;
        }

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
                    currency,
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
        fetchOpenOrders();
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
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${order.order_id}</td>
                <td>${order.energy_amount.toLocaleString()}</td>
                <td>${order.remaining_energy.toLocaleString()}</td>
                <td>${order.lock_duration} days</td>
                <td>${order.currency}</td>
                <td>${payment} ${order.currency}</td>
                <td><a href="#" class="fulfill-btn" data-order-id="${order.order_id}" data-remaining="${order.remaining_energy}" data-receiver="${order.receiver_address}" data-lock-duration="${order.lock_duration}">Fulfill</a></td>
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
                document.getElementById("selected-order-id").textContent = orderId;
                document.getElementById("delegate-amount").max = remaining;
                document.getElementById("fulfillment-form").dataset.receiverAddress = receiverAddress;
                document.getElementById("fulfillment-form").dataset.lockDuration = lockDuration;
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
    const receiverAddress = document.getElementById("fulfillment-form").dataset.receiverAddress;
    const lockDuration = parseInt(document.getElementById("fulfillment-form").dataset.lockDuration);
    const paymentAddressInput = document.getElementById("payment-address");
    const paymentAddress = paymentAddressInput ? paymentAddressInput.value.trim() : ESCROW_ADDRESS;

    if (isNaN(energyAmount) || energyAmount < 1000 || energyAmount > parseInt(document.getElementById("delegate-amount").max)) {
        alert("Please enter a valid energy amount (minimum 1,000, maximum available).");
        return;
    }

    if (!tronWeb.isAddress(receiverAddress)) {
        alert("Invalid receiver address.");
        return;
    }

    if (!tronWeb.isAddress(paymentAddress)) {
        alert("Invalid payment address. Using default escrow address.");
        // Fallback to escrow address if invalid
    }

    // Convert lock duration to blocks (3 seconds per block)
    let lockPeriodBlocks = daysToBlocks(lockDuration);
    if (lockPeriodBlocks > MAX_LOCK_BLOCKS) {
        console.warn(`Lock period ${lockPeriodBlocks} blocks exceeds maximum (${MAX_LOCK_BLOCKS} blocks). Adjusting to ${MAX_LOCK_BLOCKS} blocks.`);
        lockPeriodBlocks = MAX_LOCK_BLOCKS;
        alert(`Lock period adjusted to maximum ${MAX_LOCK_BLOCKS / (86400 / BLOCK_INTERVAL_SECONDS)} days.`);
    } else if (lockPeriodBlocks <= 0) {
        console.warn(`Lock period ${lockPeriodBlocks} blocks is invalid. Setting to default ${DEFAULT_LOCK_BLOCKS} blocks (3 days).`);
        lockPeriodBlocks = DEFAULT_LOCK_BLOCKS;
        alert(`Lock period set to default 3 days.`);
    }

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
            true, // lock = true
            lockPeriodBlocks // Lock period in blocks
        );
        const signed = await tronWeb.trx.sign(tx);
        const result = await tronWeb.trx.broadcast(signed);
        console.log("Delegation sent:", result);

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
                lockDuration
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
            const canUndelegate = new Date() > new Date(f.lock_end) && f.status === "confirmed";
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${f.fulfillment_id}</td>
                <td>${f.order_id}</td>
                <td>${f.energy_amount.toLocaleString()}</td>
                <td>${lockEnd}</td>
                <td>${f.status}</td>
                <td>
                    ${canUndelegate ? `<a href="#" class="undelegate-btn" data-fulfillment-id="${f.fulfillment_id}" data-amount="${f.energy_amount}" data-receiver="${f.receiver_address}">Undelegate</a>` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll(".undelegate-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.preventDefault();
                const fulfillmentId = btn.getAttribute("data-fulfillment-id");
                const energyAmount = parseInt(btn.getAttribute("data-amount"));
                const receiverAddress = btn.getAttribute("data-receiver");
                await undelegateEnergy(fulfillmentId, energyAmount, receiverAddress);
            });
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
        console.log("Undelegation sent:", result);

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

    const receiverAddressInput = document.getElementById("receiver-address");
    if (receiverAddressInput) receiverAddressInput.addEventListener("input", updateTotalPayment);

    const createOrderButton = document.getElementById("create-order-button");
    if (createOrderButton) createOrderButton.addEventListener("click", createOrder);

    const fulfillOrderButton = document.getElementById("fulfill-order-button");
    if (fulfillOrderButton) fulfillOrderButton.addEventListener("click", fulfillOrder);

    updateTotalPayment();
    fetchOpenOrders();
    fetchSellerFulfillments();
});
