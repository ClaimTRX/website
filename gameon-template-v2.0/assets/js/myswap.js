// Constants
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
    {"outputs": [{"name": "amounts", "type": "uint256[]"}], "inputs": [{"name": "amountIn", "type": "uint256"}, {"name": "amountOutMin", "type": "uint256"}, {"name": "path", "type": "address[]"}, {"name": "to", "type": "address"}, {"name": "deadline", "type": "uint256"}], "name": "swapExactTokensForTokens", "stateMutability": "nonpayable", "type": "function"}
];

const RESERVES_ABI = [
     {"constant": true, "inputs": [], "name": "getReserves", "outputs": [{"name": "_reserve0", "type": "uint112"}, {"name": "_reserve1", "type": "uint112"}, {"name": "_blockTimestampLast", "type": "uint32"}], "payable": false, "stateMutability": "view", "type": "function"}
];

const ERC20_ABI = [
    {"constant": true, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},
    {"constant": true, "inputs": [{"name": "_owner", "type": "address"}, {"name": "_spender", "type": "address"}], "name": "allowance", "outputs": [{"name": "remaining", "type": "uint256"}], "payable": false, "stateMutability": "view", "type": "function"},
    {"constant": false, "inputs": [{"name": "_spender", "type": "address"}, {"name": "_value", "type": "uint256"}], "name": "approve", "outputs": [{"name": "success", "type": "bool"}], "payable": false, "stateMutability": "nonpayable", "type": "function"}
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

// Populate token selectors and filter based on pairings
function populateTokenSelectors() {
    const fromSelect = document.getElementById('from-token');
    const toSelect = document.getElementById('to-token');

    // Populate "From" dropdown with all tokens
    Object.keys(TOKENS).forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.text = token;
        fromSelect.appendChild(option.cloneNode(true));
    });

    // Initially populate "To" dropdown based on default "From" selection (CFT)
    updateToDropdown('CFT');

    fromSelect.value = 'CFT'; // Default to CFT
    toSelect.value = 'KING'; // Default to KING (since CFT-KING is a valid pair)
}

// Update "To" dropdown based on selected "From" token
async function updateToDropdown(fromToken) {
    const toSelect = document.getElementById('to-token');
    toSelect.innerHTML = ''; // Clear existing options

    // Find all tokens paired with fromToken in POOLS
    const pairedTokens = new Set();
    Object.keys(POOLS).forEach(poolKey => {
        const [tokenA, tokenB] = poolKey.split('-');
        if (tokenA === fromToken) {
            pairedTokens.add(tokenB);
        } else if (tokenB === fromToken) {
            pairedTokens.add(tokenA);
        }
    });

    // Populate "To" dropdown with paired tokens
    pairedTokens.forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.text = token;
        toSelect.appendChild(option);
    });

    // Set default "To" token (first paired token, if available)
    if (pairedTokens.size > 0) {
        toSelect.value = Array.from(pairedTokens)[0];
    }

    // Update the token address prompt
    document.getElementById('token-address').textContent = TOKENS[fromToken];
}

// Update "From" dropdown based on selected "To" token
async function updateFromDropdown(toToken) {
    const fromSelect = document.getElementById('from-token');
    fromSelect.innerHTML = ''; // Clear existing options

    // Find all tokens paired with toToken in POOLS
    const pairedTokens = new Set();
    Object.keys(POOLS).forEach(poolKey => {
        const [tokenA, tokenB] = poolKey.split('-');
        if (tokenA === toToken) {
            pairedTokens.add(tokenB);
        } else if (tokenB === toToken) {
            pairedTokens.add(tokenA);
        }
    });

    // Populate "From" dropdown with paired tokens
    pairedTokens.forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.text = token;
        fromSelect.appendChild(option);
    });

    // Set default "From" token (first paired token, if available)
    if (pairedTokens.size > 0) {
        fromSelect.value = Array.from(pairedTokens)[0];
    }

    // Update the token address prompt
    document.getElementById('token-address').textContent = TOKENS[fromSelect.value];
    await updateBalances(); // Ensure balance updates when "From" token changes
}

// Build a graph of token pairs for arbitrage routing
function buildTokenGraph() {
    const graph = {};
    Object.keys(TOKENS).forEach(token => {
        graph[token] = [];
    });

    Object.keys(POOLS).forEach(poolKey => {
        const [tokenA, tokenB] = poolKey.split('-');
        const pool = POOLS[poolKey];
        graph[tokenA].push({ token: tokenB, pool: pool });
        graph[tokenB].push({ token: tokenA, pool: pool });
    });

    return graph;
}

// Find all possible routes between startToken and endToken (up to maxHops)
function findAllRoutes(startToken, endToken, maxHops = 3) {
    const graph = buildTokenGraph();
    const routes = [];
    const queue = [[startToken]];
    const visited = new Set();

    while (queue.length > 0) {
        const path = queue.shift();
        const lastToken = path[path.length - 1];

        if (path.length > maxHops + 1) continue; // Skip paths longer than maxHops

        if (lastToken === endToken && path.length > 1) {
            routes.push(path);
            continue;
        }

        graph[lastToken].forEach(neighbor => {
            const nextToken = neighbor.token;
            const pathStr = [...path, nextToken].join('->');
            if (!visited.has(pathStr)) {
                visited.add(pathStr);
                queue.push([...path, nextToken]);
            }
        });
    }

    return routes;
}

// Fetch reserves for a pool
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

// Calculate output amount for a single hop
function getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * BigInt(997);
    const numerator = amountInWithFee * reserveOut;
    const denominator = (reserveIn * BigInt(1000)) + amountInWithFee;
    return numerator / denominator;
}

// Calculate the output amount for a given route
async function calculateRouteOutput(amountInBigInt, route) {
    let currentAmount = amountInBigInt;
    for (let i = 0; i < route.length - 1; i++) {
        const tokenFrom = route[i];
        const tokenTo = route[i + 1];
        const poolKey1 = `${tokenFrom}-${tokenTo}`;
        const poolKey2 = `${tokenTo}-${tokenFrom}`;
        const pool = POOLS[poolKey1] || POOLS[poolKey2];

        if (!pool) return BigInt(0); // Invalid route

        const reserves = await fetchReserves(pool.addr);
        const isToken0From = TOKENS[tokenFrom] === TOKENS[pool.token0];
        const reserveIn = isToken0From ? reserves.reserve0 : reserves.reserve1;
        const reserveOut = isToken0From ? reserves.reserve1 : reserves.reserve0;

        currentAmount = getAmountOut(currentAmount, reserveIn, reserveOut);
    }
    return currentAmount;
}

// Find the best route that maximizes the output amount
async function findBestRoute(amountInBigInt, startToken, endToken, maxHops = 3) {
    const routes = findAllRoutes(startToken, endToken, maxHops);
    if (routes.length === 0) return { route: null, amountOut: BigInt(0) };

    let bestRoute = null;
    let bestAmountOut = BigInt(0);

    for (const route of routes) {
        const amountOut = await calculateRouteOutput(amountInBigInt, route);
        if (amountOut > bestAmountOut) {
            bestAmountOut = amountOut;
            bestRoute = route;
        }
    }

    return { route: bestRoute, amountOut: bestAmountOut };
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

// Update balances
async function updateBalances() {
    if (!isWalletConnected) return;

    const tokenFrom = document.getElementById('from-token').value;
    const tokenTo = document.getElementById('to-token').value;

    try {
        const fromContract = await tronWeb.contract(ERC20_ABI, TOKENS[tokenFrom]);
        const toContract = await tronWeb.contract(ERC20_ABI, TOKENS[tokenTo]);

        const balanceFrom = await fromContract.balanceOf(userAddress).call();
        const balanceTo = await toContract.balanceOf(userAddress).call();

        // Use BigInt to handle large numbers safely
        const balanceFromNum = Number(balanceFrom) / 10 ** DECIMALS[tokenFrom];
        const formattedBalance = formatNumber(balanceFromNum);
        document.getElementById('rate-info').textContent = `Balance: ${formattedBalance} ${tokenFrom}`;
    } catch (error) {
        console.error('Error in updateBalances:', error);
        document.getElementById('status-msg').textContent = 'Failed to fetch balances. Please try again.';
        throw error;
    }
}

// Update expected output and find the best route
async function updateExpectedOutput() {
    if (!isWalletConnected) {
        document.getElementById('to-amount').value = '';
        document.getElementById('rate-info').textContent = 'Rate: --';
        return;
    }

    const tokenFrom = document.getElementById('from-token').value;
    const tokenTo = document.getElementById('to-token').value;
    let amountIn = document.getElementById('from-amount').value;

    if (!tokenFrom || !tokenTo || !amountIn) {
        document.getElementById('to-amount').value = '';
        document.getElementById('rate-info').textContent = 'Rate: --';
        return;
    }

    // Remove commas from amountIn for calculation
    amountIn = parseFloat(amountIn.replace(/,/g, ''));

    try {
        const amountInBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[tokenFrom]));
        
        // Find the best route
        const { route, amountOut } = await findBestRoute(amountInBigInt, tokenFrom, tokenTo, 3);
        
        if (!route) {
            document.getElementById('to-amount').value = 'No route found';
            document.getElementById('rate-info').textContent = 'Rate: --';
            return;
        }

        const amountOutNum = Number(amountOut) / 10 ** DECIMALS[tokenTo];
        const formattedAmountOut = formatNumber(amountOutNum);

        document.getElementById('to-amount').value = formattedAmountOut;

        const rate = amountOutNum / amountIn;
        const formattedRate = formatNumber(rate);
        const routeDisplay = `Route: ${route.join(' -> ')}`;
        document.getElementById('rate-info').textContent = `Rate: 1 ${tokenFrom} = ${formattedRate} ${tokenTo} | ${routeDisplay}`;

        window.expectedOutBigInt = amountOut;
        window.amountInBigInt = amountInBigInt;
        window.bestRoute = route;
    } catch (error) {
        console.error('Error in updateExpectedOutput:', error);
        document.getElementById('to-amount').value = 'Error';
        document.getElementById('rate-info').textContent = 'Rate: --';
    }
}

// Execute the swap using the best route
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

    const tokenAddress = TOKENS[tokenFrom];
    const amountInBigInt = window.amountInBigInt;
    const bestRoute = window.bestRoute;
    
    if (!bestRoute) {
        document.getElementById('status-msg').textContent = 'No route found for the swap.';
        return;
    }

    try {
        // Check allowance for the SunSwap router
        const allowance = await checkAllowance(tokenAddress, userAddress, SUNSWAP_ROUTER);

        // If allowance is insufficient, auto-approve
        if (allowance < amountInBigInt) {
            await approveToken(tokenAddress, amountInBigInt);
        }

        // Execute the swap using the best route
        const slippage = 1; // Default slippage of 1%
        const minOutBigInt = window.expectedOutBigInt * BigInt(100 - slippage) / BigInt(100);
        const path = bestRoute.map(token => TOKENS[token]);
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
    await updateToDropdown(fromToken);
    await updateBalances(); // Ensure balance updates when "From" token changes
    await updateExpectedOutput();
});

document.getElementById('to-token').addEventListener('change', async () => {
    const toToken = document.getElementById('to-token').value;
    await updateFromDropdown(toToken);
    await updateBalances();
    await updateExpectedOutput();
});

document.getElementById('from-amount').addEventListener('input', updateExpectedOutput);
document.getElementById('swap-button').addEventListener('click', executeSwap);

// Auto-connect wallet on page refresh
if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    connectWallet();
}
