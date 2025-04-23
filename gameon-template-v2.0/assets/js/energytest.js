const express = require("express");
const TronWeb = require("tronweb");
const axios = require("axios");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const cron = require("node-cron");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "https://www.cftecosystem.com" }));

const tronWeb = new TronWeb({
    fullHost: "https://api.trongrid.io",
    headers: { "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY },
    privateKey: process.env.PRIVATE_KEY
});

const OWNER_ADDRESS = process.env.OWNER_ADDRESS;
const PERMISSION_ID = parseInt(process.env.PERMISSION_ID);
const PAYMENT_ADDRESS = "TRUnBRHsGVYeFuBccYac5wyWYBAgcnLzmn";

const requests = new Map();

// Initialize SQLite database
const db = new sqlite3.Database("./energy_delegations.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create or update the delegations table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS delegations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            request_id TEXT NOT NULL,
            payer_wallet TEXT NOT NULL,
            receiver_wallet TEXT NOT NULL,
            delegator_wallet TEXT NOT NULL,
            delegation_time TEXT NOT NULL,
            reclamation_time TEXT,
            delegation_txid TEXT NOT NULL,
            energy_amount INTEGER,
            trx_price REAL,
            sun_required INTEGER,
            delegation_duration INTEGER
        )
    `, (err) => {
        if (err) {
            console.error("Error creating table:", err.message);
        } else {
            console.log("Delegations table created or already exists.");
        }
    });

    // Add columns if missing
    db.run(`ALTER TABLE delegations ADD COLUMN energy_amount INTEGER`, (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.error("Error adding energy_amount column:", err.message);
        } else {
            console.log("energy_amount column added or already exists.");
        }
    });

    db.run(`ALTER TABLE delegations ADD COLUMN trx_price REAL`, (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.error("Error adding trx_price column:", err.message);
        } else {
            console.log("trx_price column added or already exists.");
        }
    });

    db.run(`ALTER TABLE delegations ADD COLUMN sun_required INTEGER`, (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.error("Error adding sun_required column:", err.message);
        } else {
            console.log("sun_required column added or already exists.");
        }
    });

    db.run(`ALTER TABLE delegations ADD COLUMN delegation_duration INTEGER`, (err) => {
        if (err && !err.message.includes("duplicate column name")) {
            console.error("Error adding delegation_duration column:", err.message);
        } else {
            console.log("delegation_duration column added or already exists.");
        }
    });
});

// Function to send a Telegram message
async function sendTelegramMessage(type, details) {
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN1;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const telegramGroupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;

    if (!telegramBotToken) {
        console.error("Telegram bot token not configured in .env");
        return;
    }

    let message = "";
    let targetChatId = telegramChatId;

    if (type === "success") {
        const { requestId, payerWallet, receiverWallet, delegatorWallet, delegationTime, txId, energyAmount, trxPrice, delegationDuration } = details;
        message = `
*New Energy Delegation*
- *Request ID*: ${requestId}
- *Payer Wallet*: ${payerWallet}
- *Receiver Wallet*: ${receiverWallet}
- *Delegator Wallet*: ${delegatorWallet}
- *Energy Amount*: ${energyAmount.toLocaleString()} units
- *TRX Paid*: ${trxPrice} TRX
- *Duration*: ${delegationDuration} minutes
- *Delegation Time*: ${delegationTime}
- *Transaction ID*: [${txId}](https://tronscan.org/#/transaction/${txId})
        `;
    } else if (type === "error") {
        const { requestId, payerWallet, errorMessage } = details;
        message = `
*Error in Energy Delegation*
- *Request ID*: ${requestId}
- *Payer Wallet*: ${payerWallet || "Unknown"}
- *Error Message*: ${errorMessage}
        `;
    } else if (type === "daily-report") {
        const { totalEnergySold, totalIncome } = details;
        message = `
*Daily Sales and Income Report (Last 24 Hours)*
- *Total Energy Sold*: ${totalEnergySold.toLocaleString()} units
- *Total Income*: ${totalIncome.toFixed(2)} TRX
- *Report Time*: ${new Date().toISOString()}
        `;
        targetChatId = telegramGroupChatId; // Send daily report to group chat
    } else if (type === "group-notification") {
        const { energyAmount, trxPrice } = details;
        message = `
*New Energy Buy*
- *Energy Amount*: ${energyAmount.toLocaleString()} units
- *Price*: ${trxPrice} TRX
        `;
        targetChatId = telegramGroupChatId;
    } else {
        console.error("Invalid message type for Telegram notification:", type);
        return;
    }

    if (!targetChatId) {
        console.error(`Telegram chat ID not configured for type ${type} in .env`);
        return;
    }

    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: targetChatId,
            text: message,
            parse_mode: "Markdown"
        });
        console.log(`Telegram ${type} message sent successfully to chat ${targetChatId}`);
    } catch (error) {
        console.error(`Error sending Telegram ${type} message to chat ${targetChatId}:`, error.message);
    }
}

// ============ Helper Functions ============

function getDateNDaysAgo(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

async function getTotalEnergyLimit() {
    try {
        console.log("Fetching total energy limit...");
        const parameters = await tronWeb.trx.getChainParameters();
        const param = parameters.find(p => p.key === "getTotalEnergyLimit");
        if (!param) throw new Error("Total energy limit not found");
        console.log(`Total energy limit: ${param.value}`);
        return param.value;
    } catch (e) {
        console.error("Error fetching total energy limit:", e.message);
        throw e;
    }
}

async function getTotalStakedTrxForEnergy() {
    const datesToTry = [getDateNDaysAgo(0), getDateNDaysAgo(1)];
    for (const date of datesToTry) {
        try {
            console.log(`Fetching staked TRX for date ${date}...`);
            const res = await axios.get(`https://apilist.tronscanapi.com/api/freezeresource?start_day=${date}&end_day=${date}`);
            const data = res.data;
            if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
                const latest = data.data[0];
                if (latest.total_energy_weight) {
                    console.log(`Total staked TRX: ${latest.total_energy_weight}`);
                    return latest.total_energy_weight;
                }
            }
        } catch (e) {
            console.warn(`No data for ${date}:`, e.message);
        }
    }
    throw new Error("No staking data available.");
}

async function calculateSunForEnergy(desiredEnergy) {
    try {
        console.log(`Calculating SUN for ${desiredEnergy} energy units...`);
        const totalEnergyLimit = await getTotalEnergyLimit();
        const totalStakedTrx = await getTotalStakedTrxForEnergy();
        const trxRequired = (desiredEnergy / totalEnergyLimit) * totalStakedTrx;
        const sunRequired = Math.ceil(trxRequired * 1e6);
        console.log(`Calculated ${sunRequired} SUN for ${desiredEnergy} energy units`);
        return { sunRequired };
    } catch (e) {
        console.error("Error calculating SUN:", e.message);
        throw e;
    }
}

async function delegateEnergy(receiver, amount) {
    try {
        console.log(`Delegating ${amount} SUN to ${receiver}...`);
        const tx = await tronWeb.transactionBuilder.delegateResource(
            amount, receiver, "ENERGY", OWNER_ADDRESS, false,
            { permissionId: PERMISSION_ID }
        );
        console.log("Transaction built, signing...");
        const signed = await tronWeb.trx.multiSign(tx, process.env.PRIVATE_KEY);
        console.log("Transaction signed, broadcasting...");
        const result = await tronWeb.trx.broadcast(signed);
        console.log("Energy delegated successfully:", result);
        return result;
    } catch (e) {
        console.error("Error delegating energy:", e.message);
        throw e;
    }
}

async function undelegateEnergy(receiver, amount) {
    try {
        console.log(`Undelegating ${amount} SUN from ${receiver}...`);
        const tx = await tronWeb.transactionBuilder.undelegateResource(
            amount, receiver, "ENERGY", OWNER_ADDRESS,
            { permissionId: PERMISSION_ID }
        );
        const signed = await tronWeb.trx.multiSign(tx, process.env.PRIVATE_KEY);
        const result = await tronWeb.trx.broadcast(signed);
        console.log("Energy undelegated successfully:", result);
        return result;
    } catch (e) {
        console.error("Error undelegating energy:", e.message);
        throw e;
    }
}

async function getAvailableEnergy() {
    try {
        console.log(`Fetching available energy for ${OWNER_ADDRESS}...`);
        const r = await tronWeb.trx.getAccountResources(OWNER_ADDRESS);
        const availableEnergy = r.EnergyLimit - (r.EnergyUsed || 0);
        console.log(`Available energy: ${availableEnergy}`);
        return availableEnergy;
    } catch (e) {
        console.error("Energy fetch failed:", e);
        return 0;
    }
}

// ============ Payment Monitor (Per User) ============

async function monitorSinglePayment(requestId) {
    const request = requests.get(requestId);
    if (!request) return;

    const hexUserAddr = tronWeb.address.toHex(request.userAddress);
    let attempts = 0;
    const maxAttempts = 60; // 60 x 2s = 120s

    console.log(`Monitoring payment for request ${requestId}:`, {
        userAddress: request.userAddress,
        hexUserAddr,
        expectedAmount: request.trxPrice * 1e6,
        paymentTxId: request.paymentTxId,
        createdAt: request.createdAt.toISOString(),
        delegationDuration: request.delegationDuration
    });

    const interval = setInterval(async () => {
        attempts++;

        try {
            console.log(`Checking transactions for request ${requestId}, attempt ${attempts}...`);
            let response;
            let retryCount = 0;
            const maxRetries = 3;
            while (retryCount < maxRetries) {
                try {
                    response = await axios.get(`https://api.trongrid.io/v1/accounts/${PAYMENT_ADDRESS}/transactions`, {
                        params: { only_to: true, limit: 50 },
                        headers: { "TRON-PRO-API-KEY": process.env.TRONGRID_API_KEY }
                    });
                    break;
                } catch (error) {
                    retryCount++;
                    console.error(`Error fetching transactions (attempt ${retryCount}/${maxRetries}):`, error.message);
                    if (retryCount === maxRetries) throw new Error(`Failed to fetch transactions after ${maxRetries} attempts: ${error.message}`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }

            const txs = response.data.data;
            console.log(`Transactions received for request ${requestId}:`, txs.map(tx => ({
                txID: tx.txID,
                owner_address: tx.raw_data?.contract?.[0]?.parameter?.value?.owner_address,
                amount: tx.raw_data?.contract?.[0]?.parameter?.value?.amount,
                timestamp: tx.raw_data?.timestamp,
                contractRet: tx.ret?.[0]?.contractRet
            })));

            const payment = txs.find(tx =>
                tx.raw_data?.contract?.[0]?.type === "TransferContract" &&
                tx.raw_data.contract[0].parameter.value.owner_address === hexUserAddr &&
                Math.abs(parseInt(tx.raw_data.contract[0].parameter.value.amount) - parseInt(request.trxPrice * 1e6)) <= 100000 &&
                tx.ret?.[0]?.contractRet === "SUCCESS" &&
                tx.txID === request.paymentTxId
            );

            if (payment) {
                console.log(`✅ Payment received from ${request.userAddress} (${request.trxPrice} TRX) for request ${requestId}`);

                const { sunRequired } = await calculateSunForEnergy(request.energyAmount);
                const result = await delegateEnergy(request.receiverAddress, sunRequired);

                const delegationTime = new Date().toISOString();
                const txId = result.txid;
                if (!txId) {
                    console.error(`No txid found in delegation result for request ${requestId}:`, result);
                    throw new Error("Delegation transaction ID not found");
                }
                await new Promise((resolve, reject) => {
                    db.run(`
                        INSERT INTO delegations (
                            request_id, payer_wallet, receiver_wallet, delegator_wallet, 
                            delegation_time, delegation_txid, energy_amount, trx_price, sun_required, delegation_duration
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `, [
                        requestId,
                        request.userAddress,
                        request.receiverAddress,
                        OWNER_ADDRESS,
                        delegationTime,
                        txId,
                        request.energyAmount,
                        request.trxPrice,
                        sunRequired,
                        request.delegationDuration
                    ], (err) => {
                        if (err) {
                            console.error(`Error storing delegation for request ${requestId}:`, err.message);
                            sendTelegramMessage("error", {
                                requestId,
                                payerWallet: request.userAddress,
                                errorMessage: `Error storing delegation in database: ${err.message}`
                            });
                            reject(err);
                        } else {
                            console.log(`Stored delegation for request ${requestId} in database.`);
                            resolve();
                        }
                    });
                });

                sendTelegramMessage("success", {
                    requestId,
                    payerWallet: request.userAddress,
                    receiverWallet: request.receiverAddress,
                    delegatorWallet: OWNER_ADDRESS,
                    delegationTime,
                    txId,
                    energyAmount: request.energyAmount,
                    trxPrice: request.trxPrice,
                    delegationDuration: request.delegationDuration
                });

                sendTelegramMessage("group-notification", {
                    energyAmount: request.energyAmount,
                    trxPrice: request.trxPrice
                });

                requests.set(requestId, {
                    ...request,
                    status: "delegated",
                    txId: txId
                });

                setTimeout(async () => {
                    try {
                        const row = await new Promise((resolve, reject) => {
                            db.get(`SELECT sun_required FROM delegations WHERE request_id = ?`, [requestId], (err, row) => {
                                if (err) reject(err);
                                else resolve(row);
                            });
                        });
                        if (!row || !row.sun_required) {
                            throw new Error(`No sun_required value found for request ${requestId}`);
                        }
                        const sunRequiredStored = row.sun_required;

                        await undelegateEnergy(request.receiverAddress, sunRequiredStored);
                        const reclamationTime = new Date().toISOString();
                        await new Promise((resolve, reject) => {
                            db.run(`
                                UPDATE delegations
                                SET reclamation_time = ?
                                WHERE request_id = ?
                            `, [reclamationTime, requestId], (err) => {
                                if (err) {
                                    console.error(`Error updating reclamation time for request ${requestId}:`, err.message);
                                    sendTelegramMessage("error", {
                                        requestId,
                                        payerWallet: request.userAddress,
                                        errorMessage: `Error updating reclamation time in database: ${err.message}`
                                    });
                                    reject(err);
                                } else {
                                    console.log(`Updated reclamation time for request ${requestId} in database.`);
                                    resolve();
                                }
                            });
                        });
                        requests.delete(requestId);
                    } catch (err) {
                        console.error(`Error during undelegation for request ${requestId}:`, err.message);
                        sendTelegramMessage("error", {
                            requestId,
                            payerWallet: request.userAddress,
                            errorMessage: `Error during undelegation: ${err.message}`
                        });
                    }
                }, request.delegationDuration * 60 * 1000); // Undelegate after specified duration

                clearInterval(interval);
                return;
            }
        } catch (err) {
            console.error(`❌ Error in request ${requestId}:`, err.message);
            requests.set(requestId, {
                ...request,
                status: "failed",
                message: err.message
            });
            sendTelegramMessage("error", {
                requestId,
                payerWallet: request.userAddress,
                errorMessage: err.message
            });
            clearInterval(interval);
        }

        if (attempts >= maxAttempts) {
            console.warn(`⏱️ Timeout: No payment found for request ${requestId}`);
            requests.set(requestId, {
                ...request,
                status: "expired",
                message: "No payment detected after 120s"
            });
            sendTelegramMessage("error", {
                requestId,
                payerWallet: request.userAddress,
                errorMessage: "No payment detected after 120 seconds"
            });
            clearInterval(interval);
        }
    }, 2000);
}

// Schedule a daily report at 05:00 UTC
cron.schedule("0 5 * * *", async () => {
    console.log("Generating daily sales and income report at 05:00 UTC...");
    
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twentyFourHoursAgoISOString = twentyFourHoursAgo.toISOString();

    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(`
                SELECT energy_amount, trx_price
                FROM delegations
                WHERE delegation_time >= ?
                AND delegation_time <= ?
            `, [twentyFourHoursAgoISOString, now.toISOString()], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        let totalEnergySold = 0;
        let totalIncome = 0;

        rows.forEach(row => {
            totalEnergySold += row.energy_amount || 0;
            totalIncome += row.trx_price || 0;
        });

        sendTelegramMessage("daily-report", {
            totalEnergySold,
            totalIncome
        });
    } catch (error) {
        console.error("Error generating daily sales report:", error.message);
        sendTelegramMessage("error", {
            requestId: "N/A",
            payerWallet: "N/A",
            errorMessage: `Error generating daily sales report: ${error.message}`
        });
    }
}, {
    scheduled: true,
    timezone: "UTC"
});

// ============ API Routes ============

app.get("/api/available-energy", async (req, res) => {
    try {
        const availableEnergy = await getAvailableEnergy();
        res.json({ success: true, availableEnergy });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
});

app.post("/api/request-energy", async (req, res) => {
    const { energyAmount, receiverAddress, trxPrice, userAddress, paymentTxId, delegationDuration } = req.body;
    const requestId = Date.now().toString();

    if (!energyAmount || !receiverAddress || !trxPrice || !userAddress || !paymentTxId || !delegationDuration) {
        return res.status(400).json({ success: false, message: "Missing fields" });
    }

    if (![5, 15].includes(parseInt(delegationDuration))) {
        return res.status(400).json({ success: false, message: "Invalid delegation duration. Must be 5 or 15 minutes." });
    }

    for (const [id, request] of requests.entries()) {
        if (request.userAddress === userAddress && request.status === "pending") {
            console.log(`Canceling previous pending request ${id} for user ${userAddress}`);
            requests.delete(id);
        }
    }

    requests.set(requestId, {
        userAddress,
        energyAmount: parseInt(energyAmount),
        trxPrice,
        receiverAddress,
        paymentTxId,
        delegationDuration: parseInt(delegationDuration),
        status: "pending",
        createdAt: new Date()
    });

    monitorSinglePayment(requestId);
    res.json({ success: true, requestId });
});

app.get("/api/delegation-status", (req, res) => {
    console.log(`Received GET request for /api/delegation-status with query:`, req.query);
    const { requestId } = req.query;
    const request = requests.get(requestId);
    if (!request) {
        console.log(`Request ${requestId} not found`);
        return res.json({ status: "not-found", message: "Request not found" });
    }
    console.log(`Returning status for request ${requestId}:`, { status: request.status, txId: request.txId, message: request.message });
    res.json({ status: request.status, txId: request.txId || "", message: request.message || "" });
});

app.post("/api/delegation-status", (req, res) => {
    console.log(`Received POST request for /api/delegation-status, which is not allowed`);
    res.status(405).json({ success: false, message: "Method Not Allowed" });
});

app.options("/api/delegation-status", (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "https://www.cftecosystem.com",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type"
    }).sendStatus(204);
});

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the CFT Ecosystem API. Use /api/available-energy, /api/request-energy, or /api/delegation-status." });
});

app.get("/api/delegation-history", (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString();

    db.all(`
        SELECT * FROM delegations
        WHERE delegation_time >= ?
        ORDER BY delegation_time DESC
    `, [thirtyDaysAgoISOString], (err, rows) => {
        if (err) {
            console.error("Error fetching delegation history:", err.message);
            res.status(500).json({ success: false, message: "Error fetching delegation history" });
        } else {
            res.json({ success: true, data: rows });
        }
    });
});

// ============ Start Server ============

app.listen(3000, "0.0.0.0", () => console.log("🚀 Server running on port 3000"));

process.on("SIGINT", () => {
    db.close((err) => {
        if (err) {
            console.error("Error closing database:", err.message);
        } else {
            console.log("Database connection closed.");
        }
        process.exit(0);
    });
});
