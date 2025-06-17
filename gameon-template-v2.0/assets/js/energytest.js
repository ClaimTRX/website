// WARNING: This file includes a private key for demo purposes only.
// NEVER expose private keys in client-side JavaScript in production.
// For a secure implementation, move CFT payments to a server-side API endpoint
// and store the private key in a secure environment (e.g., .env file).

// Constants
const CFT_CONTRACT_ADDRESS = 'THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK'; // REPLACE with actual CFT TRC20 contract address
const ENERGY_DELEGATION_WALLET = 'TD8QG6sQFy2cdsnvPXv3yfXai1avwrG1jU'; // Wallet to receive energy delegations
const CFT_PAYMENT_WALLET = 'TWzsvYAurZoKojdyrszU6aR94JEXQkL1jr'; // REPLACE with your CFT payment wallet address
const CFT_PAYMENT_PRIVATE_KEY = 'd822042898f0bf772c8e47a200930b275269c1667c12183b382a6443c4b46249'; // REPLACE with your CFT payment wallet private key
const TRONGRID_API_KEY = '1c09f073-c70c-4840-8d24-7fef9dcc84f0'; // REPLACE with your TronGrid API key (optional, for rate limits)

// Initialize TronWeb for CFT payments (for demo only)
const paymentTronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { 'TRON-PRO-API-KEY': TRONGRID_API_KEY },
    privateKey: CFT_PAYMENT_PRIVATE_KEY
});

let connectedAddress = null;
let userTronWeb = null;

async function init() {
    // DOM Elements
    const connectButton = document.getElementById('connect-button');
    const energyAmountSelect = document.getElementById('energy-amount');
    const lockDurationSelect = document.getElementById('lock-duration');
    const cftPriceInput = document.getElementById('cft-price');
    const receiverAddressInput = document.getElementById('receiver-address');
    const totalCftSpan = document.getElementById('total-cft');
    const sellEnergyButton = document.getElementById('sell-energy-button');
    const delegationStatusDiv = document.getElementById('delegation-status');
    const delegationMessageP = document.getElementById('delegation-message');
    const delegationHashA = document.getElementById('delegation-hash');

    // Wallet Connection
    connectButton.addEventListener('click', async () => {
        try {
            if (window.tronLink) {
                await window.tronLink.request({ method: 'tron_requestAccounts' });
                if (window.tronLink.ready) {
                    userTronWeb = window.tronLink.tronWeb;
                    connectedAddress = userTronWeb.defaultAddress.base58;
                    connectButton.innerHTML = `<i class="icon-wallet me-md-2"></i> ${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`;
                    receiverAddressInput.value = connectedAddress;
                    updateTotalCft();
                } else {
                    alert('Please unlock TronLink or install the extension.');
                }
            } else {
                alert('TronLink is not installed. Please install TronLink extension.');
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    });

    // Auto-populate receiver address when connected
    if (window.tronLink && window.tronLink.ready) {
        userTronWeb = window.tronLink.tronWeb;
        connectedAddress = userTronWeb.defaultAddress.base58;
        connectButton.innerHTML = `<i class="icon-wallet me-md-2"></i> ${connectedAddress.slice(0, 6)}...${connectedAddress.slice(-4)}`;
        receiverAddressInput.value = connectedAddress;
    }

    // Update total CFT calculation
    function updateTotalCft() {
        const energyAmount = parseInt(energyAmountSelect.value);
        const lockDuration = parseInt(lockDurationSelect.value);
        const cftPrice = parseFloat(cftPriceInput.value) || 0;
        if (energyAmount && lockDuration && cftPrice >= 0.1) {
            const totalCft = (energyAmount / 100000) * cftPrice * lockDuration;
            totalCftSpan.textContent = `${totalCft.toFixed(6)} CFT`;
        } else {
            totalCftSpan.textContent = 'Select valid options';
        }
    }

    energyAmountSelect.addEventListener('change', updateTotalCft);
    lockDurationSelect.addEventListener('change', updateTotalCft);
    cftPriceInput.addEventListener('input', updateTotalCft);

    // Sell Energy Button
    sellEnergyButton.addEventListener('click', async (event) => {
        event.preventDefault();
        if (!connectedAddress || !userTronWeb) {
            alert('Please connect your wallet first.');
            return;
        }

        const energyAmount = parseInt(energyAmountSelect.value);
        const lockDuration = parseInt(lockDurationSelect.value);
        const cftPrice = parseFloat(cftPriceInput.value);
        let receiverAddress = receiverAddressInput.value;

        if (!energyAmount || !lockDuration || cftPrice < 0.1) {
            alert('Please select valid energy amount, lock duration, and CFT price (minimum 0.1 CFT).');
            return;
        }

        if (!userTronWeb.isAddress(receiverAddress)) {
            alert('Invalid receiver address.');
            return;
        }

        // Default to connected wallet if receiver address is empty
        if (!receiverAddress) {
            receiverAddress = connectedAddress;
            receiverAddressInput.value = connectedAddress;
        }

        const totalCft = (energyAmount / 100000) * cftPrice * lockDuration;
        const totalCftWei = Math.floor(totalCft * 1e6); // CFT has 6 decimals

        delegationStatusDiv.style.display = 'none';
        delegationMessageP.textContent = '';
        delegationHashA.style.display = 'none';
        sellEnergyButton.disabled = true;
        sellEnergyButton.textContent = 'Processing...';

        try {
            // Check available energy
            const resources = await userTronWeb.trx.getAccountResources(connectedAddress);
            const availableEnergy = (resources.EnergyLimit || 0) - (resources.EnergyUsed || 0);
            if (availableEnergy < energyAmount) {
                throw new Error(`Insufficient energy. Available: ${availableEnergy}, Required: ${energyAmount}`);
            }

            // Check CFT balance of payment wallet
            const cftContract = await paymentTronWeb.contract().at(CFT_CONTRACT_ADDRESS);
            const balance = await cftContract.balanceOf(CFT_PAYMENT_WALLET).call();
            if (balance.lt(totalCftWei)) {
                throw new Error(`Insufficient CFT balance in payment wallet. Required: ${totalCft.toFixed(6)} CFT`);
            }

            // Delegate energy
            const tx = await userTronWeb.transactionBuilder.delegateResource(
                energyAmount,
                ENERGY_DELEGATION_WALLET,
                'ENERGY',
                connectedAddress,
                false
            );
            const signedTx = await userTronWeb.trx.sign(tx);
            const broadcast = await userTronWeb.trx.sendRawTransaction(signedTx);

            if (!broadcast.result || !broadcast.txID) {
                throw new Error('Failed to delegate energy.');
            }

            // Send CFT payment (WARNING: Client-side private key usage)
            const cftTx = await cftContract.transfer(receiverAddress, totalCftWei.toString()).send({
                from: CFT_PAYMENT_WALLET
            });

            // Update UI with success
            delegationStatusDiv.style.display = 'block';
            delegationStatusDiv.className = 'status-message success';
            delegationMessageP.textContent = `Successfully delegated ${energyAmount} energy for ${lockDuration} day(s). You received ${totalCft.toFixed(6)} CFT.`;
            delegationHashA.style.display = 'inline';
            delegationHashA.href = `https://tronscan.org/#/transaction/${broadcast.txID}`;
            delegationHashA.textContent = broadcast.txID.slice(0, 10) + '...';

            // Log transaction (console for demo; replace with server logging in production)
            console.log(`Delegation TxID: ${broadcast.txID}`);
            console.log(`CFT Payment TxID: ${cftTx}`);
            console.log(`Energy: ${energyAmount}, Duration: ${lockDuration} days, CFT: ${totalCft.toFixed(6)}`);

        } catch (error) {
            console.error('Error selling energy:', error);
            delegationStatusDiv.style.display = 'block';
            delegationStatusDiv.className = 'status-message error';
            delegationMessageP.textContent = `Error: ${error.message || 'Transaction failed'}`;
        } finally {
            sellEnergyButton.disabled = false;
            sellEnergyButton.textContent = 'Sell Energy';
        }
    });
}

window.addEventListener('load', init);
