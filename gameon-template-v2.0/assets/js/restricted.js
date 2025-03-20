const tokenContractAddress = 'TAME19SjDjKxC3omaJG5HWMTxhbHMrzWMi';
const marketplaceContractAddress = 'TXiu6DgdDsggDGhLjGSpUnzZsDZx9inS36';

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

let tronWeb, userAddress, tokenContract, marketplaceContract;

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

        if (userAddress) { 
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
        connectButton.innerHTML = isConnected ? `<i class="icon-wallet"></i> Wallet Connected` : `<i class="icon-wallet"></i> Connect Wallet`;
    }
}

// ✅ Check Allowed Address and Control "Buy CFT" Button
async function checkAllowedAddress() {
    const buyCFTButton = document.querySelector(".btn.btn-bordered.active[href='buycft.html']");

    if (!userAddress) return;

    if (allowedAddresses.includes(userAddress)) {
        buyCFTButton.style.display = "inline-block"; // Show button
        console.log(`✅ Wallet ${userAddress} is allowed. Showing "Buy CFT" button.`);
    } else {
        buyCFTButton.style.display = "none"; // Hide button
        console.log(`❌ Wallet ${userAddress} is NOT allowed. Hiding "Buy CFT" button.`);
    }
}

// ✅ Fetch Token Balance
async function updateCFTBalance() {
    try {
        const cftBalance = await tokenContract.methods.balanceOf(userAddress).call();
        document.getElementById("user-cft-balance").innerText = (cftBalance / 1e6).toFixed(2) + " CFT";
    } catch (error) {
        console.error("Error fetching CFT balance:", error);
    }
}

// ✅ List Tokens for Sale
async function listTokens() {
    if (!tronWeb) {
        alert("TronLink not detected. Please connect your wallet.");
        return;
    }

    const amount = document.getElementById("sell-amount").value;
    const pricePerCFT = document.getElementById("sell-price").value;

    if (!amount || amount <= 0) {
        alert("Enter a valid CFT amount.");
        return;
    }

    try {
        const tokenAmountSun = amount * 1e6;
        const pricePerCFTSun = parseInt(pricePerCFT);

        const allowance = await tokenContract.methods.allowance(userAddress, marketplaceContractAddress).call();
        if (parseInt(allowance) < tokenAmountSun) {
            await tokenContract.methods.approve(marketplaceContractAddress, tokenAmountSun).send();
        }

        await marketplaceContract.methods.listToken(tokenAmountSun, pricePerCFTSun).send();
        
        await fetchListings();
    } catch (error) {
        console.error("Error listing tokens:", error);
        alert("Failed to list tokens.");
    }
}

// ✅ Fetch Active Listings
async function fetchListings() {
    try {
        if (!marketplaceContract) {
            console.error("Marketplace contract is not initialized yet.");
            return;
        }

        const result = await marketplaceContract.methods.getActiveListings().call();

        if (!result || result[0].length === 0) {
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

            const listingElement = document.createElement("div");
            listingElement.className = "col-12 col-md-10 single-staking-item mb-4";
            listingElement.innerHTML = `
                <div class="card p-4">
                    <div class="content">
                        <h4 class="m-0 text-white">Seller: ${seller}</h4>
                        <p class="mt-2 text-light"><strong>Amount:</strong> <span class="text-white">${amount} CFT</span></p>
                        <p class="text-light"><strong>Price per CFT:</strong> <span class="text-white">${pricePerCFT} TRX</span></p>
                    </div>
                </div>
            `;
            container.appendChild(listingElement);
        }
    } catch (error) {
        console.error("Error fetching listings:", error);
    }
}

// ✅ Auto-connect wallet and check permissions on page load
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🔄 DOM fully loaded. Checking wallet connection...");

    await autoConnectWallet();

    const connectButton = document.getElementById("connect-button");
    if (connectButton) {
        connectButton.addEventListener("click", connectWallet);
    }

    // Check wallet every 5 seconds in case the user switches accounts
    setInterval(async () => {
        if (window.tronWeb && window.tronWeb.defaultAddress.base58 !== userAddress) {
            console.log("🔄 Wallet changed. Rechecking access...");
            userAddress = window.tronWeb.defaultAddress.base58;
            await checkAllowedAddress();
        }
    }, 5000);
});


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
        "inputs": [
            {
                "internalType": "address",
                "name": "seller",
                "type": "address"
            }
        ],
        "name": "getSellerLimits",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "remainingCFT",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "remainingTRX",
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
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "to",
                "type": "address"
            }
        ],
        "name": "withdrawFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

