document.addEventListener("DOMContentLoaded", async () => {
    for (let token in stakingContractAddresses) {
        document.getElementById(`stake-button-${token}`).addEventListener('click', async () => {
            const stakeAmount = document.getElementById(`stake-amount-${token}`).value;
            if (stakeAmount) {
                await stakeTokens(token, stakeAmount);
            }
        });

        document.getElementById(`claim-rewards-button-${token}`).addEventListener('click', async () => {
            await claimRewards(token);
        });
    }
});

async function stakeTokens(token, amount) {
    try {
        const tokenContract = await tronWeb.contract(tokenContractAbi, tokenContracts[token]);
        const stakingContractAddress = stakingContractAddresses[token];
        const amountToStake = BigInt(amount) * BigInt(1e6);

        const allowanceRaw = await tokenContract.methods.allowance(userAddress, stakingContractAddress).call();
        if (BigInt(allowanceRaw) < amountToStake) {
            await tokenContract.methods.approve(stakingContractAddress, maxUint256).send();
        }

        await stakingContracts[token].methods.stake(amountToStake.toString()).send();
    } catch (error) {
        console.error(`Error staking ${token}:`, error);
    }
}

async function claimRewards(token) {
    try {
        await stakingContracts[token].methods.claimReward().send();
    } catch (error) {
        console.error(`Error claiming rewards for ${token}:`, error);
    }
}
