// swapgame.js - Full working version for Game Token swaps (CFT → Game & TRX → Game) with energy rental
let swapContracts = {};
let userAddress;
let energyPriceSun; // No fallback; remains undefined if fetch fails
const ENERGY_RENTAL_API_URL = 'https://energyrental.io'; // Base URL for EnergyRental.io API
const ENERGY_RENTAL_API_KEY = 'fa89bd0c-1d2a-401a-9dbc-cf16f9019331';
const ENERGY_RENTAL_API_SECRET = 'ccbe0df1-8799-4fe5-a98a-cef13440dd86';
const SUN_PER_TRX = 1_000_000;
const ENERGY_RENTAL_DURATION = 5;
// Energy costs for swap actions
const energyCosts = {
  approve: 65000,
  swapFirst: 100000,
  swapRepeat: 65000
};
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
  await fetchEnergyPrice();
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
async function fetchEnergyPrice() {
  if (!userAddress) {
    console.warn('No user address for fetching energy price.');
    return;
  }
  try {
    const res = await fetch(`${ENERGY_RENTAL_API_URL}/energy/get-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': ENERGY_RENTAL_API_KEY,
        'X-Api-Secret': ENERGY_RENTAL_API_SECRET
      },
      body: JSON.stringify({
        receiver: userAddress,
        amount: 65000,
        duration: 5
      })
    });
    if (!res.ok) throw new Error(`Quote failed: ${res.status}`);
    const data = await res.json();
    if (data.success && data.quote?.price_trx) {
      energyPriceSun = Math.round((data.quote.price_trx * 1e6) / 65000);
      console.log(`Fetched energy price: ${energyPriceSun} SUN per energy unit`);
    }
  } catch (e) {
    console.error('Failed to fetch energy price:', e);
  }
}
async function getAvailableEnergy(address) {
  try {
    const resources = await retryWithBackoff(() => window.tronWeb.trx.getAccountResources(address));
    const energyLimit = resources.EnergyLimit || 0;
    const energyUsed = resources.EnergyUsed || 0;
    return energyLimit - energyUsed;
  } catch (error) {
    return 0;
  }
}
async function requestEnergyRental(rentalEnergy) {
  let processingModal = null;
  try {
    processingModal = showProcessingModal('(1/2)');
    if (!userAddress) {
      throw new Error('Please connect your wallet first.');
    }
    const quoteRes = await fetch(`${ENERGY_RENTAL_API_URL}/energy/get-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': ENERGY_RENTAL_API_KEY,
        'X-Api-Secret': ENERGY_RENTAL_API_SECRET
      },
      body: JSON.stringify({
        receiver: userAddress,
        amount: rentalEnergy,
        duration: ENERGY_RENTAL_DURATION
      })
    });
    if (!quoteRes.ok) {
      const errText = await quoteRes.text();
      throw new Error(`Quote failed (${quoteRes.status}): ${errText}`);
    }
    const quoteData = await quoteRes.json();
    if (!quoteData.success) {
      throw new Error(quoteData.error || 'Failed to get quote from server');
    }
    const {
      price_trx,
      payment_address
    } = quoteData.quote;
    const paymentSun = Math.ceil(price_trx * SUN_PER_TRX);
    const paymentRes = await window.tronWeb.trx.sendTransaction(payment_address, paymentSun);
    if (!paymentRes?.result) {
      throw new Error('Payment transaction was rejected or failed.');
    }
    const createOrderRes = await fetch(`${ENERGY_RENTAL_API_URL}/energy/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': ENERGY_RENTAL_API_KEY,
        'X-Api-Secret': ENERGY_RENTAL_API_SECRET
      },
      body: JSON.stringify({
        receiver: userAddress,
        amount: rentalEnergy,
        duration: ENERGY_RENTAL_DURATION,
        payment_txid: paymentRes.txid
      })
    });
    if (!createOrderRes.ok) {
      const errText = await createOrderRes.text();
      throw new Error(`Create order failed (${createOrderRes.status}): ${errText}`);
    }
    const orderData = await createOrderRes.json();
    if (!orderData.success) {
      throw new Error(orderData.error || 'Order creation failed on server');
    }
    const delegated = await pollDelegationStatus(orderData.order_id);
    hideProcessingModal(processingModal);
    return delegated;
  } catch (error) {
    hideProcessingModal(processingModal);
    console.error('Energy rental error:', error);
    throw error;
  }
}
async function pollDelegationStatus(orderId) {
  const maxPollAttempts = 30;
  let pollAttempts = 0;
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      pollAttempts++;
      try {
        const response = await fetch(`${ENERGY_RENTAL_API_URL}/energy/delegation-status?order_id=${orderId}`, {
          method: 'GET',
          headers: { 'X-Api-Key': ENERGY_RENTAL_API_KEY,
            'X-Api-Secret': ENERGY_RENTAL_API_SECRET }
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.status === 'delegated') {
          clearInterval(interval);
          resolve(true);
        } else if (data.status === 'failed' || data.status === 'expired') {
          clearInterval(interval);
          reject(new Error(`Delegation failed: ${data.message || 'Unknown error'}`));
        } else if (pollAttempts >= maxPollAttempts) {
          clearInterval(interval);
          reject(new Error('Delegation timed out after 60 seconds.'));
        }
      } catch (err) {
        if (pollAttempts >= maxPollAttempts) {
          clearInterval(interval);
          reject(new Error(`Error polling delegation status: ${err.message}`));
        }
      }
    }, 1000);
  });
}
function showEnergyRentalModal(action, availableEnergy) {
  return new Promise((resolve, reject) => {
    const modalElement = document.getElementById('energy-rental-modal');
    if (!modalElement) return reject(new Error('Energy rental modal not found.'));
    let requiredFirst, requiredRepeat;
    if (action === 'approve') {
      requiredFirst = energyCosts.approve;
      requiredRepeat = energyCosts.approve;
    } else {
      requiredFirst = energyCosts[action + 'First'] || energyCosts[action];
      requiredRepeat = energyCosts[action + 'Repeat'] || energyCosts[action];
    }
    const firstEst = document.getElementById('first-est');
    const repeatEst = document.getElementById('repeat-est');
    if (firstEst) firstEst.textContent = requiredFirst.toLocaleString();
    if (repeatEst) repeatEst.textContent = requiredRepeat.toLocaleString();
    const updateDisplays = () => {
      const selectedType = document.querySelector('[name="energy-type"]:checked')?.value || 'first';
      const required = selectedType === 'first' ? requiredFirst : requiredRepeat;
      let shortfall = Math.max(0, required - availableEnergy);
      let rental = shortfall;
      const costTrx = energyPriceSun ? (rental * energyPriceSun / SUN_PER_TRX) : 0;
      document.getElementById('user-energy').textContent = availableEnergy.toLocaleString();
      document.getElementById('required-energy').textContent = required.toLocaleString();
      document.getElementById('rental-energy').textContent = rental.toLocaleString();
      document.getElementById('rental-cost-trx').textContent = `${costTrx.toFixed(2)} TRX`;
      const confirmButton = document.getElementById('rent-energy-confirm');
      if (confirmButton) {
        confirmButton.innerHTML = rental === 0 ? '<i class="fa-solid fa-arrow-right me-2"></i> Proceed without Rental' : '<i class="fa-solid fa-bolt me-2"></i> Rent Energy';
        confirmButton.disabled = false;
      }
    };
    updateDisplays();
    const radios = document.querySelectorAll('[name="energy-type"]');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        radios.forEach(r => r.parentElement.classList.remove('active'));
        radio.parentElement.classList.add('active');
        updateDisplays();
      });
    });
    const initialRadio = document.querySelector('[name="energy-type"][value="first"]');
    if (initialRadio) initialRadio.parentElement.classList.add('active');
    const modal = new bootstrap.Modal(modalElement, { backdrop: 'static', keyboard: false });
    modal.show();
    const confirmButton = document.getElementById('rent-energy-confirm');
    const confirmHandler = () => {
      const selectedType = document.querySelector('[name="energy-type"]:checked')?.value || 'first';
      const required = selectedType === 'first' ? requiredFirst : requiredRepeat;
      let shortfall = Math.max(0, required - availableEnergy);
      let rental = shortfall;
      const costTrx = energyPriceSun ? (rental * energyPriceSun / SUN_PER_TRX) : 0;
      modal.hide();
      resolve({ rent: rental > 0, rentalEnergy: rental, rentalCostTrx: costTrx });
    };
    confirmButton.addEventListener('click', confirmHandler);
    const cancelHandler = () => {
      modal.hide();
      resolve({ rent: false });
    };
    modalElement.addEventListener('hidden.bs.modal', cancelHandler, { once: true });
  });
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
      let availableEnergy = await getAvailableEnergy(userAddress);
      if (type === "cft") {
        // CFT → Game (requires approval)
        const amountSun = window.tronWeb.toSun(amount); // string
        const cftTokenContract = await window.tronWeb.contract().at(details.cftTokenAddress);
        // Check current allowance
        const allowance = await cftTokenContract.allowance(userAddress, details.contractAddress).call();
        const approvalRequired = BigInt(allowance) < BigInt(amountSun);
        if (approvalRequired) {
          if (availableEnergy < energyCosts.approve && energyPriceSun > 0) {
            const modalResult = await showEnergyRentalModal('approve', availableEnergy);
            if (modalResult.rent) {
              showToast({ title: "Renting Energy", body: "Renting energy for approval...", variant: "info" });
              await requestEnergyRental(modalResult.rentalEnergy);
              await delay(3000);
              availableEnergy = await getAvailableEnergy(userAddress);
            }
          }
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
        // Now check for swap
        const maxSwap = Math.max(energyCosts.swapFirst, energyCosts.swapRepeat);
        if (availableEnergy < maxSwap && energyPriceSun > 0) {
          const modalResult = await showEnergyRentalModal('swap', availableEnergy);
          if (modalResult.rent) {
            showToast({ title: "Renting Energy", body: "Renting energy for swap...", variant: "info" });
            await requestEnergyRental(modalResult.rentalEnergy);
            await delay(3000);
          }
        }
        showToast({
          title: "Step 2/2",
          body: "Swapping CFT → CFTGame... Confirm.",
          variant: "info",
        });
        tx = await swapContracts.cft["swap(uint256)"](amountSun).send({
          feeLimit: 100_000_000,
        });
      } else {
        // TRX → Game
        const amountSun = window.tronWeb.toSun(amount); // string
        const maxSwap = Math.max(energyCosts.swapFirst, energyCosts.swapRepeat);
        if (availableEnergy < maxSwap && energyPriceSun > 0) {
          const modalResult = await showEnergyRentalModal('swap', availableEnergy);
          if (modalResult.rent) {
            showToast({ title: "Renting Energy", body: "Renting energy for swap...", variant: "info" });
            await requestEnergyRental(modalResult.rentalEnergy);
            await delay(3000);
          }
        }
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
          `<b>🎉 New CFTGame Purchase Alert!</b>\n` +
          `A user bought <b>${amount} CFTGame</b> with ${swapType} in the high-risk pool.\n` +
          `Join now at <a href="https://www.cftecosystem.com/stakinggame.html">cftecosystem.com</a>.`;
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
        body: `You received ${amount.toFixed(6)} CFTGame tokens!<br>
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
// Helper functions (duplicated from stakinggame.js where needed)
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 500) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('429') && i < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, i);
        console.warn(`429 error, retrying after ${delayMs}ms...`);
        await delay(delayMs);
        continue;
      }
      throw error;
    }
  }
}
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
function showProcessingModal(step='') {
  const modalElement = document.getElementById('transaction-processing-modal');
  if (!modalElement) throw new Error('Processing modal not found.');
  const titleElement = document.getElementById('transactionProcessingModalLabel');
  if (titleElement) titleElement.textContent = `Processing Transaction ${step}`;
  const modal = new bootstrap.Modal(modalElement, { backdrop:'static', keyboard:false });
  modalElement.addEventListener('shown.bs.modal', () => modalElement.removeAttribute('aria-hidden'), { once: true });
  modal.show();
  return modal;
}
function hideProcessingModal(modal) { if (modal) modal.hide(); }
// Initialize
document.addEventListener("DOMContentLoaded", initializeSwap);
