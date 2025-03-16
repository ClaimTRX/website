const tokenContractAddress = 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA';
const marketplaceContractAddress = 'TQaF95pNKxZp8HEVKT7Y4V9WMJYofsEKra';

let tronWeb, userAddress, tokenContract, marketplaceContract;

// Check if TronLink is installed
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

// Connect Wallet
async function connectWallet() {
    if (!window.tronWeb) {
        alert("TronLink not found. Please install and log in.");
        return;
    }
    try {
        await window.tronLink.request({ method: "tron_requestAccounts" });
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
        await initializeContracts();
        await updateUI();
    } catch (e) {
        console.error("Failed to connect:", e);
    }
}

// Initialize Contracts
async function initializeContracts() {
    try {
        tokenContract = await tronWeb.contract(tokenContractAbi, tokenContractAddress);
        marketplaceContract = await tronWeb.contract(marketplaceContractAbi, marketplaceContractAddress);
    } catch (error) {
        console.error("Error initializing contracts:", error);
    }
}

// Update UI
async function updateUI() {
    try {
        await fetchMarketplaceListings();
    } catch (error) {
        console.error("Error updating UI:", error);
    }
}

// Fetch Marketplace Listings
async function fetchMarketplaceListings() {
    try {
        const result = await marketplaceContract.methods.getActiveListings().call();
        const listingIds = result[0];
        const listings = result[1];

        const listingsContainer = document.getElementById('listings');
        listingsContainer.innerHTML = '';

        for (let i = 0; i < listingIds.length; i++) {
            const listingId = listingIds[i];
            const listing = listings[i];
            if (listing.isActive) {
                const tokenAmount = formatNumber(tronWeb.fromSun(listing.tokenAmount), 0);
                const totalPrice = formatNumber(tronWeb.fromSun(listing.priceInTRX), 2);
                const sellerAddress = tronWeb.address.fromHex(listing.seller);
                const isSeller = sellerAddress === userAddress;

                const listingElement = document.createElement('div');
                listingElement.className = 'col-12 item';
                listingElement.innerHTML = `
                    <div class="card project-card">
                        <div class="card-body">
                            <h5>Seller: ${sellerAddress}</h5>
                            <p>${tokenAmount} CFT for ${totalPrice} TRX</p>
                            <a href="#" class="btn btn-success" onclick="buyToken(${listingId}, ${totalPrice})">Buy</a>
                            ${isSeller ? `<a href="#" class="btn btn-danger" onclick="cancelListing(${listingId})">Cancel</a>` : ''}
                        </div>
                    </div>`;
                listingsContainer.appendChild(listingElement);
            }
        }
    } catch (error) {
        console.error("Error fetching marketplace listings:", error);
    }
}

// List Tokens for Sale
async function listTokens() {
    const sellAmount = document.getElementById('sell-amount').value;
    const sellPrice = document.getElementById('sell-price').value;
    if (!sellAmount || !sellPrice) {
        alert("Please enter a valid amount and price.");
        return;
    }
    try {
        const adjustedTokenAmount = tronWeb.toSun(sellAmount);
        const adjustedPriceInTRX = tronWeb.toSun(sellPrice);
        await tokenContract.methods.approve(marketplaceContractAddress, adjustedTokenAmount).send();
        await marketplaceContract.methods.listToken(adjustedTokenAmount, adjustedPriceInTRX).send();
        alert("Tokens listed successfully!");
        await fetchMarketplaceListings();
    } catch (error) {
        console.error("Error listing tokens:", error);
    }
}

// Buy Token
async function buyToken(listingId, totalPrice) {
    try {
        await marketplaceContract.methods.buyToken(listingId).send({ callValue: tronWeb.toSun(totalPrice) });
        alert("Token purchased successfully!");
        await fetchMarketplaceListings();
    } catch (error) {
        console.error("Error buying token:", error);
    }
}

// Cancel Listing
async function cancelListing(listingId) {
    try {
        await marketplaceContract.methods.cancelListing(listingId).send();
        alert("Listing cancelled successfully!");
        await fetchMarketplaceListings();
    } catch (error) {
        console.error("Error cancelling listing:", error);
    }
}

// Format Numbers
function formatNumber(num, decimals = 0) {
    return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);
    document.getElementById('list-button').addEventListener('click', listTokens);
    if (await checkTronLinkInstalled()) {
        await connectWallet();
    }
});
