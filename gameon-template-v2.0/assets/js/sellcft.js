const tokenContractAbi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "taxAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "taxRate",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "whitelist",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_taxRate",
                "type": "uint256"
            }
        ],
        "name": "setTaxRate",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_taxAddress",
                "type": "address"
            }
        ],
        "name": "setTaxAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_account",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "_isWhitelisted",
                "type": "bool"
            }
        ],
        "name": "updateWhitelist",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "oldRate",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newRate",
                "type": "uint256"
            }
        ],
        "name": "TaxRateChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "oldAddress",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "newAddress",
                "type": "address"
            }
        ],
        "name": "TaxAddressChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "account",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bool",
                "name": "isWhitelisted",
                "type": "bool"
            }
        ],
        "name": "WhitelistUpdated",
        "type": "event"
    }
];

const marketplaceContractAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "cftAddress",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "initialTaxRecipient",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "pricePerCFT",
                "type": "uint256"
            }
        ],
        "name": "listToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "listingId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "tokenAmount",
                "type": "uint256"
            }
        ],
        "name": "buyToken",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "listingId",
                "type": "uint256"
            }
        ],
        "name": "cancelListing",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getActiveListings",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            },
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "seller",
                        "type": "address"
                    },
                    {
                        "internalType": "uint128",
                        "name": "tokenAmount",
                        "type": "uint128"
                    },
                    {
                        "internalType": "uint128",
                        "name": "pricePerCFT",
                        "type": "uint128"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct CFTTRXMarketplace.Listing[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getTaxCollected",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalTrxTaxCollected",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalCftTaxCollected",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawTaxes",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const tokenContractAddress = 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK';
const marketplaceContractAddress = 'TQt7KfGA331s64EqaHUzyKMo187MfNqRGj';

let tronWeb, userAddress, tokenContract, marketplaceContract;

async function checkTronLinkInstalled() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
                clearInterval(interval);
                resolve(true);
            }
        }, 1000);
    });
}

async function connectWallet() {
    if (!window.tronWeb) {
        alert("TronLink not found. Please install and log in.");
        return;
    }

    try {
        await window.tronLink.request({ method: "tron_requestAccounts" });
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        document.getElementById('connect-button').innerHTML = '<i class="icon-wallet me-md-2"></i> Wallet Connected';
        console.log("Connected to TronLink:", userAddress);
        await initializeContracts();
        await updateUI();
    } catch (e) {
        console.error("Failed to connect:", e);
        alert("Failed to connect wallet: " + e.message);
    }
}

async function initializeContracts() {
    try {
        tokenContract = await tronWeb.contract(tokenContractAbi, tokenContractAddress);
        marketplaceContract = await tronWeb.contract(marketplaceContractAbi, marketplaceContractAddress);
        console.log("Contracts initialized successfully");
    } catch (error) {
        console.error("Error initializing contracts:", error);
        alert("Failed to initialize contracts: " + error.message);
    }
}

async function updateUI() {
    try {
        await updateCFTBalance();
        await fetchListings();
    } catch (error) {
        console.error("Error updating UI:", error);
        alert("Failed to update UI: " + error.message);
    }
}

async function updateCFTBalance() {
    try {
        const cftBalance = await tokenContract.methods.balanceOf(userAddress).call();
        document.getElementById("user-cft-balance").innerText = formatNumber(tronWeb.fromSun(cftBalance), 0) + " CFT";
    } catch (error) {
        console.error("Error fetching CFT balance:", error);
        alert("Failed to fetch CFT balance: " + error.message);
    }
}

async function fetchListings() {
    try {
        if (!marketplaceContract) {
            console.error("Marketplace contract is not initialized yet.");
            alert("Marketplace contract not initialized.");
            return;
        }

        const result = await marketplaceContract.methods.getActiveListings().call();

        if (!result || result[0].length === 0) {
            console.log("No active listings found.");
            document.getElementById("listings-container").innerHTML = "<p class='text-center'>No active listings.</p>";
            return;
        }

        const listingIds = result[0];
        const listings = result[1];
        const container = document.getElementById("listings-container");
        container.innerHTML = "";

        for (let i = 0; i < listingIds.length; i++) {
            const listing = listings[i];
            if (!listing.isActive) continue;

            const seller = tronWeb.address.fromHex(listing.seller);
            const amount = tronWeb.fromSun(listing.tokenAmount);
            const pricePerCFT = tronWeb.fromSun(listing.pricePerCFT);

            const isUserSeller = seller === userAddress;

            const cancelButton = isUserSeller
                ? `<a href="#" class="btn btn-danger mt-2" onclick="cancelListing(${listingIds[i]})">Cancel Listing</a>`
                : "";

            const listingElement = document.createElement("div");
            listingElement.className = "col-12 col-md-10 single-staking-item mb-4";
            listingElement.innerHTML = `
                <div class="card p-4">
                    <div class="content">
                        <h4 class="m-0 text-white">Seller: ${seller}</h4>
                        <p class="mt-2 text-light"><strong>Amount:</strong> <span class="text-white">${amount} CFT</span></p>
                        <p class="text-light"><strong>Price per CFT:</strong> <span class="text-white">${pricePerCFT} TRX</span></p>
                    </div>
                    <div class="input-area d-flex flex-column mt-3">
                        <input type="number" id="buy-amount-${listingIds[i]}" class="form-control mb-2" placeholder="Amount to Buy" min="0" step="0.000001">
                        <a href="#" class="btn input-btn mt-2" onclick="buyToken(${listingIds[i]})">Buy</a>
                        ${cancelButton}
                    </div>
                </div>
            `;
            container.appendChild(listingElement);
        }
    } catch (error) {
        console.error("Error fetching listings:", error);
        document.getElementById("listings-container").innerHTML = "<p class='text-center'>Failed to load listings.</p>";
        alert("Failed to fetch listings: " + error.message);
    }
}

async function listTokens() {
    if (!tronWeb) {
        alert("TronLink not detected. Please connect your wallet.");
        return;
    }

    const amount = document.getElementById("sell-amount").value;
    const pricePerCFT = document.getElementById("sell-price").value;

    if (!amount || Number(amount) <= 0 || !pricePerCFT || Number(pricePerCFT) <= 0) {
        alert("Enter a valid amount and price per CFT.");
        return;
    }

    try {
        const tokenAmountSun = tronWeb.toSun(amount);
        const pricePerCFTSun = tronWeb.toSun(pricePerCFT);

        const allowance = await tokenContract.methods.allowance(userAddress, marketplaceContractAddress).call();
        if (BigInt(allowance) < BigInt(tokenAmountSun)) {
            console.log("Approving allowance:", tokenAmountSun);
            await tokenContract.methods.approve(marketplaceContractAddress, tokenAmountSun).send();
        }

        console.log("Listing tokens:", { tokenAmountSun, pricePerCFTSun });
        await marketplaceContract.methods.listToken(tokenAmountSun, pricePerCFTSun).send();
        
        fetchListings();
        alert("Tokens listed successfully.");
    } catch (error) {
        console.error("Error listing tokens:", error);
        alert("Failed to list tokens: " + error.message);
    }
}

async function buyToken(listingId) {
    const amountToBuyInput = document.getElementById(`buy-amount-${listingId}`).value;
    if (!amountToBuyInput || Number(amountToBuyInput) <= 0) {
        alert("Enter a valid amount to buy.");
        return;
    }

    try {
        // Convert input to a number and validate
        const amountToBuy = Number(amountToBuyInput);
        if (isNaN(amountToBuy) || amountToBuy <= 0) {
            alert("Invalid amount entered.");
            return;
        }

        // Fetch all active listings
        const result = await marketplaceContract.methods.getActiveListings().call();
        const listingIds = result[0];
        const listings = result[1];

        // Find the listing
        let listing = null;
        for (let i = 0; i < listingIds.length; i++) {
            if (listingIds[i].toString() === listingId.toString()) {
                listing = listings[i];
                break;
            }
        }

        if (!listing) {
            alert("Listing not found.");
            return;
        }

        // Validate amountToBuy against available tokens
        const availableTokens = Number(tronWeb.fromSun(listing.tokenAmount));
        if (amountToBuy > availableTokens) {
            alert(`Amount to buy (${amountToBuy} CFT) exceeds available tokens (${availableTokens} CFT).`);
            return;
        }

        // Convert pricePerCFT from sun to TRX (1 TRX = 1e6 sun) using BigInt for precision
        const pricePerCFTSun = BigInt(listing.pricePerCFT);
        const pricePerCFT = Number(pricePerCFTSun) / 1e6;

        // Calculate totalPrice in sun using BigInt to avoid floating-point issues
        const amountToBuySun = BigInt(tronWeb.toSun(amountToBuy));
        const totalPriceSun = (amountToBuySun * pricePerCFTSun) / BigInt(1e6);
        const totalPrice = Number(totalPriceSun) / 1e6; // For display only

        console.log(`Buying ${amountToBuy} CFT at ${pricePerCFT} TRX per CFT. Total price: ${totalPrice} TRX (${totalPriceSun} sun)`);

        // Validate totalPriceSun
        if (totalPriceSun <= 0) {
            alert("Invalid total price calculated.");
            return;
        }

        // Execute buy transaction
        console.log("Transaction parameters:", {
            listingId,
            tokenAmount: tronWeb.toSun(amountToBuy),
            callValue: totalPriceSun.toString()
        });
        await marketplaceContract.methods.buyToken(listingId, tronWeb.toSun(amountToBuy)).send({
            callValue: totalPriceSun.toString() // Pass as string for TronWeb
        });

        fetchListings();
        alert("Tokens purchased successfully.");
    } catch (error) {
        console.error("Error buying token:", error);
        alert("Failed to buy token: " + error.message);
    }
}

async function cancelListing(listingId) {
    if (!tronWeb || !marketplaceContract) {
        alert("Wallet not connected or contracts not initialized.");
        return;
    }

    if (!confirm("Are you sure you want to cancel this listing?")) return;

    try {
        console.log("Cancelling listing:", listingId);
        await marketplaceContract.methods.cancelListing(listingId).send();
        alert("Listing cancelled successfully.");
        fetchListings();
    } catch (error) {
        console.error("Error cancelling listing:", error);
        alert("Failed to cancel listing: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const connectButton = document.getElementById("connect-button");
    const listButton = document.getElementById("list-button");

    if (connectButton) {
        connectButton.addEventListener("click", connectWallet);
    } else {
        console.error("Error: connect-button not found in the DOM.");
    }

    if (listButton) {
        listButton.addEventListener("click", listTokens);
    } else {
        console.error("Error: list-button not found in the DOM.");
    }

    if (await checkTronLinkInstalled()) {
        await connectWallet();
        await updateCFTBalance();
    }
});

function formatNumber(num, decimals = 0) {
    return Number(num).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}
