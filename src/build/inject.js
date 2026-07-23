// 用 <!-- BUILD:xxx:start/end --> 標記，把 index.html 裡對應區塊的內容整段換成
// 新產生的 HTML。刻意選標記註解而不是拆成獨立的樣板檔（index.template.html），
// 因為這樣仍然只有一份 index.html 是「真的」，開發者可以直接雙擊開檔案預覽，
// 符合本站「零建置工具、開檔案就能看」的既有習慣；也不會有「兩份檔案容易不同步」
// 的風險（FuturePlan.md 規劃三就是在講這類風險）。

// 找不到標記就直接丟錯中止建置，不要靜默略過——避免標記被誤刪之後，
// 建置腳本「看起來跑成功」但其實完全沒有寫入新內容。
function replaceBuildBlock(html, sectionName, newInnerHtml) {
  const startMarker = `<!-- BUILD:${sectionName}:start -->`;
  const endMarker = `<!-- BUILD:${sectionName}:end -->`;

  const startIndex = html.indexOf(startMarker);
  const endIndex = html.indexOf(endMarker);

  if (startIndex === -1 || endIndex === -1) {
    throw new Error(
      `找不到 BUILD:${sectionName} 標記（start=${startIndex}, end=${endIndex}），` +
        `請確認 index.html 裡的 <!-- BUILD:${sectionName}:start/end --> 註解沒有被誤刪。`
    );
  }
  if (endIndex < startIndex) {
    throw new Error(`BUILD:${sectionName} 的 end 標記出現在 start 標記之前，順序錯誤。`);
  }

  const before = html.slice(0, startIndex + startMarker.length);
  const after = html.slice(endIndex);

  return `${before}\n${newInnerHtml}\n${after}`;
}

module.exports = { replaceBuildBlock };
