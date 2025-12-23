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

let tronWeb, readTronWeb, userAddress, tokenContract, marketplaceContract, readTokenContract, readMarketplaceContract;

const CHAINSTACK_BASE_URL = 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299';
const CONTRACT_CALL_DELAY_MS = 300; // Delay between contract calls
const THROTTLE_GAP_MS = 500; // Throttle gap for Chainstack RPS limit

/* ===================== Helpers: throttle, delay, retry ===================== */
const throttle = (() => {
  let queue = Promise.resolve();
  let last = 0;
  const gap = THROTTLE_GAP_MS;
  return async function run(fn) {
    const exec = async () => {
      const now = Date.now();
      const wait = Math.max(0, gap - (now - last));
      if (wait) await new Promise(r => setTimeout(r, wait));
      last = Date.now();
      return await fn();
    };
    queue = queue.then(exec, exec);
    return queue;
  };
})();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, maxRetries = 5, baseDelay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('429') && i < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, i);
        console.warn(`429 error, retrying after ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
}

function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

async function checkTronLinkInstalled() {
    return new Promise(resolve => {
        let attempts = 0; const maxAttempts = 5;
        const interval = setInterval(() => {
            attempts++;
            if (window.tronWeb && window.tronWeb.defaultAddress.base58) { clearInterval(interval); resolve(true); }
            else if (attempts >= maxAttempts) { clearInterval(interval); resolve(false); }
        }, 500);
    });
}

async function connectWallet() {
    if (!window.tronLink) {
        alert("TronLink not found. Please install and log in.");
        return;
    }

    try {
        await window.tronLink.request({ method: "tron_requestAccounts" });
        await initializeTronWeb();
        document.getElementById('connect-button').innerHTML = '<i class="icon-wallet me-md-2"></i> Wallet Connected';
        console.log("Connected to TronLink:", userAddress);
        await updateUI();
    } catch (e) {
        console.error("Failed to connect:", e);
    }
}

async function initializeTronWeb() {
  const initDelay = 1500;
  await delay(initDelay);
  if (!window.tronLink || !window.tronWeb) {
    alert('TronLink is not detected. Install or unlock TronLink.');
    return;
  }
  if (!window.tronLink.ready) {
    alert('TronLink is not ready. Unlock TronLink and select mainnet.');
    return;
  }
  tronWeb = window.tronWeb; // Injected for signing
  // Load TronWeb library if not available
  const loadTronWebScript = () => new Promise((resolve, reject) => {
    if (window.TronWeb) {
      resolve();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/tronweb@latest/dist/TronWeb.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
  await loadTronWebScript();
  // Use TronLink's TronWeb class if the global isn't a constructor
  const TronWebCtor = (typeof window.TronWeb === 'function')
    ? window.TronWeb
    : window.tronWeb?.constructor;
  if (!TronWebCtor) {
    throw new Error('TronWeb is not available as a constructor. Reload, unlock TronLink, or use a different TronWeb CDN build.');
  }
  readTronWeb = new TronWebCtor({ fullHost: CHAINSTACK_BASE_URL });
  // Throttle requests on readTronWeb
  const originalReadRequest = readTronWeb.request;
  readTronWeb.request = async function(endpoint, params = {}, method = 'POST') {
    return throttle(async () => {
      return originalReadRequest.call(this, endpoint, serializeBigInt(params), method);
    });
  };
  userAddress = tronWeb.defaultAddress.base58;
  if (!userAddress) {
    alert('No user address found. Ensure TronLink is connected to mainnet.');
    return;
  }
  readTronWeb.setAddress(userAddress);
  await initializeContracts();
}

async function initializeContracts() {
    try {
        tokenContract = await tronWeb.contract(tokenContractAbi, tokenContractAddress);
        readTokenContract = await readTronWeb.contract(tokenContractAbi, tokenContractAddress);
        await delay(CONTRACT_CALL_DELAY_MS);
        marketplaceContract = await tronWeb.contract(marketplaceContractAbi, marketplaceContractAddress);
        readMarketplaceContract = await readTronWeb.contract(marketplaceContractAbi, marketplaceContractAddress);
    } catch (error) {
        console.error("Error initializing contracts:", error);
    }
}

async function updateUI() {
    try {
        await updateCFTBalance();
        await fetchListings();
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

async function updateCFTBalance() {
    try {
        const cftBalance = await retryWithBackoff(() => readTokenContract.methods.balanceOf(userAddress).call());
        document.getElementById("user-cft-balance").innerText = formatNumber(tronWeb.fromSun(cftBalance), 0) + " CFT";
    } catch (error) {
        console.error("Error fetching CFT balance:", error);
    }
}

async function fetchListings() {
    try {
        if (!readMarketplaceContract) {
            console.error("Marketplace contract is not initialized yet.");
            return;
        }

        const result = await retryWithBackoff(() => readMarketplaceContract.methods.getActiveListings().call());

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
                        <input type="number" id="buy-amount-${listingIds[i]}" class="form-control mb-2" placeholder="Amount to Buy">
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
    }
}

async function listTokens() {
    if (!tronWeb) {
        alert("TronLink not detected. Please connect your wallet.");
        return;
    }

    const amount = document.getElementById("sell-amount").value;
    const pricePerCFT = document.getElementById("sell-price").value;

    if (!amount || amount <= 0 || !pricePerCFT || pricePerCFT <= 0) {
        alert("Enter a valid amount and price per CFT.");
        return;
    }

    try {
        const tokenAmountSun = tronWeb.toSun(amount);
        const pricePerCFTSun = tronWeb.toSun(pricePerCFT);

        const allowance = await retryWithBackoff(() => readTokenContract.methods.allowance(userAddress, marketplaceContractAddress).call());
        await delay(CONTRACT_CALL_DELAY_MS);
        if (BigInt(allowance) < BigInt(tokenAmountSun)) {
            const approveTx = await tronWeb.transactionBuilder.triggerSmartContract(
                tokenContractAddress,
                'approve(address,uint256)',
                {},
                [{ type: 'address', value: marketplaceContractAddress }, { type: 'uint256', value: tokenAmountSun }],
                userAddress
            );
            const signedApproveTx = await tronWeb.trx.sign(approveTx.transaction);
            await tronWeb.trx.sendRawTransaction(signedApproveTx);
        }

        const listTx = await tronWeb.transactionBuilder.triggerSmartContract(
            marketplaceContractAddress,
            'listToken(uint256,uint256)',
            {},
            [{ type: 'uint256', value: tokenAmountSun }, { type: 'uint256', value: pricePerCFTSun }],
            userAddress
        );
        const signedListTx = await tronWeb.trx.sign(listTx.transaction);
        await tronWeb.trx.sendRawTransaction(signedListTx);
        
        fetchListings();
    } catch (error) {
        console.error("Error listing tokens:", error);
        alert("Failed to list tokens.");
    }
}

async function buyToken(listingId) {
    const amountToBuyInput = document.getElementById(`buy-amount-${listingId}`).value;
    if (!amountToBuyInput || amountToBuyInput <= 0) {
        alert("Enter a valid amount to buy.");
        return;
    }

    try {
        // Convert input to a number and validate
        const amountToBuy = Number(amountToBuyInput);
        if (isNaN(amountToBuy)) {
            alert("Invalid amount entered.");
            return;
        }

        // Fetch all active listings using read contract
        const result = await retryWithBackoff(() => readMarketplaceContract.methods.getActiveListings().call());
        await delay(CONTRACT_CALL_DELAY_MS);
        const listingIds = result[0];
        const listings = result[1];

        // Find the listing
        let listing = null;
        for (let i = 0; i < listingIds.length; i++) {
            if (listingIds[i].toString() == listingId) { // Ensure listingId comparison is safe
                listing = listings[i];
                break;
            }
        }

        if (!listing) {
            alert("Listing not found.");
            return;
        }

        // Keep pricePerCFT in sun (as BigInt) for precision
        const pricePerCFTSun = BigInt(listing.pricePerCFT);
        // Convert amountToBuy to sun (1 CFT = 1e6 sun)
        const amountToBuySun = BigInt(Math.floor(amountToBuy * 1e6));
        // Calculate total price in sun
        const totalPriceSun = (amountToBuySun * pricePerCFTSun) / BigInt(1e6);
        // Convert to TRX for display
        const pricePerCFT = Number(pricePerCFTSun) / 1e6;
        const totalPrice = Number(totalPriceSun) / 1e6;

        console.log(`Buying ${amountToBuy} CFT at ${pricePerCFT} TRX per CFT. Total price: ${totalPrice} TRX`);

        // Execute buy transaction
        const buyTx = await tronWeb.transactionBuilder.triggerSmartContract(
            marketplaceContractAddress,
            'buyToken(uint256,uint256)',
            { callValue: totalPriceSun.toString() },
            [{ type: 'uint256', value: listingId.toString() }, { type: 'uint256', value: amountToBuySun.toString() }],
            userAddress
        );
        const signedBuyTx = await tronWeb.trx.sign(buyTx.transaction);
        await tronWeb.trx.sendRawTransaction(signedBuyTx);

        fetchListings();
    } catch (error) {
        console.error("Error buying token:", error);
        alert("Failed to buy token.");
    }
}

async function cancelListing(listingId) {
    if (!tronWeb || !marketplaceContract) {
        alert("Wallet not connected or contracts not initialized.");
        return;
    }

    if (!confirm("Are you sure you want to cancel this listing?")) return;

    try {
        const cancelTx = await tronWeb.transactionBuilder.triggerSmartContract(
            marketplaceContractAddress,
            'cancelListing(uint256)',
            {},
            [{ type: 'uint256', value: listingId.toString() }],
            userAddress
        );
        const signedCancelTx = await tronWeb.trx.sign(cancelTx.transaction);
        await tronWeb.trx.sendRawTransaction(signedCancelTx);
        alert("Listing cancelled successfully.");
        fetchListings(); // Refresh the listings
    } catch (error) {
        console.error("Error cancelling listing:", error);
        alert("Failed to cancel listing.");
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
        updateCFTBalance();
    }
});

function formatNumber(num, decimals = 0) {
    return Number(num).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}
