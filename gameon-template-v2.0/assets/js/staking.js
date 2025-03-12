// Initialize TronWeb & Connect Wallet
async function initializeTronWeb() {
    if (!window.tronWeb) {
        console.error("TronWeb is not available. Please install TronLink.");
        return;
    }

    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    
    console.log('Connected to TronLink. User Address:', userAddress);
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;

    // Load Staking Contracts
    for (let token in stakingContractAddresses) {
        stakingContracts[token] = await tronWeb.contract(stakingContractAbi, stakingContractAddresses[token]);
    }

    updateAllUI();
}

// Delay function for smoother async operations
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Update all UI elements for each token
async function updateAllUI() {
    for (let token in stakingContracts) {
        await updateTokenUI(token);
    }
}

async function updateTokenUI(token) {
    await delay(400); await updateAvailableTokens(token);
    await delay(400); await updateStakedAmount(token);
    await delay(400); await updateEstimatedAPR(token);
    await delay(400); await updateClaimableRewards(token);
    await delay(400); await updateTotalClaimedRewards();
	await delay(400); await updateProjectedYearlyEarnings(token);
}

// ✅ Update available token balance
async function updateAvailableTokens(token) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
        const decimals = await tokenContract.methods.decimals().call();
        const balance = balanceRaw / Math.pow(10, decimals);

        document.getElementById(`available-tokens-${token}`).innerText = formatNumber(balance);
    } catch (error) {
        console.error(`Error fetching available tokens for ${token}:`, error);
    }
}

// ✅ Update staked amount
async function updateStakedAmount(token) {
    try {
        const stakedAmountRaw = await stakingContracts[token].methods.viewStakedAmount(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const stakedAmount = stakedAmountRaw / Math.pow(10, decimals);

        document.getElementById(`staked-amount-${token}`).innerText = formatWholeNumber(stakedAmount);
    } catch (error) {
        console.error(`Error fetching staked amount for ${token}:`, error);
    }
}

// ✅ Update estimated APR
async function updateEstimatedAPR(token) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const dailyRewardRaw = await stakingContracts[token].methods.viewDailyReward().call();
        const totalStakedRaw = await stakingContracts[token].methods.viewTotalStaked().call();

        const dailyReward = parseFloat(dailyRewardRaw) / Math.pow(10, decimals);
        const totalStaked = parseFloat(totalStakedRaw) / Math.pow(10, decimals);
        const apr = totalStaked > 0 ? ((dailyReward / totalStaked) * 365 * 100).toFixed(2) + '%' : 'N/A';

        document.getElementById(`estimated-apr-${token}`).innerText = apr;
    } catch (error) {
        console.error(`Error fetching APR for ${token}:`, error);
    }
}

// ✅ Update claimable rewards
async function updateClaimableRewards(token) {
    try {
        const claimableRewardsRaw = await stakingContracts[token].methods.viewPendingReward(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const claimableRewards = claimableRewardsRaw / Math.pow(10, decimals);

        document.getElementById(`claimable-rewards-${token}`).innerText = formatNumber(claimableRewards);
    } catch (error) {
        console.error(`Error fetching claimable rewards for ${token}:`, error);
    }
}

// ✅ Update projected yearly earnings
async function updateProjectedYearlyEarnings(token) {
    try {
        const projectedYearlyEarningsRaw = await stakingContracts[token].methods.viewProjectedRewardsForYear(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const projectedYearlyEarnings = projectedYearlyEarningsRaw / Math.pow(10, decimals);

        document.getElementById(`projected-yearly-earnings-${token}`).innerText = formatNumber(projectedYearlyEarnings);
    } catch (error) {
        console.error(`Error fetching projected yearly earnings for ${token}:`, error);
    }
}

// ✅ Update total claimed rewards
async function updateTotalClaimedRewards() {
    try {
        const totalClaimedRewardsRaw = await stakingContracts['token1'].methods.viewTotalClaimedRewards(userAddress).call();
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts['token1']);
        const decimals = await tokenContract.methods.decimals().call();
        const totalClaimedRewards = totalClaimedRewardsRaw / Math.pow(10, decimals);

        document.getElementById('total-claimed-rewards').innerText = formatNumber(totalClaimedRewards);
    } catch (error) {
        console.error('Error fetching total claimed rewards:', error);
    }
}

// ✅ Stake Tokens
async function stakeTokens(token, amount) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const stakingContractAddress = stakingContractAddresses[token];
        const decimals = await tokenContract.methods.decimals().call();
        const amountToStake = BigInt(amount) * BigInt(Math.pow(10, decimals));

        // Check allowance before staking
        const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
        const allowance = BigInt(allowanceRaw);

        if (allowance < amountToStake) {
            console.log("Approval needed. Requesting...");
            await tokenContract.methods.approve(stakingContractAddress, maxUint256).send();
            console.log("Approval granted!");
        }

        console.log("Staking tokens...");
        await stakingContracts[token].methods.stake(amountToStake.toString()).send();
        console.log("Tokens staked successfully!");

        updateStakedAmount(token);
    } catch (error) {
        console.error(`Error staking tokens for ${token}:`, error);
    }
}

// ✅ Unstake Tokens
async function unstakeTokens(token) {
    try {
        const unstakeAmount = document.getElementById(`withdraw-amount-${token}`).value;
        if (!unstakeAmount) return;

        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const decimals = await tokenContract.methods.decimals().call();
        const amountToUnstake = BigInt(unstakeAmount) * BigInt(Math.pow(10, decimals));

        await stakingContracts[token].methods.withdraw(amountToUnstake.toString()).send();
        updateStakedAmount(token);
    } catch (error) {
        console.error(`Error unstaking tokens for ${token}:`, error);
    }
}

// ✅ Claim Rewards
async function claimRewards(token) {
    try {
        await stakingContracts[token].methods.claimReward().send();
        updateClaimableRewards(token);
    } catch (error) {
        console.error(`Error claiming rewards for ${token}:`, error);
    }
}

// ✅ Format Numbers for UI
function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatWholeNumber(num) {
    return Math.floor(parseFloat(num)).toLocaleString('en-US');
}

