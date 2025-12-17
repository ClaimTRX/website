let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Define contracts for StableX and CFT
const tokenDetails = {
    stablex: {
        tokenAddress: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS',
        stakingAddress: 'TRVn2h65VrbGb7zkASz3escJiHJWMSy7pV',
        decimals: 6,
        displayName: 'StableX' // ← Added missing comma here
    },
     cftnew: {
        tokenAddress: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS',
        stakingAddress: 'TABSRFLk6FF1FKPtTLy4zJpJqaiZQzwgQt',
        decimals: 6,
        price: 0.27,
        displayName: 'CFT' // ← Added missing comma here
    }
    
};

const stakingContractAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_stakingToken",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_dailyReward",
                "type": "uint256"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
    "inputs": [],
    "name": "viewAPR",
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
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Staked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "Withdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "user",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "reward",
                "type": "uint256"
            }
        ],
        "name": "RewardClaimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "OwnerWithdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "OwnerStakedTokenWithdrawn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "stake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "claimReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "rewardPerToken",
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
                "name": "account",
                "type": "address"
            }
        ],
        "name": "earned",
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
                "name": "account",
                "type": "address"
            }
        ],
        "name": "viewProjectedRewardsForYear",
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
        "name": "viewTotalUnclaimedRewards",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "totalUnclaimedRewards",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "viewTotalStaked",
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
                "name": "account",
                "type": "address"
            }
        ],
        "name": "viewStakedAmount",
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
                "name": "account",
                "type": "address"
            }
        ],
        "name": "viewPendingReward",
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
        "name": "viewDailyReward",
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
                "name": "account",
                "type": "address"
            }
        ],
        "name": "viewTotalClaimedRewards",
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
                "internalType": "uint256",
                "name": "_dailyReward",
                "type": "uint256"
            }
        ],
        "name": "setDailyReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "ownerWithdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "ownerWithdrawStakedTokens",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]
;


;

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
// Helper: Wait for an element to appear in DOM
function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Timeout waiting for element: ${selector}`));
        }, timeout);
    });
}

// Main initialization
async function initialize() {
    try {
        // Wait for connect buttons to be injected via header.html
        const connectButton = await waitForElement('#connect-button');
        const connectButtonMobile = document.getElementById('connect-button-mobile');

        // Attach click listeners
        connectButton.addEventListener('click', connectWallet);
        if (connectButtonMobile) {
            connectButtonMobile.addEventListener('click', () => {
                connectWallet();
                // Close mobile menu if open
                const menuModal = bootstrap.Modal.getInstance(document.getElementById('menu'));
                if (menuModal) menuModal.hide();
            });
        }

        console.log('Connect buttons ready.');

        // Auto-connect if TronLink is already available
        if (await checkTronLinkInstalled()) {
            await initializeTronWeb();
            setInterval(updateAllUI, 60000); // Refresh UI every minute
        }
    } catch (error) {
        console.error('Failed to initialize connect button:', error);
    }
}

// Check if TronLink is installed and ready
async function checkTronLinkInstalled() {
    return new Promise(resolve => {
        let attempts = 0;
        const maxAttempts = 20;
        const interval = setInterval(() => {
            attempts++;
            if (window.tronWeb && window.tronWeb.defaultAddress && window.tronWeb.defaultAddress.base58) {
                clearInterval(interval);
                resolve(true);
            } else if (attempts >= maxAttempts) {
                clearInterval(interval);
                resolve(false);
            }
        }, 500);
    });
}

// Connect Wallet
async function connectWallet() {
    try {
        if (!window.tronLink) {
            alert('TronLink wallet not detected. Please install TronLink.');
            return;
        }
        await window.tronLink.request({ method: 'tron_requestAccounts' });
        await initializeTronWeb();
    } catch (error) {
        console.error('Wallet connection failed:', error);
        alert('Failed to connect wallet. Please try again.');
    }
}

// Initialize TronWeb and Contracts
async function initializeTronWeb() {
    try {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;

        if (!userAddress) {
            throw new Error('No wallet address found.');
        }

        console.log('Wallet connected:', userAddress);

        // Update both desktop and mobile buttons
        const desktopBtn = document.getElementById('connect-button');
        const mobileBtn = document.getElementById('connect-button-mobile');
        const connectedHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;

        if (desktopBtn) {
            desktopBtn.innerHTML = connectedHTML;
            desktopBtn.disabled = true;
        }
        if (mobileBtn) {
            mobileBtn.innerHTML = connectedHTML;
            mobileBtn.disabled = true;
        }

        // Initialize contracts
        for (let key in tokenDetails) {
            let details = tokenDetails[key];
            tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
            stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
            if (details.decimals === null) {
                tokenDetails[key].decimals = await tokenContracts[key].methods.decimals().call();
            }
        }

        await updateAllUI();
    } catch (error) {
        console.error('Error initializing TronWeb or Contracts:', error);
        alert('Failed to initialize contracts. Check console for details.');
    }
}

// Update UI for all tokens
async function updateAllUI() {
    for (let key in tokenDetails) {
        await updateTokenUI(key);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Update UI for a specific token
async function updateTokenUI(token) {
    await updateAvailableTokens(token);
    await delay(400);
    await updateStakedAmount(token);
    await delay(400);
    await updateAPR(token);
    await delay(400);
    await updateProjectedRewards(token);
    await delay(400);
    await updateClaimableRewards(token);
    await delay(400);
    await updateTotalClaimedRewards(token);
}
// Update available tokens
async function updateAvailableTokens(token) {
    try {
        const balanceRaw = await tokenContracts[token].methods.balanceOf(userAddress).call();
        const decimals = BigInt(tokenDetails[token].decimals);
        const divisor = BigInt(10) ** decimals; // Use BigInt for 10^decimals
        const balance = Number(balanceRaw) / Number(divisor); // Convert both to number for division
        document.getElementById(`available-tokens-${token}`).innerText = balance.toFixed(2);
    } catch (error) {
        console.error(`Error updating available tokens for ${token}:`, error);
    }
}

// Update staked amount
async function updateStakedAmount(token) {
    try {
        const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
        const decimals = BigInt(tokenDetails[token].decimals);
        const divisor = BigInt(10) ** decimals;
        const stakedAmount = Number(stakedAmountRaw) / Number(divisor);
        document.getElementById(`staked-amount-${token}`).innerText = stakedAmount.toFixed(2);
    } catch (error) {
        console.error(`Error updating staked amount for ${token}:`, error);
    }
}

async function updateAPR(token) {
    try {
        if (token === "stablex") {
            if (!stakingContracts[token].methods.viewAPR) {
                console.error(`viewAPR function is missing in ${token} staking contract.`);
                return;
            }
            const aprRaw = await stakingContracts[token].methods.viewAPR().call();
            const apr = Number(aprRaw) / 1e4; // Convert BigInt to number for division
            document.getElementById(`estimated-apr-${token}`).innerText = apr.toFixed(2) + ' %';
        } else if (token === "cftnew") { // Corrected from "cft" to "cftnew" to match tokenDetails
            const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
            const projectedRewardsRaw = await stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call();

            if (stakedAmountRaw == 0) { // Loose comparison ok here, but consider BigInt(0)
                document.getElementById(`estimated-apr-${token}`).innerText = '0.00 %';
                return;
            }

            const decimals = BigInt(tokenDetails[token].decimals);
            const divisor = BigInt(10) ** decimals;
            const stakedTokens = Number(stakedAmountRaw) / Number(divisor);
            const annualRewardTokens = Number(projectedRewardsRaw) / Number(divisor);
            const stakedValueUSD = stakedTokens * 1; // Assuming StableX is $1
            const annualRewardValueUSD = annualRewardTokens * tokenDetails[token].price;

            const apr = (annualRewardValueUSD / stakedValueUSD) * 100;
            document.getElementById(`estimated-apr-${token}`).innerText = apr.toFixed(2) + ' %';
        }
    } catch (error) {
        console.error(`Error updating APR for ${token}:`, error);
    }
}

// Update projected rewards
async function updateProjectedRewards(token) {
    try {
        const projectedRewardsRaw = await stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call();
        const rewardDecimals = tokenDetails[token].rewardDecimals || tokenDetails[token].decimals;
        const divisor = BigInt(10) ** BigInt(rewardDecimals);
        const projectedRewards = Number(projectedRewardsRaw) / Number(divisor);
        document.getElementById(`projected-rewards-${token}`).innerText = Math.floor(projectedRewards).toLocaleString('en-US');
    } catch (error) {
        console.error(`Error updating projected rewards for ${token}:`, error);
    }
}


async function updateClaimableRewards(token) {
    try {
        const claimableRewardsRaw = await stakingContracts[token].methods.viewPendingReward(userAddress).call();
        const decimals = BigInt(tokenDetails[token].decimals);
        const divisor = BigInt(10) ** decimals;
        const claimableRewards = Number(claimableRewardsRaw) / Number(divisor);
        const tokenName = tokenDetails[token].displayName || token.toUpperCase();
        document.getElementById(`claimable-rewards-${token}`).innerText =
            claimableRewards.toFixed(2) + " " + tokenName;
    } catch (error) {
        console.error(`Error updating claimable rewards for ${token}:`, error);
    }
}



// Update total claimed rewards
async function updateTotalClaimedRewards(token) {
    try {
        const totalClaimedRewardsRaw = await stakingContracts[token].methods.viewTotalClaimedRewards(userAddress).call();
        const decimals = BigInt(tokenDetails[token].decimals);
        const divisor = BigInt(10) ** decimals;
        const totalClaimedRewards = Number(totalClaimedRewardsRaw) / Number(divisor);
        document.getElementById(`total-claimed-rewards-${token}`).innerText = totalClaimedRewards.toFixed(2);
    } catch (error) {
        console.error(`Error updating total claimed rewards for ${token}:`, error);
    }
}

// Staking function
async function stakeTokens(token, amount) {
    try {
        const amountToStake = tronWeb.toSun(amount);
        const stakingContractAddress = tokenDetails[token].stakingAddress;
        const tokenContract = tokenContracts[token];

        const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
        const allowance = BigInt(allowanceRaw);

        if (allowance >= BigInt(amountToStake)) {
            console.log(`Sufficient approval detected: ${allowance}`);
            await stakingContracts[token].methods.stake(amountToStake).send();
        } else {
            console.log("Approval needed. Requesting unlimited approval...");
            await tokenContract.methods.approve(stakingContractAddress, maxUint256).send();
            await stakingContracts[token].methods.stake(amountToStake).send();
        }

        await updateTokenUI(token);
    } catch (error) {
        console.error(`Error staking tokens for ${token}:`, error);
        alert(`Staking failed: ${error.message || error}`);
    }
}

// Unstaking function
async function unstakeTokens(token) {
    try {
        const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
        if (!unstakeAmount || Number(unstakeAmount) <= 0) {
            alert('Please enter a valid amount to withdraw.');
            return;
        }
        await stakingContracts[token].methods.withdraw(tronWeb.toSun(unstakeAmount)).send();
        await updateTokenUI(token);
    } catch (error) {
        console.error(`Error unstaking tokens for ${token}:`, error);
        alert(`Withdraw failed: ${error.message || error}`);
    }
}

// Claim rewards function
async function claimRewards(token) {
    try {
        await stakingContracts[token].methods.claimReward().send();
        await updateTokenUI(token);
    } catch (error) {
        console.error(`Error claiming rewards for ${token}:`, error);
        alert(`Claim failed: ${error.message || error}`);
    }
}

// Attach staking action listeners
for (let key in tokenDetails) {
    const stakeBtn = document.getElementById(`stake-button-${key}`);
    const unstakeBtn = document.getElementById(`unstake-button-${key}`);
    const claimBtn = document.getElementById(`claim-rewards-button-${key}`);

    if (stakeBtn) {
        stakeBtn.addEventListener('click', async () => {
            const amount = document.getElementById(`stake-amount-${key}`).value;
            if (!amount || Number(amount) <= 0) {
                alert('Please enter a valid amount to stake.');
                return;
            }
            await stakeTokens(key, amount);
        });
    }

    if (unstakeBtn) {
        unstakeBtn.addEventListener('click', async () => {
            await unstakeTokens(key);
        });
    }

    if (claimBtn) {
        claimBtn.addEventListener('click', async () => {
            await claimRewards(key);
        });
    }
}

// Start initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initialize);
