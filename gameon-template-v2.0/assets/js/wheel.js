document.addEventListener('DOMContentLoaded', async () => {
    // Contract and token addresses
    const contractAddress = "TYmnqRGEQyjz3yUX482F9uZTaee8YprYRf";
    const tokenAddress = "TAME19SjDjKxC3omaJG5HWMTxhbHMrzWMi";

    // Check for TronLink and get TronWeb instance
    const tronWeb = window.tronWeb;
    if (!tronWeb || !tronWeb.defaultAddress.base58) {
        alert("Please install TronLink and connect your wallet.");
        return;
    }

    // Initialize contracts
    const contract = await tronWeb.contract().at(contractAddress);
    const token = await tronWeb.contract().at(tokenAddress);

    // Get UI elements
    const wheel = document.querySelector('.wheel');
    const spinButton = document.getElementById('spin-button');
    const approveButton = document.getElementById('approve-button');
    const balanceDisplay = document.getElementById('balance');
    const resultDisplay = document.getElementById('result');

    // Spin cost: 50 CFT tokens (assuming 6 decimals)
    const spinCost = 50e6;

    // Function to update and display user's token balance
    async function updateBalance() {
        const balance = await token.balanceOf(tronWeb.defaultAddress.base58).call();
        const balanceNum = balance.toNumber();
        balanceDisplay.innerText = `Your balance: ${(balanceNum / 1e6).toFixed(2)} CFT`;
        return balanceNum;
    }

    // Function to check if the contract is allowed to spend tokens
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

    // Event listener for approving token spending
    approveButton.addEventListener('click', async () => {
        try {
            approveButton.disabled = true;
            // Approve a large amount to avoid frequent approvals
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

    // Event listener for spinning the wheel
    spinButton.addEventListener('click', async () => {
        const balance = await updateBalance();
        if (balance < spinCost) {
            resultDisplay.innerText = "Insufficient balance";
            return;
        }

        spinButton.disabled = true;
        resultDisplay.innerText = "Spinning...";

        try {
            // Send the spin transaction
            await contract.spin().send({
                callValue: 0, // No TRX required; tokens are handled by the contract
                feeLimit: 100000000,
                shouldPollResponse: false
            });

            // Watch for the SpinResult event
            contract.SpinResult().watch((err, event) => {
                if (err) {
                    console.error("Event watch error:", err);
                    resultDisplay.innerText = "Error processing spin.";
                    spinButton.disabled = false;
                    return;
                }

                // Check if the event is for the current user
                if (event.player.toLowerCase() === tronWeb.defaultAddress.hex.toLowerCase()) {
                    const multiplier = Number(event.multiplier);

                    // Map multiplier to wheel segments (10 segments total)
                    let segmentIndices;
                    if (multiplier === 0) {
                        segmentIndices = [0, 1, 2, 3, 4, 5, 6]; // 7 "Lose" segments
                    } else if (multiplier === 2) {
                        segmentIndices = [7, 8]; // 2 "2x" segments
                    } else if (multiplier === 3) {
                        segmentIndices = [9]; // 1 "3x" segment
                    }

                    // Choose a random segment from the possible indices
                    const chosenIndex = segmentIndices[Math.floor(Math.random() * segmentIndices.length)];
                    const centerAngle = chosenIndex * 36 + 18; // Center of the segment
                    const targetRotation = ((270 - centerAngle) % 360 + 360) % 360; // Align with top pointer
                    const fullSpins = 1440; // 4 full spins
                    const rotation = fullSpins + targetRotation;

                    // Animate the wheel
                    wheel.style.transform = `rotate(${rotation}deg)`;

                    // Display result after animation (5 seconds)
                    setTimeout(() => {
                        resultDisplay.innerText = multiplier === 0 ? "You lost!" : `You won ${multiplier}x!`;
                        updateBalance();
                        spinButton.disabled = false;
                    }, 5000);
                }
            });
        } catch (error) {
            // Handle transaction errors
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
