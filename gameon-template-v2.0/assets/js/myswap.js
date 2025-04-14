// Constants
const SMART_ROUTER = 'TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR';

const TOKENS = {
    TRX:  'TRX_NATIVE', // pseudo address for frontend, used only in UI
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
    TRX: 6, WTRX: 6, KING: 6, CFT: 6, BBT: 8, USDT: 6, PROS: 18, JM: 8, USDD: 18, SUN: 18,
    WIN: 6, TWX: 18, ARB: 6, JST: 18, TEM: 6, TUSD: 18, BTC: 8
};

// Simplified router ABI with swapExactInput
const SMART_ROUTER_ABI = [{
    name: 'swapExactInput',
    type: 'function',
    inputs: [
        { name: 'path', type: 'address[]' },
        { name: 'poolVersions', type: 'uint8[]' },
        { name: 'versionLen', type: 'uint256' },
        { name: 'fees', type: 'uint256[]' },
        {
            name: 'swapData', type: 'tuple[]', components: [
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

// Wallet connection
let tronWeb;
let userAddress;
let isWalletConnected = false;

function formatNumber(num) {
    return Number(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

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

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

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

// Update to-token options
function updateToDropdown(fromToken) {
    const toSelect = document.getElementById('to-token');
    const tokenAddrDisplay = document.getElementById('token-address');
    if (!toSelect || !tokenAddrDisplay) return;

    toSelect.innerHTML = '';
    Object.keys(TOKENS).forEach(token => {
        if (token !== fromToken) {
            const option = document.createElement('option');
            option.value = token;
            option.text = token;
            toSelect.appendChild(option);
        }
    });

    tokenAddrDisplay.textContent = fromToken === 'TRX' ? 'Native TRX (auto-wrapped)' : TOKENS[fromToken];
}

// Update balances
async function updateBalances() {
    if (!isWalletConnected) return;

    const tokenFrom = document.getElementById('from-token').value;
    if (tokenFrom === 'TRX') {
        const balance = await tronWeb.trx.getBalance(userAddress);
        document.getElementById('rate-info').textContent = `Balance: ${formatNumber(balance / 1e6)} TRX`;
    } else {
        const contract = await tronWeb.contract().at(TOKENS[tokenFrom]);
        const balance = await contract.balanceOf(userAddress).call();
        const value = Number(balance) / 10 ** DECIMALS[tokenFrom];
        document.getElementById('rate-info').textContent = `Balance: ${formatNumber(value)} ${tokenFrom}`;
    }
}

// Dummy placeholders for route + expected output (replace with your logic)
window.expectedOutBigInt = BigInt(1e6);  // For now
window.amountInBigInt = BigInt(1e6);
window.bestRoute = ['TRX', 'CFT'];  // Dummy route

async function executeSwap() {
    if (!isWalletConnected) return alert('Connect wallet first.');

    const fromToken = document.getElementById('from-token').value;
    const toToken = document.getElementById('to-token').value;
    let amountIn = parseFloat(document.getElementById('from-amount').value.replace(/,/g, ''));

    if (!amountIn || isNaN(amountIn)) {
        document.getElementById('status-msg').textContent = 'Enter a valid amount.';
        return;
    }

    const amountInBigInt = BigInt(Math.floor(amountIn * 10 ** DECIMALS[fromToken]));
    const minOutBigInt = window.expectedOutBigInt * BigInt(99n) / BigInt(100); // 1% slippage
    const path = window.bestRoute.map(t => t === 'TRX' ? TOKENS['WTRX'] : TOKENS[t]);

    const swapData = [{
        amountIn: amountInBigInt.toString(),
        amountOutMin: minOutBigInt.toString(),
        deadline: Math.floor(Date.now() / 1000) + 600,
        to: userAddress
    }];

    const contract = await tronWeb.contract(SMART_ROUTER_ABI, SMART_ROUTER);

    const poolVersions = new Array(path.length - 1).fill(2);
    const versionLen = poolVersions.length;
    const fees = new Array(path.length - 1).fill(0);

    try {
        document.getElementById('status-msg').textContent = 'Processing swap...';

        const tx = await contract.swapExactInput(
            path,
            poolVersions,
            versionLen,
            fees,
            swapData
        ).send({
            feeLimit: 100000000,
            callValue: fromToken === 'TRX' ? amountInBigInt.toString() : '0'
        });

        document.getElementById('status-msg').textContent = `Swap complete! TX: ${tx}`;
        await updateBalances();
    } catch (err) {
        console.error(err);
        document.getElementById('status-msg').textContent = 'Swap failed: ' + (err.message || 'Unknown error');
    }
}

// Event listeners
document.getElementById('connect-button').addEventListener('click', connectWallet);
document.getElementById('from-token').addEventListener('change', async () => {
    updateToDropdown(document.getElementById('from-token').value);
    await updateBalances();
});
document.getElementById('to-token').addEventListener('change', async () => {
    await updateBalances();
});
document.getElementById('from-amount').addEventListener('input', async () => {
    await updateBalances();
});
document.getElementById('swap-button').addEventListener('click', executeSwap);

// Auto-connect
if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    connectWallet();
}

