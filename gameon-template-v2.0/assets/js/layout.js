// assets/js/layout.js
(function(){
  // ======= Shared Header =======
  const headerHTML = `
  <header id="header" class="pt-2">
    <nav data-aos="zoom-out" data-aos-delay="800" class="navbar gameon-navbar navbar-expand">
      <div class="container">
        <a class="navbar-brand" href="index.html"><img src="assets/img/logo/logo.png" alt=""/></a>
        <div class="ms-auto"></div>
        <ul class="navbar-nav items mx-auto">
          <li class="nav-item"><a href="index.html" class="nav-link">Home</a></li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link">CFT<i class="icon-arrow-down"></i></a>
            <ul class="dropdown-menu">
              <li class="nav-item"><a href="staking.html" class="nav-link">Staking</a></li>
              <li class="nav-item"><a href="lockstaking.html" class="nav-link">Locked Staking</a></li>
              <li class="nav-item"><a href="sellcft.html" class="nav-link">Trading</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link">StableX<i class="icon-arrow-down"></i></a>
            <ul class="dropdown-menu">
              <li class="nav-item"><a href="buystablex.html" class="nav-link">Buy StableX</a></li>
              <li class="nav-item"><a href="sellstablex.html" class="nav-link">Sell StableX</a></li>
              <li class="nav-item"><a href="stablexstaking.html" class="nav-link">Stake StableX</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link">CFT News<i class="icon-arrow-down"></i></a>
            <ul class="dropdown-menu">
              <li class="nav-item"><a href="blog.html" class="nav-link">News</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a href="#" class="nav-link">Energy<i class="icon-arrow-down"></i></a>
            <ul class="dropdown-menu">
              <li class="nav-item"><a href="feb.html" class="nav-link">FEB</a></li>
              <li class="nav-item"><a href="energy.html" class="nav-link">Rent Energy</a></li>
            </ul>
          </li>
          <li class="nav-item"><a href="swap.html" class="nav-link">Swap</a></li>
        </ul>
        <ul class="navbar-nav toggle">
          <li class="nav-item">
            <a href="#" class="nav-link" data-bs-toggle="modal" data-bs-target="#menu">
              <i class="icon-menu m-0"></i>
            </a>
          </li>
        </ul>
        <ul class="navbar-nav action">
          <li class="nav-item ms-2">
            <button id="connect-button" class="btn btn-outline"><i class="icon-wallet me-md-2"></i> Wallet Connect</button>
          </li>
        </ul>
      </div>
    </nav>
  </header>`;

  // ======= Shared Footer =======
  const footerHTML = `
  <footer class="footer-area py-5 mt-3">
    <div class="container text-center">
      <a class="navbar-brand" href="index.html"><img src="assets/img/logo/logo.png" alt="" style="height:28px"></a>
      <div class="social-icons d-flex justify-content-center my-3 gap-3">
        <a class="x-twitter" href="https://x.com/CFTTRC20" target="_blank"><i class="fab fa-x-twitter"></i></a>
        <a class="reddit" href="https://www.reddit.com/" target="_blank"><i class="fab fa-reddit"></i></a>
        <a class="telegram" href="https://t.me/CFTEcosystem" target="_blank"><i class="fab fa-telegram-plane"></i></a>
      </div>
      <div class="copyright-area py-2">&copy;2025 CFT Ecosystem, All Rights Reserved</div>
      <div id="scroll-to-top" class="scroll-to-top"><a href="#header" class="smooth-anchor"><i class="fa-solid fa-arrow-up"></i></a></div>
    </div>
  </footer>`;

  // ======= Mobile Menu Modal (shared) =======
  const mobileMenuModal = `
  <div id="menu" class="modal fade p-0">
    <div class="modal-dialog dialog-animated">
      <div class="modal-content h-100">
        <div class="modal-header" data-bs-dismiss="modal">
          Menu <i class="far fa-times-circle icon-close"></i>
        </div>
        <div class="menu modal-body">
          <div class="row w-100">
            <div class="items p-0 col-12 text-center"></div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  // ======= Reusable Commercial (Ad/CTA) Card =======
  const commercialHTML = `
  <section class="py-3">
    <div class="container">
      <div class="cta luxe-ad-card">
        <div class="row align-items-center g-0">
          <div class="col-12 col-md-5 text-center p-3">
            <img src="assets/img/content/guardian.png" alt="CFT Guardian" style="max-width:220px">
          </div>
          <div class="col-12 col-md-7 p-3">
            <div class="inner">
              <h2 class="m-0">CFT Guardian Minting is Now Live</h2>
              <p class="mb-3">Earn daily SOL rewards by staking our Guardian NFTs</p>
              <a class="btn primary" href="https://cftguardians.com/" aria-label="Mint CFT Guardians"><i class="icon-rocket me-2"></i>Mint Now</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;

  // Inject header/footer if placeholders exist
  const headerMount = document.getElementById('app-header');
  if (headerMount) headerMount.innerHTML = headerHTML;

  const footerMount = document.getElementById('app-footer');
  if (footerMount) footerMount.innerHTML = footerHTML;

  // Ensure mobile menu modal exists once
  if (!document.getElementById('menu')) {
    document.body.insertAdjacentHTML('beforeend', mobileMenuModal);
  }

  // Render commercial sections wherever requested
  document.querySelectorAll('[data-commercial="guardian"]').forEach(node => {
    node.innerHTML = commercialHTML;
  });

})();
