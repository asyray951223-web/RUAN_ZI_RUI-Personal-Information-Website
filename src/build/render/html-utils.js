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

module.exports = { escapeHtml, joinLines };
