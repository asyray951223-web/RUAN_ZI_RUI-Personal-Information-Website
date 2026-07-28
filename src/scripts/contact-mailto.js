// #contact 表單提交邏輯。這是全站第二支自訂 JavaScript（第一支是 filter.js）：
// 表單本身沒有後端，純 HTML <form action="mailto:...">在瀏覽器間換行/編碼行為不一致，
// 改成送出時攔截預設行為、自己組一個帶 subject/body 的 mailto: 連結再導頁，
// 可靠度較高（見 docs/superpowers/specs/2026-07-24-contact-content-design.md 技術選型清單）。
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact__form');
  if (!form) return;

  const destination = form.dataset.mailto;
  if (!destination) return;

  const statusEl = form.querySelector('.contact__form-status');

  // 顯示提示文字：mailto 表單無法得知使用者裝置是否真的開啟了郵件軟體，
  // 這裡只能提示「已嘗試開啟」，並附上備援做法，不宣稱「已送出成功」
  function showStatus(text) {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.hidden = false;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const message = form.querySelector('#contact-message').value.trim();

    const subject = `來自 ${name || '網站訪客'} 的聯絡表單訊息`;
    const body = `${message}\n\n——\n姓名：${name}\nEmail：${email}`;

    const mailtoUrl = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    showStatus('已為你開啟郵件軟體並帶入訊息內容，如果沒有反應，可以直接複製下方 Email 寄信給我。');
  });

  // 複製 Email 備援按鈕：不依賴 mailto: 是否有對應的預設郵件 App，
  // clipboard API 在非 https/localhost 環境可能不可用，失敗時退回提示文字讓人手動複製
  const copyBtn = form.querySelector('.contact__form-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.copyEmail;
      try {
        await navigator.clipboard.writeText(email);
        showStatus(`已複製 Email（${email}）到剪貼簿。`);
      } catch (error) {
        showStatus(`複製失敗，請手動複製：${email}`);
      }
    });
  }
});
