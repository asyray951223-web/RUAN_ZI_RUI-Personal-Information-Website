// #notes 區塊渲染邏輯。視覺方向依 docs/superpowers/specs/2026-07-23-notes-content-design.md
// 確認為「RSS 訂閱源」：每篇筆記是指向外部平台的一筆索引，不是站內全文。
// data-type/typeLabel 這輪先定義好命名，篩選器 UI 留到筆記數量真的累積到一定程度再做
// （見規格文件技術選型清單），因此這裡不輸出篩選按鈕，只在每筆項目上保留 data-type 屬性。
const { escapeHtml, hrefAttr } = require('./html-utils');

function renderIcon(platform) {
  // 圖示直接取平台名稱的第一個字，不另外在 JSON 存一個 icon 欄位——
  // 避免「平台名稱」與「圖示文字」兩份資料要手動保持同步
  return escapeHtml(platform.charAt(0));
}

function renderItem(item) {
  return `          <li class="notes__item" id="notes-${escapeHtml(item.slug)}" data-type="${escapeHtml(item.type)}">
            <article>
              <div class="notes__icon" aria-hidden="true">${renderIcon(item.platform)}</div>
              <div class="notes__body">
                <div class="notes__meta">
                  <span class="notes__type">${escapeHtml(item.typeLabel)}</span>
                  <span class="notes__date">${escapeHtml(item.date)}</span>
                </div>
                <h3 class="notes__title">
                  <a class="notes__link"${hrefAttr(item.href)}>${escapeHtml(item.title)}</a>
                </h3>
                <p class="notes__excerpt">${escapeHtml(item.excerpt)}</p>
                <!-- 外部連結視覺提示只加箭頭符號（↗），不寫完整句子，維持簡潔 -->
                <span class="notes__platform">${escapeHtml(item.platform)} ↗</span>
              </div>
            </article>
          </li>`;
}

function renderNotes(data) {
  return [
    `        <p class="notes__head"><b>學習筆記</b> · 共 ${data.items.length} 篇 · 依日期排序</p>`,
    '        <ul class="notes__list">',
    data.items.map(renderItem).join('\n'),
    '        </ul>',
  ].join('\n');
}

module.exports = { renderNotes };
