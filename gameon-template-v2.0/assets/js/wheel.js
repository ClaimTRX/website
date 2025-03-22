const contractAddress = "TYmnqRGEQyjz3yUX482F9uZTaee8YprYRf";
const tokenAddress = "TAME19SjDjKxC3omaJG5HWMTxhbHMrzWMi";
const spinCost = 50e6; // 50 CFT

let tronWeb, userAddress, contract, token;

async function waitForTronLink() {
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      if (window.tronWeb && window.tronWeb.ready) {
        clearInterval(timer);
        resolve(true);
      }
    }, 500);
  });
}

async function connectWallet() {
  if (!window.tronWeb) return alert("TronLink not found");
  try {
    await window.tronLink.request({ method: "tron_requestAccounts" });
    tronWeb = window.tronWeb;
    userAddress = tronWeb.defaultAddress.base58;
    document.getElementById('wallet-status').innerText = `Connected: ${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    document.getElementById('connect-button').style.display = 'none';
    await loadContracts();
    await updateBalance();
    await checkAllowance();
  } catch (err) {
    console.error("Connection failed", err);
  }
}

async function loadContracts() {
  contract = await tronWeb.contract().at(contractAddress);
  token = await tronWeb.contract().at(tokenAddress);
}

async function updateBalance() {
  const balance = await token.balanceOf(userAddress).call();
  document.getElementById('balance').innerText = `Your balance: ${(balance.toNumber() / 1e6).toFixed(2)} CFT`;
}

async function checkAllowance() {
  const allowance = await token.allowance(userAddress, contractAddress).call();
  const approved = allowance.toNumber() >= spinCost;
  document.getElementById('approve-button').style.display = approved ? 'none' : 'inline-block';
  document.getElementById('spin-button').style.display = approved ? 'inline-block' : 'none';
}

async function approve() {
  try {
    document.getElementById('approve-button').disabled = true;
    await token.approve(contractAddress, '100000000000').send({ feeLimit: 100000000 });
    await checkAllowance();
  } catch (e) {
    alert("Approval failed");
  } finally {
    document.getElementById('approve-button').disabled = false;
  }
}

async function spinWheel() {
  const balance = await token.balanceOf(userAddress).call();
  if (balance.toNumber() < spinCost) {
    return document.getElementById('result').innerText = "Insufficient balance";
  }

  const allowance = await token.allowance(userAddress, contractAddress).call();
  if (allowance.toNumber() < spinCost) {
    return document.getElementById('result').innerText = "Not enough allowance. Click Approve first.";
  }

  document.getElementById('spin-button').disabled = true;
  document.getElementById('result').innerText = "Spinning...";

  try {
    await contract.spin().send({ callValue: 0, feeLimit: 100000000 });
  } catch (err) {
    console.error(err);
    document.getElementById('result').innerText = "Transaction failed.";
    document.getElementById('spin-button').disabled = false;
    return;
  }
}

function handleSpinResultEvent() {
  contract.SpinResult().watch((err, event) => {
    if (err) return console.error("Spin event error:", err);

    if (event && event.player.toLowerCase() === tronWeb.defaultAddress.hex.toLowerCase()) {
      const multiplier = Number(event.multiplier);
      let segmentIndices = multiplier === 3 ? [9] : multiplier === 2 ? [7, 8] : [0,1,2,3,4,5,6];
      const chosenIndex = segmentIndices[Math.floor(Math.random() * segmentIndices.length)];
      const centerAngle = chosenIndex * 36 + 18;
      const targetRotation = 1440 + ((270 - centerAngle + 360) % 360);

      document.getElementById('wheel').style.transform = `rotate(${targetRotation}deg)`;

      setTimeout(() => {
        document.getElementById('result').innerText = multiplier === 0 ? "You lost!" : `You won ${multiplier}x!`;
        document.getElementById('spin-button').disabled = false;
        updateBalance();
      }, 5000);
    }
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await waitForTronLink();
  handleSpinResultEvent();

  document.getElementById('connect-button').addEventListener('click', connectWallet);
  document.getElementById('approve-button').addEventListener('click', approve);
  document.getElementById('spin-button').addEventListener('click', spinWheel);
});

