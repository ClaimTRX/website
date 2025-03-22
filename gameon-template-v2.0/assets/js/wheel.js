document.addEventListener('DOMContentLoaded', async () => {
    // Contract and token addresses
    const contractAddress = "TYmnqRGEQyjz3yUX482F9uZTaee8YprYRf";
    const tokenAddress = "TAME19SjDjKxC3omaJG5HWMTxhbHMrzWMi";

    // Check for TronLink
    const tronWeb = window.tronWeb;
    if (!tronWeb || !tronWeb.defaultAddress.base58) {
        alert("Please install TronLink and connect your wallet.");
        return;
    }

    // Initialize contracts
    const contract = await tronWeb.contract().at(contractAddress);
    const token = await tronWeb.contract().at(tokenAddress);

    // UI elements
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spin-button');
    const approveButton = document.getElementById('approve-button');
    const balanceDisplay = document.getElementById('balance');
    const resultDisplay = document.getElementById('result');

    // Spin cost: 50 CFT tokens (assuming 6 decimals)
    const spinCost = 50e6;

    // Update balance
    async function updateBalance() {
        const balance = await token.balanceOf(tronWeb.defaultAddress.base58).call();
        const balanceNum = balance.toNumber();
        balanceDisplay.innerText = `Your balance: ${(balanceNum / 1e6).toFixed(2)} CFT`;
        return balanceNum;
    }

    // Check allowance
    async function checkAllowance() {
        const allowance = await token.allowance(tronWeb.defaultAddress.base58, contractAddress).call();
        const allowanceNum = allowance.toNumber();
        if (allowanceNum < spinCost) {
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
            await token.approve(contractAddress, '1000000000000').send({
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
        if (balance < spinCost) {
            resultDisplay.innerText = "Insufficient balance";
            return;
        }

        spinButton.disabled = true;
        resultDisplay.innerText = "Spinning...";

        try {
            await contract.spin().send({
                callValue: 0,
                feeLimit: 100000000,
                shouldPollResponse: false
            });

            contract.SpinResult().watch((err, event) => {
                if (err) {
                    console.error("Event watch error:", err);
                    resultDisplay.innerText = "Error processing spin.";
                    spinButton.disabled = false;
                    return;
                }

                if (event.player.toLowerCase() === tronWeb.defaultAddress.hex.toLowerCase()) {
                    const multiplier = Number(event.multiplier);
                    let segmentIndices;
                    if (multiplier === 0) {
                        segmentIndices = [0, 1, 2, 3, 4, 5, 6]; // Lose
                    } else if (multiplier === 2) {
                        segmentIndices = [7, 8]; // 2x
                    } else if (multiplier === 3) {
                        segmentIndices = [9]; // 3x
                    }

                    const chosenIndex = segmentIndices[Math.floor(Math.random() * segmentIndices.length)];
                    const centerAngle = chosenIndex * 36 + 18;
                    const targetRotation = ((270 - centerAngle) % 360 + 360) % 360;
                    const fullSpins = 1440;
                    const rotation = fullSpins + targetRotation;

                    wheel.style.transform = `rotate(${rotation}deg)`;

                    setTimeout(() => {
                        resultDisplay.innerText = multiplier === 0 ? "You lost!" : `You won ${multiplier}x!`;
                        updateBalance();
                        spinButton.disabled = false;
                    }, 5000);
                }
            });
        } catch (error) {
            if (error === 'Confirmation declined by user') {
                resultDisplay.innerText = "Transaction declined.";
            } else {
                console.error("Spin failed:", error);
                resultDisplay.innerText = "Spin failed. Please try again.";
            }
            spinButton.disabled = false;
        }
    });

    // Initial setup
    await updateBalance();
    await checkAllowance();
});
