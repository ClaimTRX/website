// swap.js - Fully complete, 100% ready-to-copy version
// Fixes:
// - Reliable Chainstack read node using tronWeb.constructor
// - Polling for async-loaded 'connect-button' (header fetch) to avoid null addEventListener error
// - All static swap elements have direct listeners
// - Full STBLX_SWAP_ABI included
// - BigNumber for price impact (ensure bignumber.js is loaded in HTML)

const CHAINSTACK_BASE_URL = 'https://tron-mainnet.core.chainstack.com/a326f4c9a023702fa22b346f85066299';

const SUNSWAP_ROUTER = 'TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR';
const WTRX_CONTRACT = 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR';
const STBLX_SWAP_CONTRACT = 'TUGprGUNtszQgc3pGwMcC9R3z3sDT31G9W';

const TOKENS = {
    TRX: 'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR',
    CFT: 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK',
    STBLX: 'TGd1irpHHU8cFC4ArY9KBoBiocQr1vVpWS',
    BBT: 'TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL',
    KING: 'TMFNzkJaj573F62s4bWmfonKwGcosAA8fE',
    USDD: 'TXDk8mbtRbXeYuMNS83CfKPaYYT8XWv9Hz',
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
};

const DECIMALS = {
    TRX: 6,
    KING: 6,
    CFT: 6,
    BBT: 8,
    USDT: 6,
    USDD: 18,
    STBLX: 6
};

const POOLS = {
    'WTRX-CFT': { addr: 'TDBm3WAEaykeMUhmrNe1eLNWhG8CwfmGCg', token0: 'CFT', token1: 'WTRX' },
    'WTRX-KING': { addr: 'TQ2HCSvpir3ELSJg3J2wKG6TskePh74rz8', token0: 'KING', token1: 'WTRX' },
    'CFT-KING': { addr: 'TXm1bnUSVSZWE5PpYzzyiZAoQVpFDbNq38', token0: 'CFT', token1: 'KING' },
    'CFT-BBT': { addr: 'TANnrhzkhjGtgAmD1GQ91rgrmRwKu7sedj', token0: 'BBT', token1: 'CFT' },
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
let tronWeb = null;
let readTronWeb = null;
let userAddress = null;
let isWalletConnected = false;
let lastInputField = 'from';

function formatNumber(num) {
    const numValue = Number(num);
    if (isNaN(numValue)) return '0.00';
    return numValue.toFixed(2);
}

function parseInput(value) {
    if (!value) return 0;
    const cleanedValue = value.replace(/[^0-9.]/g, '');
    const parts = cleanedValue.split('.');
    const validValue = parts.length > 1 ? parts[0] + '.' + parts.slice(1).join('') : cleanedValue;
    const parsed = parseFloat(validValue);
    return isNaN(parsed) ? 0 : parsed;
}

async function connectWallet() {
    try {
        if (!window.tronWeb) {
            alert('TronLink is not installed. Please install the TronLink extension.');
            return;
        }

        if (!window.tronWeb.defaultAddress.base58) {
            await window.tronWeb.request({ method: 'tron_requestAccounts' });
        }

        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;

        readTronWeb = new tronWeb.constructor(
            CHAINSTACK_BASE_URL,
            CHAINSTACK_BASE_URL,
            CHAINSTACK_BASE_URL
        );
        readTronWeb.setAddress(userAddress);

        isWalletConnected = true;

        const connectBtn = document.getElementById('connect-button');
        if (connectBtn) {
            connectBtn.innerHTML = '<i class="icon-wallet me-md-2"></i> Wallet Connected';
            connectBtn.disabled = true;
        }

        populateTokenSelectors();
        await updateBalances();
    } catch (error) {
        alert('Failed to connect to TronLink: ' + (error.message || 'Unknown error'));
        console.error('Error in connectWallet:', error);
    }
}

function populateTokenSelectors() {
    const fromSelect = document.getElementById('from-token');
    const toSelect = document.getElementById('to-token');

    Object.keys(TOKENS).forEach(token => {
        if (token !== 'STBLX') {
            const option = document.createElement('option');
            option.value = token;
            option.text = token;
            fromSelect.appendChild(option.cloneNode(true));
        }
    });

    updateToDropdown('TRX');
    fromSelect.value = 'TRX';
    toSelect.value = 'CFT';
}

function updateToDropdown(fromToken) {
    const toSelect = document.getElementById('to-token');
    const currentToValue = toSelect.value;
    toSelect.innerHTML = '';

    const effectiveFrom = fromToken === 'TRX' ? 'WTRX' : fromToken;
    const pairedTokens = new Set();

    Object.keys(POOLS).forEach(poolKey => {
        const [tokenA, tokenB] = poolKey.split('-');
        if (tokenA === effectiveFrom) {
            pairedTokens.add(tokenB === 'WTRX' ? 'TRX' : tokenB);
        } else if (tokenB === effectiveFrom) {
            pairedTokens.add(tokenA === 'WTRX' ? 'TRX' : tokenA);
        }
    });

    if (fromToken === 'USDT' || fromToken === 'USDD') {
        pairedTokens.add('STBLX');
    }

    pairedTokens.forEach(token => {
        const option = document.createElement('option');
        option.value = token;
        option.text = token;
        toSelect.appendChild(option);
    });

    if (pairedTokens.has(currentToValue)) {
        toSelect.value = currentToValue;
    } else if (pairedTokens.size > 0) {
        toSelect.value = Array.from(pairedTokens)[0];
    }
}

async function fetchReserves(poolAddress) {
    try {
        const contract = await readTronWeb.contract(RESERVES_ABI, poolAddress);
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

function getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * BigInt(997);
    const numerator = amountInWithFee * reserveOut;
    const denominator = (reserveIn * BigInt(1000)) + amountInWithFee;
    return numerator / denominator;
}

function getAmountIn(amountOut, reserveIn, reserveOut) {
    const numerator = reserveIn * amountOut * BigInt(1000);
    const denominator = (reserveOut - amountOut) * BigInt(997);
    return (numerator / denominator) + BigInt(1);
}

async function checkAllowance(tokenAddress, owner, spender) {
    try {
        const contract = await readTronWeb.contract(ERC20_ABI, tokenAddress);
        const allowance = await contract.allowance(owner, spender).call();
        return BigInt(allowance);
    } catch (error) {
        console.error('Error in checkAllowance:', error);
        document.getElementById('status-msg').textContent = 'Failed to check allowance.';
        throw error;
    }
}

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

async function updateBalances() {
    if (!isWalletConnected || !readTronWeb) {
        document.getElementById('from-balance').textContent = 'Balance: 0';
        document.getElementById('to-balance').textContent = 'Balance: 0';
        return;
    }

    const tokenFrom = document.getElementById('from-token').value;
    const tokenTo = document.getElementById('to-token').value;

    let balanceFrom = 0n;
    let balanceTo = 0n;

    if (tokenFrom === 'TRX') {
        balanceFrom = BigInt(await readTronWeb.trx.getBalance(userAddress));
    } else {
        const contract = await readTronWeb.contract(ERC20_ABI, TOKENS[tokenFrom]);
        balanceFrom = BigInt(await contract.balanceOf(userAddress).call());
    }

    if (tokenTo === 'TRX') {
        balanceTo = BigInt(await readTronWeb.trx.getBalance(userAddress));
    } else {
        const contract = await readTronWeb.contract(ERC20_ABI, TOKENS[tokenTo]);
        balanceTo = BigInt(await contract.balanceOf(userAddress).call());
    }

    const formattedFrom = formatNumber(Number(balanceFrom) / 10 ** DECIMALS[tokenFrom]);
    const formattedTo = formatNumber(Number(balanceTo) / 10 ** DECIMALS[tokenTo]);

    document.getElementById('from-balance').textContent = `Balance: ${formattedFrom} ${tokenFrom}`;
    document.getElementById('to-balance').textContent = `Balance: ${formattedTo} ${tokenTo}`;
}

async function setMaxAmount() {
    if (!isWalletConnected || !readTronWeb) {
        alert('Please connect your wallet first.');
        return;
    }

    const tokenFrom = document.getElementById('from-token').value;
    let balanceRaw;

    if (tokenFrom === 'TRX') {
        balanceRaw = await readTronWeb.trx.getBalance(userAddress);
    } else {
        const contract = await readTronWeb.contract(ERC20_ABI, TOKENS[tokenFrom]);
        balanceRaw = await contract.balanceOf(userAddress).call();
    }

    const decimals = DECIMALS[tokenFrom];
    const balance = Number(balanceRaw) / 10 ** decimals;
    const uiBalance = Math.floor(balance * 100) / 100;

    window.maxAmountBigInt = BigInt(balanceRaw);
    document.getElementById('from-amount').value = formatNumber(uiBalance);
    lastInputField = 'from';
    await updateExpectedOutput();
}

async function updateExpectedOutput() {
    if (!isWalletConnected || !readTronWeb) {
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

    amountIn = parseInput(amountIn);
    amountOut = parseInput(amountOut);

    if ((amountIn <= 0 && amountOut <= 0) || isNaN(amountIn) || isNaN(amountOut)) {
        document.getElementById('from-amount').value = '';
        document.getElementById('to-amount').value = '';
        document.getElementById('rate-info').textContent = 'Rate: --';
        document.getElementById('impact-info').textContent = 'Price Impact: --';
        return;
    }

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

        const rate = (Number(amountOutBigInt) / 10 ** DECIMALS[tokenTo]) / (Number(amountInBigInt) / 10 ** DECIMALS[tokenFrom]);
        const displayFrom = tokenFrom === 'TRX' ? 'WTRX' : tokenFrom;
        const displayTo = tokenTo === 'TRX' ? 'WTRX' : tokenTo;
        const formattedRate = rate.toFixed(DECIMALS[tokenTo]);
        document.getElementById('rate-info').textContent = `Rate: 1 ${displayFrom} = ${formattedRate} ${displayTo}`;

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

    let amountInBigInt = (window.maxAmountBigInt && Math.abs(Number(window.maxAmountBigInt) - amountInFloat * 10 ** DECIMALS[tokenFrom]) < 1)
        ? window.maxAmountBigInt
        : BigInt(Math.floor(amountInFloat * 10 ** DECIMALS[tokenFrom]));

    const tokenAddressFrom = TOKENS[tokenFrom];
    const tokenAddressTo = TOKENS[tokenTo];

    try {
        let balanceRaw;
        if (tokenFrom === 'TRX') {
            balanceRaw = await readTronWeb.trx.getBalance(userAddress);
        } else {
            const contract = await readTronWeb.contract(ERC20_ABI, tokenAddressFrom);
            balanceRaw = await contract.balanceOf(userAddress).call();
        }
        const balance = Number(balanceRaw) / 10 ** DECIMALS[tokenFrom];
        if (balance < amountInFloat && !window.maxAmountBigInt) {
            document.getElementById('status-msg').textContent = `Insufficient ${tokenFrom} balance.`;
            return;
        }

        if (tokenTo === 'STBLX' && (tokenFrom === 'USDT' || tokenFrom === 'USDD')) {
            const swapContract = await tronWeb.contract(STBLX_SWAP_ABI, STBLX_SWAP_CONTRACT);

            const trxBalance = Number(await readTronWeb.trx.getBalance(userAddress)) / 1e6;
            if (trxBalance < 1) {
                document.getElementById('status-msg').textContent = 'Insufficient TRX for transaction fees.';
                return;
            }

            const allowance = await checkAllowance(tokenAddressFrom, userAddress, STBLX_SWAP_CONTRACT);
            if (allowance < amountInBigInt) {
                await approveToken(tokenAddressFrom, amountInBigInt, STBLX_SWAP_CONTRACT);
            }

            document.getElementById('status-msg').textContent = `Processing STBLX swap with ${tokenFrom}...`;
            const method = tokenFrom === 'USDT' ? 'buyWithUSDT' : 'buyWithUSDD';
            const tx = await swapContract[method](amountInBigInt.toString()).send({ feeLimit: 100000000 });
            document.getElementById('status-msg').textContent = `TX: ${tx}`;
            await updateBalances();
            await updateExpectedOutput();
            return;
        }

        const slippage = 1;
        const minOutBigInt = window.expectedOutBigInt * BigInt(100 - slippage) / BigInt(100);
        const deadline = Math.floor(Date.now() / 1000) + 600;
        const router = await tronWeb.contract(ROUTER_ABI, SUNSWAP_ROUTER);

        if (tokenFrom === 'TRX') {
            const path = [WTRX_CONTRACT, tokenAddressTo];
            document.getElementById('status-msg').textContent = 'Processing swap...';
            const tx = await router.swapExactETHForTokens(
                minOutBigInt.toString(),
                path,
                userAddress,
                deadline
            ).send({
                callValue: amountInBigInt.toString(),
                feeLimit: 100000000
            });
            document.getElementById('status-msg').textContent = `TX: ${tx}`;
        } else if (tokenTo === 'TRX') {
            const path = [tokenAddressFrom, WTRX_CONTRACT];
            const allowance = await checkAllowance(tokenAddressFrom, userAddress, SUNSWAP_ROUTER);
            if (allowance < amountInBigInt) {
                await approveToken(tokenAddressFrom, amountInBigInt, SUNSWAP_ROUTER);
            }
            document.getElementById('status-msg').textContent = 'Processing swap...';
            const tx = await router.swapExactTokensForETH(
                amountInBigInt.toString(),
                minOutBigInt.toString(),
                path,
                userAddress,
                deadline
            ).send({ feeLimit: 100000000 });
            document.getElementById('status-msg').textContent = `TX: ${tx}`;
        } else {
            const path = [tokenAddressFrom, tokenAddressTo];
            const allowance = await checkAllowance(tokenAddressFrom, userAddress, SUNSWAP_ROUTER);
            if (allowance < amountInBigInt) {
                await approveToken(tokenAddressFrom, amountInBigInt, SUNSWAP_ROUTER);
            }
            document.getElementById('status-msg').textContent = 'Processing swap...';
            const tx = await router.swapExactTokensForTokens(
                amountInBigInt.toString(),
                minOutBigInt.toString(),
                path,
                userAddress,
                deadline
            ).send({ feeLimit: 100000000 });
            document.getElementById('status-msg').textContent = `TX: ${tx}`;
        }

        await updateBalances();
        await updateExpectedOutput();
    } catch (error) {
        console.error('Error in executeSwap:', error);
        document.getElementById('status-msg').textContent = 'Swap failed: ' + (error.message || 'Unknown error');
    }
}

async function mirrorSwap() {
    const fromSelect = document.getElementById('from-token');
    const toSelect = document.getElementById('to-token');
    const fromToken = fromSelect.value;
    const toToken = toSelect.value;

    if (toToken === 'STBLX' && (fromToken === 'USDT' || fromToken === 'USDD')) {
        document.getElementById('status-msg').textContent = 'Cannot swap STBLX to USDT/USDD.';
        return;
    }

    const effectiveFrom = toToken === 'TRX' ? 'WTRX' : toToken;
    const effectiveTo = fromToken === 'TRX' ? 'WTRX' : fromToken;
    const possibleKey1 = `${effectiveFrom}-${effectiveTo}`;
    const possibleKey2 = `${effectiveTo}-${effectiveFrom}`;
    const poolExists = POOLS[possibleKey1] || POOLS[possibleKey2];

    if (!poolExists) {
        document.getElementById('status-msg').textContent = 'No pool exists for the mirrored pair.';
        return;
    }

    fromSelect.value = toToken;
    updateToDropdown(toToken);
    toSelect.value = fromToken;

    document.getElementById('from-amount').value = '';
    document.getElementById('to-amount').value = '';
    document.getElementById('rate-info').textContent = 'Rate: --';
    document.getElementById('impact-info').textContent = 'Price Impact: --';

    await updateBalances();
}

// Static event listeners (elements exist immediately in DOM)
document.getElementById('from-token').addEventListener('change', async () => {
    const fromToken = document.getElementById('from-token').value;
    updateToDropdown(fromToken);
    document.getElementById('from-amount').value = '';
    document.getElementById('to-amount').value = '';
    document.getElementById('rate-info').textContent = 'Rate: --';
    document.getElementById('impact-info').textContent = 'Price Impact: --';
    await updateBalances();
});

document.getElementById('to-token').addEventListener('change', async () => {
    document.getElementById('from-amount').value = '';
    document.getElementById('to-amount').value = '';
    document.getElementById('rate-info').textContent = 'Rate: --';
    document.getElementById('impact-info').textContent = 'Price Impact: --';
    await updateBalances();
});

document.getElementById('from-amount').addEventListener('input', function () {
    let value = this.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    if (parts[1] && parts[1].length > 2) value = parts[0] + '.' + parts[1].slice(0, 2);
    this.value = value;
    lastInputField = 'from';
    updateExpectedOutput();
});

document.getElementById('from-amount').addEventListener('blur', function () {
    const value = parseInput(this.value);
    this.value = value > 0 ? formatNumber(value) : '';
    lastInputField = 'from';
    updateExpectedOutput();
});

document.getElementById('to-amount').addEventListener('input', function () {
    let value = this.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
    if (parts[1] && parts[1].length > 2) value = parts[0] + '.' + parts[1].slice(0, 2);
    this.value = value;
    lastInputField = 'to';
    updateExpectedOutput();
});

document.getElementById('to-amount').addEventListener('blur', function () {
    const value = parseInput(this.value);
    this.value = value > 0 ? formatNumber(value) : '';
    lastInputField = 'to';
    updateExpectedOutput();
});

document.getElementById('max-button').addEventListener('click', setMaxAmount);
document.getElementById('swap-button').addEventListener('click', executeSwap);
document.getElementById('mirror-button').addEventListener('click', mirrorSwap);

// Poll for async-loaded connect-button (from header fetch)
const connectPollInterval = setInterval(() => {
    const connectBtn = document.getElementById('connect-button');
    if (connectBtn) {
        connectBtn.addEventListener('click', connectWallet);
        if (isWalletConnected) {
            connectBtn.innerHTML = '<i class="icon-wallet me-md-2"></i> Wallet Connected';
            connectBtn.disabled = true;
        }
        clearInterval(connectPollInterval);
    }
}, 300);

// Auto-connect if wallet already connected
if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    (async () => {
        tronWeb = window.tronWeb;
        userAddress = tronWeb.defaultAddress.base58;

        readTronWeb = new tronWeb.constructor(
            CHAINSTACK_BASE_URL,
            CHAINSTACK_BASE_URL,
            CHAINSTACK_BASE_URL
        );
        readTronWeb.setAddress(userAddress);

        isWalletConnected = true;

        populateTokenSelectors();
        await updateBalances();

        // Update connect button if already loaded
        const connectBtn = document.getElementById('connect-button');
        if (connectBtn) {
            connectBtn.innerHTML = '<i class="icon-wallet me-md-2"></i> Wallet Connected';
            connectBtn.disabled = true;
        }
    })();
}
