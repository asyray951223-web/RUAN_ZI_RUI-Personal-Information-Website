// 導覽列「目前狀態」標示 + 點擊跳轉動畫。這是全站第三支自訂 JavaScript
// （前兩支是 filter.js／contact-mailto.js）：捲動時偵測目前所在區塊（scrollspy）跟
// 自訂緩動曲線的平滑捲動，都是純 CSS 難以優雅處理的互動，才用 JS（同 filter.js 的判斷原則）。
//
// header 是 position: fixed，這裡的 headerHeight 直接讀 .site-header 實際渲染高度
// （不是寫死 4rem 換算的 px 值），跟 _section.scss 的 scroll-margin-top 概念一致，
// 之後 header 高度改變兩邊都不用手動同步數字。
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(document.querySelectorAll('.site-nav__link'));
  if (!header || !navLinks.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- 漢堡選單開關（768px 以下才會顯示，見 _header.scss 的 media query）----
  const navToggle = document.querySelector('.site-nav__toggle');
  const navList = document.querySelector('.site-nav__list');

  function closeNavMenu() {
    if (!navToggle || !navList) return;
    navList.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // 點選單外側也收合，符合一般漢堡選單的慣例行為
    document.addEventListener('click', (event) => {
      const clickedInsideNav = event.target === navToggle || navToggle.contains(event.target) || navList.contains(event.target);
      if (!clickedInsideNav) closeNavMenu();
    });
  }

  function getHeaderHeight() {
    return header.offsetHeight;
  }

  // header 現在會因為導覽列換行而變高（手機寬度常見），把實際高度同步寫進
  // --header-height 讓 .site-main 的 padding-top／.section 的 scroll-margin-top
  // 跟著調整，避免固定 header 蓋住內容。resize 時（例如手機轉橫向）重新量一次。
  function syncHeaderHeightVar() {
    document.documentElement.style.setProperty('--header-height', `${getHeaderHeight()}px`);
  }

  syncHeaderHeightVar();
  window.addEventListener('resize', syncHeaderHeightVar);

  // ---- 平滑捲動：點擊導覽連結時攔截預設的瞬間跳轉，改成自訂緩動動畫 ----
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
  }

  function animateScrollTo(targetY, duration) {
    const startY = window.scrollY;
    const distance = targetY - startY;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + distance * easeInOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || !targetId.startsWith('#')) return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const targetY = target.getBoundingClientRect().top + window.scrollY - getHeaderHeight();

      if (prefersReducedMotion) {
        target.scrollIntoView();
      } else {
        animateScrollTo(targetY, 600);
      }

      // preventDefault 蓋掉了瀏覽器預設的 hash 更新行為，手動補上，
      // 讓網址列/上一頁按鈕/分享連結還是能正確定位到該區塊
      history.pushState(null, '', targetId);

      // 手機版點完導覽連結就該收合選單，不然選單會一直疊在畫面上擋住剛跳轉到的內容
      closeNavMenu();
    });
  });

  // ---- Scrollspy：用 IntersectionObserver 偵測目前經過視窗中段的區塊 ----
  // rootMargin 抓視窗垂直中段一條窄帶（上緣扣掉 header 再抓 45%、下緣抓 50%），
  // 用「區塊是否經過這條窄帶」判斷目前所在區塊，不用捲動百分比——
  // 這樣區塊高度不一也能正確運作，不會因為某區塊特別高/特別矮而誤判。
  // 只挑 href 以 # 開頭的連結才查詢（跟上面點擊處理的判斷一致）：project-1.html
  // 這類子頁面的 nav 連結是指回首頁的絕對路徑（例如 /src/pages/index.html#about），
  // 不是本頁的錨點，直接丟給 document.querySelector 會因為選擇器字串不合法而丟出
  // SyntaxError（RWD 分階段規劃 Phase 4 幫 project-1.html 補上這支腳本時發現）
  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute('href');
      return href && href.startsWith('#') ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeLink = navLinks.find((link) => link.getAttribute('href') === `#${entry.target.id}`);
        if (!activeLink) return;
        navLinks.forEach((link) => link.classList.toggle('is-active', link === activeLink));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
});
