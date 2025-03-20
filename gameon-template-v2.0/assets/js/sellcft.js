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


const tokenContractAddress = 'TAME19SjDjKxC3omaJG5HWMTxhbHMrzWMi';
const marketplaceContractAddress = 'TF9jKVXYKdihFZ5DxYiKbdpP9pmAYsDxhM';

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
    }
}

async function initializeContracts() {
    try {
        tokenContract = await tronWeb.contract(tokenContractAbi, tokenContractAddress);
        marketplaceContract = await tronWeb.contract(marketplaceContractAbi, marketplaceContractAddress);
    } catch (error) {
        console.error("Error initializing contracts:", error);
    }
}

async function updateUI() {
    try {
        await updateCFTBalance();
        await fetchListings();
        await updateTaxCollected();
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

async function updateCFTBalance() {
    try {
        const cftBalance = await tokenContract.methods.balanceOf(userAddress).call();
        document.getElementById("user-cft-balance").innerText = formatNumber(tronWeb.fromSun(cftBalance), 0) + " CFT";
    } catch (error) {
        console.error("Error fetching CFT balance:", error);
    }
}

async function fetchListings() {
    try {
        const result = await marketplaceContract.methods.getActiveListings().call();
        const listingIds = result[0];
        const listings = result[1];
        const container = document.getElementById("listings-container");
        container.innerHTML = ""; // Clear previous listings

        if (listingIds.length === 0) {
            container.innerHTML = "<p class='text-center'>No active listings.</p>";
            return;
        }

        for (let i = 0; i < listingIds.length; i++) {
            const listing = listings[i];
            if (!listing.isActive) continue;

            const seller = tronWeb.address.fromHex(listing.seller);
            const amount = tronWeb.fromSun(listing.tokenAmount);
            const pricePerCFT = tronWeb.fromSun(listing.pricePerCFT);
            const isSeller = seller === userAddress; // Check if the connected wallet is the seller

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
                        <input type="number" id="buy-amount-${listingIds[i]}" class="form-control mb-2" placeholder="Amount to Buy">
                        <a href="#" class="btn input-btn mt-2" onclick="buyToken(${listingIds[i]})">Buy</a>
                        ${isSeller ? `<a href="#" class="btn btn-danger mt-2" onclick="cancelListing(${listingIds[i]})">Cancel</a>` : ""}
                    </div>
                </div>
            `;

            container.appendChild(listingElement);
        }
    } catch (error) {
        console.error("Error fetching listings:", error);
        document.getElementById("listings-container").innerHTML = "<p class='text-center'>Failed to load listings.</p>";
    }
}

async function listTokens() {
    const amount = document.getElementById("sell-amount").value;
    const pricePerCFT = document.getElementById("sell-price").value;

    if (!amount || amount <= 0 || !pricePerCFT || pricePerCFT <= 0) {
        alert("Enter a valid amount and price per CFT.");
        return;
    }

    const tokenAmountSun = tronWeb.toSun(amount);
    const pricePerCFTSun = tronWeb.toSun(pricePerCFT);

    try {
        const allowance = await tokenContract.methods.allowance(userAddress, marketplaceContractAddress).call();
        if (parseInt(allowance) < parseInt(tokenAmountSun)) {
            await tokenContract.methods.approve(marketplaceContractAddress, tokenAmountSun).send();
        }

        await marketplaceContract.methods.listToken(tokenAmountSun, pricePerCFTSun).send();
        alert("Tokens listed successfully!");
        fetchListings();
    } catch (error) {
        console.error("Error listing tokens:", error);
        alert("Failed to list tokens.");
    }
}

async function buyToken(listingId) {
    const amountToBuy = document.getElementById(`buy-amount-${listingId}`).value;
    if (!amountToBuy || amountToBuy <= 0) {
        alert("Enter a valid amount to buy.");
        return;
    }

    try {
        const listing = await marketplaceContract.methods.getListing(listingId).call();
        const pricePerCFT = tronWeb.fromSun(listing.pricePerCFT);
        const totalPrice = amountToBuy * pricePerCFT;

        await marketplaceContract.methods.buyToken(listingId, tronWeb.toSun(amountToBuy)).send({ callValue: tronWeb.toSun(totalPrice) });
        alert("Purchase successful!");
        fetchListings();
    } catch (error) {
        console.error("Error buying token:", error);
        alert("Failed to buy token.");
    }
}

async function updateTaxCollected() {
    try {
        const taxData = await marketplaceContract.methods.getTaxCollected().call();
        const totalTrxTax = tronWeb.fromSun(taxData[0]);
        const totalCftTax = tronWeb.fromSun(taxData[1]);

        document.getElementById("tax-collected").innerText = `Collected Taxes: ${totalTrxTax} TRX / ${totalCftTax} CFT`;
    } catch (error) {
        console.error("Error fetching tax data:", error);
    }
}

async function withdrawTaxes() {
    try {
        await marketplaceContract.methods.withdrawTaxes().send();
        alert("Taxes withdrawn successfully!");
        updateTaxCollected();
    } catch (error) {
        console.error("Error withdrawing taxes:", error);
        alert("Failed to withdraw taxes.");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("connect-button").addEventListener("click", connectWallet);
    document.getElementById("list-button").addEventListener("click", listTokens);
    document.getElementById("withdraw-taxes").addEventListener("click", withdrawTaxes);

    if (await checkTronLinkInstalled()) {
        await connectWallet();
        updateCFTBalance();
    }
});



