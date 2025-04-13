const routerAddress = "TXF1xDbVGdxFGbovmmmXvBGu8ZiE3Lq4mR"; // SunSwap V2 Router
const tokenList = {
  CFT: "TAQzALyftaynnr3VG3rCvzkY2KouFH79sA",
  TRX: "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb", // native token
  KING: "TDaFxeqvx1xdsXkddvCbMJkUpmC3ieaB1g",
  TWX: "TFpZjmX3eojZXVYvvcc1eHVZt3aSSjuhme",
  BBT: "TGyZUWrL97mmmYJwrC7ZCLVrhbzvHmmWPL",
  TEM: "TFuEe2QMB8J1rfwNhAwjRSwoFivMcU5N75",
};

let tronWeb, userAddress;

async function connectWallet() {
  if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    document.getElementById("walletAddress").innerText = "Connected: " + userAddress;
    populateTokens();
  } else {
    alert("Please install TronLink wallet");
  }
}

function populateTokens() {
  const fromSelect = document.getElementById("fromToken");
  const toSelect = document.getElementById("toToken");
  fromSelect.innerHTML = "";
  toSelect.innerHTML = "";
  for (const [name, address] of Object.entries(tokenList)) {
    const option1 = new Option(name, address);
    const option2 = new Option(name, address);
    fromSelect.appendChild(option1);
    toSelect.appendChild(option2);
  }
  fromSelect.value = tokenList.CFT;
  toSelect.value = tokenList.TRX;
}

async function getAmountsOut(amountIn, path) {
  const router = await tronWeb.contract().at(routerAddress);
  try {
    const res = await router.getAmountsOut(amountIn, path).call();
    return res.amounts;
  } catch (e) {
    console.error("Failed to fetch getAmountsOut:", e);
    return null;
  }
}

document.getElementById("fromAmount").addEventListener("input", async () => {
  const fromAmount = parseFloat(document.getElementById("fromAmount").value);
  if (!fromAmount || !tronWeb) return;

  const fromToken = document.getElementById("fromToken").value;
  const toToken = document.getElementById("toToken").value;
  const amountIn = tronWeb.toSun(fromAmount);

  const amounts = await getAmountsOut(amountIn, [fromToken, toToken]);
  if (amounts) {
    const output = tronWeb.fromSun(amounts[1]);
    document.getElementById("toAmount").value = output;
  }
});

async function approveToken(tokenAddress, amount) {
  const contract = await tronWeb.contract().at(tokenAddress);
  return contract.approve(routerAddress, amount).send();
}

async function swapTokens() {
  const fromAmount = parseFloat(document.getElementById("fromAmount").value);
  if (!fromAmount) return alert("Enter amount to swap");

  const fromToken = document.getElementById("fromToken").value;
  const toToken = document.getElementById("toToken").value;
  const amountIn = tronWeb.toSun(fromAmount);

  const router = await tronWeb.contract().at(routerAddress);

  if (fromToken !== tokenList.TRX) {
    await approveToken(fromToken, amountIn);
  }

  const deadline = Math.floor(Date.now() / 1000) + 60;

  try {
    const tx = await router.swapExactTokensForTokens(
      amountIn,
      0,
      [fromToken, toToken],
      userAddress,
      deadline
    ).send({ feeLimit: 100_000_000 });
    alert("Swap tx sent: " + tx);
  } catch (e) {
    console.error("Swap failed:", e);
    alert("Swap failed. Check console for details.");
  }
}
