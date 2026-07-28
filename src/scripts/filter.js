// 通用的「依類型篩選」互動邏輯：原本只服務 #portfolio（全站第一支 JavaScript），
// 這次 #activities 也需要同一種篩選行為，改寫成通用版本讓兩個區塊共用同一份邏輯，
// 不重複寫兩份幾乎一樣的程式碼。其餘區塊（#resume、#skills）的展開/收合都刻意維持
// 原生 <details>，不受這裡影響——只有「同時顯示/隱藏多個項目」這種純 CSS 較難優雅
// 處理的互動，才用 JS。
//
// 判斷規則：以每個 .section 為篩選範圍，只要該 section 內同時存在帶 [data-filter]
// 的按鈕與帶 [data-type] 的項目，就視為一組篩選器並啟用互動；不需要額外設定，
// 之後若有第三個區塊要做類似篩選，直接沿用同一組 data 屬性命名即可自動生效。
// 篩選掉的項目統一加上共用的 .js-filter-hidden class（定義在 components/_section.scss），
// 不用各區塊各自寫一個 xxx__item--hidden。
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section').forEach((section) => {
    const filterButtons = section.querySelectorAll('[data-filter]');
    const items = section.querySelectorAll('[data-type]');
    // 空狀態文字：篩選到零筆資料時顯示，取代原本「畫面直接開天窗」的空白
    // （adversarial-ux-test 發現：使用者點到沒有對應項目的分類，會誤以為網站壞掉）
    const emptyMessage = section.querySelector('.js-filter-empty');

    if (!filterButtons.length || !items.length) return;

    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter;

        filterButtons.forEach((btn) => {
          const isActive = btn === button;
          btn.classList.toggle('is-active', isActive);
          btn.setAttribute('aria-pressed', String(isActive));
        });

        let anyVisible = false;
        items.forEach((item) => {
          const matches = filter === 'all' || item.dataset.type === filter;
          item.classList.toggle('js-filter-hidden', !matches);
          if (matches) anyVisible = true;
        });

        if (emptyMessage) emptyMessage.hidden = anyVisible;
      });
    });
  });
});
