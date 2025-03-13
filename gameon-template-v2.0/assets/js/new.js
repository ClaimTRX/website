let tronWeb, userAddress;
const stakingContracts = {};
const tokenContracts = {};
const maxUint256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

// Define contracts for StableX and CFT
const tokenDetails = {
    stablex: {
        tokenAddress: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS',
        stakingAddress: 'TRVn2h65VrbGb7zkASz3escJiHJWMSy7pV',
        decimals: null
    },
    cft: {
        tokenAddress: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS',
        stakingAddress: 'TUvHH8QtyXvMubLJRgKBdwfG7Y2TRLGSE6',
        decimals: 6,
        price: 0.27
    }
};

// DOMContentLoaded Event Listener
async function initialize() {
    document.getElementById('connect-button').addEventListener('click', connectWallet);
    if (await checkTronLinkInstalled()) {
        await initializeTronWeb();
        setInterval(updateAllUI, 60000); // Update UI every minute
    } else {
        console.error('TronLink is not installed.');
    }
}

document.addEventListener('DOMContentLoaded', initialize);

// Check if TronLink is installed
async function checkTronLinkInstalled() {
    return new Promise(resolve => {
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
    try {
        await tronLink.request({ method: 'tron_requestAccounts' });
        await initializeTronWeb();
    } catch (e) {
        console.error('Failed to connect to TronLink:', e);
    }
}

// Initialize TronWeb and Contracts
async function initializeTronWeb() {
    try {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        
        document.getElementById('connect-button').style.display = 'none';
        
        for (let key in tokenDetails) {
            let details = tokenDetails[key];
            tokenContracts[key] = await tronWeb.contract(tokenContractAbi, details.tokenAddress);
            stakingContracts[key] = await tronWeb.contract(stakingContractAbi, details.stakingAddress);
            if (!details.decimals) {
                tokenDetails[key].decimals = await tokenContracts[key].methods.decimals().call();
            }
        }
        
        await updateAllUI();
    } catch (error) {
        console.error('Error initializing TronWeb or Contracts:', error);
    }
}

// Update UI for all tokens
async function updateAllUI() {
    for (let key in tokenDetails) {
        await updateTokenUI(key);
    }
}

// Update UI for a specific token
async function updateTokenUI(token) {
    await updateAvailableTokens(token);
    await updateStakedAmount(token);
    await updateAPR(token);
    await updateClaimableRewards(token);
    await updateTotalClaimedRewards(token);
}

// Update available tokens
async function updateAvailableTokens(token) {
    try {
        const balanceRaw = await tokenContracts[token].methods.balanceOf(userAddress).call();
        const balance = Number(balanceRaw) / Math.pow(10, tokenDetails[token].decimals);
        document.getElementById(`available-tokens-${token}`).innerText = balance.toFixed(2);
    } catch (error) {
        console.error(`Error updating available tokens for ${token}:`, error);
    }
}

// Update staked amount
async function updateStakedAmount(token) {
    try {
        const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
        const stakedAmount = Number(stakedAmountRaw) / Math.pow(10, tokenDetails[token].decimals);
        document.getElementById(`staked-amount-${token}`).innerText = stakedAmount.toFixed(2);
    } catch (error) {
        console.error(`Error updating staked amount for ${token}:`, error);
    }
}

// Update APR
async function updateAPR(token) {
    try {
        const aprRaw = await stakingContracts[token].methods.viewAPR().call();
        document.getElementById(`estimated-apr-${token}`).innerText = (aprRaw / 1e4).toFixed(2) + ' %';
    } catch (error) {
        console.error(`Error updating APR for ${token}:`, error);
    }
}

// Update claimable rewards
async function updateClaimableRewards(token) {
    try {
        const claimableRewardsRaw = await stakingContracts[token].methods.viewPendingReward(userAddress).call();
        const claimableRewards = claimableRewardsRaw / Math.pow(10, tokenDetails[token].decimals);
        document.getElementById(`claimable-rewards-${token}`).innerText = claimableRewards.toFixed(2);
    } catch (error) {
        console.error(`Error updating claimable rewards for ${token}:`, error);
    }
}

// Update total claimed rewards
async function updateTotalClaimedRewards(token) {
    try {
        const totalClaimedRewardsRaw = await stakingContracts[token].methods.viewTotalClaimedRewards(userAddress).call();
        const totalClaimedRewards = totalClaimedRewardsRaw / Math.pow(10, tokenDetails[token].decimals);
        document.getElementById(`total-claimed-rewards-${token}`).innerText = totalClaimedRewards.toFixed(2);
    } catch (error) {
        console.error(`Error updating total claimed rewards for ${token}:`, error);
    }
}

// Staking function
async function stakeTokens(token, amount) {
    try {
        const amountToStake = tronWeb.toSun(amount);
        await tokenContracts[token].methods.approve(tokenDetails[token].stakingAddress, amountToStake).send();
        await stakingContracts[token].methods.stake(amountToStake).send();
        await updateTokenUI(token);
    } catch (error) {
        console.error(`Error staking tokens for ${token}:`, error);
    }
}

// Unstaking function
async function unstakeTokens(token) {
    try {
        const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
        await stakingContracts[token].methods.withdraw(tronWeb.toSun(unstakeAmount)).send();
        await updateTokenUI(token);
    } catch (error) {
        console.error(`Error unstaking tokens for ${token}:`, error);
    }
}

// Claim rewards function
async function claimRewards(token) {
    try {
        await stakingContracts[token].methods.claimReward().send();
        await updateTokenUI(token);
    } catch (error) {
        console.error(`Error claiming rewards for ${token}:`, error);
    }
}

// Attach event listeners dynamically
for (let key in tokenDetails) {
    document.getElementById(`stake-button-${key}`).addEventListener('click', async () => {
        const amount = document.getElementById(`stake-amount-${key}`).value;
        await stakeTokens(key, amount);
    });
    document.getElementById(`unstake-button-${key}`).addEventListener('click', async () => {
        await unstakeTokens(key);
    });
    document.getElementById(`claim-rewards-button-${key}`).addEventListener('click', async () => {
        await claimRewards(key);
    });
}
