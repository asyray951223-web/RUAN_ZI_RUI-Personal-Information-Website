// #casestudy 區塊渲染邏輯。視覺方向依 docs/superpowers/specs/2026-07-23-casestudy-content-design.md
// 確認為「Pull Request 框架」：MERGED 徽章／描述／過程／挑戰（審查意見樣式）／成果（合併摘要），
// 「查看關聯作品」連結套用誠實圓點——圓點代表「幾個階段有圖片佐證」，不是固定不變的裝飾數字
// （沿用全站「誠實感優先」原則：陳姐不信自誇形容詞，這裡也不放無意義的固定滿分指標）。
const { escapeHtml, joinLines } = require('./html-utils');

function renderBlockImage(image) {
  if (!image) return '';
  return `                  <img class="casestudy__block-image" src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt)}" />`;
}

function renderBlock(block) {
  const bodyText = `                  <p class="casestudy__block-text">${escapeHtml(block.text)}</p>`;

  if (block.key === 'challenge') {
    // 挑戰：用審查意見（review comment）樣式的強調框，呼應 PR 框架裡「有討論、有困難」的語意
    return joinLines([
      '                <div class="casestudy__block">',
      `                  <h4 class="casestudy__block-label">${escapeHtml(block.label)}</h4>`,
      '                  <div class="casestudy__review">',
      bodyText,
      '                  </div>',
      '                </div>',
    ]);
  }

  if (block.key === 'outcome') {
    // 成果與收穫：可選配量化成果標註（真的有數字才輸出，沒有就不放）
    return joinLines([
      '                <div class="casestudy__block">',
      `                  <h4 class="casestudy__block-label">${escapeHtml(block.label)}</h4>`,
      block.metric ? `                  <p class="casestudy__metric">${escapeHtml(block.metric)}</p>` : '',
      bodyText,
      '                </div>',
    ]);
  }

  // 背景／目標／過程：一般段落，過程可選配圖片佐證
  return joinLines([
    '                <div class="casestudy__block">',
    `                  <h4 class="casestudy__block-label">${escapeHtml(block.label)}</h4>`,
    renderBlockImage(block.image),
    bodyText,
    '                </div>',
  ]);
}

function renderItem(item, index) {
  const num = String(index + 1).padStart(2, '0');
  const imageCount = item.blocks.filter((block) => block.image).length;
  const totalBlocks = item.blocks.length;

  return joinLines([
    `          <li class="casestudy__item" id="casestudy-${escapeHtml(item.slug)}">`,
    '            <article>',
    '              <div class="casestudy__head">',
    '                <span class="casestudy__badge">MERGED</span>',
    `                <h3 class="casestudy__name">${escapeHtml(item.name)}</h3>`,
    `                <span class="casestudy__num">#${num}</span>`,
    '              </div>',
    `              <p class="casestudy__summary">${escapeHtml(item.summary)}</p>`,
    '',
    item.blocks.map(renderBlock).join('\n\n'),
    '',
    '              <div class="casestudy__footer">',
    '                <div class="casestudy__footer-row">',
    `                  <span class="casestudy__footer-status" aria-label="${imageCount} / ${totalBlocks} 個階段附有圖片佐證">`,
    Array.from({ length: totalBlocks })
      .map((_, i) => `                    <span class="casestudy__footer-dot${i < imageCount ? ' is-on' : ''}"></span>`)
      .join('\n'),
    '                  </span>',
    `                  <span>${imageCount} / ${totalBlocks} 個階段附圖片佐證</span>`,
    '                </div>',
    '                <div class="casestudy__footer-row">',
    '                  Merged by <span class="casestudy__footer-accent">ruan_zi_rui</span> ·',
    `                  <a class="casestudy__portfolio-link" href="#portfolio-${escapeHtml(item.portfolioSlug)}">查看關聯作品 portfolio/${escapeHtml(item.portfolioSlug)} →</a>`,
    '                </div>',
    '              </div>',
    '            </article>',
    '          </li>',
  ]);
}

function renderCasestudy(data) {
  return joinLines(['        <ul class="casestudy__list">', data.items.map(renderItem).join('\n'), '        </ul>']);
}

module.exports = { renderCasestudy };
