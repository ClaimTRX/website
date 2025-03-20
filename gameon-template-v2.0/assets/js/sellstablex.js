let tronWeb, userAddress, tokenContract, usddContract, marketplaceContract;
const tokenContractAddress = 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS';
const usddContractAddress = 'TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz';
const marketplaceContractAddress = 'TDxSTFQvsxeSfsSgokKxMU2e8uXKAgp3vw';
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const tokenContractAbi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_to", "type": "address" },
            { "internalType": "uint256", "name": "_value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_spender", "type": "address" },
            { "internalType": "uint256", "name": "_value", "type": "uint256" }
        ],
        "name": "approve",
        "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_from", "type": "address" },
            { "internalType": "address", "name": "_to", "type": "address" },
            { "internalType": "uint256", "name": "_value", "type": "uint256" }
        ],
        "name": "transferFrom",
        "outputs": [{ "internalType": "bool", "name": "success", "type": "bool" }],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "", "type": "address" },
            { "internalType": "address", "name": "", "type": "address" }
        ],
        "name": "allowance",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }
        ],
        "name": "Approval",
        "type": "event"
    }
];

const marketplaceContractAbi = [
    {
        "inputs": [
            { "internalType": "address", "name": "tokenAddress", "type": "address" },
            { "internalType": "address", "name": "usddAddress", "type": "address" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }
        ],
        "name": "listToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "listingId", "type": "uint256" },
            { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }
        ],
        "name": "buyToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "listingId", "type": "uint256" }
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
            { "internalType": "uint256[]", "name": "", "type": "uint256[]" },
            {
                "components": [
                    { "internalType": "address", "name": "seller", "type": "address" },
                    { "internalType": "uint128", "name": "tokenAmount", "type": "uint128" },
                    { "internalType": "bool", "name": "isActive", "type": "bool" }
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

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);

    if (await checkTronLinkInstalled()) {
        await initializeTronWeb();
        setInterval(updateUI, 60000);
    } else {
        console.error('TronLink is not installed.');
    }
});

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

async function initializeTronWeb() {
    try {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;

        if (!userAddress) throw new Error('User address not available');

        tokenContract = await tronWeb.contract(tokenContractAbi, tokenContractAddress);
        usddContract = await tronWeb.contract(tokenContractAbi, usddContractAddress);
        marketplaceContract = await tronWeb.contract(marketplaceContractAbi, marketplaceContractAddress);

        console.log('Connected to TronLink.');
        console.log('User Address:', userAddress);
        document.getElementById('connect-button').style.display = 'none';
        await updateUI();
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing TronWeb or Contracts:', error);
    }
}

async function updateUI() {
    try {
        await updateStableXBalance();
        await fetchListings();
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

function setupEventListeners() {
    const listButton = document.getElementById('list-button');
    if (!listButton) {
        console.error("Element with ID 'list-button' not found in the DOM.");
        return;
    }
    listButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const tokenAmount = document.getElementById('sell-amount').value;
        if (tokenAmount) {
            try {
                await approveAndListTokens(tokenAmount);
            } catch (error) {
                console.error('Error listing tokens:', error);
                alert('Failed to list tokens.');
            }
        }
    });
}

async function refreshUI() {
    const balance = await tronWeb.trx.getBalance(userAddress);
    console.log('Balance refreshed:', tronWeb.fromSun(balance), 'TRX');
    await fetchListings();
}

async function updateStableXBalance() {
    const balanceElement = document.getElementById('user-stablex-balance');
    if (!balanceElement) {
        console.error("Element with ID 'user-stablex-balance' not found in the DOM.");
        return;
    }
    try {
        const balance = await tokenContract.balanceOf(userAddress).call();
        const formattedBalance = (balance / 1e6).toFixed(2);
        balanceElement.textContent = formattedBalance;
    } catch (error) {
        console.error('Error fetching StableX balance:', error);
        balanceElement.textContent = 'Error';
    }
}

async function fetchListings() {
    const container = document.getElementById("listings-container");
    if (!container) {
        console.error("Element with ID 'listings-container' not found in the DOM.");
        return;
    }
    try {
        const result = await marketplaceContract.getActiveListings().call();
        const listingIds = result[0];
        const listings = result[1];
        container.innerHTML = "";

        if (listingIds.length === 0) {
            container.innerHTML = "<p class='text-center'>No active listings.</p>";
            return;
        }

        for (let i = 0; i < listingIds.length; i++) {
            const listing = listings[i];
            if (!listing.isActive) continue;

            const seller = tronWeb.address.fromHex(listing.seller);
            const amount = tronWeb.fromSun(listing.tokenAmount);
            const isSeller = seller === userAddress;
            const totalCostInUSDD = amount;

            const listingElement = document.createElement("div");
            listingElement.className = "col-12 col-md-10 single-staking-item mb-4";

            listingElement.innerHTML = `
                <div class="card p-4">
                    <div class="content">
                        <h4 class="m-0 text-white">Seller: ${seller}</h4>
                        <p class="mt-2 text-light"><strong>Amount:</strong> <span class="text-white">${amount} StableX</span></p>
                        <p class="text-light"><strong>Total Cost:</strong> <span class="text-white">${totalCostInUSDD} USDD</span></p>
                    </div>
                    <div class="input-area d-flex flex-column mt-3">
                        <div class="input-text">
                            <input type="number" placeholder="Amount to buy" id="buyAmount_${listingIds[i]}" min="0.01" step="0.01" max="${amount}">
                        </div>
                        <a href="#" class="btn input-btn mt-2" onclick="buyToken(${listingIds[i]}, document.getElementById('buyAmount_${listingIds[i]}').value)">Buy</a>
                        ${isSeller ? `<a href="#" class="btn btn-danger mt-2" onclick="cancelListing(${listingIds[i]})">Cancel</a>` : ""}
                    </div>
                </div>
            `;

            container.appendChild(listingElement);
        }
    } catch (error) {
        console.error("Error fetching listings:", error);
        container.innerHTML = "<p class='text-center'>Failed to load listings.</p>";
    }
}

async function buyToken(listingId, amountToBuy) {
    try {
        const tokenUnits = tronWeb.toSun(amountToBuy);
        const totalCostInUSDDUnits = (parseFloat(amountToBuy) * 1e18).toFixed(0);

        const currentAllowance = await usddContract.allowance(userAddress, marketplaceContractAddress).call();

        if (BigInt(currentAllowance) < BigInt(totalCostInUSDDUnits)) {
            await usddContract.approve(marketplaceContractAddress, totalCostInUSDDUnits).send();
            console.log(`Approved ${amountToBuy} USDD for marketplace.`);
        } else {
            console.log("Sufficient allowance already exists for buying.");
        }

        await marketplaceContract.buyToken(listingId, tokenUnits).send();

        alert("StableX purchased successfully!");
        fetchListings();
    } catch (error) {
        console.error("Error buying StableX:", error);
        alert("Failed to buy StableX.");
    }
}

async function cancelListing(listingId) {
    try {
        await marketplaceContract.cancelListing(listingId).send();
        alert('Listing cancelled successfully!');
        updateUI();
    } catch (error) {
        console.error('Error cancelling listing:', error);
        alert('Failed to cancel listing.');
    }
}

async function approveAndListTokens(tokenAmount) {
    const tokenUnits = tronWeb.toSun(tokenAmount);
    try {
        const currentAllowance = await tokenContract.allowance(userAddress, marketplaceContractAddress).call();

        if (BigInt(currentAllowance) < BigInt(tokenUnits)) {
            await tokenContract.approve(marketplaceContractAddress, tokenUnits).send();
            console.log(`Approved ${tokenAmount} StableX for marketplace.`);
        } else {
            console.log("Sufficient allowance already exists for listing.");
        }

        await marketplaceContract.listToken(tokenUnits).send();
        alert('Tokens listed successfully!');
        updateUI();
    } catch (error) {
        console.error('Error listing tokens:', error);
        throw error;
    }
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatWholeNumber(num) {
    return Math.floor(parseFloat(num)).toLocaleString('en-US');
}
