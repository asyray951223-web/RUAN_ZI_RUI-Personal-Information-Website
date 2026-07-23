// #portfolio 篩選器：全站第一支 JavaScript。
// 其餘區塊（#resume、#skills）的展開/收合都刻意維持原生 <details>，不受這裡影響；
// 這裡因為要做「點擊切換多張卡片同時顯示/隱藏」，純 CSS（radio + :checked）較難兼顧
// 之後可能的多重篩選需求，經確認後選擇用原生 JS，不引入框架或建置工具。
document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.portfolio__filter-btn');
  const items = document.querySelectorAll('.portfolio__item');

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => {
        const isActive = btn === button;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', String(isActive));
      });

      items.forEach((item) => {
        const matches = filter === 'all' || item.dataset.type === filter;
        item.classList.toggle('portfolio__item--hidden', !matches);
      });
    });
  });
});
