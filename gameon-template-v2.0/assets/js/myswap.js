// myswap.js

let tronWeb, userAddress;
const connectBtn = document.getElementById("connect-button");

// DOM elements
const fromSelect = document.getElementById("from-token");
const toSelect = document.getElementById("to-token");
const amountInput = document.getElementById("amount");
const outputBox = document.getElementById("output");
const rateBox = document.getElementById("rate");
const maxBtn = document.getElementById("max-button");
const swapBtn = document.getElementById("swap-button");
const slippageInput = document.getElementById("slippage");

const TOKENS = {
  WTRX: "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR",
  KING: "TMFNzkJaj573F62s4bWmfonKwGcosAA8fE",
  CFT:  "TAQzALyftaynnr3VG3rCvzkY2KouFH79sA",
  BBT:  "TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL",
  TWX:  "TTFreuJ4pYDaCeEMEtiR1GQDwPPrS4jKFk",
  TEM:  "TFuEe2QMB8J1rfwNhAwjRSwoFivMcU5N75"
};

const DECIMALS = {
  WTRX: 6, KING: 6, CFT: 6, BBT: 8, TWX: 18, TEM: 6
};

const POOLS = {
  "CFT-KING": { addr: "TRRevVDqvM31DdUQb73qViCEcDyCffYJTA", token0: "CFT", token1: "KING" },
  "CFT-BBT": { addr: "TLWPwGteW4gZ1AU5CWCPYmfLdEm8yqduNb", token0: "CFT", token1: "BBT" },
  "TWX-CFT": { addr: "TE5X2A4rhXyoSheojRGiqow5qjapSQdrPY", token0: "CFT", token1: "TWX" },
  "CFT-TEM": { addr: "TKNxcR2i2G191XEJpC3PpFTm9TvMvbww3R", token0: "CFT", token1: "TEM" }
};

const SUNSWAP_ROUTER = "TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR";

// Ensure TronLink is detected and wallet connected
async function connectWallet() {
  if (!window.tronLink || !window.tronWeb) {
    alert("TronLink not installed");
    return;
  }

  await window.tronLink.request({ method: "tron_requestAccounts" });
  tronWeb = window.tronWeb;
  userAddress = tronWeb.defaultAddress.base58;

  if (!userAddress) {
    alert("Wallet connection failed");
    return;
  }

  connectBtn.innerText = "Wallet Connected";
  console.log("Wallet connected:", userAddress);
}

function waitForElements() {
  if (!fromSelect || !toSelect || !amountInput || !outputBox || !swapBtn || !slippageInput) {
    console.warn("Waiting for DOM elements...");
    setTimeout(waitForElements, 500);
    return;
  }

  fromSelect.addEventListener("change", simulateSwap);
  toSelect.addEventListener("change", simulateSwap);
  amountInput.addEventListener("input", simulateSwap);
  slippageInput.addEventListener("input", simulateSwap);
  swapBtn.addEventListener("click", handleSwap);
  maxBtn?.addEventListener("click", fillMaxAmount);
}

function simulateSwap() {
  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = parseFloat(amountInput.value);

  if (!from || !to || isNaN(amount) || amount <= 0) {
    outputBox.value = "";
    rateBox.innerText = "Rate: --";
    return;
  }

  const rate = 0.8 + Math.random() * 0.4; // simulate random rate between 0.8 - 1.2
  const output = amount * rate;

  outputBox.value = output.toFixed(4);
  rateBox.innerText = `Rate: ${rate.toFixed(4)} ${to}/${from}`;
}

function fillMaxAmount() {
  amountInput.value = "100"; // Simulated max
  simulateSwap();
}

async function handleSwap() {
  if (!tronWeb || !userAddress) {
    alert("Please connect your wallet first");
    return;
  }

  const from = fromSelect.value;
  const to = toSelect.value;
  const amount = parseFloat(amountInput.value);

  if (!from || !to || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  const slippage = parseFloat(slippageInput.value) || 1;

  alert(`Simulating swap:\nFrom: ${amount} ${from}\nTo: ${to}\nSlippage: ${slippage}%`);
}

// On Load
window.addEventListener("DOMContentLoaded", async () => {
  waitForElements();
  connectBtn?.addEventListener("click", connectWallet);

  if (window.tronLink && window.tronWeb && window.tronWeb.defaultAddress?.base58) {
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    connectBtn.innerText = "Wallet Connected";
  }
});

