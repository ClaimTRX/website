
const tokenContractAddress = 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA';
const stakingContractAddress = 'TPLECu1WkQnQS5Hnm97TwxsWJYpr6ZeGcA';

const priceCFT = 1; // USD per CFT
const priceTRX = 1; // USD per TRX
let stakingContract, tokenContract;

const stakingContractAbi = [
        {
          "inputs": [
            {"internalType": "address", "name": "_stakingToken", "type": "address"},
            {"internalType": "uint256", "name": "_dailyReward", "type": "uint256"}
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
          ],
          "name": "Staked",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
          ],
          "name": "Withdrawn",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256"}
          ],
          "name": "RewardClaimed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
          ],
          "name": "OwnerWithdrawn",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
          ],
          "name": "OwnerStakedTokenWithdrawn",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
          "name": "stake",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
          "name": "withdraw",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {"inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", "type": "function"},
        {
          "inputs": [],
          "name": "rewardPerToken",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
          "name": "earned",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
          "name": "viewProjectedRewardsForYear",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "viewTotalUnclaimedRewards",
          "outputs": [{"internalType": "uint256", "name": "totalUnclaimedRewards", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "viewTotalStaked",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
          "name": "viewStakedAmount",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
          "name": "viewPendingReward",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "viewDailyReward",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
          "name": "viewTotalClaimedRewards",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_dailyReward", "type": "uint256"}],
          "name": "setDailyReward",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
          "name": "ownerWithdraw",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
          "name": "ownerWithdrawStakedTokens",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {"stateMutability": "payable", "type": "receive"}
      ];
const tokenContractAbi = [
        {"inputs": [], "stateMutability": "nonpayable", "type": "constructor"},
        {
          "inputs": [],
          "name": "name",
          "outputs": [{"internalType": "string", "name": "", "type": "string"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [{"internalType": "string", "name": "", "type": "string"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "decimals",
          "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "totalSupply",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "taxAddress",
          "outputs": [{"internalType": "address", "name": "", "type": "address"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "taxRate",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "", "type": "address"}],
          "name": "whitelist",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "address", "name": "", "type": "address"},
            {"internalType": "address", "name": "", "type": "address"}
          ],
          "name": "allowance",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "address", "name": "_to", "type": "address"},
            {"internalType": "uint256", "name": "_value", "type": "uint256"}
          ],
          "name": "transfer",
          "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "address", "name": "_spender", "type": "address"},
            {"internalType": "uint256", "name": "_value", "type": "uint256"}
          ],
          "name": "approve",
          "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "address", "name": "_from", "type": "address"},
            {"internalType": "address", "name": "_to", "type": "address"},
            {"internalType": "uint256", "name": "_value", "type": "uint256"}
          ],
          "name": "transferFrom",
          "outputs": [{"internalType": "bool", "name": "success", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "uint256", "name": "_taxRate", "type": "uint256"}],
          "name": "setTaxRate",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [{"internalType": "address", "name": "_taxAddress", "type": "address"}],
          "name": "setTaxAddress",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {"internalType": "address", "name": "_account", "type": "address"},
            {"internalType": "bool", "name": "_isWhitelisted", "type": "bool"}
          ],
          "name": "updateWhitelist",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
          ],
          "name": "Transfer",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
            {"indexed": true, "internalType": "address", "name": "spender", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "value", "type": "uint256"}
          ],
          "name": "Approval",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "oldRate", "type": "uint256"},
            {"indexed": false, "internalType": "uint256", "name": "newRate", "type": "uint256"}
          ],
          "name": "TaxRateChanged",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": false, "internalType": "address", "name": "oldAddress", "type": "address"},
            {"indexed": false, "internalType": "address", "name": "newAddress", "type": "address"}
          ],
          "name": "TaxAddressChanged",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {"indexed": true, "internalType": "address", "name": "account", "type": "address"},
            {"indexed": false, "internalType": "bool", "name": "isWhitelisted", "type": "bool"}
          ],
          "name": "WhitelistUpdated",
          "type": "event"
        }
      ];
document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('connect-button').addEventListener('click', connectWallet);
    if (await checkTronLinkInstalled()) await initializeTronWeb();

    document.getElementById('stake-button-token2').addEventListener('click', () => stakeTokens('token2'));
    document.getElementById('unstake-button-token2').addEventListener('click', () => unstakeTokens('token2'));
    document.getElementById('claim-rewards-button-token2').addEventListener('click', () => claimRewards('token2'));
});

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

async function connectWallet() {
    try {
        await window.tronLink.request({ method: 'tron_requestAccounts' });
        await initializeTronWeb();
    } catch (e) {
        console.error('Failed to connect to TronLink:', e);
    }
}

async function initializeTronWeb() {
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    document.getElementById('connect-button').innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
    stakingContract = await tronWeb.contract(stakingContractAbi, stakingContractAddress);
    tokenContract = await tronWeb.contract(tokenContractAbi, tokenContractAddress);
    setInterval(updateUI, 60000);
    await updateUI();
}

async function updateUI() {
    await updateAvailableTokens('token2');
    await updateStakedAmount('token2');
    await updateEstimatedAPR('token2');
    await updateClaimableRewards('token2');
    await updateTotalClaimedRewards('token2');
}

async function updateAvailableTokens(token) {
    const balanceRaw = await tokenContract.methods.balanceOf(userAddress).call();
    const decimals = await tokenContract.methods.decimals().call();
    document.getElementById(`available-tokens-${token}`).innerText = formatNumber(balanceRaw / 10 ** decimals);
}

async function updateStakedAmount(token) {
    const stakedAmountRaw = await stakingContract.methods.viewStakedAmount(userAddress).call();
    const decimals = await tokenContract.methods.decimals().call();
    document.getElementById(`staked-amount-${token}`).innerText = formatWholeNumber(stakedAmountRaw / 10 ** decimals);
}

async function updateEstimatedAPR(token) {
    const projectedRewardsRaw = await stakingContract.methods.viewProjectedRewardsForYear(userAddress).call();
    const projectedRewardsTRX = parseFloat(tronWeb.fromSun(projectedRewardsRaw));
    const stakedAmountRaw = await stakingContract.methods.viewStakedAmount(userAddress).call();
    const decimals = await tokenContract.methods.decimals().call();
    const stakedAmountCFT = parseFloat(stakedAmountRaw) / 10 ** decimals;
    const apr = stakedAmountCFT > 0 ? ((projectedRewardsTRX * priceTRX) / (stakedAmountCFT * priceCFT) * 100).toFixed(2) + '%' : 'N/A';
    document.getElementById(`estimated-apr-${token}`).innerText = apr;
}

async function updateClaimableRewards(token) {
    const claimableRewardsRaw = await stakingContract.methods.viewPendingReward(userAddress).call();
    document.getElementById(`claimable-rewards-${token}`).innerText = formatNumber(tronWeb.fromSun(claimableRewardsRaw)) + ' TRX';
}

async function updateTotalClaimedRewards(token) {
    const totalClaimedRaw = await stakingContract.methods.viewTotalClaimedRewards(userAddress).call();
    document.getElementById(`total-claimed-rewards-${token}`).innerText = formatNumber(tronWeb.fromSun(totalClaimedRaw));
}

async function stakeTokens(token) {
    const amount = document.getElementById(`stake-amount-${token}`).value;
    const decimals = await tokenContract.methods.decimals().call();
    const amountToStake = BigInt(amount) * BigInt(10 ** decimals);
    await tokenContract.methods.approve(stakingContractAddress, maxUint256).send();
    await stakingContract.methods.stake(amountToStake.toString()).send();
    setTimeout(updateUI, 3000);
}

async function unstakeTokens(token) {
    const amount = document.getElementById(`withdraw-amount-${token}`).value;
    const decimals = await tokenContract.methods.decimals().call();
    const amountToUnstake = BigInt(amount) * BigInt(10 ** decimals);
    await stakingContract.methods.withdraw(amountToUnstake.toString()).send();
    setTimeout(updateUI, 3000);
}

async function claimRewards(token) {
    await stakingContract.methods.claimReward().send();
    setTimeout(updateUI, 3000);
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatWholeNumber(num) {
    return Math.floor(parseFloat(num)).toLocaleString('en-US');
}
