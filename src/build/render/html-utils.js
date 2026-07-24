// 共用的 HTML 渲染小工具。這支檔案只在開發者機器用 Node 執行（npm run build:html），
// 不會被瀏覽器載入，跟 src/scripts/ 底下會被 <script src> 載入的瀏覽器端 JS 是兩回事。

// 把 JSON 資料裡的文字塞進 HTML 之前先跳脫特殊字元，避免之後填入真實資料時
// 若含有 &、<、"、' 這類字元會破壞 HTML 結構（目前佔位文字都不含這些字元，
// 現有輸出不受影響，這是針對未來真實資料的預防性強化）。
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 多個可能為 undefined/null/空字串的片段組起來，過濾掉空的，用換行接起來——
// 讓每個 render 函式可以用陣列+filter 的方式組裝「選填欄位」，不用寫一堆 if/else 字串拼接
function joinLines(parts) {
  return parts.filter(Boolean).join('\n');
}

// adversarial-ux-test 發現：全站有十幾處連結的 JSON 資料 href 還是佔位用的 "#"，
// 點下去會觸發瀏覽器預設的「跳到頁面最頂端」行為，對使用者來說像網站忽然壞掉，
// 而且發生在使用者主動點擊、最容易被注意到的時刻。這裡統一處理：href 是真正的
// "#"（純佔位，不是 "#some-real-id" 這種功能性錨點）時，直接不輸出 href 屬性，
// 讓 <a> 變成不可點擊、游標維持預設樣式，視覺上就先誠實地告訴使用者「還不能點」；
// 之後使用者填入真實網址，href 屬性就會正常出現，不需要改任何程式碼。
function hrefAttr(href) {
  if (!href || href === '#') return '';
  return ` href="${escapeHtml(href)}"`;
}

module.exports = { escapeHtml, joinLines, hrefAttr };
