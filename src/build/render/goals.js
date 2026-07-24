// #goals 區塊渲染邏輯。視覺方向依 docs/superpowers/specs/2026-07-24-goals-content-design.md：
// - 區塊最上方放一句「整體願景總述」（沿用 #about__motto 的斜體強調色語彙），把短期/中長期
//   兩組清單串成一個故事，不是兩份互不相關的清單
// - 每筆目標左側的雙點標記（近/遠）沿用 #skills 等級指示的圓點語彙，用 group.dotPosition
//   （near/far）決定哪一顆點亮，不是逐筆目標自己算，避免同一組內的點位不一致
// - 「為什麼／完成定義」收進原生 <details>/<summary>，完全比照 #skills__evidence 的既有
//   做法（不用 JavaScript），評估佐證/連結才會在收合區「之後」出現，維持快速掃描時的輕量感
const { escapeHtml, joinLines } = require('./html-utils');

function renderDots(dotPosition) {
  const nearOn = dotPosition === 'near';
  return [
    `                <span class="goals__dot${nearOn ? ' goals__dot--on' : ''}"></span>`,
    `                <span class="goals__dot${nearOn ? '' : ' goals__dot--on'}"></span>`,
  ].join('\n');
}

function renderWhy(item) {
  // why／criteria 兩個欄位只要有其中一個就顯示收合區，都沒有才整段省略
  if (!item.why && !item.criteria) return '';
  return joinLines([
    '              <details class="goals__why">',
    '                <summary class="goals__why-summary">為什麼／完成定義</summary>',
    '                <div class="goals__why-body">',
    item.why ? `                  <p><b>為什麼：</b>${escapeHtml(item.why)}</p>` : '',
    item.criteria ? `                  <p><b>完成定義：</b>${escapeHtml(item.criteria)}</p>` : '',
    '                </div>',
    '              </details>',
  ]);
}

function renderItem(item, dotPosition) {
  return joinLines([
    `          <li class="goals__item" id="goals-${escapeHtml(item.slug)}">`,
    '            <div class="goals__row">',
    '              <span class="goals__dots" aria-hidden="true">',
    renderDots(dotPosition),
    '              </span>',
    '              <div class="goals__body">',
    '                <div class="goals__top">',
    `                  <p class="goals__desc">${escapeHtml(item.desc)}</p>`,
    `                  <span class="goals__time">${escapeHtml(item.timeframe)}</span>`,
    '                </div>',
    item.evidence ? `                <p class="goals__evidence">${escapeHtml(item.evidence)}</p>` : '',
    renderWhy(item),
    // 連結放在「為什麼／完成定義」之後，是這輪確認過的順序（見規格文件）
    item.link
      ? `                <a class="goals__link" href="${escapeHtml(item.link.href)}">↗ ${escapeHtml(item.link.text)}</a>`
      : '',
    '              </div>',
    '            </div>',
    '          </li>',
  ]);
}

function renderGroup(group) {
  return joinLines([
    '        <div class="goals__group">',
    `          <h3 class="goals__subtitle">${escapeHtml(group.title)}</h3>`,
    '          <ul class="goals__list">',
    group.items.map((item) => renderItem(item, group.dotPosition)).join('\n'),
    '          </ul>',
    '        </div>',
  ]);
}

function renderGoals(data) {
  return [
    `        <p class="goals__vision">「${escapeHtml(data.vision)}」</p>`,
    data.groups.map(renderGroup).join('\n\n'),
  ].join('\n\n');
}

module.exports = { renderGoals };
