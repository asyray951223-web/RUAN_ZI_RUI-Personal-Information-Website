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

  function getHeaderHeight() {
    return header.offsetHeight;
  }

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
    });
  });

  // ---- Scrollspy：用 IntersectionObserver 偵測目前經過視窗中段的區塊 ----
  // rootMargin 抓視窗垂直中段一條窄帶（上緣扣掉 header 再抓 45%、下緣抓 50%），
  // 用「區塊是否經過這條窄帶」判斷目前所在區塊，不用捲動百分比——
  // 這樣區塊高度不一也能正確運作，不會因為某區塊特別高/特別矮而誤判
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
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
