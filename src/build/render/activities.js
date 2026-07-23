// #activities 區塊渲染邏輯。三個分組（社團/競賽/志工）各自的欄位組合不同
// （badge 只有競賽類有、audience/quantity 只有志工類有、links 目前只有社團類有），
// 統一用「有值才輸出對應標籤」的方式處理，不用幫每個分組寫專屬的 render 函式。
const { escapeHtml, joinLines } = require('./html-utils');

function renderSkillTags(skillTags) {
  if (!skillTags || !skillTags.length) return '';
  const tags = skillTags.map((tag) => `                  <span class="activities__skill-tag">${escapeHtml(tag)}</span>`).join('\n');
  return joinLines([
    '                <!-- 軟實力標籤：自由填寫，不強制標準化分類 -->',
    '                <div class="activities__skill-tags">',
    tags,
    '                </div>',
  ]);
}

function renderLinkList(links) {
  if (!links || !links.length) return '';
  const items = links
    .map(
      (link) =>
        `                  <li class="activities__link-item">\n                    <a class="activities__link" href="${escapeHtml(
          link.href
        )}">${escapeHtml(link.label)}</a>\n                  </li>`
    )
    .join('\n');
  return joinLines(['                <ul class="activities__link-list">', items, '                </ul>']);
}

function renderItem(item) {
  return joinLines([
    `            <li class="activities__item" id="activities-${escapeHtml(item.slug)}">`,
    '              <article>',
    `                <h4 class="activities__name">${escapeHtml(item.name)}</h4>`,
    // badge：只有競賽類等有具體名次時才輸出，獨立於敘述文字外，方便快速掃描
    item.badge
      ? `                <!-- 名次/成果徽章：只有競賽類等有具體名次時才輸出，視覺獨立於敘述文字外，方便快速掃描 -->\n                <p class="activities__badge">${escapeHtml(
          item.badge
        )}</p>`
      : '',
    `                <p class="activities__date">${escapeHtml(item.date)}</p>`,
    `                <p class="activities__role">${escapeHtml(item.role)}</p>`,
    `                <p class="activities__desc">${escapeHtml(item.desc)}</p>`,
    `                <p class="activities__outcome">${escapeHtml(item.outcome)}</p>`,
    renderSkillTags(item.skillTags),
    renderLinkList(item.links),
    // audience／quantity：志工類特有欄位
    item.audience ? `                <!-- 服務對象／時數：志工類特有欄位 -->\n                <p class="activities__audience">${escapeHtml(item.audience)}</p>` : '',
    item.quantity ? `                <p class="activities__quantity">${escapeHtml(item.quantity)}</p>` : '',
    '              </article>',
    '            </li>',
  ]);
}

function renderGroup(group) {
  return joinLines([
    '        <div class="activities__group">',
    `          <h3 class="activities__subtitle">${escapeHtml(group.title)}</h3>`,
    '          <ul class="activities__list">',
    group.items.map(renderItem).join('\n'),
    '          </ul>',
    '        </div>',
  ]);
}

function renderActivities(data) {
  return data.groups.map(renderGroup).join('\n\n');
}

module.exports = { renderActivities };
