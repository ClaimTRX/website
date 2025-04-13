// Constants
const SUNSWAP_ROUTER = 'TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR';
const WTRX_ADDRESS = 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR';

const TOKENS = {
    TRX: 'TRX',
    KING: 'TMFNzkJaj573F62s4bWmfonKwGcosAA8fE',
    CFT: 'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA',
    BBT: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    JM: 'TVHH59uHVpHzLDMFFpUgCx2dNAQqCzPhcR',
    PROS: 'TFf1aBoNFqxN32V2NQdvNrXVyYCy9qY8p1',
    SUN: 'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S',
    WIN: 'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
    USDD: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
    TWX: 'TTFreuJ4pYDaCeEMEtiR1GQDwPPrS4jKFk',
    ARB: 'TMGrV13RDQQWE37E2Fp6oqRHVWD66AbN2L',
    JST: 'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9',
    TEM: 'TFuEe2QMB8J1rfwNhAwjRSwoFivMcU5N75',
    TUSD: 'TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4',
    BTC: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'
};

const DECIMALS = {
    TRX: 6, KING: 6, CFT: 6, BBT: 8, USDT: 6, PROS: 18, JM: 8, USDD: 18, SUN: 18,
    WIN: 6, TWX: 18, ARB: 6, JST: 18, TEM: 6, TUSD: 18, BTC: 8
};

const POOLS = {
    'TRX-KING': { addr: 'TQ2HCSvpir3ELSJg3J2wKG6TskePh74rz8', token0: 'KING', token1: 'WTRX' },
    'CFT-KING': { addr: 'TRRevVDqvM31DdUQb73qViCEcDyCffYJTA', token0: 'CFT', token1: 'KING' },
    'CFT-BBT': { addr: 'TLWPwGteW4gZ1AU5CWCPYmfLdEm8yqduNb', token0: 'CFT', token1: 'BBT' },
    'TRX-BBT': { addr: 'TTJ9VB8kUptB1bztysnQZtcqaR5cYCbzAW', token0: 'BBT', token1: 'WTRX' },
    'TRX-USDT': { addr: 'TFGDbUyP8xez44C76fin3bn3Ss6jugoUwJ', token0: 'WTRX', token1: 'USDT' },
    'PROS-TRX': { addr: 'TVcaFufasLEzZ8hyyRwtz5aK8ae5E76rGi', token0: 'PROS', token1: 'WTRX' },
    'PROS-USDT': { addr: 'TQNyKQSSWTyN98zd8iMXgtsmTknXfEqaFV', token0: 'PROS', token1: 'USDT' },
    'JM-TRX': { addr: 'TNyDrrafFWR8nWPfrJqZkcc7qFhb8UKio2', token0: 'WTRX', token1: 'JM' },
    'JM-PROS': { addr: 'TNcGWGJySGrWavPnq4g6Pw3EKhUGacJDvU', token0: 'PROS', token1: 'JM' },
    'PROS-SUN': { addr: 'TKJH4nF2v8TX7VjzyhSigaHrDP3toh21iU', token0: 'PROS', token1: 'SUN' },
    'PROS-USDD': { addr: 'TA13jjXLmj72cNiDMm9Z4xuAa2d988PDd7', token0: 'PROS', token1: 'USDD' },
    'SUN-USDT': { addr: 'TTdeCobmYxhfFBYUZbiQqbZ56zrFkSE5DG', token0: 'USDT', token1: 'SUN' },
    'SUN-TRX': { addr: 'THu6ConqvZ3phYHeNTDyW9aE3pGypwBsP6', token0: 'WTRX', token1: 'SUN' },
    'TRX-USDD': { addr: 'TEjpEVwm3Xr5VHfa2CWYLqcyKZEGE9CGUz', token0: 'WTRX', token1: 'USDD' },
    'WIN-USDT': { addr: 'TC1GhhC5iGFLuuUthriuUu183P8YWPmQsK', token0: 'WIN', token1: 'USDT' },
    'WIN-PROS': { addr: 'TAeSpozQr3JyuYnuQmDB75GPvDzvXXe7LR', token0: 'PROS', token1: 'WIN' },
    'WIN-TRX': { addr: 'TDq9PCXQM5RfpN14T8sc6ePYJRFecPJCut', token0: 'WIN', token1: 'WTRX' },
    'TWX-TRX': { addr: 'TGfr9GrRLadatJj1d69D6B7JH6RFEvmvsh', token0: 'WTRX', token1: 'TWX' },
    'TWX-CFT': { addr: 'TE5X2A4rhXyoSheojRGiqow5qjapSQdrPY', token0: 'CFT', token1: 'TWX' },
    'ARB-TRX': { addr: 'TXHmQG2XQNvn6uFyJJBSxhKFVZFESbJYAb', token0: 'ARB', token1: 'WTRX' },
    'ARB-TWX': { addr: 'TSMLAjkrUYmyYeBFoWiSsMp2YMdm9MYGqb', token0: 'ARB', token1: 'TWX' },
    'ARB-KING': { addr: 'TN6CLkCjBmURXg4Q39VjrTZooxcCMj7f5N', token0: 'KING', token1: 'ARB' },
    'ARB-JM': { addr: 'TNDcGUzMa4bYqCof2bYs4NZgktTx6Ymdtp', token0: 'ARB', token1: 'JM' },
    'JST-TRX': { addr: 'TUDo1PuMG6j4aDSg6rsCNiz5gR5cnQaNTT', token0: 'JST', token1: 'WTRX' },
    'JST-USDT': { addr: 'TW68dBGdy9gtk16BfzmvaCZ9pEti3KFkk2', token0: 'JST', token1: 'USDT' },
    'JST-PROS': { addr: 'TEFiG7LFnAMedthyUXTMDZz777Cmj3Mnpe', token0: 'JST', token1: 'PROS' },
    'ARB-CFT': { addr: 'TXw4Yj38EXzmk6MDxMSDyKnauS89Bpcv1P', token0: 'CFT', token1: 'ARB' },
    'ARB-TEM': { addr: 'TSwf1LFcwCax2ArKvQfv3uXXCNdPgb8b4N', token0: 'TEM', token1: 'ARB' },
    'TRX-TEM': { addr: 'TEJAugHke9ahqaDPBoz4ZRQPz5qpu8cDua', token0: 'TEM', token1: 'WTRX' },
    'CFT-TEM': { addr: 'TKNxcR2i2G191XEJpC3PpFTm9TvMvbww3R', token0: 'CFT', token1: 'TEM' },
    'TRX-TUSD': { addr: 'TMr7LizLihDymctG2w2ezLxjZDrv9S53p6', token0: 'WTRX', token1: 'TUSD' },
    'USDT-TUSD': { addr: 'TR4fHizLc7xCy6v1UVdTqLxYzTW1QHCds6', token0: 'USDT', token1: 'TUSD' },
    'TUSD-PROS': { addr: 'TBdUFz5UkMTxkd78fyudovYkpMT47hriqb', token0: 'PROS', token1: 'TUSD' },
    'BTC-USDT': { addr: 'TTQpjqQUjMJjF3MAvWWVURn3YrRxg2quTM', token0: 'BTC', token1: 'USDT' },
    'BTC-PROS': { addr: 'THW2KCE2rxPiusv5QzZ85ZmFKqf9JEYtWi', token0: 'PROS', token1: 'BTC' }
};

const ROUTER_ABI = [
    {"outputs": [{"name": "amounts", "type": "uint256[]"}], "inputs": [{"name": "amountIn", "type": "uint256"}, {"name": "amountOutMin", "type": "uint256"}, {"name": "path", "type": "address[]"}, {"name": "to", "type": "address"}, {"name": "deadline", "type": "uint256"}], "name": "swapExactTokensForTokens", "stateMutability": "nonpayable", "type": "function"}
];

const RESERVES_ABI = [
    {"constant": true, "inputs": [], "name": "getReserves", "outputs": [{"name": "_reserve0", "type": "uint112"}, {"name": "_reserve1", "type": "uint112"}, {"name": "_blockTimestampLast", "type": "uint32"}], "payable": false, "stateMutability": "view", "type": "function"}
];

const ERC20_ABI = [
    {"constant": true, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},
    {"constant": true, "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}], "name": "allowance", "outputs": [{"name": "remaining", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},
    {"constant": false, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "approve", "outputs": [{"name": "success", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"},
    {"constant": false, "inputs": [], "name": "deposit", "outputs": [], "payable": true, "stateMutability": "payable", "type": "function"}
];

// Global variables
let tronWeb;
let userAddress;
let isWalletConnected = false;

// Function to format numbers with 2 decimals and thousand separators
function formatNumber(num) {
    return Number(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Connect to TronLink wallet
async function connectWallet() {
    const connectButton = document.getElementById('connect-button');
    try {
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
            tronWeb = window.tronWeb;
            userAddress = tronWeb.defaultAddress.base58;
            isWalletConnected = true;
            connectButton.textContent = 'Wallet Connected';
            connectButton.disabled = true;
            populateTokenSelectors();
            await updateBalances();
        } else if (window.tronWeb) {
            await window.tronWeb.request({ method: 'tron_requestAccounts' });
            tronWeb = window.tronWeb;
            userAddress = tronWeb.defaultAddress.base58;
            isWalletConnected = true;
            connectButton.textContent = 'Wallet Connected';
            connectButton.disabled = true;
            populateTokenSelectors();
            await updateBalances();
        } else {
            alert('TronLink is not installed. Please install the TronLink extension.');
        }
    } catch (error) {
        alert('Failed to connect to TronLink. Please ensure you are logged in.');
        console.error(error);
    }
}

// Populate token selectors
function populateTokenSelectors() {
    const fromSelect = document.getElementById('from-token');
    const toSelect = document.getElementById('to-token');

    Object.keys(TOKENS).forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.text = token;
        fromSelect.appendChild(option.cloneNode(true));
    });

    updateToDropdown('CFT');

    fromSelect.value = 'CFT';
    toSelect.value = 'KING';
}

// Update "To" dropdown
function updateToDropdown(fromToken) {
    const toSelect = document.getElementById('to-token');
    toSelect.innerHTML = '';

    const pairedTokens = new Set();
    Object.keys(POOLS).forEach(poolKey => {
        const [tokenA, tokenB] = poolKey.split('-');
        if (tokenA === fromToken) {
            pairedTokens.add(tokenB);
        } else if (tokenB === fromToken) {
            pairedTokens.add(tokenA);
        }
    });

    pairedTokens.forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.text = token;
        toSelect.appendChild(option);
    });

    if (pairedTokens.size > 0) {
        toSelect.value = Array.from(pairedTokens)[0];
    }
}

// Update "From" dropdown
function updateFromDropdown(toToken) {
    const fromSelect = document.getElementById('from-token');
    fromSelect.innerHTML = '';

    const pairedTokens = new Set();
    Object.keys(POOLS).forEach(poolKey => {
        const [tokenA, tokenB] = poolKey.split('-');
        if (tokenA === toToken) {
            pairedTokens.add(tokenB);
        } else if (tokenB === toToken) {
            pairedTokens.add(tokenA);
        }
    });

    pairedTokens.forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.text = token;
        fromSelect.appendChild(option);
    });

    if (pairedTokens.size > 0) {
        fromSelect.value = Array.from(pairedTokens)[0];
    }
}

// Fetch reserves
async function fetchReserves(poolAddress) {
    try {
        const contract = await tronWeb.contract(RESERVES_ABI, poolAddress);
        const reserves = await contract.getReserves().call();
        return {
            reserve0: BigInt(reserves._reserve0),
            reserve1: BigInt(reserves._reserve1)
        };
    } catch (error) {
        console.error('Error in fetchReserves:', error);
        document.getElementById('status-msg').textContent = 'Failed to fetch pool reserves.';
        throw error;
    }
}

// Calculate output amount
function getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * BigInt(997);
    const numerator = amountInWithFee * reserveOut;
    const denominator = (reserveIn * BigInt(1000)) + amountInWithFee;
    return numerator / denominator;
}

// Check token allowance
async function checkAllowance(tokenAddress, owner, spender) {
    try {
        const contract = await tronWeb.contract(ERC20_ABI, tokenAddress);
        const allowance = await contract.allowance(owner, spender).call();
        return BigInt(allowance);
    } catch (error) {
        console.error('Error in checkAllowance:', error);
        document.getElementById('status-msg').textContent = 'Failed to check allowance.';
        throw error;
    }
}

// Approve token spending
async function approveToken(tokenAddress, amountInBigInt) {
    if (!isWalletConnected) {
        alert('Please connect your wallet first.');
        return false;
    }

    const contract = await tronWeb.contract(ERC20_ABI, tokenAddress);
    try {
        document.getElementById('status-msg').textContent = 'Approving token...';
        await contract.approve(SUNSWAP_ROUTER, amountInBigInt.toString()).send({ feeLimit: 100000000 });
        document.getElementById('status-msg').textContent = 'Approval successful!';
        return true;
    } catch (error) {
        console.error('Error in approveToken:', error);
        document.getElementById('status-msg').textContent = 'Approval failed: ' + (error.message || 'Unknown error');
        throw error;
    }
}

// Wrap TRX to WTRX
async function wrapTRX(amountInBigInt) {
    const contract = await tronWeb.contract(ERC20_ABI, WTRX_ADDRESS);
    try {
        document.getElementById('status-msg').textContent = 'Wrapping TRX to WTRX...';
        await contract.deposit().send({
            callValue: amountInBigInt.toString(),
            feeLimit: 100000000
        });
        document.getElementById('status-msg').textContent = 'TRX wrapped successfully!';
        return true;
    } catch (error) {
        console.error('Error in wrapTRX:', error);
        document.getElementById('status-msg').textContent = 'Wrapping failed: ' + (error.message || 'Unknown error');
        throw error;
    }
}

// Update balances
async function updateBalances() {
    if (!isWalletConnected) {
        document.getElementById('rate-info').textContent = 'Balance: 0';
        return;
    }

    const tokenFrom = document.getElementById('from-token').value;

    try {
        let balance;
        if (tokenFrom === 'TRX') {
            balance = await tronWeb.trx.getBalance(userAddress);
        } else {
            const contract = await tronWeb.contract(ERC20_ABI, TOKENS[tokenFrom]);
            balance = await contract.balanceOf(userAddress).call();
        }

        const formattedBalance = balance
            ? formatNumber(Number(balance) / 10 ** DECIMALS[tokenFrom])
            : '0';
        document.getElementById('rate-info').textContent = `Balance: ${formattedBalance} ${tokenFrom}`;
    } catch (error) {
        console.error('Error in updateBalances:', error);
        document.getElementById('rate-info').textContent = `Balance: 0 ${tokenFrom}`;
    }
}

// Update expected output and rate
async function updateExpectedOutput() {
    if (!isWalletConnected) {
        document.getElementById('to-amount').value = '';
        document.getElementById('rate-info').textContent = 'Balance: 0';
        return;
    }

    const tokenFrom = document.getElementById('from-token').value;
    const tokenTo = document.getElementById('to-token').value;
    let amountIn = document.getElementById('from-amount').value;

    if (!tokenFrom || !tokenTo || !amountIn) {
        document.getElementById('to-amount').value = '';
        document.getElementById('rate-info').textContent = `Balance: 0 ${tokenFrom}`;
        return;
    }

    amountIn = parseFloat(amountIn.replace(/,/g, ''));

    const possibleKey1 = `${tokenFrom}-${tokenTo}`;
    const possibleKey2 = `${tokenTo}-${tokenFrom}`;
    const pool = POOLS[possibleKey1] || POOLS[possibleKey2];

    if (!pool) {
        document.getElementById('to-amount').value = 'No direct pool';
        document.getElementById('rate-info').textContent = `Balance: 0 ${tokenFrom}`;
        return;
    }

    try {
        const reserves = await fetchReserves(pool.addr);
        const isToken0From = (tokenFrom === 'TRX' ? WTRX_ADDRESS : TOKENS[tokenFrom]) === TOKENS[pool.token0];
        const reserveIn = isToken0From ? reserves.reserve0 : reserves.reserve1;
        const reserveOut = isToken0From ? reserves.reserve1 : reserves.reserve0;

        const amountInBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[tokenFrom]));
        const amountOutBigInt = getAmountOut(amountInBigInt, reserveIn, reserveOut);
        const amountOut = Number(amountOutBigInt) / 10 ** DECIMALS[tokenTo];

        const formattedAmountOut = formatNumber(amountOut);
        document.getElementById('to-amount').value = formattedAmountOut;

        const rate = amountOut / amountIn;
        const formattedRate = formatNumber(rate);
        document.getElementById('rate-info').textContent = `Rate: 1 ${tokenFrom} = ${formattedRate} ${tokenTo}`;
        window.expectedOutBigInt = amountOutBigInt;
        window.amountInBigInt = amountInBigInt;
    } catch (error) {
        console.error('Error in updateExpectedOutput:', error);
        document.getElementById('to-amount').value = 'Error';
        document.getElementById('rate-info').textContent = `Balance: 0 ${tokenFrom}`;
    }
}

// Execute the swap
async function executeSwap() {
    if (!isWalletConnected) {
        alert('Please connect your wallet first.');
        return;
    }

    const tokenFrom = document.getElementById('from-token').value;
    const tokenTo = document.getElementById('to-token').value;
    const amountIn = document.getElementById('from-amount').value;

    if (!amountIn) {
        document.getElementById('status-msg').textContent = 'Please enter an amount.';
        return;
    }

    let tokenAddress = tokenFrom === 'TRX' ? WTRX_ADDRESS : TOKENS[tokenFrom];
    const amountInBigInt = window.amountInBigInt;

    try {
        if (tokenFrom === 'TRX') {
            await wrapTRX(amountInBigInt);
        } else {
            const allowance = await checkAllowance(tokenAddress, userAddress, SUNSWAP_ROUTER);
            if (allowance < amountInBigInt) {
                await approveToken(tokenAddress, amountInBigInt);
            }
        }

        const slippage = 1;
        const minOutBigInt = window.expectedOutBigInt * BigInt(100 - slippage) / BigInt(100);
        const path = [tokenFrom === 'TRX' ? WTRX_ADDRESS : TOKENS[tokenFrom], TOKENS[tokenTo]];
        const deadline = Math.floor(Date.now() / 1000) + 600;

        const router = await tronWeb.contract(ROUTER_ABI, SUNSWAP_ROUTER);

        document.getElementById('status-msg').textContent = 'Processing swap...';
        const tx = await router.swapExactTokensForTokens(
            amountInBigInt.toString(),
            minOutBigInt.toString(),
            path,
            userAddress,
            deadline
        ).send({ feeLimit: 100000000 });

        document.getElementById('status-msg').textContent = `Swap successful! TX: ${tx}`;
        await updateBalances();
        await updateExpectedOutput();
    } catch (error) {
        console.error('Error in executeSwap:', error);
        document.getElementById('status-msg').textContent = 'Swap failed: ' + (error.message || 'Unknown error');
    }
}

// Event listeners
document.getElementById('connect-button').addEventListener('click', connectWallet);
document.getElementById('from-token').addEventListener('change', async () => {
    const fromToken = document.getElementById('from-token').value;
    updateToDropdown(fromToken);
    await updateBalances();
    await updateExpectedOutput();
});
document.getElementById('to-token').addEventListener('change', async () => {
    const toToken = document.getElementById('to-token').value;
    updateFromDropdown(toToken);
    await updateBalances();
    await updateExpectedOutput();
});
document.getElementById('from-amount').addEventListener('input', updateExpectedOutput);
document.getElementById('swap-button').addEventListener('click', executeSwap);

// Auto-connect wallet on page refresh
if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    connectWallet();
}
