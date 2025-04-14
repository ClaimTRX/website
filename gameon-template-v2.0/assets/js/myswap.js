// Constants
const SMART_ROUTER = 'TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR';

const TOKENS = {
    TRX:  'TRX', // virtual
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
    TRX: 6, WTRX: 6, KING: 6, CFT: 6, BBT: 8, USDT: 6, PROS: 18, JM: 8,
    USDD: 18, SUN: 18, WIN: 6, TWX: 18, ARB: 6, JST: 18, TEM: 6, TUSD: 18, BTC: 8
};

const SMART_ROUTER_ABI = [{
    name: 'swapExactInput',
    type: 'function',
    inputs: [
        { name: 'path', type: 'address[]' },
        { name: 'poolVersions', type: 'uint8[]' },
        { name: 'versionLen', type: 'uint256' },
        { name: 'fees', type: 'uint256[]' },
        {
            name: 'swapData',
            type: 'tuple[]',
            components: [
                { name: 'amountIn', type: 'uint256' },
                { name: 'amountOutMin', type: 'uint256' },
                { name: 'deadline', type: 'uint256' },
                { name: 'to', type: 'address' }
            ]
        }
    ],
    stateMutability: 'payable',
    outputs: []
}];

// Global variables
let tronWeb;
let userAddress;
let isWalletConnected = false;

function formatNumber(num) {
    return Number(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Connect to TronLink
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
        } else {
            alert('TronLink not found.');
        }
    } catch (e) {
        console.error('Connection error:', e);
        alert('Wallet connection failed.');
    }
}

// Token dropdown setup
function populateTokenSelectors() {
    const from = document.getElementById('from-token');
    const to = document.getElementById('to-token');
    Object.keys(TOKENS).forEach(token => {
        const opt1 = document.createElement('option');
        opt1.value = token;
        opt1.text = token;
        from.appendChild(opt1);
    });
    Object.keys(TOKENS).forEach(token => {
        const opt2 = document.createElement('option');
        opt2.value = token;
        opt2.text = token;
        to.appendChild(opt2);
    });
    from.value = 'TRX';
    to.value = 'USDT';
}

// Update expected output (mock preview)
async function updateExpectedOutput() {
    const fromToken = document.getElementById('from-token').value;
    const toToken = document.getElementById('to-token').value;
    let amountIn = document.getElementById('from-amount').value;

    if (!amountIn || isNaN(amountIn)) {
        document.getElementById('to-amount').value = '';
        document.getElementById('rate-info').textContent = 'Rate: --';
        return;
    }

    const decIn = DECIMALS[fromToken];
    const decOut = DECIMALS[toToken];
    const bigIn = BigInt(Math.floor(parseFloat(amountIn) * 10 ** decIn));

    window.amountInBigInt = bigIn;
    window.expectedOutBigInt = bigIn * BigInt(95) / BigInt(100); // Mock 5% less
    window.path = [TOKENS[fromToken] === 'TRX' ? TOKENS['WTRX'] : TOKENS[fromToken], TOKENS[toToken]];
    window.poolVersions = [2];
    window.fees = [0];

    const outNum = Number(window.expectedOutBigInt) / 10 ** decOut;
    document.getElementById('to-amount').value = formatNumber(outNum);
    document.getElementById('rate-info').textContent = `Rate: 1 ${fromToken} = ${formatNumber(outNum / parseFloat(amountIn))} ${toToken}`;
}

// Swap with Smart Router
async function executeSwap() {
    const fromToken = document.getElementById('from-token').value;
    const toToken = document.getElementById('to-token').value;
    const amountInBigInt = window.amountInBigInt;
    const minOutBigInt = window.expectedOutBigInt;
    const path = window.path;
    const poolVersions = window.poolVersions;
    const fees = window.fees;

    const router = await tronWeb.contract(SMART_ROUTER_ABI, SMART_ROUTER);
    const swapData = [{
        amountIn: amountInBigInt.toString(),
        amountOutMin: minOutBigInt.toString(),
        deadline: Math.floor(Date.now() / 1000) + 600,
        to: userAddress
    }];

    try {
        document.getElementById('status-msg').textContent = 'Sending swap...';

        const tx = await router.swapExactInput(
            path,
            poolVersions,
            poolVersions.length,
            fees,
            swapData
        ).send({
            feeLimit: 100_000_000,
            callValue: fromToken === 'TRX' ? amountInBigInt.toString() : '0'
        });

        document.getElementById('status-msg').textContent = `Swap success! TX: ${tx}`;
    } catch (err) {
        console.error('Swap error:', err);
        document.getElementById('status-msg').textContent = 'Swap failed';
    }
}

// Event Listeners
document.getElementById('connect-button').addEventListener('click', connectWallet);
document.getElementById('from-token').addEventListener('change', updateExpectedOutput);
document.getElementById('to-token').addEventListener('change', updateExpectedOutput);
document.getElementById('from-amount').addEventListener('input', updateExpectedOutput);
document.getElementById('swap-button').addEventListener('click', executeSwap);

// Auto-connect
if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    connectWallet();
}

