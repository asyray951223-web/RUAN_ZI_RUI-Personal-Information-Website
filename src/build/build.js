// 建置進入點：讀 src/data/*.json，交給對應的 render 函式產生 HTML 字串，
// 再用 replaceBuildBlock 塞回 src/pages/index.html 對應的 <!-- BUILD:xxx:start/end --> 標記內。
// 只在開發者機器用 Node 執行（npm run build:html），不會被瀏覽器載入。
const fs = require('fs');
const path = require('path');

const { replaceBuildBlock } = require('./inject');
const { renderResume } = require('./render/resume');
const { renderActivities } = require('./render/activities');
const { renderSkills } = require('./render/skills');
const { renderPortfolio } = require('./render/portfolio');
const { renderCasestudy } = require('./render/casestudy');
const { renderNotes } = require('./render/notes');
const { renderGoals } = require('./render/goals');

const SRC_DIR = path.join(__dirname, '..');
const INDEX_HTML_PATH = path.join(SRC_DIR, 'pages', 'index.html');
const DATA_DIR = path.join(SRC_DIR, 'data');

function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  let html = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

  const sections = [
    { name: 'resume', data: readJson('resume.json'), render: renderResume },
    { name: 'activities', data: readJson('activities.json'), render: renderActivities },
    { name: 'skills', data: readJson('skills.json'), render: renderSkills },
    { name: 'portfolio', data: readJson('portfolio.json'), render: renderPortfolio },
    { name: 'casestudy', data: readJson('casestudy.json'), render: renderCasestudy },
    { name: 'notes', data: readJson('notes.json'), render: renderNotes },
    { name: 'goals', data: readJson('goals.json'), render: renderGoals },
  ];

  sections.forEach(({ name, data, render }) => {
    const innerHtml = render(data);
    html = replaceBuildBlock(html, name, innerHtml);
  });

  fs.writeFileSync(INDEX_HTML_PATH, html, 'utf8');
  console.log('已依 src/data/*.json 重新產生 index.html 的 resume/activities/skills/portfolio/casestudy/notes/goals 區塊');
}

main();
