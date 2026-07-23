// #resume 區塊渲染邏輯。6 個手風琴面板哪些預設展開（open）、標題文字與順序，
// 屬於版面設計決策而非「內容資料」，維持寫死在這裡，不進 src/data/resume.json，
// 避免 JSON schema 為了遷就固定不變的結構性資訊而變複雜。
const { escapeHtml, joinLines } = require('./html-utils');

function renderEducationItem(item) {
  return joinLines([
    '            <li class="resume__edu">',
    '              <article>',
    `                <h4 class="resume__edu-school">${escapeHtml(item.school)}</h4>`,
    `                <p class="resume__edu-meta">${escapeHtml(item.meta)}</p>`,
    // extra 是選填欄位（原本註解：非必要，沒有的話這行可以直接刪掉，不要留佔位字）
    item.extra ? `                <p class="resume__edu-extra">\n                  ${escapeHtml(item.extra)}\n                </p>` : '',
    '              </article>',
    '            </li>',
  ]);
}

function renderJobItem(item) {
  return joinLines([
    '            <li class="resume__job">',
    '              <article>',
    `                <h4 class="resume__job-title">${escapeHtml(item.title)}</h4>`,
    `                <p class="resume__job-meta">\n                  ${escapeHtml(item.meta)}\n                </p>`,
    `                <p class="resume__job-desc">\n                  ${escapeHtml(item.desc)}\n                </p>`,
    `                <p class="resume__job-tools">${escapeHtml(item.tools)}</p>`,
    '              </article>',
    '            </li>',
  ]);
}

function renderProjectItem(item) {
  const tags = item.tags
    .map((tag) => `                  <li class="resume__project-tag">${escapeHtml(tag)}</li>`)
    .join('\n');
  return joinLines([
    '            <li class="resume__project">',
    '              <article>',
    `                <h4 class="resume__project-title">${escapeHtml(item.title)}</h4>`,
    `                <p class="resume__project-desc">\n                  ${escapeHtml(item.desc)}\n                </p>`,
    `                <p class="resume__project-role">\n                  ${escapeHtml(item.role)}\n                </p>`,
    '                <ul class="resume__project-tags">',
    tags,
    '                </ul>',
    `                <a class="resume__project-link" href="${escapeHtml(item.link)}"\n                  >${escapeHtml(item.linkLabel)}</a\n                >`,
    '              </article>',
    '            </li>',
  ]);
}

function renderCertItem(item) {
  return joinLines([
    '            <li class="resume__cert">',
    '              <article>',
    `                <h4 class="resume__cert-name">${escapeHtml(item.name)}</h4>`,
    `                <p class="resume__cert-meta">${escapeHtml(item.meta)}</p>`,
    '              </article>',
    '            </li>',
  ]);
}

function renderAwardItem(item) {
  return joinLines([
    '            <li class="resume__award">',
    '              <article>',
    `                <h4 class="resume__award-name">${escapeHtml(item.name)}</h4>`,
    `                <p class="resume__award-meta">${escapeHtml(item.meta)}</p>`,
    '              </article>',
    '            </li>',
  ]);
}

function renderResume(data) {
  return joinLines([
    '        <!-- 求職者最想第一眼看到的重點，預設展開（避免忙碌訪客沒點開就漏看關鍵經歷） -->',
    '        <details class="resume__group" open>',
    '          <summary class="resume__subtitle">教育背景</summary>',
    '          <ul class="resume__edu-list">',
    data.education.map(renderEducationItem).join('\n'),
    '          </ul>',
    '        </details>',
    '',
    '        <details class="resume__group" open>',
    '          <summary class="resume__subtitle">實習 / 工讀經歷</summary>',
    '          <ul class="resume__job-list">',
    data.jobs.map(renderJobItem).join('\n'),
    '          </ul>',
    '        </details>',
    '',
    '        <details class="resume__group" open>',
    '          <summary class="resume__subtitle">專案經歷</summary>',
    '          <ul class="resume__project-list">',
    data.projects.map(renderProjectItem).join('\n'),
    '          </ul>',
    '        </details>',
    '',
    '        <!-- 補充性質，不影響核心資訊判讀，預設摺疊 -->',
    '        <details class="resume__group">',
    '          <summary class="resume__subtitle">校園經歷（精簡版）</summary>',
    '          <ul class="resume__campus-list">',
    data.campus
      .map((text) => `            <li class="resume__campus">\n              ${escapeHtml(text)}\n            </li>`)
      .join('\n'),
    '          </ul>',
    '        </details>',
    '',
    '        <!-- 原本「證照 / 獎項」合併一組，這次拆成兩個獨立面板：證照通常是能力佐證、',
    '             獎項是成果佐證，性質不同，分開後各自可以放多筆條目 -->',
    '        <details class="resume__group">',
    '          <summary class="resume__subtitle">證照</summary>',
    '          <ul class="resume__cert-list">',
    data.certs.map(renderCertItem).join('\n'),
    '          </ul>',
    '        </details>',
    '',
    '        <details class="resume__group">',
    '          <summary class="resume__subtitle">獎項</summary>',
    '          <ul class="resume__award-list">',
    data.awards.map(renderAwardItem).join('\n'),
    '          </ul>',
    '        </details>',
  ]);
}

module.exports = { renderResume };
