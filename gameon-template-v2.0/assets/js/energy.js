 const allowedAddresses = [
            "TR2XJawheHUAcbxgzABVh1toDA59Eb4RbM",
            "TQLrSGjNtYwtUdttbm4HsXxD6vmbePWni4",
            "TL71zkkpC59dKmj8CeVf3woiXJuTNGBUfw"
        ];

        let tronWeb, userAddress;

        async function checkTronLinkInstalled() {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
                        clearInterval(interval);
                        resolve(true);
                    }
                }, 1000);
                setTimeout(() => {
                    clearInterval(interval);
                    resolve(false);
                }, 10000);
            });
        }

        async function connectWallet() {
            if (!window.tronWeb) {
                alert("TronLink not found. Please install TronLink and log in.");
                return;
            }
            try {
                await window.tronLink.request({ method: "tron_requestAccounts" });
                tronWeb = window.tronWeb;
                userAddress = tronWeb.defaultAddress.base58;
                await checkAllowedAddress();
            } catch (e) {
                console.error("Wallet connection failed:", e);
            }
        }

        async function checkAllowedAddress() {
            const energyCard = document.getElementById('energy-card');
            const accessDenied = document.getElementById('access-denied');
            const connectWalletMessage = document.getElementById('connect-wallet-message');

            if (!userAddress) return;

            if (allowedAddresses.includes(userAddress)) {
                energyCard.style.display = 'block';
                accessDenied.style.display = 'none';
                connectWalletMessage.style.display = 'none';
            } else {
                energyCard.style.display = 'none';
                accessDenied.style.display = 'block';
                connectWalletMessage.style.display = 'none';
            }
        }

        async function callDelegationEndpoint() {
            const url = 'https://0rtix684bi.execute-api.eu-west-1.amazonaws.com/claimfreetrxtwo/claimfreetrxtwo';
            const payload = { AllocationAddress: userAddress, IsDelegation: true };

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer abc'
                    },
                    body: JSON.stringify(payload),
                });

                const data = await response.json();
                document.getElementById('msg').textContent = data.Message;
            } catch (error) {
                console.error("Network error:", error);
                document.getElementById('msg').textContent = "Error processing request.";
            }
        }

        document.addEventListener('DOMContentLoaded', async () => {
            if (await checkTronLinkInstalled()) {
                await connectWallet();
            }

            document.getElementById('request-energy-button').addEventListener('click', callDelegationEndpoint);
        });
