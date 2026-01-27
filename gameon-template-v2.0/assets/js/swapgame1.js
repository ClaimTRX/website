// swapgame.js - Full working version for Game Token swaps (CFT → Game & TRX → Game)
let swapContracts = {};
let userAddress;
// Keep both overloads in ABI, but ALWAYS call by signature to avoid TronLink/TronWeb overload bugs.
const swapAbi = [
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "swap",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "swap",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
];
const swapDetails = {
  cft: {
    contractAddress: "TDqRsqMaxsjMAwx4VLR6xvYDM8RRfiL83r", // CFT→Game contract
    cftTokenAddress: "THUjZzHsvzDermxAGr3aGyophJ4nn4XyAK", // CFT token address
    tokenName: "CFT",
    inputId: "swap-cft-amount",
    buttonId: "swap-cft-button",
  },
  trx: {
    contractAddress: "TDyLmpoX2aBrpdfmQr7mXvXCY2AX7D8Mje", // TRX→Game contract
    tokenName: "TRX",
    inputId: "swap-trx-amount",
    buttonId: "swap-trx-button",
  },
};
async function initializeSwap() {
  if (!window.tronWeb || !window.tronWeb.defaultAddress?.base58) {
    console.log("TronWeb not ready yet");
    return;
  }
  userAddress = window.tronWeb.defaultAddress.base58;
  for (const key of ["cft", "trx"]) {
    const details = swapDetails[key];
    try {
      swapContracts[key] = await window.tronWeb.contract(swapAbi, details.contractAddress);
      const button = document.getElementById(details.buttonId);
      if (button) {
        button.addEventListener("click", () => performSwap(key));
      }
    } catch (e) {
      console.error(`Failed to initialize ${key} swap contract:`, e);
    }
  }
}
async function performSwap(type) {
  console.log(`Starting swap for type: ${type}`);
  if (!userAddress) {
    showToast({ title: "Wallet not connected", body: "Please connect your wallet first.", variant: "danger" });
    return;
  }
  const details = swapDetails[type];
  const amountInput = document.getElementById(details.inputId);
  if (!amountInput) {
    showToast({ title: "Error", body: "Input field missing.", variant: "danger" });
    return;
  }
  const rawInput = (amountInput.value || "").trim();
  if (!rawInput) {
    showToast({ title: "Error", body: "Please enter an amount.", variant: "danger" });
    return;
  }
  const cleanedInput = rawInput.replace(",", ".");
  const amount = parseFloat(cleanedInput);
  if (isNaN(amount) || amount <= 0) {
    showToast({
      title: "Invalid Amount",
      body: "Enter a valid positive number (e.g. 5 or 5.5).",
      variant: "danger",
    });
    return;
  }
  const button = document.getElementById(details.buttonId);
  withLoading(button, "Swapping...", async () => {
    try {
      let tx;
      if (type === "cft") {
        // CFT → Game (requires approval)
        // Use toSun to avoid float/rounding issues and keep encoder happy.
        const amountSun = window.tronWeb.toSun(amount); // string
        const cftTokenContract = await window.tronWeb.contract().at(details.cftTokenAddress);
        // Check current allowance
        const allowance = await cftTokenContract.allowance(userAddress, details.contractAddress).call();
        if (BigInt(allowance) < BigInt(amountSun)) {
          // Step 1: Approve
          showToast({
            title: "Step 1/2",
            body: "Approve CFT spending... Confirm in wallet.",
            variant: "info",
          });
          await cftTokenContract.approve(details.contractAddress, amountSun).send({
            feeLimit: 100_000_000,
          });
          await delay(6000); // optional confirmation wait
        }
        // Step 2: Swap (force correct overload)
        showToast({
          title: "Step 2/2",
          body: "Swapping CFT → Game... Confirm.",
          variant: "info",
        });
        tx = await swapContracts.cft["swap(uint256)"](amountSun).send({
          feeLimit: 100_000_000,
        });
      } else {
        // TRX → Game
        // IMPORTANT: force correct overload and pass callValue as string.
        const amountSun = window.tronWeb.toSun(amount); // string
        tx = await swapContracts.trx["swap()"]().send({
          callValue: amountSun,
          feeLimit: 80_000_000,
        });
      }
      // ── Add Telegram notification ────────────────────────────────────────────────
      try {
        const TELEGRAM_BOT_TOKEN = '7649731922:AAHmtLEynzwdllJQis9TFTKobHpl2aUcz0g';
        const TELEGRAM_CHAT_ID = '-1003603146813';
        const swapType = type.toUpperCase();
        const gameType = 'Game'; // Adjust if needed for 3/7 day distinction
        const message = 
          `🎁 New buy!\n` +
          `Wallet: ${userAddress}\n` +
          `Amount: ${amount} ${swapType}\n` +
          `For: CFT Game\n` +
          `Game: ${gameType}\n` +
          `Tx: https://tronscan.org/#/transaction/${tx}`;
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML',
            disable_web_page_preview: true
          })
        });
      } catch (notifyErr) {
        console.warn('Failed to send Telegram notification:', notifyErr);
      }
      // ──────────────────────────────────────────────────────────────────────────────
      showToast({
        title: "Swap Complete!",
        body: `You received ${amount.toFixed(6)} Game tokens!<br>
               <a href="https://tronscan.org/#/transaction/${tx}" target="_blank" rel="noopener">View on Tronscan</a>`,
        variant: "success",
      });
      amountInput.value = "";
    } catch (err) {
      console.error("Swap error:", err);
      let msg = "Transaction failed or rejected.";
      if (err?.message) {
        if (err.message.includes("balance") || err.message.includes("insufficient")) msg = "Insufficient balance.";
        else if (err.message.toLowerCase().includes("energy")) msg = "Not enough energy. Rent energy and try again.";
        else if (err.message.includes("REVERT")) msg = "Contract reverted. Check contract state/balance.";
        else msg = err.message;
      }
      showToast({ title: "Swap Failed", body: msg, variant: "danger" });
    }
  })();
}
// Helper functions
function showToast({ title, body, variant = "dark" }) {
  const el = document.getElementById("app-toast");
  if (!el) return;
  el.className = `toast text-bg-${variant}`;
  el.innerHTML = `
    <div class="toast-header">
      <strong class="me-auto">${title}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
    </div>
    <div class="toast-body">${body}</div>`;
  new bootstrap.Toast(el, { delay: 8000 }).show();
}
function withLoading(btn, label, fn) {
  return async () => {
    if (!btn) return fn(); // safety if button missing
    btn.disabled = true;
    const oldHTML = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>${label}`;
    try {
      await fn();
    } finally {
      btn.disabled = false;
      btn.innerHTML = oldHTML;
    }
  };
}
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Initialize
document.addEventListener("DOMContentLoaded", initializeSwap);
