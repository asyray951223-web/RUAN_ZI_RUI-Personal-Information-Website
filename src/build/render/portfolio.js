// #portfolio 區塊渲染邏輯。這是四個區塊中唯一有：
// (a) 真正運作中的 JS 篩選器依賴（data-type/data-filter，見 src/scripts/filter.js）
// (b) links／ndaNote 互斥二選一欄位
// (c) id 被範圍外的 src/pages/portfolio/project-1.html 手寫頁面外部連結引用
// 三者同時存在，遷移時要格外小心不要破壞這些依賴。
const { escapeHtml, joinLines, hrefAttr } = require('./html-utils');

function renderFilterButtons(filters) {
  return filters
    .map((filter, index) => {
      const isActive = index === 0; // 第一個（"全部"）預設為 active
      const classAttr = isActive ? ' is-active' : '';
      return joinLines([
        '          <button',
        '            type="button"',
        `            class="portfolio__filter-btn${classAttr}"`,
        `            data-filter="${escapeHtml(filter.value)}"`,
        `            aria-pressed="${isActive}"`,
        '          >',
        `            ${escapeHtml(filter.label)}`,
        '          </button>',
      ]);
    })
    .join('\n');
}

function renderTechList(tech) {
  const items = tech.map((name) => `                <li class="portfolio__tech">${escapeHtml(name)}</li>`).join('\n');
  return joinLines(['              <ul class="portfolio__tech-list">', items, '              </ul>']);
}

function renderLinksOrNda(item) {
  const hasLinks = Array.isArray(item.links) && item.links.length > 0;
  const hasNda = typeof item.ndaNote === 'string' && item.ndaNote.length > 0;

  // 防呆檢查：links／ndaNote 必須恰好其中一個有值，兩者同時有值或同時沒值都是資料錯誤，
  // 直接中止建置讓人立刻發現，不要靜默吃掉造成卡片漏掉整個連結區塊
  if (hasLinks === hasNda) {
    throw new Error(
      `portfolio 項目 "${item.slug}" 的 links／ndaNote 必須恰好擇一有值（目前 links=${JSON.stringify(
        item.links
      )}, ndaNote=${JSON.stringify(item.ndaNote)}）`
    );
  }

  if (hasLinks) {
    const items = item.links
      .map(
        (link) =>
          `                <li class="portfolio__link-item">\n                  <a class="portfolio__link"${hrefAttr(
            link.href
          )}>${escapeHtml(link.label)}</a>\n                </li>`
      )
      .join('\n');
    return joinLines(['              <ul class="portfolio__link-list">', items, '              </ul>']);
  }

  return joinLines([
    '              <!-- 實習/公司內部專案常見無法公開連結的情況：跟 .portfolio__link-list 二擇一顯示，',
    '                   讓讀者知道「不是忘記放連結」而不是留空或整段消失 -->',
    `              <p class="portfolio__nda-note">\n                ${escapeHtml(item.ndaNote)}\n              </p>`,
  ]);
}

function renderCard(item) {
  return joinLines([
    `          <li class="portfolio__item" id="portfolio-${escapeHtml(item.slug)}" data-type="${escapeHtml(item.type)}">`,
    '            <article>',
    `              <img class="portfolio__cover" src="${escapeHtml(item.cover.src)}" alt="${escapeHtml(item.cover.alt)}" />`,
    '              <!-- 作品類型標籤，方便之後用篩選或視覺區分不同類型的作品 -->',
    `              <p class="portfolio__type">${escapeHtml(item.typeLabel)}</p>`,
    `              <h3 class="portfolio__name">${escapeHtml(item.name)}</h3>`,
    `              <p class="portfolio__summary">${escapeHtml(item.summary)}</p>`,
    `              <p class="portfolio__date">${escapeHtml(item.date)}</p>`,
    renderTechList(item.tech),
    `              <p class="portfolio__role">${escapeHtml(item.role)}</p>`,
    '              <!-- 這裡只放單一作品層級的簡短成果，1-2 個最想深談的作品可以另外寫進下方 #casestudy -->',
    `              <p class="portfolio__outcome">\n                ${escapeHtml(item.outcome)}\n              </p>`,
    renderLinksOrNda(item),
    item.detailLink
      ? `              <!-- 這件作品「需要」深度說明，連到獨立詳細頁面示範 -->\n              <a class="portfolio__detail-link" href="${escapeHtml(
          item.detailLink
        )}">\n                查看完整專案說明 →\n              </a>`
      : '              <!-- 這件作品「不需要」獨立詳細頁，示範不是每個作品都要有 .portfolio__detail-link -->',
    '            </article>',
    '          </li>',
  ]);
}

function renderPortfolio(data) {
  return joinLines([
    '        <!-- 篩選器：全站第一次引入 JavaScript（src/scripts/filter.js，現已通用化同時服務 #activities），',
    '             其餘區塊的展開/收合都刻意維持原生 <details>，這裡因為需要「點擊切換多張卡片顯示」',
    '             這種純 CSS 較難優雅處理的互動，經使用者確認後選擇用 JS 而非 radio-button 技巧 -->',
    '        <div class="portfolio__filter" role="group" aria-label="依作品類型篩選">',
    renderFilterButtons(data.filters),
    '        </div>',
    '',
    '        <ul class="portfolio__list">',
    data.items.map(renderCard).join('\n'),
    '        </ul>',
  ]);
}

module.exports = { renderPortfolio };
