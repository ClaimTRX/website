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

  
  const marketplaceContractAbi = [ {
  "inputs": [
    {
      "internalType": "address",
      "name": "tokenAddress",
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
      "name": "priceInTRX",
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
          "name": "priceInTRX",
          "type": "uint128"
        },
        {
          "internalType": "bool",
          "name": "isActive",
          "type": "bool"
        }
      ],
      "internalType": "struct TokenMarketplace.Listing[]",
      "name": "",
      "type": "tuple[]"
    }
  ],
  "stateMutability": "view",
  "type": "function"
}
];

const tokenContractAddress = 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA';
const marketplaceContractAddress = 'TQaF95pNKxZp8HEVKT7Y4V9WMJYofsEKra';

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
        await updateMarketPrice();
        await fetchMarketplaceListings();
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

async function updateMarketPrice() {
    try {
        const marketPrice = await marketplaceContract.methods.getMarketPrice().call();
        document.getElementById("market-price").innerText = formatNumber(tronWeb.fromSun(marketPrice), 2) + " TRX per CFT";
    } catch (error) {
        console.error("Error fetching market price:", error);
    }
}

async function fetchMarketplaceListings() {
    try {
        const result = await marketplaceContract.methods.getActiveListings().call();
        const listingIds = result[0];
        const listings = result[1];
        const listingsContainer = document.getElementById("marketplace-listings");
        listingsContainer.innerHTML = "";

        listings.forEach((listing, index) => {
            if (listing.isActive) {
                const seller = tronWeb.address.fromHex(listing.seller);
                const tokenAmount = tronWeb.fromSun(listing.tokenAmount);
                const totalPrice = tronWeb.fromSun(listing.priceInTRX);
                const isSeller = seller === userAddress;

                const listingElement = document.createElement("div");
                listingElement.className = "listing";
                listingElement.innerHTML = `
                    <p>Seller: ${seller}</p>
                    <p>Token Amount: ${tokenAmount}</p>
                    <p>Total Price: ${totalPrice} TRX</p>
                    <button class="btn btn-success mb-2" onclick="buyToken(${listingIds[index]}, ${totalPrice})">Buy</button>
                    ${isSeller ? `<button class="btn btn-danger" onclick="cancelListing(${listingIds[index]})">Cancel</button>` : ''}
                `;
                listingsContainer.appendChild(listingElement);
            }
        });
    } catch (error) {
        console.error("Error fetching marketplace listings:", error);
    }
}

async function approveAndListTokens(tokenAmount, priceInTRX) {
    try {
        const adjustedTokenAmount = tronWeb.toSun(tokenAmount);
        const adjustedPriceInTRX = tronWeb.toSun(priceInTRX);

        await tokenContract.methods.approve(marketplaceContractAddress, adjustedTokenAmount).send();
        await marketplaceContract.methods.listToken(adjustedTokenAmount, adjustedPriceInTRX).send();
        alert("Tokens listed successfully!");
        fetchMarketplaceListings();
    } catch (error) {
        console.error("Error listing tokens:", error);
        alert("Failed to list tokens.");
    }
}

async function buyToken(listingId, totalPrice) {
    try {
        await marketplaceContract.methods.buyToken(listingId).send({
            callValue: tronWeb.toSun(totalPrice)
        });
        alert("Token purchased successfully!");
        fetchMarketplaceListings();
    } catch (error) {
        console.error("Error buying token:", error);
    }
}

async function cancelListing(listingId) {
    try {
        await marketplaceContract.methods.cancelListing(listingId).send();
        alert("Listing cancelled successfully!");
        fetchMarketplaceListings();
    } catch (error) {
        console.error("Error cancelling listing:", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("connect-button").addEventListener("click", connectWallet);
    document.querySelectorAll(".sell-option").forEach(button => {
        button.addEventListener("click", () => {
            const price = button.getAttribute("data-price");
            approveAndListTokens(document.getElementById("sell-amount").value, price);
        });
    });

    if (await checkTronLinkInstalled()) {
        await connectWallet();
    }
});

function formatNumber(num, decimals = 0) {
    return Number(num).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

