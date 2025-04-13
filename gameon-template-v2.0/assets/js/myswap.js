const SUNSWAP_ROUTER = 'TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR';

const TOKENS = {
    TRX: null, // TRX is native, not a token
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
    TRX: 6,
    WTRX: 6, KING: 6, CFT: 6, BBT: 8, USDT: 6, PROS: 18, JM: 8, USDD: 18, SUN: 18,
    WIN: 6, TWX: 18, ARB: 6, JST: 18, TEM: 6, TUSD: 18, BTC: 8
};

const ROUTER_ABI = [
    {
        "name": "swapExactTokensForTokens",
        "type": "function",
        "inputs": [
            { "name": "amountIn", "type": "uint256" },
            { "name": "amountOutMin", "type": "uint256" },
            { "name": "path", "type": "address[]" },
            { "name": "to", "type": "address" },
            { "name": "deadline", "type": "uint256" }
        ],
        "outputs": [{ "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "nonpayable"
    },
    {
        "name": "swapExactTRXForTokens",
        "type": "function",
        "inputs": [
            { "name": "amountOutMin", "type": "uint256" },
            { "name": "path", "type": "address[]" },
            { "name": "to", "type": "address" },
            { "name": "deadline", "type": "uint256" }
        ],
        "outputs": [{ "name": "amounts", "type": "uint256[]" }],
        "stateMutability": "payable"
    }
];

const ERC20_ABI = [
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }],
        "name": "allowance",
        "outputs": [{ "name": "remaining", "type": "uint256" }],
        "stateMutability": "view"
    },
    {
        "constant": false,
        "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }],
        "name": "approve",
        "outputs": [{ "name": "success", "type": "bool" }],
        "stateMutability": "nonpayable"
    }
];

// Globals
let tronWeb;
let userAddress;
let isWalletConnected = false;

function formatNumber(num) {
    return Number(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

async function connectWallet() {
    const btn = document.getElementById('connect-button');
    try {
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
            tronWeb = window.tronWeb;
            userAddress = tronWeb.defaultAddress.base58;
            isWalletConnected = true;
            btn.textContent = 'Wallet Connected';
            btn.disabled = true;
            populateTokenSelectors();
            await updateBalances();
        } else {
            alert('TronLink not detected. Please install it.');
        }
    } catch (e) {
        alert('Wallet connection failed.');
        console.error(e);
    }
}

function populateTokenSelectors() {
    const fromSelect = document.getElementById('from-token');
    const toSelect = document.getElementById('to-token');

    Object.keys(TOKENS).forEach(token => {
        const opt = document.createElement('option');
        opt.value = token;
        opt.text = token;
        fromSelect.appendChild(opt.cloneNode(true));
    });

    updateToDropdown('CFT');
    fromSelect.value = 'CFT';
    toSelect.value = 'KING';
}

function updateToDropdown(fromToken) {
    const toSelect = document.getElementById('to-token');
    toSelect.innerHTML = '';

    const pairs = new Set();
    Object.keys(POOLS).forEach(pool => {
        const [a, b] = pool.split('-');
        if (a === fromToken) pairs.add(b);
        else if (b === fromToken) pairs.add(a);
    });

    pairs.forEach(token => {
        const opt = document.createElement('option');
        opt.value = token;
        opt.text = token;
        toSelect.appendChild(opt);
    });

    if (pairs.size > 0) {
        toSelect.value = Array.from(pairs)[0];
    }
}

async function updateBalances() {
    const tokenFrom = document.getElementById('from-token').value;
    try {
        let balance = '0';
        if (tokenFrom === 'TRX') {
            const sun = await tronWeb.trx.getBalance(userAddress);
            balance = formatNumber(sun / 10 ** DECIMALS['TRX']);
        } else {
            const contract = await tronWeb.contract(ERC20_ABI, TOKENS[tokenFrom]);
            const res = await contract.balanceOf(userAddress).call();
            balance = formatNumber(Number(res) / 10 ** DECIMALS[tokenFrom]);
        }

        document.getElementById('rate-info').textContent = `Balance: ${balance} ${tokenFrom}`;
    } catch (e) {
        document.getElementById('rate-info').textContent = `Balance: 0 ${tokenFrom}`;
    }
}

function getAmountOut(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * BigInt(997);
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * BigInt(1000) + amountInWithFee;
    return numerator / denominator;
}

async function fetchReserves(poolAddress) {
    try {
        const contract = await tronWeb.contract([{ name: "getReserves", type: "function", outputs: [{ name: "_reserve0", type: "uint112" }, { name: "_reserve1", type: "uint112" }] }], poolAddress);
        const r = await contract.getReserves().call();
        return { reserve0: BigInt(r._reserve0), reserve1: BigInt(r._reserve1) };
    } catch (e) {
        document.getElementById('status-msg').textContent = 'Reserve fetch failed.';
        throw e;
    }
}

async function checkAllowance(tokenAddress, owner, spender) {
    const contract = await tronWeb.contract(ERC20_ABI, tokenAddress);
    const res = await contract.allowance(owner, spender).call();
    return BigInt(res);
}

async function approveToken(tokenAddress, amount) {
    const contract = await tronWeb.contract(ERC20_ABI, tokenAddress);
    document.getElementById('status-msg').textContent = 'Approving...';
    await contract.approve(SUNSWAP_ROUTER, amount.toString()).send({ feeLimit: 100000000 });
    document.getElementById('status-msg').textContent = 'Approved';
}

async function updateExpectedOutput() {
    const tokenFrom = document.getElementById('from-token').value;
    const tokenTo = document.getElementById('to-token').value;
    let amountIn = document.getElementById('from-amount').value;

    if (!amountIn) {
        document.getElementById('to-amount').value = '';
        return;
    }

    amountIn = parseFloat(amountIn.replace(/,/g, ''));
    const key1 = `${tokenFrom}-${tokenTo}`;
    const key2 = `${tokenTo}-${tokenFrom}`;
    const pool = POOLS[key1] || POOLS[key2];

    if (!pool) {
        document.getElementById('to-amount').value = 'No pool';
        return;
    }

    const reserves = await fetchReserves(pool.addr);
    const isFromToken0 = TOKENS[pool.token0] === TOKENS[tokenFrom];
    const reserveIn = isFromToken0 ? reserves.reserve0 : reserves.reserve1;
    const reserveOut = isFromToken0 ? reserves.reserve1 : reserves.reserve0;

    const amountInBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[tokenFrom]));
    const amountOutBigInt = getAmountOut(amountInBigInt, reserveIn, reserveOut);
    const amountOut = Number(amountOutBigInt) / 10 ** DECIMALS[tokenTo];

    document.getElementById('to-amount').value = formatNumber(amountOut);
    const rate = amountOut / amountIn;
    document.getElementById('rate-info').textContent = `Rate: 1 ${tokenFrom} = ${formatNumber(rate)} ${tokenTo}`;

    window.expectedOutBigInt = amountOutBigInt;
    window.amountInBigInt = amountInBigInt;
}

async function executeSwap() {
    const tokenFrom = document.getElementById('from-token').value;
    const tokenTo = document.getElementById('to-token').value;

    const amountInBigInt = window.amountInBigInt;
    const expectedOutBigInt = window.expectedOutBigInt;
    const minOutBigInt = expectedOutBigInt * BigInt(99) / BigInt(100);
    const deadline = Math.floor(Date.now() / 1000) + 600;
    const router = await tronWeb.contract(ROUTER_ABI, SUNSWAP_ROUTER);

    try {
        if (tokenFrom === 'TRX') {
            const path = [TOKENS['WTRX'], TOKENS[tokenTo]];
            await router.swapExactTRXForTokens(
                minOutBigInt.toString(),
                path,
                userAddress,
                deadline
            ).send({ callValue: amountInBigInt.toString(), feeLimit: 100000000 });
        } else {
            const allowance = await checkAllowance(TOKENS[tokenFrom], userAddress, SUNSWAP_ROUTER);
            if (allowance < amountInBigInt) {
                await approveToken(TOKENS[tokenFrom], amountInBigInt);
            }

            const path = [TOKENS[tokenFrom], TOKENS[tokenTo]];
            await router.swapExactTokensForTokens(
                amountInBigInt.toString(),
                minOutBigInt.toString(),
                path,
                userAddress,
                deadline
            ).send({ feeLimit: 100000000 });
        }

        document.getElementById('status-msg').textContent = 'Swap complete!';
        await updateBalances();
        await updateExpectedOutput();
    } catch (e) {
        document.getElementById('status-msg').textContent = 'Swap failed.';
        console.error(e);
    }
}

document.getElementById('connect-button').addEventListener('click', connectWallet);

document.getElementById('from-token').addEventListener('change', async () => {
    updateToDropdown(document.getElementById('from-token').value);
    await updateBalances();
    await updateExpectedOutput();
});

document.getElementById('to-token').addEventListener('change', async () => {
    await updateBalances();
    await updateExpectedOutput();
});

document.getElementById('from-amount').addEventListener('input', updateExpectedOutput);
document.getElementById('swap-button').addEventListener('click', executeSwap);

if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    connectWallet();
}
