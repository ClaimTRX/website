const advertisements = [
  {
    title: "CFT Guardian Minting is Now Live",
    description: "Earn daily SOL rewards by staking our Guardian NFTs",
    image: "assets/img/content/guardian.png",
    link: "https://cftguardians.com/",
    linkText: "Mint Now",
    icon: "icon-rocket"
  },
  {
    title: "JM Swap",
    description: "JustMoney Swap is an AMM decentralized exchange (DEX) launched initially on the Tron Blockchain. It is the first multi and cross-chain swap with full support for taxed tokens.",
    image: "assets/img/content/jmswap.png",
    link: "https://just.money",
    linkText: "Swap Now",
    icon: "icon-rocket"
  },
  {
    title: "Stake StableX",
    description: "Earn both CFT and StableX with StableX staking",
    image: "assets/img/content/stablex.png",
    link: "https://www.cftecosystem.com/buystablex",
    linkText: "Stake Now",
    icon: "icon-stake"
  }
];

function rotateAdvertisements() {
  const adContainer = document.querySelector('.luxe-ad-card .row');
  if (!adContainer) return;
  let currentAdIndex = 0;
  const updateAd = () => {
    const ad = advertisements[currentAdIndex];
    adContainer.innerHTML = `
      <div class="col-12 col-md-5 text-center p-3">
        <img src="${ad.image}" alt="${ad.title}" style="max-width:220px" loading="lazy">
      </div>
      <div class="col-12 col-md-7 p-3">
        <div class="inner">
          <h2 class="m-0">${ad.title}</h2>
          <p class="mb-3">${ad.description}</p>
          <a class="btn primary" href="${ad.link}" aria-label="${ad.linkText}"><i class="${ad.icon} me-2"></i>${ad.linkText}</a>
        </div>
      </div>
    `;
    currentAdIndex = (currentAdIndex + 1) % advertisements.length;
  };
  updateAd();
  setInterval(updateAd, 30000);
}

// Initialize ad rotation on DOM content loaded
document.addEventListener('DOMContentLoaded', rotateAdvertisements);
