const advertisements = [
{
    title: "Legacy Trading",
    description: "New SunSwap V4 Legacy-USDT Pool is now live. Buy/Sell Legacy using the new Smart Router.  ",
    image: "assets/img/content/legacy-warrior-logo.png",
    link: "https://sun.io/?lang=en-US#/scan/pairDetail?pairAddress=2ccc7715f822ffa5f4eeb0c2ca6c2468170d011cca5e44bf6b59ab3dbb6c927d&version=v4",
    linkText: "Trade Now",
    icon: "icon-coins"
  },
  
{
    title: "CFT Trading",
    description: "New SunSwap V4 CFT-TRX Pool is now live. Buy/Sell CFT using the new Smart Router.  ",
    image: "assets/img/content/cftlogo300.png",
    link: "https://sun.io/#/scan/pairDetail?pairAddress=c89289b58a94683a048efce2aafed347af9035c3e32b4b983b3ce8c118311c11&version=v4",
    linkText: "Trade Now",
    icon: "icon-coins"
  },
 
  
  
  {
    title: "CFT Legacy",
    description: "Legacy Staking now live, swap your CFT to Legacy and earn daily rewards. ",
    image: "assets/img/content/legacy-warrior-logo.png",
    link: "https://www.cftlegacy.com/",
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
