document.addEventListener("DOMContentLoaded", async function () {
    const connectButton = document.getElementById("connect-button");

    async function connectWallet() {
        if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
            userAddress = window.tronWeb.defaultAddress.base58;
            console.log("Connected to TronLink:", userAddress);
            connectButton.innerHTML = `<i class="icon-wallet me-md-2"></i> Wallet Connected`;
        } else {
            console.log("TronLink not connected.");
        }
    }

    connectButton.addEventListener("click", async () => {
        if (window.tronLink) {
            try {
                await window.tronLink.request({ method: "tron_requestAccounts" });
                connectWallet();
            } catch (e) {
                console.error("Failed to connect to TronLink:", e);
            }
        }
    });

    if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        connectWallet();
    }
});
