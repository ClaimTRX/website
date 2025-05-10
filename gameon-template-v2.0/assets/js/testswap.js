// Constants
const SUNSWAP_ROUTER = 'TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR';
const WTRX_CONTRACT = 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR';
const STBLX_SWAP_CONTRACT = 'TUGprGUNtszQgc3pGwMcC9R3z3sDT31G9W'; // StableX swap contract

const TOKENS = {
    TRX: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR', // Maps to WTRX address for pool interactions
    CFT: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    STBLX: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS', // StableX token
    BBT: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    KING: 'TMFNzkJaj573F62s4bWmfonKwGcosAA8fE',
   
    USDD: 'TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz', // USDD for StableX
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
   
};

const DECIMALS = {
    TRX: 6,
    KING: 6,
    CFT: 6,
    BBT: 8,
    USDT: 6,
  
    USDD: 18,
    
    STBLX: 6 // 6 decimals for STBLX
};

const POOLS = {
    'WTRX-CFT': { addr: 'TDBm3WAEaykeMUhmrNe1eLNWhG8CwfmGCg', token0: 'CFT', token1: 'WTRX' },
    'WTRX-KING': { addr: 'TQ2HCSvpir3ELSJg3J2wKG6TskePh74rz8', token0: 'KING', token1: 'WTRX' },
    'CFT-KING':  { addr: 'TXm1bnUSVSZWE5PpYzzyiZAoQVpFDbNq38', token0: 'CFT', token1: 'KING' },
    'CFT-BBT':   { addr: 'TANnrhzkhjGtgAmD1GQ91rgrmRwKu7sedj', token0: 'BBT', token1: 'CFT' },
    'WTRX-BBT': { addr: 'TTJ9VB8kUptB1bztysnQZtcqaR5cYCbzAW', token0: 'BBT', token1: 'WTRX' },
    'WTRX-USDT': { addr: 'TFGDbUyP8xez44C76fin3bn3Ss6jugoUwJ', token0: 'WTRX', token1: 'USDT' }
   
};

const ROUTER_ABI = [
    {
        "outputs": [{"name": "amounts", "type": "uint256[]"}],
        "inputs": [
            {"name": "amountOutMin", "type": "uint256"},
            {"name": "path", "type": "address[]"},
            {"name": "to", "type": "address"},
            {"name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactETHForTokens",
        "stateMutability": "payable",
        "type": "function"
    },
  {
  "inputs": [
    { "name": "amountOutMin", "type": "uint256" },
    { "name": "path", "type": "address[]" },
    { "name": "to", "type": "address" },
    { "name": "deadline", "type": "uint256" }
  ],
  "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
},
{
  "inputs": [
    { "name": "amountIn", "type": "uint256" },
    { "name": "amountOutMin", "type": "uint256" },
    { "name": "path", "type": "address[]" },
    { "name": "to", "type": "address" },
    { "name": "deadline", "type": "uint256" }
  ],
  "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},
{
  "inputs": [
    { "name": "amountIn", "type": "uint256" },
    { "name": "amountOutMin", "type": "uint256" },
    { "name": "path", "type": "address[]" },
    { "name": "to", "type": "address" },
    { "name": "deadline", "type": "uint256" }
  ],
  "name": "swapExactTokensForETHSupportingFeeOnTransferTokens",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
},

    {
        "outputs": [{"name": "amounts", "type": "uint256[]"}],
        "inputs": [
            {"name": "amountIn", "type": "uint256"},
            {"name": "amountOutMin", "type": "uint256"},
            {"name": "path", "type": "address[]"},
            {"name": "to", "type": "address"},
            {"name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForTokens",
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "outputs": [{"name": "amounts", "type": "uint256[]"}],
        "inputs": [
            {"name": "amountIn", "type": "uint256"},
            {"name": "amountOutMin", "type": "uint256"},
            {"name": "path", "type": "address[]"},
            {"name": "to", "type": "address"},
            {"name": "deadline", "type": "uint256"}
        ],
        "name": "swapExactTokensForETH",
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const RESERVES_ABI = [
    {
        "constant": true,
        "inputs": [],
        "name": "getReserves",
        "outputs": [
            {"name": "_reserve0", "type": "uint112"},
            {"name": "_reserve1", "type": "uint112"},
            {"name": "_blockTimestampLast", "type": "uint32"}
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {"name": "_owner", "type": "address"},
            {"name": "_spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"name": "remaining", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {"name": "_spender", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "success", "type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const STBLX_SWAP_ABI = [
    {
        "inputs": [
            {"internalType": "contract ITRC20", "name": "_token", "type": "address"},
            {"internalType": "contract ITRC20", "name": "_usdt", "type": "address"},
            {"internalType": "contract ITRC20", "name": "_usdd", "type": "address"}
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
            {"indexed": false, "internalType": "string", "name": "paymentToken", "type": "string"}
        ],
        "name": "TokensPurchased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
            {"indexed": false, "internalType": "address", "name": "tokenAddress", "type": "address"}
        ],
        "name": "WithdrawnTokens",
        "type": "event"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
        "name": "buyWithUSDT",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "amount", "type": "uint256"}],
        "name": "buyWithUSDD",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "name": "token",
        "outputs": [{"internalType": "contract ITRC20", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usdd",
        "outputs": [{"internalType": "contract ITRC20", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "usdt",
        "outputs": [{"internalType": "contract ITRC20", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawAllUSDD",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "withdrawAllUSDT",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Global variables
let tronWeb;
let userAddress;
let isWalletConnected = false;
let lastInputField = 'from'; // Track which field was last edited ('from' or 'to')

// Function to format numbers with . as decimal, no thousand separator, fixed to 2 decimals
function formatNumber(num) {
    const numValue = Number(num);
    if (isNaN(numValue)) return '0.00';
    return numValue.toFixed(2);
}

// Parse input string to a number, handling only digits and decimal point
function parseInput(value) {
    if (!value) return 0;
    // Remove any non-numeric characters except decimal point
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleanedValue.split('.');
    const validValue = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('') : cleanedValue;
    const parsed = parseFloat(validValue);
    return isNaN(parsed) ? 0 : parsed;
}

// Connect to TronLink wallet
async function connectWallet() {
    const connectButton = document.getElementById('connect-button');
    try {
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
            tronWeb = window.tronWeb;
            userAddress = tronWeb.defaultAddress.base58;
            isWalletConnected = true;
            connectButton.innerHTML = '<i class="icon-wallet me-md-2"></i> Wallet Connected';
            connectButton.disabled = true;
            populateTokenSelectors();
            await updateBalances();
        } else if (window.tronWeb) {
            await window.tronWeb.request({ method: 'tron_requestAccounts' });
            tronWeb = window.tronWeb;
            userAddress = tronWeb.defaultAddress.base58;
            isWalletConnected = true;
            connectButton.innerHTML = '<i class="icon-wallet me-md-2"></i> Wallet Connected';
            connectButton.disabled = true;
            populateTokenSelectors();
            await updateBalances();
        } else {
            alert('TronLink is not installed. Please install the TronLink extension.');
        }
    } catch (error) {
        alert('Failed to connect to TronLink. Please ensure you are logged in.');
        console.error('Error in connectWallet:', error);
    }
}

// Populate token selectors and filter based on pairings
function populateTokenSelectors() {
    const fromSelect = document.getElementById('from-token');
    const toSelect = document.getElementById('to-token');

    // Populate "From" dropdown with all tokens except STBLX
    Object.keys(TOKENS).forEach(token => {
        if (token !== 'STBLX') {
            const option = document.createElement('option');
            option.value = token;
            option.text = token;
            fromSelect.appendChild(option.cloneNode(true));
        }
    });

    // Initially populate "To" dropdown based on default "From" selection (CFT)
    updateToDropdown('TRX');

    fromSelect.value = 'TRX'; // Default to CFT
    toSelect.value = 'CFT'; // Default to KING
}

// Update "To" dropdown based on selected "From" token
function updateToDropdown(fromToken) {
    const toSelect = document.getElementById('to-token');
    const currentToValue = toSelect.value;
    toSelect.innerHTML = ''; // Clear existing options

    // Map TRX to WTRX for pool lookup
    const effectiveFrom = fromToken === 'TRX' ? 'WTRX' : fromToken;

    // Find all tokens paired with effectiveFrom in POOLS
    const pairedTokens = new Set();
    Object.keys(POOLS).forEach(poolKey => {
        const [tokenA, tokenB] = poolKey.split('-');
        if (tokenA === effectiveFrom) {
            pairedTokens.add(tokenB === 'WTRX' ? 'TRX' : tokenB);
        } else if (tokenB === effectiveFrom) {
            pairedTokens.add(tokenA === 'WTRX' ? 'TRX' : tokenA);
        }
    });

    // Special case for USDT and USDD: allow STBLX as a "To" token
    if (fromToken === 'USDT' || fromToken === 'USDD') {
        pairedTokens.add('STBLX');
    }

    // Populate "To" dropdown with paired tokens
    pairedTokens.forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.text = token;
        toSelect.appendChild(option);
    });

    // Restore previous "To" selection if still valid, otherwise set to first paired token
    if (pairedTokens.has(currentToValue)) {
        toSelect.value = currentToValue;
    } else if (pairedTokens.size > 0) {
        toSelect.value = Array.from(pairedTokens)[0];
    }
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

// Calculate output amount (amountOut given amountIn)
function getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * BigInt(997);
    const numerator = amountInWithFee * reserveOut;
    const denominator = (reserveIn * BigInt(1000)) + amountInWithFee;
    return numerator / denominator;
}

// Calculate input amount (amountIn given amountOut)
function getAmountIn(amountOut, reserveIn, reserveOut) {
    const numerator = reserveIn * amountOut * BigInt(1000);
    const denominator = (reserveOut - amountOut) * BigInt(997);
    return (numerator / denominator) + BigInt(1); // Add 1 to account for rounding
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
async function approveToken(tokenAddress, amountInBigInt, spender) {
    if (!isWalletConnected) {
        alert('Please connect your wallet first.');
        return false;
    }

    const contract = await tronWeb.contract(ERC20_ABI, tokenAddress);
    try {
        document.getElementById('status-msg').textContent = 'Approving token...';
        await contract.approve(spender, amountInBigInt.toString()).send({ feeLimit: 100000000 });
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
    if (!isWalletConnected) {
        document.getElementById('from-balance').textContent = 'Balance: 0';
        document.getElementById('to-balance').textContent = 'Balance: 0';
        return;
    }

    const tokenFrom = document.getElementById('from-token').value;
    const tokenTo = document.getElementById('to-token').value;

    let balanceFrom = BigInt(0);
    let balanceTo = BigInt(0);

    // Handle TRX balance for "From"
    if (tokenFrom === 'TRX') {
        try {
            balanceFrom = BigInt(await tronWeb.trx.getBalance(userAddress));
        } catch (error) {
            console.error(`Error fetching TRX balance:`, error);
        }
    } else {
        const fromAddress = TOKENS[tokenFrom];
        try {
            const fromContract = await tronWeb.contract(ERC20_ABI, fromAddress);
            balanceFrom = BigInt(await fromContract.balanceOf(userAddress).call());
        } catch (error) {
            console.error(`Error fetching balance for ${tokenFrom} at ${fromAddress}:`, error);
        }
    }

    // Handle TRX balance for "To"
    if (tokenTo === 'TRX') {
        try {
            balanceTo = BigInt(await tronWeb.trx.getBalance(userAddress));
        } catch (error) {
            console.error(`Error fetching TRX balance:`, error);
        }
    } else {
        const toAddress = TOKENS[tokenTo];
        try {
            const toContract = await tronWeb.contract(ERC20_ABI, toAddress);
            balanceTo = BigInt(await fromContract.balanceOf(userAddress).call());
        } catch (error) {
            console.error(`Error fetching balance for ${tokenTo} at ${toAddress}:`, error);
        }
    }

    const formattedBalanceFrom = formatNumber(Number(balanceFrom) / 10 ** DECIMALS[tokenFrom]);
    const formattedBalanceTo = formatNumber(Number(balanceTo) / 10 ** DECIMALS[tokenTo]);

    document.getElementById('from-balance').textContent = `Balance: ${formattedBalanceFrom} ${tokenFrom}`;
    document.getElementById('to-balance').textContent = `Balance: ${formattedBalanceTo} ${tokenTo}`;
}

// Set max amount for "From" field
async function setMaxAmount() {
    if (!isWalletConnected) {
        alert('Please connect your wallet first.');
        return;
    }

    const tokenFrom = document.getElementById('from-token').value;
    let balanceRaw;

    if (tokenFrom === 'TRX') {
        try {
            balanceRaw = await tronWeb.trx.getBalance(userAddress);
        } catch (error) {
            console.error(`Error fetching TRX balance:`, error);
            document.getElementById('status-msg').textContent = 'Failed to fetch balance.';
            return;
        }
    } else {
        const fromAddress = TOKENS[tokenFrom];
        try {
            const fromContract = await tronWeb.contract(ERC20_ABI, fromAddress);
            balanceRaw = await fromContract.balanceOf(userAddress).call();
        } catch (error) {
            console.error(`Error fetching balance for ${tokenFrom}:`, error);
            document.getElementById('status-msg').textContent = 'Failed to fetch balance.';
            return;
        }
    }

    const decimals = DECIMALS[tokenFrom];
    const balance = Number(balanceRaw) / 10 ** decimals;
    // Round down to 2 decimal places for UI display
    const uiBalance = Math.floor(balance * 100) / 100;
    // Store exact balance for transaction
    window.maxAmountBigInt = BigInt(balanceRaw);

    document.getElementById('from-amount').value = formatNumber(uiBalance);
    lastInputField = 'from';
    await updateExpectedOutput();
}

// Update expected output based on input field
async function updateExpectedOutput() {
    if (!isWalletConnected) {
        document.getElementById('from-amount').value = '';
        document.getElementById('to-amount').value = '';
        document.getElementById('rate-info').textContent = 'Rate: --';
        document.getElementById('impact-info').textContent = 'Price Impact: --';
        return;
    }

    const tokenFrom = document.getElementById('from-token').value;
    const tokenTo = document.getElementById('to-token').value;
    let amountIn = document.getElementById('from-amount').value;
    let amountOut = document.getElementById('to-amount').value;

    // Parse inputs
    amountIn = parseInput(amountIn);
    amountOut = parseInput(amountOut);

    if ((amountIn <= 0 && amountOut <= 0) || isNaN(amountIn) || isNaN(amountOut)) {
        document.getElementById('from-amount').value = '';
        document.getElementById('to-amount').value = '';
        document.getElementById('rate-info').textContent = 'Rate: --';
        document.getElementById('impact-info').textContent = 'Price Impact: --';
        return;
    }

    // Special case for STBLX swaps
    if (tokenTo === 'STBLX' && (tokenFrom === 'USDT' || tokenFrom === 'USDD')) {
        if (lastInputField === 'from') {
            const formattedAmountOut = formatNumber(amountIn);
            document.getElementById('to-amount').value = formattedAmountOut;
            window.amountInBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[tokenFrom]));
            window.expectedOutBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[tokenTo]));
        } else {
            const formattedAmountIn = formatNumber(amountOut);
            document.getElementById('from-amount').value = formattedAmountIn;
            window.amountInBigInt = BigInt(Math.floor(amountOut * 10 ** DECIMALS[tokenFrom]));
            window.expectedOutBigInt = BigInt(Math.floor(amountOut * 10 ** DECIMALS[tokenTo]));
        }
        document.getElementById('rate-info').textContent = `Rate: 1 ${tokenFrom} = 1 STBLX`;
        document.getElementById('impact-info').textContent = 'Price Impact: 0%';
        return;
    }

    const effectiveFrom = tokenFrom === 'TRX' ? 'WTRX' : tokenFrom;
    const effectiveTo = tokenTo === 'TRX' ? 'WTRX' : tokenTo;

    const possibleKey1 = `${effectiveFrom}-${effectiveTo}`;
    const possibleKey2 = `${effectiveTo}-${effectiveFrom}`;
    const pool = POOLS[possibleKey1] || POOLS[possibleKey2];

    if (!pool) {
        document.getElementById(lastInputField === 'from' ? 'to-amount' : 'from-amount').value = 'No direct pool';
        document.getElementById('rate-info').textContent = 'Rate: --';
        document.getElementById('impact-info').textContent = 'Price Impact: --';
        return;
    }

    try {
        const reserves = await fetchReserves(pool.addr);
        if (reserves.reserve0 === 0n || reserves.reserve1 === 0n) {
            document.getElementById(lastInputField === 'from' ? 'to-amount' : 'from-amount').value = 'Pool empty';
            document.getElementById('rate-info').textContent = 'Rate: --';
            document.getElementById('impact-info').textContent = 'Price Impact: --';
            return;
        }

        const fromAddress = tokenFrom === 'TRX' ? TOKENS['TRX'] : TOKENS[tokenFrom];
        const token0Address = pool.token0 === 'WTRX' ? TOKENS['TRX'] : TOKENS[pool.token0];
        const isToken0From = fromAddress === token0Address;

        const reserveIn = isToken0From ? reserves.reserve0 : reserves.reserve1;
        const reserveOut = isToken0From ? reserves.reserve1 : reserves.reserve0;

        let amountInBigInt, amountOutBigInt, formattedAmount;

        if (lastInputField === 'from') {
            amountInBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[tokenFrom]));
            amountOutBigInt = getAmountOut(amountInBigInt, reserveIn, reserveOut);
            const amountOutCalc = Number(amountOutBigInt) / 10 ** DECIMALS[tokenTo];
            formattedAmount = formatNumber(amountOutCalc);
            document.getElementById('to-amount').value = formattedAmount;
            window.amountInBigInt = amountInBigInt;
            window.expectedOutBigInt = amountOutBigInt;
        } else {
            amountOutBigInt = BigInt(Math.floor(amountOut * 10 ** DECIMALS[tokenTo]));
            amountInBigInt = getAmountIn(amountOutBigInt, reserveIn, reserveOut);
            const amountInCalc = Number(amountInBigInt) / 10 ** DECIMALS[tokenFrom];
            formattedAmount = formatNumber(amountInCalc);
            document.getElementById('from-amount').value = formattedAmount;
            window.amountInBigInt = amountInBigInt;
            window.expectedOutBigInt = amountOutBigInt;
        }

        // Calculate the rate with full precision
        const rate = (Number(amountOutBigInt) / 10 ** DECIMALS[tokenTo]) / (Number(amountInBigInt) / 10 ** DECIMALS[tokenFrom]);
        const displayFrom = tokenFrom === 'TRX' ? 'WTRX' : tokenFrom;
        const displayTo = tokenTo === 'TRX' ? 'WTRX' : tokenTo;
        // Format the rate to show all decimals for the "To" token
        const formattedRate = rate.toFixed(DECIMALS[tokenTo]);
        document.getElementById('rate-info').textContent = `Rate: 1 ${displayFrom} = ${formattedRate} ${displayTo}`;

        // Calculate price impact
        const BN = BigNumber;
        const reserveInBN = BN(reserveIn.toString());
        const reserveOutBN = BN(reserveOut.toString());
        const amountInBN = BN(amountInBigInt.toString());
        const amountOutBN = BN(amountOutBigInt.toString());

        let priceImpactText;
        if (amountInBN.isZero() || reserveInBN.isZero() || reserveOutBN.isZero()) {
            priceImpactText = 'Price Impact: 0%';
        } else {
            const fraction = amountOutBN.multipliedBy(reserveInBN).dividedBy(amountInBN.multipliedBy(reserveOutBN));
            const priceImpact = (1 - fraction.toNumber()) * 100;
            priceImpactText = `Price Impact: ${formatNumber(priceImpact)}%`;
        }
        document.getElementById('impact-info').textContent = priceImpactText;

    } catch (error) {
        console.error('Error in updateExpectedOutput:', error);
        document.getElementById(lastInputField === 'from' ? 'to-amount' : 'from-amount').value = 'Error';
        document.getElementById('rate-info').textContent = 'Rate: --';
        document.getElementById('impact-info').textContent = 'Price Impact: --';
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

    const amountInFloat = parseInput(amountIn);
    if (!amountIn || isNaN(amountInFloat) || amountInFloat <= 0) {
        document.getElementById('status-msg').textContent = 'Please enter a valid amount.';
        return;
    }

    // Use exact balance if max button was used
    let amountInBigInt;
    const uiBalance = Number(amountInFloat) * 10 ** DECIMALS[tokenFrom];
    if (window.maxAmountBigInt && Math.floor(uiBalance) === Math.floor(Number(window.maxAmountBigInt))) {
        amountInBigInt = window.maxAmountBigInt;
    } else {
        amountInBigInt = BigInt(Math.floor(amountInFloat * 10 ** DECIMALS[tokenFrom]));
    }

    const tokenAddressFrom = TOKENS[tokenFrom];
    const tokenAddressTo = TOKENS[tokenTo];

    try {
        // Check balance
        let balanceRaw;
        if (tokenFrom === 'TRX') {
            balanceRaw = await tronWeb.trx.getBalance(userAddress);
        } else {
            const fromContract = await tronWeb.contract(ERC20_ABI, tokenAddressFrom);
            balanceRaw = await fromContract.balanceOf(userAddress).call();
        }
        const balance = Number(balanceRaw) / 10 ** DECIMALS[tokenFrom];

        if (balance < amountInFloat && !window.maxAmountBigInt) {
            document.getElementById('status-msg').textContent = `Insufficient ${tokenFrom} balance.`;
            return;
        }

        // Special case for STBLX swaps
        if (tokenTo === 'STBLX' && (tokenFrom === 'USDT' || tokenFrom === 'USDD')) {
            const swapContract = await tronWeb.contract(STBLX_SWAP_ABI, STBLX_SWAP_CONTRACT);

            // Check TRX balance for fees
            const trxBalance = await tronWeb.trx.getBalance(userAddress) / 1e6;
            if (trxBalance < 1) {
                document.getElementById('status-msg').textContent = 'Insufficient TRX for transaction fees.';
                return;
            }

            // Check and approve allowance
            const allowance = await checkAllowance(tokenAddressFrom, userAddress, STBLX_SWAP_CONTRACT);
            if (allowance < amountInBigInt) {
                await approveToken(tokenAddressFrom, amountInBigInt, STBLX_SWAP_CONTRACT);
            }

            // Execute STBLX swap
            document.getElementById('status-msg').textContent = `Processing STBLX swap with ${tokenFrom}...`;
            const method = tokenFrom === 'USDT' ? 'buyWithUSDT' : 'buyWithUSDD';
            const tx = await swapContract[method](amountInBigInt.toString()).send({ feeLimit: 100000000 });
            document.getElementById('status-msg').textContent = ` TX: ${tx}`;

            await updateBalances();
            await updateExpectedOutput();
            return;
        }

        // Existing SunSwap logic
        const slippage = 1; // 1% slippage
        const minOutBigInt = window.expectedOutBigInt * BigInt(100 - slippage) / BigInt(100);
        const deadline = Math.floor(Date.now() / 1000) + 600;
        const router = await tronWeb.contract(ROUTER_ABI, SUNSWAP_ROUTER);

        if (tokenFrom === 'TRX') {
            const path = [WTRX_CONTRACT, tokenAddressTo];
            document.getElementById('status-msg').textContent = 'Processing swap...';
            const tx = await const tx = await router.swapExactETHForTokensSupportingFeeOnTransferTokens(

                minOutBigInt.toString(),
                path,
                userAddress,
                deadline
            ).send({
                callValue: amountInBigInt.toString(),
                feeLimit: 100000000
            });
            document.getElementById('status-msg').textContent = ` TX: ${tx}`;
        } else if (tokenTo === 'TRX') {
            const path = [tokenAddressFrom, WTRX_CONTRACT];
            const allowance = await checkAllowance(tokenAddressFrom, userAddress, SUNSWAP_ROUTER);
            if (allowance < amountInBigInt) {
                await approveToken(tokenAddressFrom, amountInBigInt, SUNSWAP_ROUTER);
            }
            document.getElementById('status-msg').textContent = 'Processing swap...';
            const tx = await const tx = await router.swapExactTokensForETHSupportingFeeOnTransferTokens(

                amountInBigInt.toString(),
                minOutBigInt.toString(),
                path,
                userAddress,
                deadline
            ).send({ feeLimit: 100000000 });
            document.getElementById('status-msg').textContent = ` TX: ${tx}`;
        } else {
            const path = [tokenAddressFrom, tokenAddressTo];
            const allowance = await checkAllowance(tokenAddressFrom, userAddress, SUNSWAP_ROUTER);
            if (allowance < amountInBigInt) {
                await approveToken(tokenAddressFrom, amountInBigInt, SUNSWAP_ROUTER);
            }
            document.getElementById('status-msg').textContent = 'Processing swap...';
            const tx = await const tx = await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(

                amountInBigInt.toString(),
                minOutBigInt.toString(),
                path,
                userAddress,
                deadline
            ).send({ feeLimit: 100000000 });
            document.getElementById('status-msg').textContent = ` TX: ${tx}`;
        }

        await updateBalances();
        await updateExpectedOutput();
    } catch (error) {
        console.error('Error in executeSwap:', error);
        document.getElementById('status-msg').textContent = 'Swap failed: ' + (error.message || 'Unknown error');
    }
}

// Mirror the swap (swap "From" and "To" tokens)
async function mirrorSwap() {
    const fromSelect = document.getElementById('from-token');
    const toSelect = document.getElementById('to-token');

    // Get current values
    const fromToken = fromSelect.value;
    const toToken = toSelect.value;

    // Check if the mirrored pair is valid
    let isValidPair = false;
    if (toToken === 'STBLX' && (fromToken === 'USDT' || fromToken === 'USDD')) {
        document.getElementById('status-msg').textContent = 'Cannot swap STBLX to USDT/USDD.';
        return;
    }

    const effectiveFrom = toToken === 'TRX' ? 'WTRX' : toToken;
    const effectiveTo = fromToken === 'TRX' ? 'WTRX' : fromToken;
    const possibleKey1 = `${effectiveFrom}-${effectiveTo}`;
    const possibleKey2 = `${effectiveTo}-${effectiveFrom}`;
    const poolExists = POOLS[possibleKey1] || POOLS[possibleKey2];

    if (poolExists) {
        isValidPair = true;
    }

    if (!isValidPair) {
        document.getElementById('status-msg').textContent = 'No pool exists for the mirrored pair.';
        return;
    }

    // Swap the token selections
    fromSelect.value = toToken;
    updateToDropdown(toToken);
    toSelect.value = fromToken;

    // Clear input fields and reset rate/info
    document.getElementById('from-amount').value = '';
    document.getElementById('to-amount').value = '';
    document.getElementById('rate-info').textContent = 'Rate: --';
    document.getElementById('impact-info').textContent = 'Price Impact: --';

    // Update balances
    await updateBalances();
}

// Event listeners
document.getElementById('connect-button').addEventListener('click', connectWallet);

document.getElementById('from-token').addEventListener('change', async () => {
    const fromToken = document.getElementById('from-token').value;
    updateToDropdown(fromToken);
    // Clear input fields and reset rate/info
    document.getElementById('from-amount').value = '';
    document.getElementById('to-amount').value = '';
    document.getElementById('rate-info').textContent = 'Rate: --';
    document.getElementById('impact-info').textContent = 'Price Impact: --';
    await updateBalances();
});

document.getElementById('to-token').addEventListener('change', async () => {
    // Clear input fields and reset rate/info
    document.getElementById('from-amount').value = '';
    document.getElementById('to-amount').value = '';
    document.getElementById('rate-info').textContent = 'Rate: --';
    document.getElementById('impact-info').textContent = 'Price Impact: --';
    await updateBalances();
});

document.getElementById('from-amount').addEventListener('input', function () {
    // Allow only numbers and a single decimal point
    let value = this.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
        value = parts[0] + '.' + parts[1];
    }
    this.value = value;
    lastInputField = 'from';
    updateExpectedOutput();
});

document.getElementById('from-amount').addEventListener('blur', function () {
    const value = parseInput(this.value);
    if (value > 0) {
        this.value = formatNumber(value);
    } else {
        this.value = '';
    }
    lastInputField = 'from';
    updateExpectedOutput();
});

document.getElementById('to-amount').addEventListener('input', function () {
    // Allow only numbers and a single decimal point
    let value = this.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].slice(0, 2);
        value = parts[0] + '.' + parts[1];
    }
    this.value = value;
    lastInputField = 'to';
    updateExpectedOutput();
});

document.getElementById('to-amount').addEventListener('blur', function () {
    const value = parseInput(this.value);
    if (value > 0) {
        this.value = formatNumber(value);
    } else {
        this.value = '';
    }
    lastInputField = 'to';
    updateExpectedOutput();
});

document.getElementById('max-button').addEventListener('click', setMaxAmount);

document.getElementById('swap-button').addEventListener('click', executeSwap);
document.getElementById('mirror-button').addEventListener('click', mirrorSwap);

// Auto-connect wallet on page refresh
if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    const connectButton = document.getElementById('connect-button');
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    isWalletConnected = true;
    connectButton.innerHTML = '<i class="icon-wallet me-md-2"></i> Wallet Connected';
    connectButton.disabled = true;
    populateTokenSelectors();
    updateBalances();
}
