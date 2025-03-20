document.addEventListener('DOMContentLoaded', async () => {
    // Replace with your deployed contract and token addresses
    const contractAddress = "TYmnqRGEQyjz3yUX482F9uZTaee8YprYRf";
    const tokenAddress = "TAME19SjDjKxC3omaJG5HWMTxhbHMrzWMi";
    const tronWeb = window.tronWeb;

    // Check for TronLink
    if (!tronWeb || !tronWeb.defaultAddress.base58) {
        alert("Please install TronLink and connect your wallet.");
        return;
    }

    // Contract instances
    const contract = await tronWeb.contract().at(contractAddress);
    const token = await tronWeb.contract().at(tokenAddress);

    // Initialize the wheel
    const theWheel = new Winwheel({
        'numSegments': 10,
        'outerRadius': 180,
        'textFontSize': 16,
        'segments': [
            { 'fillStyle': '#ff4d4d', 'text': 'Lose' },
            { 'fillStyle': '#ff4d4d', 'text': 'Lose' },
            { 'fillStyle': '#ff4d4d', 'text': 'Lose' },
            { 'fillStyle': '#ff4d4d', 'text': 'Lose' },
            { 'fillStyle': '#ff4d4d', 'text': 'Lose' },
            { 'fillStyle': '#ff4d4d', 'text': 'Lose' },
            { 'fillStyle': '#ff4d4d', 'text': 'Lose' },
            { 'fillStyle': '#00cc00', 'text': '2x' },
            { 'fillStyle': '#00cc00', 'text': '2x' },
            { 'fillStyle': '#ffd700', 'text': '3x' }
        ],
        'animation': {
            'type': 'spinToStop',
            'duration': 5,
            'spins': 8,
            'callbackFinished': () => {
                const result = document.getElementById('result').innerText;
                document.getElementById('spin-button').disabled = false;
            }
        }
    });

    // Elements
    const spinButton = document.getElementById('spin-button');
    const approveButton = document.getElementById('approve-button');
    const balanceDisplay = document.getElementById('balance');
    const resultDisplay = document.getElementById('result');

    // Update balance
    async function updateBalance() {
        const balance = await token.balanceOf(tronWeb.defaultAddress.base58).call();
        balanceDisplay.innerText = `Your balance: ${(balance / 1e6).toFixed(2)} CFT`;
        return balance;
    }

    // Check and toggle approval
    async function checkAllowance() {
        const allowance = await token.allowance(tronWeb.defaultAddress.base58, contractAddress).call();
        if (allowance < 50e6) {
            approveButton.style.display = 'inline-block';
            spinButton.style.display = 'none';
        } else {
            approveButton.style.display = 'none';
            spinButton.style.display = 'inline-block';
        }
    }

    // Approve token spending
    approveButton.addEventListener('click', async () => {
        try {
            approveButton.disabled = true;
            await token.approve(contractAddress, '1000000000').send({
                feeLimit: 100000000
            });
            await checkAllowance();
        } catch (error) {
            console.error("Approval failed:", error);
            resultDisplay.innerText = "Approval failed. Please try again.";
        } finally {
            approveButton.disabled = false;
        }
    });

    // Spin the wheel
    spinButton.addEventListener('click', async () => {
        const balance = await updateBalance();
        if (balance < 50e6) {
            resultDisplay.innerText = "Insufficient balance";
            return;
        }

        spinButton.disabled = true;
        resultDisplay.innerText = "Spinning...";

        try {
            // Send spin transaction
            await contract.spin().send({
                callValue: 0,
                feeLimit: 100000000,
                shouldPollResponse: false
            });

            // Listen for SpinResult event
            contract.SpinResult().watch((err, event) => {
                if (err) {
                    console.error("Event watch error:", err);
                    resultDisplay.innerText = "Error processing spin.";
                    spinButton.disabled = false;
                    return;
                }

                if (event.player.toLowerCase() === tronWeb.defaultAddress.hex.toLowerCase()) {
                    const multiplier = Number(event.multiplier);
                    let segmentIndex;

                    if (multiplier === 0) {
                        segmentIndex = Math.floor(Math.random() * 7) + 1; // Segments 1-7
                    } else if (multiplier === 2) {
                        segmentIndex = Math.floor(Math.random() * 2) + 8; // Segments 8-9
                    } else if (multiplier === 3) {
                        segmentIndex = 10; // Segment 10
                    }

                    const segment = theWheel.segments[segmentIndex];
                    const stopAngle = segment.startAngle + Math.random() * (segment.endAngle - segment.startAngle);
                    theWheel.animation.stopAngle = stopAngle;
                    theWheel.startAnimation();

                    resultDisplay.innerText = multiplier === 0 ? "You lost!" : `You won ${multiplier}x!`;
                    updateBalance();
                }
            });
        } catch (error) {
            console.error("Spin failed:", error);
            resultDisplay.innerText = "Spin failed. Please try again.";
            spinButton.disabled = false;
        }
    });

    // Initial setup
    await updateBalance();
    await checkAllowance();
});
