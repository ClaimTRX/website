document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);

    if (await checkTronLinkInstalled()) {
        await initializeTronWeb();
        setInterval(updateAllUI, 60000); // Update UI every minute
    } else {
        console.error('TronLink is not installed.');
    }

    // Add event listeners for staking actions
    document.getElementById('stake-button-token1').addEventListener('click', async () => {
        const stakeAmount = document.getElementById('stake-amount-token1').value;
        if (stakeAmount) {
            await stakeTokens('token1', stakeAmount);
            setTimeout(updateAllUI, 4000);
        }
    });

    document.getElementById('unstake-button-token1').addEventListener('click', async () => {
        await unstakeTokens('token1');
        setTimeout(updateAllUI, 4000);
    });

    document.getElementById('claim-rewards-button-token1').addEventListener('click', async () => {
        await claimRewards('token1');
        setTimeout(updateAllUI, 4000);
    });

    // "Max" button functionality
    document.getElementById('max-stake-token1').addEventListener('click', async (e) => {
        e.preventDefault();
        const token = 'token1';
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
        const decimals = await tokenContract.methods.decimals().call();
        const balance = balanceRaw / Math.pow(10, decimals);
        document.getElementById('stake-amount-token1').value = balance;
    });

    document.getElementById('max-withdraw-token1').addEventListener('click', async (e) => {
        e.preventDefault();
        const token = 'token1';
        const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const stakedAmount = stakedAmountRaw / Math.pow(10, decimals);
        document.getElementById('withdraw-amount-token1').value = stakedAmount;
    });
});

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

	    document.addEventListener("DOMContentLoaded", async function () {
    const connectButton = document.getElementById("connect-button");

    async function connectWallet() {
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
            userAddress = window.tronWeb.defaultAddress.base58;
            console.log("Connected to TronLink:", userAddress);

            connectButton.innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
        } else {
            
        }
    }

    connectButton.addEventListener("click", async () => {
        if (window.tronLink) {
            try {
                await window.tronLink.request({ method: "tron_requestAccounts" });
                connectWallet();
            } catch (e) {
                console.error("Failed to connect to TronLink:", e);
            }
        } else {
            
        }
    });

    // Check connection status on page load
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        connectWallet();
    }
});



// Connect wallet
async function connectWallet() {
    try {
        await tronLink.request({ method: 'tron_requestAccounts' });
        await initializeTronWeb();
    } catch (e) {
        console.error('Failed to connect to TronLink:', e);
    }
}

// Initialize TronWeb and contracts
