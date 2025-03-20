let tronWeb, userAddress, tokenContract, usddContract, marketplaceContract;
    const tokenContractAddress = 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS'; // CFT Token Address
    const usddContractAddress = 'TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz'; // Replace with actual USDD contract address
    const marketplaceContractAddress = 'TDxSTFQvsxeSfsSgokKxMU2e8uXKAgp3vw'; // Marketplace Contract Address
    const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

    // Token Contract ABI (Standard TRC20 ABI for CFT and USDD)
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

    // Updated Marketplace Contract ABI
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

    // TronLink connection
    document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);

    if (await checkTronLinkInstalled()) {
      await initializeTronWeb();
      setInterval(updateUI, 60000); // Update UI every minute
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
    try {
      await window.tronLink.request({ method: 'tron_requestAccounts' });
      await initializeTronWeb();
    } catch (e) {
      console.error('Failed to connect to TronLink:', e);
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
        await updateStableXBalance(); // Update StableX balance
        await fetchMarketplaceListings(); // Update listings
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}

  function setupEventListeners() {
    document.getElementById('list-button').addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent default link behavior
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
    await fetchMarketplaceListings();
  }

async function updateStableXBalance() {
    try {
        const balance = await tokenContract.balanceOf(userAddress).call();
        const formattedBalance = (balance / 1e6).toFixed(2); // Assuming 6 decimals
        document.getElementById('user-stablex-balance').textContent = formattedBalance;
    } catch (error) {
        console.error('Error fetching StableX balance:', error);
        document.getElementById('user-stablex-balance').textContent = 'Error';
    }
}

  // Fetch and display active listings
  async function fetchMarketplaceListings() {
    try {
        const result = await marketplaceContract.getActiveListings().call();
        const listingIds = result[0];
        const listings = result[1];
        const listingsContainer = document.getElementById('listings-container');
        listingsContainer.innerHTML = '';
        for (let i = 0; i < listingIds.length; i++) {
            // Rest of the listing creation logic remains the same
            // Example listing element creation:
            const listingId = listingIds[i];
            const listing = listings[i];
            if (listing.isActive) {
                const tokenAmount = parseFloat(tronWeb.fromSun(listing.tokenAmount));
                const listingElement = document.createElement('div');
                listingElement.innerHTML = `
                    <p>Seller: ${tronWeb.address.fromHex(listing.seller)}</p>
                    <p>Token Amount: ${tokenAmount.toFixed(2)}</p>
                    <button onclick="buyToken(${listingId}, ${tokenAmount})">Buy</button>
                    ${tronWeb.address.fromHex(listing.seller) === userAddress ? `<button onclick="cancelListing(${listingId})">Cancel</button>` : ''}
                `;
                listingsContainer.appendChild(listingElement);
            }
        }
    } catch (error) {
        console.error('Error fetching listings:', error);
        alert('Failed to fetch listings.');
    }
}

  // Buy tokens from the marketplace
  async function buyToken(listingId, tokenAmount) {
    try {
        const tokenUnits = tronWeb.toSun(tokenAmount);
        const totalPrice = tokenAmount * (10 ** 12); // Adjust based on price logic
        await usddContract.approve(marketplaceContractAddress, totalPrice.toString()).send();
        await marketplaceContract.buyToken(listingId, tokenUnits).send();
        alert('Token purchased successfully!');
        updateUI(); // Refresh balance and listings
    } catch (error) {
        console.error('Error buying token:', error);
        alert('Failed to buy tokens.');
    }
}

  // Cancel a listing from the marketplace
  async function cancelListing(listingId) {
    try {
        await marketplaceContract.cancelListing(listingId).send();
        alert('Listing cancelled successfully!');
        updateUI(); // Refresh balance and listings
    } catch (error) {
        console.error('Error cancelling listing:', error);
        alert('Failed to cancel listing.');
    }
}

  // Approve and list tokens for sale
 async function approveAndListTokens(tokenAmount) {
    const tokenUnits = tronWeb.toSun(tokenAmount);
    try {
        await tokenContract.approve(marketplaceContractAddress, tokenUnits).send();
        await marketplaceContract.listToken(tokenUnits).send();
        alert('Tokens listed successfully!');
        updateUI(); // Refresh balance and listings
    } catch (error) {
        console.error('Error listing tokens:', error);
        throw error; // Propagates to event listener
    }
}

  // Utility function to format numbers
  function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Utility function to format whole numbers
  function formatWholeNumber(num) {
    return Math.floor(parseFloat(num)).toLocaleString('en-US');
  }

     document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const sidebar = document.querySelector(".sidebar");

    menuToggle.addEventListener("click", function () {
        sidebar.classList.toggle("active");
    });
});
