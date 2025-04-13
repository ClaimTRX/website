// assets/js/cftswap.js

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
    'CFT-KING':  { addr: 'TRRevVDqvM31DdUQb73qViCEcDyCffYJTA', token0: 'CFT', token1: 'KING' },
    'CFT-BBT':   { addr: 'TLWPwGteW4gZ1AU5CWCPYmfLdEm8yqduNb', token0: 'CFT', token1: 'BBT' },
    'TWX-CFT':   { addr: 'TE5X2A4rhXyoSheojRGiqow5qjapSQdrPY', token0: 'CFT', token1: 'TWX' },
    'CFT-TEM':   { addr: 'TKNxcR2i2G191XEJpC3PpFTm9TvMvbww3R', token0: 'CFT', token1: 'TEM' }
};

const ROUTER_ADDRESS = 'TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR';
const ROUTER_ABI = [{
    "outputs": [{"name": "amounts", "type": "uint256[]"}],
    "inputs": [
        {"name": "amountIn", "type": "uint256"},
        {"name": "amountOutMin", "type": "uint256"},
        {"name": "path", "type": "address[]"},
        {"name": "to", "type": "address"},
        {"name": "deadline", "type": "uint256"}
    ],
    "name": "swapExactTokensForTokens",
    "stateMutability": "Nonpayable",
    "type": "Function"
}];

let tronWeb;

async function initTronWeb() {
    if (!window.tronWeb || !window.tronWeb.defaultAddress.base58) {
        alert('Please connect your TronLink wallet.');
        return;
    }
    tronWeb = window.tronWeb;
    console.log('✅ TronWeb ready. Wallet:', tronWeb.defaultAddress.base58);
}

function populateDropdowns() {
    const fromSelect = document.getElementById('from-token');
    const toSelect = document.getElementById('to-token');
    for (const [symbol] of Object.entries(TOKENS)) {
        const opt = new Option(symbol, symbol);
        fromSelect.appendChild(opt.cloneNode(true));
        toSelect.appendChild(opt);
    }
    fromSelect.value = 'KING';
    toSelect.value = 'CFT';
}

function getMatchingPool(tokenA, tokenB) {
    const key1 = `${tokenA}-${tokenB}`;
    const key2 = `${tokenB}-${tokenA}`;
    return POOLS[key1] || POOLS[key2] || null;
}

async function getReserves(poolAddr) {
    const ABI = [{
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
    }];
    const contract = await tronWeb.contract(ABI, poolAddr);
    const { _reserve0, _reserve1 } = await contract.getReserves().call();
    return { reserve0: BigInt(_reserve0), reserve1: BigInt(_reserve1) };
}

function getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;
    return numerator / denominator;
}

async function updateOutputEstimate() {
    const from = document.getElementById('from-token').value;
    const to = document.getElementById('to-token').value;
    const inputRaw = document.getElementById('input-amount').value.trim();
    const rateDisplay = document.getElementById('rate-info');
    const outputInput = document.getElementById('output-amount');

    if (!inputRaw || isNaN(inputRaw)) return;
    const amount = parseFloat(inputRaw);

    const pool = getMatchingPool(from, to);
    if (!pool) return rateDisplay.innerText = 'Rate: No pool';

    const fromAddr = TOKENS[from];
    const toAddr = TOKENS[to];
    const fromDec = BigInt(10 ** DECIMALS[from]);
    const toDec = BigInt(10 ** DECIMALS[to]);
    const amountIn = BigInt(Math.floor(amount * 10 ** DECIMALS[from]));

    const { reserve0, reserve1 } = await getReserves(pool.addr);

    let reserveIn, reserveOut;
    if (TOKENS[pool.token0] === fromAddr) {
        reserveIn = reserve0;
        reserveOut = reserve1;
    } else {
        reserveIn = reserve1;
        reserveOut = reserve0;
    }

    const output = getAmountOut(amountIn, reserveIn, reserveOut);
    const readable = Number(output) / (10 ** DECIMALS[to]);
    rateDisplay.innerText = `Rate: ~${readable.toFixed(4)} ${to}`;
    outputInput.value = readable.toFixed(4);
}

async function executeSwap() {
    const from = document.getElementById('from-token').value;
    const to = document.getElementById('to-token').value;
    const slippage = parseFloat(document.getElementById('slippage').value || '1');
    const inputAmount = parseFloat(document.getElementById('input-amount').value);

    if (!inputAmount || isNaN(inputAmount)) return alert('Enter amount to swap');

    const path = [TOKENS[from], TOKENS[to]];
    const amountIn = BigInt(Math.floor(inputAmount * 10 ** DECIMALS[from]));
    const minOut = BigInt(document.getElementById('output-amount').value * (1 - slippage / 100) * 10 ** DECIMALS[to]);

    const router = await tronWeb.contract(ROUTER_ABI, ROUTER_ADDRESS);
    const deadline = Math.floor(Date.now() / 1000) + 600;

    try {
        const tx = await router.swapExactTokensForTokens(
            amountIn.toString(),
            minOut.toString(),
            path,
            tronWeb.defaultAddress.hex,
            deadline
        ).send({ feeLimit: 100_000_000 });
        alert('✅ Swap submitted! TX: ' + tx);
    } catch (err) {
        console.error(err);
        alert('❌ Swap failed. See console.');
    }
}

function initEvents() {
    document.getElementById('from-token').addEventListener('change', updateOutputEstimate);
    document.getElementById('to-token').addEventListener('change', updateOutputEstimate);
    document.getElementById('input-amount').addEventListener('input', updateOutputEstimate);
    document.getElementById('slippage').addEventListener('input', updateOutputEstimate);
    document.getElementById('max-button').addEventListener('click', async () => {
        const from = document.getElementById('from-token').value;
        const bal = await tronWeb.trx.getTokenBalance(tronWeb.defaultAddress.base58, TOKENS[from]);
        document.getElementById('input-amount').value = Number(bal) / 10 ** DECIMALS[from];
        updateOutputEstimate();
    });
    document.getElementById('swap-now').addEventListener('click', executeSwap);
}

(async function () {
    await initTronWeb();
    populateDropdowns();
    initEvents();
})();
