const advertisements = [
  {
    title: "CFT Guardian Minting is Now Live",
    description: "Earn daily SOL rewards by staking our Guardian NFTs",
    image: "assets/img/content/guardian1.png",
    link: "https://cftguardians.com/",
    linkText: "Mint Now",
    icon: "icon-rocket"
  },
  {
    title: "BabyTuru",
    description: "BabyTuru ($BBT) is a multichain memetoken originating on the Tron blockchain, blending playful bird-themed memes with practical utilities like deflationary token burns, arbitrage mechanisms and seamless staking rewards to incentivize long-term holding. It is a standout OG memecoin that has been around for over 4 years.",
    image: "assets/img/content/bbt.jpg",
    link: "https://t.me/babyturu",
    linkText: "Join Now",
    icon: "icon-telegram"
  },
  {
    title: "UpDawg",
    description: "UpDawg (UDAWG) is a Proof-of-reserve TRC20 token backed by TRX on the Tron Blockchain. It powers the uDawg_bot on Telegram - gamifying off & on-chain community engagement with rewards.",
    image: "assets/img/content/updawg.png",
    link: "https://t.me/udawgorg",
    linkText: "Join Now",
    icon: "icon-telegram"
  },
  {
    title: "TronsCore",
    description: `TronsCore POAPs (Proof of Attendance Protocols) is verifiable badges that prove participation in events.
Creators can launch open POAP Badges or exclusive Whitelist POAPs with wallet-based access control.
A TRON DAO HackaTRON Season 7 winner, TronsCore makes community engagement and digital identity on TRON simple and transparent.`,
    image: "assets/img/content/tronscore.png",
    link: "https://t.me/TronsCore",
    linkText: "Join Now",
    icon: "icon-telegram"
  },
  {
    title: "JM Swap",
    description: "JustMoney Swap is an AMM decentralized exchange (DEX) launched initially on the Tron Blockchain. It is the first multi and cross-chain swap with full support for taxed tokens.",
    image: "assets/img/content/jmswapwhite.png",
    link: "https://just.money",
    linkText: "Swap Now",
    icon: "icon-rocket"
  },
  {
    title: "JM Explorer",
    description: "JustMoney Explorer brings you all the advantages of a blockchain explorer, a DEX viewer, and a dAppstore in just one place! It offers a comprehensive solution where projects can list their dApps and users can effortlessly navigate and interact with them.",
    image: "assets/img/content/jme.png",
    link: "https://explorer.just.money/",
    linkText: "Explore Now",
    icon: "icon-rocket"
  },
  {
    title: "Stake StableX",
    description: "Earn both CFT and StableX with StableX staking",
    image: "assets/img/content/stablex.png",
    link: "https://www.cftecosystem.com/buystablex",
    linkText: "Stake Now",
    icon: "icon-stake"
  },
  {
    title: "CFT Legacy",
    description: "OGs Prepare",
    image: "assets/img/content/legacy.jpg",
    link: "https://www.cftecosystem.com/",
    linkText: "Coming Soon",
    icon: "icon-stake"
  },
  {
    title: "New CFT-USDT Staking",
    description: "New USDT reward pool live. Stake your CFT for daily USDT rewards",
    image: "assets/img/content/usdt.png",
    link: "https://www.cftecosystem.com/poolstakingusdt",
    linkText: "Stake Now",
    icon: "icon-stake"
  },
  {
    title: "Advertise Your Project Here",
    description: "Want to showcase your project to our audience? Contact us to discuss advertising opportunities!",
    image: "assets/img/content/cftlogo300.png",
    link: "https://t.me/CFT_dev",
    linkText: "Contact Us",
    icon: "icon-telegram"
  }
];

function rotateAdvertisements() {
  const adContainer = document.querySelector('.luxe-ad-card .row');
  if (!adContainer) return;
  // Set random initial index
  let currentAdIndex = Math.floor(Math.random() * advertisements.length);
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
