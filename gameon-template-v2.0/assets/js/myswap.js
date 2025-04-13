// Constants from the arbitrage bot code
const SUNSWAP_ROUTER = 'TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR';

const TOKENS = {
    WTRX: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
    KING: 'TMFNzkJaj573F62s4bWmfonKwGcosAA8fE',
    CFT:  'TAQzALyftaynnr3VG3rCvzkY2KouFH79sA',
    BBT:  'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    JM:   'TVHH59uHVpHzLDMFFpUgCx2dNAQqCzPhcR',
    PROS: 'TFf1aBoNFqxN32V2NQdvNrXVyYCy9qY8p1',
    SUN:  'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S',
    WIN:  'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7',
    USDD: 'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn',
    TWX:  'TTFreuJ4pYDaCeEMEtiR1GQDwPPrS4jKFk',
    ARB:  'TMGrV13RDQQWE37E2Fp6oqRHVWD66AbN2L',
    JST:  'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9',
    TEM:  'TFuEe2QMB8J1rfwNhAwjRSwoFivMcU5N75',
    TUSD: 'TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4',
    BTC:  'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9'
};

const DECIMALS = {
    WTRX: 6, KING: 6, CFT: 6, BBT: 8, USDT: 6, PROS: 18, JM: 8, USDD: 18, SUN: 18,
    WIN: 6, TWX: 18, ARB: 6, JST: 18, TEM: 6, TUSD: 18, BTC: 8
};

const POOLS = {
    'WTRX-KING': { addr: 'TQ2HCSvpir3ELSJg3J2wKG6TskePh74rz8', token0: 'KING', token1: 'WTRX' },
    'CFT-KING':  { addr: 'TRRevVDqvM31DdUQb73qViCEcDyCffYJTA', token0: 'CFT', token1: 'KING' },
    'CFT-BBT':   { addr: 'TLWPwGteW4gZ1AU5CWCPYmfLdEm8yqduNb', token0: 'CFT', token1: 'BBT' },
    'WTRX-BBT':  { addr: 'TTJ9VB8kUptB1bztysnQZtcqaR5cYCbzAW', token0: 'BBT', token1: 'WTRX' },
    'WTRX-USDT': { addr: 'TFGDbUyP8xez44C76fin3bn3Ss6jugoUwJ', token0: 'WTRX', token1: 'USDT' },
    'PROS-WTRX': { addr: 'TVcaFufasLEzZ8hyyRwtz5aK8ae5E76rGi', token0: 'PROS', token1: 'WTRX' },
    'PROS-USDT': { addr: 'TQNyKQSSWTyN98zd8iMXgtsmTknXfEqaFV', token0: 'PROS', token1: 'USDT' },
    'JM-WTRX':   { addr: 'TNyDrrafFWR8nWPfrJqZkcc7qFhb8UKio2', token0: 'WTRX', token1: 'JM' },
    'JM-PROS':   { addr: 'TNcGWGJySGrWavPnq4g6Pw3EKhUGacJDvU', token0: 'PROS', token1: 'JM' },
    'PROS-SUN':  { addr: 'TKJH4nF2v8TX7VjzyhSigaHrDP3toh21iU', token0: 'PROS', token1: 'SUN' },
    'PROS-USDD': { addr: 'TA13jjXLmj72cNiDMm9Z4xuAa2d988PDd7', token0: 'PROS', token1: 'USDD' },
    'SUN-USDT':  { addr: 'TTdeCobmYxhfFBYUZbiQqbZ56zrFkSE5DG', token0: 'USDT', token1: 'SUN' },
    'SUN-WTRX':  { addr: 'THu6ConqvZ3phYHeNTDyW9aE3pGypwBsP6', token0: 'WTRX', token1: 'SUN' },
    'WTRX-USDD': { addr: 'TEjpEVwm3Xr5VHfa2CWYLqcyKZEGE9CGUz', token0: 'WTRX', token1: 'USDD' },
    'WIN-USDT':  { addr: 'TC1GhhC5iGFLuuUthriuUu183P8YWPmQsK', token0: 'WIN', token1: 'USDT' },
    'WIN-PROS':  { addr: 'TAeSpozQr3JyuYnuQmDB75GPvDzvXXe7LR', token0: 'PROS', token1: 'WIN' },
    'WIN-WTRX':  { addr: 'TDq9PCXQM5RfpN14T8sc6ePYJRFecPJCut', token0: 'WIN', token1: 'WTRX' },
    'TWX-WTRX':  { addr: 'TGfr9GrRLadatJj1d69D6B7JH6RFEvmvsh', token0: 'WTRX', token1: 'TWX' },
    'TWX-CFT':   { addr: 'TE5X2A4rhXyoSheojRGiqow5qjapSQdrPY', token0: 'CFT', token1: 'TWX' },
    'ARB-WTRX':  { addr: 'TXHmQG2XQNvn6uFyJJBSxhKFVZFESbJYAb', token0: 'ARB', token1: 'WTRX' },
    'ARB-TWX':   { addr: 'TSMLAjkrUYmyYeBFoWiSsMp2YMdm9MYGqb', token0: 'ARB', token1: 'TWX' },
    'ARB-KING':  { addr: 'TN6CLkCjBmURXg4Q39VjrTZooxcCMj7f5N', token0: 'KING', token1: 'ARB' },
    'ARB-JM':    { addr: 'TNDcGUzMa4bYqCof2bYs4NZgktTx6Ymdtp', token0: 'ARB', token1: 'JM' },
    'JST-WTRX':  { addr: 'TUDo1PuMG6j4aDSg6rsCNiz5gR5cnQaNTT', token0: 'JST', token1: 'WTRX' },
    'JST-USDT':  { addr: 'TW68dBGdy9gtk16BfzmvaCZ9pEti3KFkk2', token0: 'JST', token1: 'USDT' },
    'JST-PROS':  { addr: 'TEFiG7LFnAMedthyUXTMDZz777Cmj3Mnpe', token0: 'JST', token1: 'PROS' },
    'ARB-CFT':   { addr: 'TXw4Yj38EXzmk6MDxMSDyKnauS89Bpcv1P', token0: 'CFT', token1: 'ARB' },
    'ARB-TEM':   { addr: 'TSwf1LFcwCax2ArKvQfv3uXXCNdPgb8b4N', token0: 'TEM', token1: 'ARB' },
    'WTRX-TEM':  { addr: 'TEJAugHke9ahqaDPBoz4ZRQPz5qpu8cDua', token0: 'TEM', token1: 'WTRX' },
    'CFT-TEM':   { addr: 'TKNxcR2i2G191XEJpC3PpFTm9TvMvbww3R', token0: 'CFT', token1: 'TEM' },
    'WTRX-TUSD': { addr: 'TMr7LizLihDymctG2w2ezLxjZDrv9S53p6', token0: 'WTRX', token1: 'TUSD' },
    'USDT-TUSD': { addr: 'TR4fHizLc7xCy6v1UVdTqLxYzTW1QHCds6', token0: 'USDT', token1: 'TUSD' },
    'TUSD-PROS': { addr: 'TBdUFz5UkMTxkd78fyudovYkpMT47hriqb', token0: 'PROS', token1: 'TUSD' },
    'BTC-USDT':  { addr: 'TTQpjqQUjMJjF3MAvWWVURn3YrRxg2quTM', token0: 'BTC', token1: 'USDT' },
    'BTC-PROS':  { addr: 'THW2KCE2rxPiusv5QzZ85ZmFKqf9JEYtWi', token0: 'PROS', token1: 'BTC' }
};

const ROUTER_ABI = [
    {"outputs": [{"name": "amounts", "type": "uint256[]"}], "inputs": [{"name": "amountIn", "type": "uint256"}, {"name": "amountOutMin", "type": "uint256"}, {"name": "path", "type": "address[]"}, {"name": "to", "type": "address"}, {"name": "deadline", "type": "uint256"}], "name": "swapExactTokensForTokens", "stateMutability": "Nonpayable", "type": "Function"}
];

const RESERVES_ABI = [
    {"constant": true, "inputs": [], "name": "getReserves", "outputs": [{"name": "_reserve0", "type": "uint112"}, {"name": "_reserve1", "type": "uint112"}, {"name": "_blockTimestampLast", "type": "uint32"}], "payable": false, "stateMutability": "view", "type": "function"}
];

const ERC20_ABI = [
    {"constant": true, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function"},
    {"constant": true, "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}], "name": "allowance", "outputs": [{"name": "remaining", "type": "uint256"}], "type": "function"},
    {"constant": false, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "approve", "outputs": [{"name": "success", "type": "bool"}], "type": "function"}
];

// Global variables
let tronWeb;
let userAddress;

// Connect to TronLink wallet
async function connectWallet() {
    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;
        showSwapInterface();
    } else if (window.tronWeb) {
        try {
            await window.tronWeb.request({ method: 'tron_requestAccounts' });
            tronWeb = window.tronWeb;
            userAddress = tronWeb.defaultAddress.base58;
            showSwapInterface();
        } catch (error) {
            alert('Failed to connect to TronLink. Please ensure you are logged in.');
            console.error(error);
        }
    } else {
        alert('TronLink is not installed. Please install the TronLink extension.');
    }
}

// Show swap interface and initialize token dropdowns
function showSwapInterface() {
    document.getElementById('wallet-connect').style.display = 'none';
    document.getElementById('swap-interface').style.display = 'block';

    const tokenSelectFrom = document.getElementById('token-from');
    const tokenSelectTo = document.getElementById('token-to');
    Object.keys(TOKENS).forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.text = token;
        tokenSelectFrom.appendChild(option.cloneNode(true));
        tokenSelectTo.appendChild(option);
    });

    // Set default selections (e.g., WTRX to USDT)
    tokenSelectFrom.value = 'WTRX';
    tokenSelectTo.value = 'USDT';
    updateBalances();
    updateExpectedOutput();
}

// Fetch reserves for a pool
async function fetchReserves(poolAddress) {
    const contract = await tronWeb.contract(RESERVES_ABI, poolAddress);
    const reserves = await contract.getReserves().call();
    return {
        reserve0: BigInt(reserves._reserve0),
        reserve1: BigInt(reserves._reserve1)
    };
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
    const contract = await tronWeb.contract(ERC20_ABI, tokenAddress);
    const allowance = await contract.allowance(owner, spender).call();
    return BigInt(allowance);
}

// Approve token spending
async function approveToken() {
    const tokenFrom = document.getElementById('token-from').value;
    const amountIn = document.getElementById('amount-in').value;
    if (!amountIn) return;

    const tokenAddress = TOKENS[tokenFrom];
    const amountInBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[tokenFrom]));
    const contract = await tronWeb.contract(ERC20_ABI, tokenAddress);

    try {
        await contract.approve(SUNSWAP_ROUTER, amountInBigInt.toString()).send({ feeLimit: 100000000 });
        alert('Approval successful!');
        updateExpectedOutput(); // Refresh UI after approval
    } catch (error) {
        alert('Approval failed. Please try again.');
        console.error(error);
    }
}

// Update balances
async function updateBalances() {
    const tokenFrom = document.getElementById('token-from').value;
    const tokenTo = document.getElementById('token-to').value;

    const fromContract = await tronWeb.contract(ERC20_ABI, TOKENS[tokenFrom]);
    const toContract = await tronWeb.contract(ERC20_ABI, TOKENS[tokenTo]);

    const balanceFrom = await fromContract.balanceOf(userAddress).call();
    const balanceTo = await toContract.balanceOf(userAddress).call();

    document.getElementById('balance-from').textContent = `Balance: ${(Number(balanceFrom) / 10 ** DECIMALS[tokenFrom]).toFixed(2)} ${tokenFrom}`;
    document.getElementById('balance-to').textContent = `Balance: ${(Number(balanceTo) / 10 ** DECIMALS[tokenTo]).toFixed(2)} ${tokenTo}`;
}

// Update expected output and button visibility
async function updateExpectedOutput() {
    const tokenFrom = document.getElementById('token-from').value;
    const tokenTo = document.getElementById('token-to').value;
    const amountIn = document.getElementById('amount-in').value;

    if (!tokenFrom || !tokenTo || !amountIn) {
        document.getElementById('expected-out').textContent = '';
        document.getElementById('approve-btn').style.display = 'none';
        document.getElementById('swap-btn').style.display = 'none';
        return;
    }

    const possibleKey1 = `${tokenFrom}-${tokenTo}`;
    const possibleKey2 = `${tokenTo}-${tokenFrom}`;
    const pool = POOLS[possibleKey1] || POOLS[possibleKey2];

    if (!pool) {
        document.getElementById('expected-out').textContent = 'No direct pool available';
        document.getElementById('approve-btn').style.display = 'none';
        document.getElementById('swap-btn').style.display = 'none';
        return;
    }

    const reserves = await fetchReserves(pool.addr);
    const isToken0From = TOKENS[tokenFrom] === TOKENS[pool.token0];
    const reserveIn = isToken0From ? reserves.reserve0 : reserves.reserve1;
    const reserveOut = isToken0From ? reserves.reserve1 : reserves.reserve0;

    const amountInBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[tokenFrom]));
    const amountOutBigInt = getAmountOut(amountInBigInt, reserveIn, reserveOut);
    const amountOut = Number(amountOutBigInt) / 10 ** DECIMALS[tokenTo];

    document.getElementById('expected-out').textContent = `Expected: ${amountOut.toFixed(6)} ${tokenTo}`;
    window.expectedOutBigInt = amountOutBigInt; // Store for swap

    // Check allowance
    const allowance = await checkAllowance(TOKENS[tokenFrom], userAddress, SUNSWAP_ROUTER);
    if (allowance < amountInBigInt) {
        document.getElementById('approve-btn').style.display = 'block';
        document.getElementById('swap-btn').style.display = 'none';
    } else {
        document.getElementById('approve-btn').style.display = 'none';
        document.getElementById('swap-btn').style.display = 'block';
    }
}

// Execute the swap
async function executeSwap() {
    const tokenFrom = document.getElementById('token-from').value;
    const tokenTo = document.getElementById('token-to').value;
    const amountIn = document.getElementById('amount-in').value;

    const amountInBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[tokenFrom]));
    const slippage = 0.005; // 0.5%
    const minOutBigInt = (window.expectedOutBigInt * BigInt(995)) / BigInt(1000); // 0.5% slippage
    const path = [TOKENS[tokenFrom], TOKENS[tokenTo]];
    const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes

    const router = await tronWeb.contract(ROUTER_ABI, SUNSWAP_ROUTER);

    try {
        await router.swapExactTokensForTokens(
            amountInBigInt.toString(),
            minOutBigInt.toString(),
            path,
            userAddress,
            deadline
        ).send({ feeLimit: 100000000 });
        alert('Swap successful!');
        updateBalances();
        updateExpectedOutput();
    } catch (error) {
        alert('Swap failed. Please try again.');
        console.error(error);
    }
}

// Event listeners
document.getElementById('token-from').addEventListener('change', () => {
    updateBalances();
    updateExpectedOutput();
});
document.getElementById('token-to').addEventListener('change', () => {
    updateBalances();
    updateExpectedOutput();
});
document.getElementById('amount-in').addEventListener('input', updateExpectedOutput);

// Initial check for TronLink
if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    connectWallet();
}

