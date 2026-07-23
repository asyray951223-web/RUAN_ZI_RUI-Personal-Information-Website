// #skills 區塊渲染邏輯。這是四個區塊中最值得資料驅動的一個：
// - 6 顆圓點的 on/off 與熟練度文字，由 level（1–6 整數）透過下面的固定對照表推導，
//   不在 JSON 存已經算好的 levelLabel（對照表見 docs/superpowers/specs/2026-07-23-skills-redesign-design.md）
// - 65 年尺標的寬度百分比，由 tenureYears 數字算出，不在 JSON 存已經算好的百分比字串
const { escapeHtml, joinLines } = require('./html-utils');

// CEFR 六級量表對照：入門/基礎/中等/中高/高等/精通，index 對應 level 1–6
const LEVEL_LABELS = ['入門', '基礎', '中等', '中高', '高等', '精通'];

function tenureWidthPercent(years) {
  // 65 年尺標：100% = 65 年，取一位小數；已驗算 3→4.6%、1→1.5%，跟目前手寫值吻合
  return ((years / 65) * 100).toFixed(1) + '%';
}

function renderLevelDots(level) {
  const dots = [];
  for (let i = 1; i <= 6; i += 1) {
    dots.push(
      i <= level
        ? '                  <span class="skills__level-dot skills__level-dot--on"></span>'
        : '                  <span class="skills__level-dot"></span>'
    );
  }
  return dots.join('\n');
}

function renderEvidence(evidence) {
  if (!evidence || !evidence.length) {
    return '              <p class="skills__evidence-empty">尚無對應作品連結</p>';
  }
  const links = evidence
    .map(
      (work) =>
        `                  <a class="skills__evidence-link" href="${escapeHtml(work.href)}" title="${escapeHtml(
          work.name
        )}">${escapeHtml(work.name)}</a>`
    )
    .join('\n');
  return joinLines([
    '              <details class="skills__evidence">',
    `                <summary class="skills__evidence-summary">用於 <span class="skills__evidence-count">${evidence.length}</span> 個作品</summary>`,
    '                <div class="skills__evidence-grid">',
    '                  <!-- title 屬性補上完整文字：格線窄，連結文字會被 ellipsis 截斷，',
    '                       hover 時靠 title 顯示完整作品名稱，不會因為截斷而看不出是哪個作品 -->',
    links,
    '                </div>',
    '              </details>',
  ]);
}

function renderTechToolItem(item) {
  const label = LEVEL_LABELS[item.level - 1];
  return joinLines([
    '            <li class="skills__item">',
    '              <div class="skills__row1">',
    `                <span class="skills__name">${escapeHtml(item.name)}</span>`,
    `                <!-- CEFR 六級量表：${item.level}/6 顆填色＝「${label}」 -->`,
    `                <div class="skills__level" aria-label="熟練度：${label}">`,
    renderLevelDots(item.level),
    `                  <span class="skills__level-label">${label}</span>`,
    '                </div>',
    '              </div>',
    '              <div class="skills__row2">',
    `                <span class="skills__tenure-num">${item.tenureYears} 年</span>`,
    `                <!-- 65 年尺標：${item.tenureYears} / 65 ≈ ${tenureWidthPercent(item.tenureYears)} -->`,
    '                <div class="skills__tenure-track">',
    `                  <div class="skills__tenure-fill" style="width: ${tenureWidthPercent(item.tenureYears)};"></div>`,
    '                </div>',
    '              </div>',
    renderEvidence(item.evidence),
    '            </li>',
  ]);
}

function renderLangItem(item) {
  return joinLines([
    '            <li class="skills__item skills__item--lang">',
    '              <div class="skills__row1">',
    `                <span class="skills__name">${escapeHtml(item.name)}</span>`,
    '              </div>',
    '              <!-- 語言類不套用 CEFR 圓點，改沿用 resume__cert-meta 的「名稱・取得時間」寫法 -->',
    `              <p class="skills__cert-meta"><b>${escapeHtml(item.certName)}</b>・${escapeHtml(item.certTime)}</p>`,
    '            </li>',
  ]);
}

function renderGroup(group) {
  const renderItem = group.id === 'lang' ? renderLangItem : renderTechToolItem;
  return joinLines([
    '        <div class="skills__group">',
    `          <h3 class="skills__subtitle">${escapeHtml(group.title)}</h3>`,
    '          <ul class="skills__list">',
    group.items.map(renderItem).join('\n'),
    '          </ul>',
    '        </div>',
  ]);
}

function renderSkills(data) {
  return data.groups.map(renderGroup).join('\n\n');
}

module.exports = { renderSkills };
