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
    title: "UpDawg",
    description: "UpDawg (UDAWG) is a Proof-of-reserve TRC20 token backed by TRX on the Tron Blockchain. It powers the uDawg_bot on Telegram - gamifying off & on-chain community engagement with rewards.",
    image: "assets/img/content/updawg.png",
    link: "https://t.me/udawgorg",
    linkText: "Join Now",
    icon: "icon-telegram"
  },
  {
    title: "TronsCore",
    description: "TronsCore is an all-in-one ecosystem on the TRON blockchain, combining digital identity, gamified learning, and event participation.
At its core are POAPs (Proof of Attendance Protocols) — blockchain badges that verify your attendance — and Trivion, a quiz game that makes learning about TRON fun and rewarding.
Creators can host events with POAP Badges for open claims or use the POAP Whitelist for exclusive, wallet-restricted events.
A TRON DAO HackaTRON Season 7 winner, TronsCore continues to drive community engagement and education across the TRON ecosystem.",
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
    title: "Stake StableX",
    description: "Earn both CFT and StableX with StableX staking",
    image: "assets/img/content/stablex.png",
    link: "https://www.cftecosystem.com/buystablex",
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
