// #contact 表單提交邏輯。這是全站第二支自訂 JavaScript（第一支是 filter.js）：
// 表單本身沒有後端，純 HTML <form action="mailto:...">在瀏覽器間換行/編碼行為不一致，
// 改成送出時攔截預設行為、自己組一個帶 subject/body 的 mailto: 連結再導頁，
// 可靠度較高（見 docs/superpowers/specs/2026-07-24-contact-content-design.md 技術選型清單）。
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.contact__form');
  if (!form) return;

  const destination = form.dataset.mailto;
  if (!destination) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = form.querySelector('#contact-name').value.trim();
    const email = form.querySelector('#contact-email').value.trim();
    const message = form.querySelector('#contact-message').value.trim();

    const subject = `來自 ${name || '網站訪客'} 的聯絡表單訊息`;
    const body = `${message}\n\n——\n姓名：${name}\nEmail：${email}`;

    const mailtoUrl = `mailto:${destination}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  });
});
