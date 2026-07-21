# Claude 協助歷程紀錄

本檔案記錄 Claude Code 在本專案（`Project_個人資訊網站`）中協助過的變更歷程，方便日後回顧「做了什麼、為什麼這樣做」。

---

## 2026-07-20

### 1. 網站字型設定

**背景**：專案原本完全沒有設定 `font-family`，瀏覽器套用預設字型。

**變更**：
- `src/pages/index.html`：加入 Google Fonts 的 `<link>`（`preconnect` + stylesheet），載入 **Inter**（英文/數字）與 **Noto Sans TC**（中文，思源黑體）字重 400/500/700。
- 定義字型變數 `$font-family-base: 'Inter', 'Noto Sans TC', sans-serif;`，套用在 `body`。

**討論過的取捨**：Google Fonts CDN vs 本機託管（`@font-face`）
- CDN：架設簡單、Google 自動處理相容格式，但多一次對外部網域的請求，且有 GDPR 相關的隱私疑慮（曾有德國法院判例）。
- 本機託管：字型同源、無第三方請求、不受 Google 服務可用性影響，但需自行下載字型檔、手寫 `@font-face`，維護成本較高。
- **決定**：目前維持 Google Fonts CDN，之後若有隱私合規或離線需求再切換成本機託管。

### 2. HTML 標籤加上 class / id（BEM 命名）

**背景**：`src/pages/index.html` 原本的標籤（`header`、`nav`、`section` 等）沒有 class，不利於之後撰寫對應樣式，也不利於學習前端命名慣例。

**變更**：依照 **BEM（Block\_\_Element）** 命名法，為 `header`、`nav`、`main`、`footer` 等標籤加上對應 class：
- `site-header`、`site-header__title`
- `site-nav`、`site-nav__list`、`site-nav__item`、`site-nav__link`
- `site-main`（+ `id="main"`）
- 三個 `<section>` 同時保留原本用於錨點跳轉的 `id`（`about` / `works` / `contact`），並加上共用 class `section` + 專屬 class（`about` / `works` / `contact`）
- `section__title`、`about__text`、`works__list`、`works__item`、`works__link`、`contact__text`、`contact__link`
- `site-footer`、`site-footer__text`

**命名原則**：class 名稱反映「這是什麼」而非「長什麼樣子」，`id` 只保留給需要被錨點/JS 定位的唯一元素使用。

### 3. SCSS 檔案結構重新規劃

**背景**：原本樣式只有三個檔案（`main.scss`、`_variables.scss`、`_mixins.scss`，後兩者是空檔案），隨著網站內容增加會難以維護。

**變更**：改用縮減版 **7-1 架構**，`main.scss` 只保留 `@use` 匯入、不寫任何實際樣式規則：

```
src/styles/
├── abstracts/
│   ├── _variables.scss     # $font-family-base 等變數
│   └── _mixins.scss        # 共用 mixin / function（目前為空）
├── base/
│   ├── _reset.scss         # box-sizing 重置、body margin/background
│   └── _typography.scss    # body font-family
├── layout/
│   ├── _header.scss        # .site-header / .site-nav（目前為空，待補樣式）
│   └── _footer.scss        # .site-footer（目前為空，待補樣式）
├── components/
│   └── _section.scss       # .section 共用樣式（目前為空，待補樣式）
├── pages/
│   ├── _about.scss         # .about 專屬樣式（目前為空，待補樣式）
│   ├── _works.scss         # .works 專屬樣式（目前為空，待補樣式）
│   └── _contact.scss       # .contact 專屬樣式（目前為空，待補樣式）
└── main.scss                # 入口檔，只寫 @use
```

**分類原則**：
| 資料夾 | 判斷原則 |
|---|---|
| `abstracts/` | 編譯後不產生任何 CSS，只是給其他檔案借用的變數/工具 |
| `base/` | 跟特定元件無關的全站基礎規則（reset、字體） |
| `layout/` | 對應頁面骨架、只會出現一次的區域（header/footer） |
| `components/` | 可重複使用的小元件（如 `.section`） |
| `pages/` | 只屬於單一頁面/區塊的專屬樣式 |

**注意**：`base/_reset.scss` 新增了 `body { margin: 0; }`（瀏覽器預設 body margin 通常是 8px），這是標準 reset 的一部分，會讓頁面內容更貼齊視窗邊緣。其餘視覺效果（背景色、字型）與重構前完全一致，已用瀏覽器實測確認。

**驗證方式**：`npx sass src/styles/main.scss src/styles/main.css` 重新編譯，並用本機靜態伺服器 + Playwright 開啟頁面比對畫面與 `getComputedStyle` 結果。

### 4. 為既有程式碼加上說明註解

**背景**：使用者正在學習前端，希望在既有程式碼旁加註解方便複習，不改變任何邏輯或輸出。

**變更**：
- `src/styles/main.scss`：每組 `@use` 前加註解，說明 abstracts/base/layout/components/pages 各自的用途。
- `src/styles/base/_reset.scss`：`box-sizing: border-box` 與 `body { margin: 0; }` 各自加註解說明原因。
- `src/pages/index.html`：在 `site-header`/`site-nav`/三個 `section`/`works__list` 附近加 HTML 註解，解釋 BEM 的 Block/Element 關係，以及 `class` 與 `id` 的分工（樣式 vs 錨點跳轉）。

純加註解，`main.css` 編譯結果與加註解前完全一致。

### 5. 修正 header 樣式沒有生效的問題

**背景**：使用者在 `src/styles/layout/_header.scss` 手寫了 `.site-header`、`.site-nav__list` 等樣式（含固定定位、flex 排版），但套用後畫面沒有變化。

**根本原因**：
1. `_header.scss` 用到 `$header-height` 變數，但**沒有在檔案開頭 `@use '../abstracts/variables' as *;`**，且該變數本身**也還沒被定義**——Sass 新版 `@use` 模組系統規定每個檔案要用到其他檔案的變數都得自行 `@use`，不像舊版 `@import` 全域共用。導致 `npx sass` 編譯直接報錯中止，`main.css` 完全沒被更新。
2. 專案目前沒有設定「存檔自動編譯（watch）」，即使沒有報錯，改完 `.scss` 也需要手動重新執行編譯指令才會反映到網頁。

**變更**：
- `src/styles/abstracts/_variables.scss` 新增 `$header-height: 4rem;`（先給一個預設值，可依需求調整）。
- `src/styles/layout/_header.scss` 開頭加上 `@use '../abstracts/variables' as *;`。

**驗證方式**：`npx sass` 重新編譯成功、用 Playwright 開啟頁面截圖確認 header 呈現固定頂部、左右排版的效果。

### 6. `node_modules` 加入 `.gitignore`

**背景**：先前多次執行 `npx sass ...` 進行編譯，因為 `src/package.json` 存在，npm 判斷 `src/` 為專案根目錄，把 `sass` 套件與其相依套件（約 8.1MB）安裝到了 `src/node_modules/`。當時 `src/.gitignore` 是空檔案，若執行 `git add`，這些第三方套件檔案會整包被加入版控。

**變更**：`src/.gitignore` 新增 `node_modules/`，避免這種「可被 `npm install` 重新產生」的內容進版控。

**決策**：`package.json` 目前仍為空檔案，尚未正式宣告 `sass` 為開發相依套件；待技術棧/建置流程定案後再補上 `devDependencies` 與對應 script（例如 `npm run build`、`npm run watch`）。

### 7. 新增專案根目錄 `.gitignore`

**背景**：`.playwright-mcp/`（Claude Code 用 Playwright MCP 驗證網頁時產生的截圖/紀錄暫存資料夾）位於專案根目錄，跟 `src/` 是平行關係。`.gitignore` 的規則只對「所在資料夾及其子資料夾」生效，`src/.gitignore` 管不到根目錄的東西，所以不能共用。

**變更**：新增專案根目錄的 `.gitignore`，把 `.playwright-mcp/` 排除在版控外；`src/.gitignore`（管 `node_modules/`）維持不變，兩者分工：根目錄管全 repo 通用的忽略規則，`src/.gitignore` 管 `src/` 內部建置產物。

### 8. 讓有機會用到顏色的 SCSS 檔案改用顏色變數

**背景**：`abstracts/_variables.scss` 已定義 `$color-parchment: rgba(245, 239, 237);`，但 `base/_reset.scss` 的 `body { background-color: rgba(245, 239, 237); }` 仍是寫死同一個顏色值，沒有引用變數，之後要換色得兩處一起改，容易漏改。

**變更**：
- `src/styles/base/_reset.scss`：開頭加上 `@use '../abstracts/variables' as *;`，並把 `background-color: rgba(245, 239, 237);` 改成 `background-color: $color-parchment;`。

**檢查過的其他檔案**：`layout/_header.scss`、`layout/_footer.scss`、`components/_section.scss`、`pages/_about.scss`、`pages/_works.scss`、`pages/_contact.scss`、`abstracts/_mixins.scss` 目前都沒有寫死的顏色值（多數還是空檔案），暫時不需要引用顏色變數；等之後這些檔案補上樣式、用到顏色時，記得比照本次做法引用 `$color-parchment` 或新增的顏色變數，不要再寫死色碼。

**驗證方式**：`npx sass src/styles/main.scss src/styles/main.css` 重新編譯成功，`main.css` 輸出的背景色數值與變更前完全一致（僅來源從寫死值改為變數）。

### 9. 頁面內容擴充為五大區塊（自我介紹／履歷／作品集／技能／聯絡方式）

**背景**：原本 `index.html` 只有三個簡略區塊（自我介紹、作品列表、聯絡方式），使用者依照完整個人網站規劃（履歷、作品集、技能等常見區塊應包含的資訊項目），要求先規劃並產出 HTML 結構，暫不做排版與 CSS 裝飾，文字內容一律用結構性佔位文字，之後由使用者自行填入真實資料。

**變更**：
- `src/pages/index.html`：
  - 導覽列 `site-nav__list` 從三個錨點擴充為五個：`#about`／`#resume`／`#portfolio`／`#skills`／`#contact`。
  - `#about`：新增 `about__tagline`（一句話定位）、`about__bio`（簡短背景）、`about__value`（價值主張）三段。
  - 新增 `#resume`（履歷／經歷）區塊：分「工作經歷／專案經歷／教育背景／證照獎項」四個 `resume__group` 子群組，每筆條目用 `<article>` 包裹，方便日後複製新增。
  - 原本的「作品列表」`#works` 擴充改名為 `#portfolio`（作品集），每個作品項目用 `<article>` 包含封面圖、名稱、一句話說明、技術標籤列表、角色、案例故事、連結列表。
  - 新增 `#skills`（技能）區塊：分「技術／工具／語言」三個 `skills__group`，每項用 `skills__name` + `skills__level` 兩個 `span` 標示名稱與熟練度。
  - `#contact` 新增 `contact__social-list`（社群連結）與 `contact__form`（聯絡表單 HTML 骨架：姓名／Email／訊息／送出鈕，`label for` 對應 `input id`，但沒有 `action`/`method`，不含任何送出邏輯）。
- SCSS 同步調整（維持空白樣式檔，不寫實際 CSS 規則）：
  - `src/styles/pages/_works.scss` 改名為 `src/styles/pages/_portfolio.scss`，呼應 HTML 區塊改名。
  - 新增空白樣式檔 `src/styles/pages/_resume.scss`、`src/styles/pages/_skills.scss`。
  - `src/styles/main.scss` 的 `@use` 清單同步更新（`pages/works` → `pages/portfolio`，新增 `pages/resume`、`pages/skills`）。

**取捨說明**：
- 「作品列表」改名「作品集」是使用者確認的決定，class/id 命名從 `works` 全面改成 `portfolio`，避免新舊命名混用造成混淆。
- 聯絡表單這次只搭骨架、不串接（不接 Google 表單、不寫後端、不加 JS），因為串接方式屬於之後才會定案的技術細節。
- 全部使用結構性佔位文字，不是使用者真實履歷/作品資料，之後要上線前需要使用者自行替換成真實內容。

**驗證方式**：`npx sass src/styles/main.scss src/styles/main.css` 重新編譯成功，無錯誤；新增/改名的空白 SCSS 模組不影響現有 `main.css` 視覺輸出。

### 10. Header 姓名標題改版：組合 C · 強調色點綴版

**背景**：使用者參考自備的設計範例檔 `claude助手-設計範例展示資料夾\設計範例展示.html` 裡的 `.comboC`（組合 C · 強調色點綴版），要求把 header 的 `阮梓睿 RUAN ZI RUI`（單行 `<h1>`）正式改版：中文名為主標、大字放上排，英文拼音改成小寫底線格式的等寬字（Space Mono）放下排、字尾帶閃爍游標，字首用磚紅強調色點綴；導覽列 hover 也統一改用同一個強調色，呈現底線由左至右展開的效果。

**變更**：
- `src/pages/index.html`：
  - `<head>` 的 Google Fonts `<link>` 加入 `Space Mono:wght@400;700`。
  - `<h1 class="site-header__title">阮梓睿 RUAN ZI RUI</h1>` 拆成 `<div class="site-header__title">` 包住 `<h1 class="site-header__title-cn">阮梓睿</h1>` 與 `<p class="site-header__title-en">`（內含 `<span class="site-header__title-en-accent">r</span>uan_zi_rui`）。
- `src/styles/abstracts/_variables.scss`：新增 `$color-accent: #b3401f;`（磚紅強調色）。
- `src/styles/layout/_header.scss`：
  - `.site-header__title` 改寫成 `flex-direction: column` 容器，巢狀 `&-cn`（中文主標樣式）與 `&-en`（英文拼音樣式，含 `::after` 閃爍游標動畫、`&-accent` 強調色）。
  - 新增 `@keyframes blink`。
  - `.site-nav__link:hover` 從「變色 + 底線」改成 `::after` 底線由左至右展開（用 `$color-accent`），移除原本的 `$color-pacific-cyan` hover 樣式。

**取捨說明**：
- 使用者原規格是把最外層拆成 `<div><p>中文</p><p>英文</p></div>`，但 `<h1>` 依 HTML 規範不能直接包 `<p>`，且全站只有這一個 `<h1>`，拿掉會讓頁面失去語意標題。改成：最外層 `site-header__title` 用 `<div>` 做排版容器，中文名維持用 `<h1 class="site-header__title-cn">`（全站唯一標題），英文拼音用 `<p>`。視覺與 class 命名跟原規格完全一致，只是修正了不合法的巢狀結構。
- 英文拼音的灰階顏色 `#999` 先直接寫死，沒有另外新增變數，因為目前只有這一處使用，之後若有其他地方要重複用到同一個灰階才考慮抽成變數。
- `$color-pacific-cyan` 變數保留不刪，雖然這次拿掉了它在 header hover 的唯一使用處，但先留著供之後其他地方需要青色點綴時使用。

**驗證方式**：`npx sass src/styles/main.scss src/styles/main.css` 重新編譯成功；用 Playwright 開啟本機靜態伺服器（`python -m http.server`）截圖確認中文主標／英文等寬拼音／字首強調色／閃爍游標的排版效果，並模擬 hover「履歷」導覽連結，確認底線由左至右展開、呈現磚紅強調色。

### 11. Header 標題改為並排＋放大字級

**背景**：使用者看過組合 C 上下疊放版後，覺得標題偏小，希望中文名跟英文拼音改成並排顯示，並把中英文字級等比例放大。

**變更**：`src/styles/layout/_header.scss` 的 `.site-header__title`：
- `flex-direction: column`（上下疊放）改成預設的 `row`（並排），並加上 `align-items: baseline`（中英文字級不同，用文字基線對齊比置中更整齊）與 `gap: 0.6rem` 控制間距。
- `&-cn` 字級從 `1.7rem` 放大到 `2.4rem`；`&-en` 字級從 `0.72rem` 放大到 `1rem`，兩者放大倍率一致（約 1.4 倍），維持原本的中英文比例關係。
- `&-en` 的 `margin: 4px 0 0`（原本用來跟中文名留出上下間距）改成 `margin: 0`，間距改交給父層 `gap` 統一控制。

**驗證方式**：`npx sass` 重新編譯成功；Playwright 截圖確認中文名明顯放大、與英文拼音並排在同一行、基線對齊，且沒有超出 header 固定高度（`$header-height: 4rem`）的範圍。

### 12. 內容擴充為大學生版九大區塊，並修復 header HTML/CSS 不同步問題

**背景**：使用者提供一份針對大學生的個人網站內容規劃（核心五項：自我介紹／履歷摘要／作品專案／技能／聯絡方式，加分四項：學習紀錄筆記／案例故事／校園課外經歷／目標願景），要求先規劃並套用 HTML 結構，暫不做排版與 CSS。動手前發現 `index.html` 的 header 已經被還原回最舊的單一 `<h1>` 版本，但 `_header.scss` 仍停留在第 10～11 筆紀錄做的「組合 C 並排放大版」樣式，兩者對不上（CSS 選到的 `-cn`／`-en`／`-en-accent` class 在 HTML 裡不存在）。跟使用者確認後，這次順便把 header HTML 補回來對齊 CSS。

**變更**：
- `src/pages/index.html`：
  - `<head>` 補回 `Space Mono` 字型 `<link>`（配合 header）。
  - header 標題補回「組合 C 並排放大版」結構：`<div class="site-header__title">` 包 `<h1 class="site-header__title-cn">阮梓睿</h1>` + `<p class="site-header__title-en">`（含 `-en-accent` 字首）。
  - `#about`：移除原本籠統的 `about__bio`／`about__value`，改成 `about__group` 底下的「目前狀態」（學校／科系／年級、正在學習的技能）與「興趣方向」兩組，貼近大學生實際會寫的內容。
  - `#resume`：新增 `resume__pdf-link`（完整履歷 PDF 下載連結骨架）；子群組重新排序為教育背景／實習工讀經歷／專案經歷／校園經歷（精簡版）／證照獎項，「校園經歷」這裡只放 1 行重點，完整版另開 `#activities`。
  - 新增 `#activities`（課外經歷）：社團／競賽／志工服務學習三個子群組，跟 `#resume` 的精簡版互相對應但不重複打字。
  - `#portfolio`：新增 `portfolio__type`（作品類型標籤），`portfolio__story` 改名為 `portfolio__outcome`（成果與收穫，語意跟新的 `#casestudy` 深度敘事分開）。
  - 新增 `#casestudy`（案例故事）：從作品集挑 1–2 個作品，用背景／目標／過程／挑戰／成果五段式敘事。
  - 新增 `#notes`（學習筆記）：文章列表，每篇 `<article>` 含標題連結／摘要／日期。
  - 新增 `#goals`（目標願景）：短期目標／中長期方向兩段。
  - `site-nav__list` 從 5 個錨點擴充為 9 個，順序對應 `about → resume → activities → portfolio → casestudy → skills → notes → goals → contact`。
- SCSS 同步新增空白樣式檔 `pages/_activities.scss`、`pages/_casestudy.scss`、`pages/_notes.scss`、`pages/_goals.scss`，並在 `main.scss` 的 `@use` 清單依區塊順序加入。
- `FuturePlan.md` 補上「規劃三：作品集（及未來可能的部落格/筆記）拆成獨立分頁」，記錄使用者提出的分頁想法、為什麼這次先不做（沒有建置工具，手動複製 header/nav 維護風險高，跟規劃一的雙語頁面是同一類問題）、以及未來觸發條件與建議做法。

**取捨說明**：
- Header 這次「順便」修復是使用者當場確認要做的，不是原始任務範圍，但因為本來就要大幅改寫 `index.html`，一起處理成本最低。
- `#resume` 的「校園經歷」跟 `#activities`（課外經歷）刻意分成精簡版／完整版兩處，而不是二選一，是使用者確認的方向：履歷摘要維持精簡、完整故事放獨立章節。
- `portfolio__story` 改名 `portfolio__outcome`：因為新增了 `#casestudy` 做真正的深度案例敘事，原本 `portfolio__story` 的「問題→解法→成果」定位跟新章節重疊，改成「成果與收穫」聚焦在單一作品層級的簡短總結，深度故事留給 `#casestudy`。
- 作品集／學習筆記要不要拆成獨立分頁：使用者一度提出這個想法，但確認這次先不做，記錄進 `FuturePlan.md`，避免在沒有建置工具的情況下手動複製 header 造成維護風險。

**驗證方式**：`npx sass src/styles/main.scss src/styles/main.css` 重新編譯成功；用 Playwright 開啟本機靜態伺服器，透過 accessibility snapshot 確認九個區塊依序出現、標題階層正確（全站僅一個 `<h1>`，各區塊 `<h2>`，子群組 `<h3>`/`<h4>`），header 中英文並排放大樣式與 nav 連結數量、錨點皆正確。

---

## 2026-07-21

### 13. 內容區塊順序跟著 nav 選單順序調整

**背景**：使用者已自行把 `site-nav__list` 的錨點順序從第 12 筆紀錄的 `about → resume → activities → portfolio → casestudy → skills → notes → goals → contact` 改成 `about → resume → skills → portfolio → activities → casestudy → notes → goals → contact`（技能提前到履歷後、作品集前），但下方 `<main>` 裡實際的 `<section>` 排列還停留在舊順序，兩邊對不上，要求同步。

**變更**：
- `src/pages/index.html`：只搬動 `<section>` 區塊在 `<main>` 裡的先後位置（含各自上方的說明註解），內容、class、id 完全不變。新順序：`#about → #resume → #skills → #portfolio → #activities → #casestudy → #notes → #goals → #contact`，跟 nav 一致。

**取捨說明**：
- 純粹是區塊搬移，沒有調整任何區塊內部結構或文字，避免順手做超出這次要求的修改。
- `#skills` 的說明註解補了一句「順序對齊上方 nav（履歷之後、作品集之前）」，方便之後有人再調 nav 順序時，能同時想到要回來對這裡。

**驗證方式**：搬移後用 Grep 確認 `<section id=` 出現順序與 nav 錨點順序一致；未執行 sass 重新編譯，因為這次沒有改動任何 CSS/SCSS。

### 14. `CLAUDE.md` 新增本專案預設使用的 Skill 清單

**背景**：使用者確認往後在本專案討論設計/前端相關工作時，希望固定使用 frontend-design、frontend-design-direction、brainstorming、browser-use、adversarial-ux-test 五個 skill，不用每次額外指定。

**變更**：`CLAUDE.md` 新增「預設使用的 Skill」章節，列出上述五個 skill 與各自用途（視覺設計方向、產品級設計方向、創意前先釐清需求、瀏覽器實測、完成後的 UX 檢查）。

**取捨說明**：這是規則檔變更、不是程式碼變更，但依專案慣例仍記錄一筆，方便之後回顧「為什麼固定用這幾個 skill」。

### 15. Header 標題右側加上磚紅色垂直分隔線 + 身分/專長副標

**背景**：使用者希望在 header 標題區（中文名＋英文拼音）右側，再加上一條垂直的磚紅色底線，並在線右邊加上「資訊管理・全端開發」文字，補上身分/專長標示。

**變更**：
- `src/pages/index.html`：`.site-header__title` 內，英文拼音 `<p class="site-header__title-en">` 之後新增 `<span class="site-header__title-divider" aria-hidden="true"></span>`（純視覺分隔線，`aria-hidden` 避免螢幕報讀器唸出）與 `<p class="site-header__title-tagline">資訊管理・全端開發</p>`。
- `src/styles/layout/_header.scss`：`&__title` 底下新增 `&-divider`（寬 2px、高 1.2rem、背景色 `$color-accent`，`align-self: center` 置中）與 `&-tagline`（font-size 0.95rem、顏色 `#999`，跟英文拼音同一套灰階弱化樣式）。
- `src/styles/abstracts/_variables.scss`：`$color-accent` 的用途註解補上「header 標題分隔線」。

**取捨說明**：
- 分隔線顏色直接沿用既有的 `$color-accent`（磚紅），不新增顏色變數，維持全站配色一致。
- 父層 `.site-header__title` 是 `align-items: baseline`，但純色 `<span>` 沒有基線可對齊，會偏上或偏下，所以 `&-divider` 額外加 `align-self: center` 覆寫，讓分隔線視覺置中。
- 副標文字色調刻意跟英文拼音一致（灰階弱化），維持中文名是視覺最搶眼元素的主從關係，不跟中文名搶焦點。

**驗證方式**：`npx sass src/styles/main.scss src/styles/main.css` 重新編譯成功，無錯誤。

**後續調整**：使用者回報「資訊管理・全端開發」文字沒有跟分隔線對齊在同一水平（被父層 `align-items: baseline` 拉去對齊文字底部）。修正：`&-tagline` 補上 `align-self: center`，跟 `&-divider` 用同一種對齊方式，兩者才會落在同一條水平線上。

### 16. 修正 header 深色背景上強調色的對比度不足問題

**背景**：使用者請 Claude 用 adversarial-ux-test 檢視 header 實際截圖的配色。實際換算截圖對應色碼後發現：`$color-accent`（磚紅 `#b3401f`）對 header 的深藍底 `$color-deep-space-blue`（`rgb(13,50,77)`）對比度只有約 2.32:1，不符合 WCAG AA 標準（一般文字需 4.5:1，非文字元件如底線／分隔線需 3:1）。這個顏色當初是設計給淺色背景使用（例如 `示範.html` 裡的自我介紹卡片），被直接沿用到深色 header 上才出問題。使用者確認採用「新增一個深底專用強調色」的建議並請 Claude 動手改。

**變更**：
- `src/styles/abstracts/_variables.scss`：新增 `$color-accent-on-dark: #ff6b47;`（同色系但拉高亮度，對深藍底對比度約 4.7:1，符合 WCAG AA）。`site-header__title-en-accent`（拼音字首）已由使用者自行改用新變數；這次補上剩下兩處：
- `src/styles/layout/_header.scss`：
  - `&-divider`（header 標題分隔線）改用 `$color-accent-on-dark`，並補註解說明原因。
  - `.site-nav__link::after`（導覽列 hover 底線）改用 `$color-accent-on-dark`，並補註解說明原因。
- `src/styles/main.css`：同步手動更新 `.site-header__title-divider` 與 `.site-nav__link::after` 的 `background-color`/`background` 為 `#ff6b47`（因專案沒有存檔自動編譯，`main.css` 需要跟 `.scss` 手動保持同步）。

**取捨說明**：
- 沒有直接把 `$color-accent` 本身改成 `#ff6b47`，因為 `$color-accent`（磚紅）在淺色背景的情境下（例如 `示範.html` 的自我介紹卡片設計稿）對比度是足夠的，直接改動會影響那些情境的視覺效果；改用新增一個「深底專用」變數，讓兩種背景情境各自使用適合自己的強調色版本，之後有其他深色區塊要用強調色，也直接引用 `$color-accent-on-dark` 即可。
- 只換色碼，沒有動任何排版結構。

**驗證方式**：手動計算 WCAG 相對亮度公式，確認 `#ff6b47` 對 `rgb(13,50,77)` 的對比度約 4.7:1，符合一般文字 4.5:1 的門檻；`main.css` 同步更新後，兩個色碼與 `.scss` 來源一致。

### 17. 修正 `#about` 兩個 adversarial-ux-test 找出的 RED 項目

**背景**：使用者請 Claude 用 adversarial-ux-test 檢視已實作的 `#about` 區塊截圖，找出兩個跟螢幕大小無關、之後填入真實內容一定會踩到的問題：① 主題字句用 `<br />` 寫死斷行，換成真實文字長度不同時會斷得不自然；② 大頭照目前是 `<div>` 佔位，沒有預先加 `object-fit: cover`，之後換成真實 `<img>` 時如果照片不是正方形會被拉伸變形。使用者確認直接修正。

**變更**：
- `src/pages/index.html`：`.about__tagline` 拿掉 `<br />`，改成一段完整文字（佔位內容也一併簡化成一句話，避免誤導成「一定要兩行」）。
- `src/styles/pages/_about.scss`：
  - `.about__tagline` 新增 `max-width: 26ch;`，改讓瀏覽器依實際內容自然換行，取代原本手動斷行。
  - `.about__avatar` 新增 `object-fit: cover;`，目前對 `<div>` 沒有實際效果，但之後換成 `<img>` 時會直接生效，不用回頭補。
- `src/styles/main.css`：同步手動更新 `.about__tagline`（加 `max-width`）與 `.about__avatar`（加 `object-fit`），因專案沒有存檔自動編譯。

**取捨說明**：
- `max-width: 26ch` 是抓一個大約跟原本兩行佔位字寬度相近的值，之後使用者填入真實一句話定位文字時，如果字數落差很大，可能還是要微調這個數值，但至少不會再有「斷點寫死在錯誤位置」的結構性問題。
- `object-fit: cover` 只有搭配 `<img>` 元素才會生效，這次先加上是預防性修正，不影響目前佔位版面的顯示結果。

**驗證方式**：純樣式/標籤微調，未執行 sass 重新編譯（`main.css` 已手動同步），視覺上主標從兩行固定文字變成一行、換行邏輯交給瀏覽器，佔位版面顯示結果與修正前接近。

### 17. `#about` 改版為「01・基礎延伸版」卡片排版（已撤銷）

**背景**：曾參考自備設計範例把首頁自我介紹區塊改成白底圓角卡片（eyebrow 標題、圓形大頭照、tagline/identity/bio/tags/motto），`identity`／`bio`／`tags` 欄位對應方式與 tagline 佔位文字都已跟使用者確認過。改完之後使用者要求撤銷本次變動，因此 `src/pages/index.html` 的 `#about`、`src/styles/components/_section.scss`、`src/styles/pages/_about.scss` 都已還原回改版前的狀態（`about__group` 兩欄結構、空白樣式檔）。這筆紀錄保留是為了讓之後想重新做這個改版時，能查到當初已經談定的欄位對應與設計規格。

### 18. `#about` 重新改版為「01・基礎延伸版」——這次數值自主設計，不照抄參考檔案

**背景**：使用者用 `/plan` 重新提出跟第 17 筆同樣的版面需求，但這次特別加註「示範.html 僅供參考、禁止直接套用」。訊息裡雖然仍列出跟第 17 筆完全相同的具體數值（1.55rem、`#23303d`、`#8a939c`、`#f1f3f5` 等），但透過 AskUserQuestion 確認後，使用者要的是「版面邏輯（eyebrow + 左圖右文兩欄 + 標籤 + 座右銘）可以參考示範檔案，但字級/行高/色碼這次由 Claude 重新設計，不直接沿用示範檔案或訊息裡列的數字」。因此這次用 `frontend-design` skill 重新做了一輪設計判斷：本站在 header 已經建立「深空藍 + 磚紅強調色 + Space Mono 等寬字/閃爍游標」的開發者語彙，若直接照搬示範檔案的中性灰階，`#about` 會變成一張跟本站身分脫節的通用卡片，所以這次改成從 `$color-deep-space-blue` 推導出一組專屬深藍灰階（tagline/identity/bio 三階），並把技能標籤設計成 Space Mono 等寬「# 標籤」小卡片，作為呼應 header 語彙的簽名元素。

**變更**：
- `src/pages/index.html`：`#about` 結構跟第 17 筆相同（`about__eyebrow` + `about__layout` 內 `about__avatar` + `about__content` 包 `about__tagline`／`about__identity`／`about__bio`／`about__tags`（3 個 `about__tag`）／`about__motto`），移除 `about__group` 等舊 class。
- `src/styles/components/_section.scss`：新增 `@mixin section-card`（白底、圓角 14px、`box-shadow` 改用 `rgba(13, 50, 77, 0.08)` 帶一點本站主色調，取代純黑陰影；`max-width: 920px` 置中）。維持第 17 筆確認過的做法：不直接套用在 `.section` class 上，只有需要的區塊自行 `@include`，這次只有 `.about` 用。
- `src/styles/pages/_about.scss`：`.about { @include section-card; }`，並補上以下自主設計的樣式（取代第 17 筆直接沿用範例檔案的版本）：
  - `.about__eyebrow`：0.95rem/700，`letter-spacing: 0.08em`，顏色 `$color-deep-space-blue`；`&-bar` 3px 寬強調色短豎線。
  - `.about__tagline`：1.6rem/800，`line-height: 1.35`，`letter-spacing: -0.01em`，顏色直接用 `$color-deep-space-blue`（呼應 header 背景色）。
  - `.about__identity`：0.92rem，顏色 `#55707f`（從深空藍推導的中間調）。
  - `.about__bio`：0.94rem/`line-height: 1.8`，顏色 `#32424d`。
  - `.about__tags`／`.about__tag`：改用 `'Space Mono', monospace` + `::before { content: '#'; color: $color-accent; }`，底色 `#eef2f5`、文字 `#3d5566`，圓角 6px（不是全圓膠囊），做成「# 標籤」code-chip 觀感。
  - `.about__avatar`：136px 圓形、2px 實線 `$color-accent` 邊框、底色 `#eef2f5`（跟 tag 底色一致）。
  - `.about__motto`：0.85rem 斜體 `$color-accent`，上方分隔線改用 `rgba(13, 50, 77, 0.18)` 虛線（主色低透明度，取代示範檔案的中性灰）。

**取捨說明**：
- 所有新色碼都手動驗算過對白底的 WCAG 對比度：identity `#55707f` 約 5.23:1、bio `#32424d` 約 10.38:1、tag 文字 `#3d5566` 對淺底約 6.93:1、`$color-accent` 對白底約 5.72:1，皆通過一般文字 4.5:1 門檻（`$color-accent` 在 header 深底情境對比度不足，才有第 16 筆的 `$color-accent-on-dark`；這裡是白底卡片，情境不同，另外驗算過沒有沿用那個深底專用變數）。
- 簽名元素（Space Mono 等寬 + `#` 前綴標籤）只用在 tags 這一處，identity/bio 維持全站基礎字體，避免整張卡片過度風格化，符合「boldness 只花在一個地方」的設計原則。
- 版面結構（eyebrow/兩欄/標籤/座右銘）跟第 17 筆一致，因為使用者只要求「數值不要照抄」，沒有要求改版面邏輯。

**驗證方式**：`npx sass src/styles/main.scss src/styles/main.css` 重新編譯成功；起本機靜態伺服器並用 Playwright 截圖確認：卡片呈現深藍/磚紅/等寬字的專屬觀感（tagline 深藍、標籤帶 `#` 前綴等寬字）、`#resume`（履歷/經歷）等其餘區塊未受影響，證實視覺上跟示範檔案的中性灰清爽風有明顯區隔，同時跟 header 的既有品牌識別一致。

### 19. 取消 `#about` 的卡片視覺，內容保留

**背景**：第 18 筆讓 `#about` 變成一張獨立白底卡片（`section-card` mixin：背景、圓角、陰影、`max-width` 置中），跟頁面其餘區塊（resume/portfolio 等完全無樣式）風格不一致，使用者覺得格格不入，並訂下規則：**本網站主區塊預設不做成卡片，除非之後特別要求**。

**變更**：
- `src/styles/pages/_about.scss`：移除 `.about { @include section-card; }` 整個 ruleset，以及不再需要的 `@use '../components/section' as *;`；`.about__eyebrow`／`.about__layout`／`.about__avatar`／`.about__tagline`／`.about__identity`／`.about__bio`／`.about__tags`／`.about__tag`／`.about__motto` 完全不動，內容與排版保留。
- `src/styles/components/_section.scss`：`@mixin section-card` 定義維持不刪，只是目前沒有任何區塊 `@include` 它——工具留著，之後有區塊明確要做成卡片可以直接用，但不會自動套用。

**取捨說明**：拿掉卡片外觀後 `.about` 沒有背景/圓角/陰影/寬度限制，回到跟其他區塊一樣貼齊版面；只拿掉外層容器樣式，不動內部設計（深藍配色、等寬字標籤等第 18 筆的設計判斷維持）。

**驗證方式**：`npx sass src/styles/main.scss src/styles/main.css` 重新編譯成功；Playwright 截圖確認 `#about` 不再有白底卡片外觀，內容與內部排版跟改版前一致。

### 20. `#about` 加上 clamp() 流體留白（左右留白 + 上下間距）

**背景**：使用者希望 `#about` 左右留空、上下間距加大，並且要「保持空間的彈性與呼吸感」。先在 `示範.html` 規劃三個方向（① 置中容器＋固定留白 ② `clamp()` 流體留白 ③ 不對稱大留白＋加大節奏感），使用者確認採用方案二。

**變更**：
- `src/styles/pages/_about.scss`：新增 `.about { padding: clamp(2.5rem, 9vw, 4.5rem) clamp(1rem, 6vw, 3.5rem); }`，並補上說明留白邏輯的註解。
- `src/styles/main.css`：同步手動新增同一段 `.about` 規則（因專案沒有存檔自動編譯）。

**取捨說明**：
- 沒有採用「置中容器＋固定寬度」的方案一，因為使用者明確要「彈性」，固定寬度容器在極寬螢幕上留白量不會繼續增加，不符合需求。
- 用 `clamp()` 直接讓留白隨視窗寬度連續縮放，不用等之後做響應式斷點才有彈性，這一層的彈性現在就到位；但這不等於完整的響應式設計（例如 `.about__layout` 在窄螢幕會不會擠壓變形這件事仍未處理），使用者已確認響應式工程留給之後。
- 只加在 `.about` 這個區塊，沒有動 `components/_section.scss`，因為使用者這次只針對 `#about` 提出需求，其他區塊目前都還是空白樣式檔，之後如果要統一各區塊的留白邏輯，建議再抽到共用的 `_section.scss`。

**驗證方式**：純樣式新增，`clamp()` 語法瀏覽器原生支援不需編譯轉換；未執行 sass 重新編譯（`main.css` 已手動同步）。

### 21. `#about` 大改版：大頭照放大、標題放大、分隔線閃爍、新增「個人資訊」直向清單、座右銘放大

**背景**：使用者先在 `示範.html` 規劃六款「#about 大改版」示範（大頭照放大到約 1/3 版面寬、「自我介紹」字級放大、左側分隔線閃爍、主題字句下方新增「個人資訊」內容區塊、座右銘放大），並釐清「個人資訊」不是幫身份說明加標籤，而是插入一個全新的區塊放姓名/生日/居住地等個人資料，跟原本「身份/學校科系年級」分成兩層。使用者最後選定「01・左圖右文，個人資訊做成直向清單」套用到真實網站。

**變更**：
- `src/pages/index.html`：`#about` 內新增 `<ul class="about__info-list">`（含姓名/生日/居住地三筆佔位資料的 `<li><b>欄位名</b>數值</li>`），放在 `about__tagline` 與 `about__identity` 之間；其餘結構不變。
- `src/styles/pages/_about.scss`：
  - `.about__eyebrow` 字級從 0.95rem 放大到 1.5rem、字重 800，拿掉原本的 `letter-spacing` 標籤感寫法。
  - `.about__eyebrow-bar` 加大到 5px×1.5em，並加上 `animation: blink 1s steps(1) infinite;`——直接沿用 `layout/_header.scss` 已定義的 `@keyframes blink`（`main.scss` 的 `@use` 順序 header 排在 about 前面，編譯後 keyframes 全域共用，這裡不重複定義）。
  - 新增 `.about__info-list`／`li`／`b` 三層樣式：左側 2px 灰色細線、每行左內距、欄位名稱固定寬度 4.2em 對齊、灰階小字。
  - `.about__avatar` 從固定 `136px × 136px` 改成 `width: clamp(136px, 30%, 220px)` 搭配 `aspect-ratio: 1 / 1`，讓照片隨版面寬度放大到約 1/3、同時維持正圓形不被壓扁。
  - `.about__motto` 字級從 0.85rem 放大到 1.15rem 並加上 `font-weight: 700`。
- `src/styles/main.css`：同步手動更新以上四處樣式（因專案沒有存檔自動編譯）。

**取捨說明**：
- 大頭照用 `clamp(136px, 30%, 220px)` 而不是單純 `width: 33%`，是為了避免視窗極寬時照片被放到不合理的巨大尺寸、視窗極窄時又縮太小，用上下限包住「約 1/3 版面寬」這個需求。
- 分隔線閃爍動畫沒有另外定義新的 `@keyframes`，直接沿用 header 已有的同名動畫，減少重複程式碼，但這代表 `_about.scss` 對 `_header.scss` 的編譯順序有隱性依賴，`main.scss` 的 `@use` 清單如果之後調整順序（header 排到 about 後面）需要注意這裡會失效。
- 姓名/生日/居住地目前都是佔位文字，之後使用者要填入真實資料時，`about__info-list` 的 `<li>` 結構可以直接複製增減欄位。

**驗證方式**：純樣式與標籤新增，未執行 sass 重新編譯（`main.css` 已手動同步）；視覺上大頭照明顯放大、eyebrow 標題與短豎線份量提升（短豎線持續閃爍）、主題字句與身份說明之間多一段個人資訊清單、座右銘字級與字重提升。

### 22. `#about` 大頭照改成靠右、比例調整為 64:36，並修正 adversarial-ux-test 找出的兩個 RED 問題

**背景**：使用者提供一張參考截圖，希望文字跟照片的比例更接近「照片佔 4-5 成、垂直幾乎撐滿」的效果。先在 `示範.html` 規劃三個方向（A 照片右/56:44/圓形、B 照片左/42:58/圓形、C 照片右/45:55/圓角矩形），並用 adversarial-ux-test 檢視，找出三款共通的兩個 RED 問題：① 完全沒有窄容器保護，照片比例放大後這個問題比之前更嚴重；② `align-items: center` 在文字內容變長時會讓照片飄在文字區塊中間、觀感不穩定。使用者最後選定「範例 A・照片右／64:36／圓形」（把比例從 56:44 調整為 64:36，文字更寬裕），並確認一併套用兩個 RED 修正。

**變更**：
- `src/pages/index.html`：`.about__layout` 內把 `.about__avatar` 移到 `.about__content` 之後（DOM 順序決定視覺順序，大頭照從左邊換到右邊，不使用 CSS `order`）。
- `src/styles/pages/_about.scss`：
  - `.about__layout` 新增 `flex-wrap: wrap;`——容器不夠寬時大頭照自動換到文字下方，不會把兩欄硬擠在一起；`align-items` 維持既有的 `flex-start`（先前已經是頂端對齊，這次確認保留，不是這次新加）。
  - 新增 `.about__content { flex: 1 1 62%; min-width: 260px; }`，文字欄占約 62%，並用 `min-width` 避免欄位被壓到過窄才觸發換行。
  - `.about__avatar` 從 `width: clamp(136px, 30%, 220px)` 改成 `flex: 0 0 34%; max-width: 280px;`，大頭照比例放大到約 34%，並用 `max-width` 避免超寬螢幕時被撐到不合理的巨大尺寸。
- `src/styles/main.css`：同步手動更新 `.about__layout`（加 `flex-wrap`）、新增 `.about__content`、更新 `.about__avatar`（因專案沒有存檔自動編譯）。

**取捨說明**：
- 沒有用 CSS `order` 屬性把照片視覺移到右邊，而是直接調整 HTML 的 DOM 順序，讓視覺順序跟閱讀/無障礙朗讀順序一致（文字先、照片後），避免 `order` 造成視覺順序跟 DOM 順序不一致、螢幕報讀器唸出順序跟畫面看到的不同。
- `flex-wrap` 只是「窄容器不擠壞」的防呆底線，不等於完整的響應式設計（例如換行後大頭照該多大、要不要置中，這些細節之後做響應式工程時仍要另外規劃），使用者已確認這個範圍。
- `.about__avatar` 拿掉了原本的 `flex-shrink: 0`，因為現在用 `flex: 0 0 34%` 已經明確定義了 flex-grow/flex-shrink/flex-basis（0 0 34%），`flex-shrink: 0` 已經包含在這個簡寫裡，不用重複寫。

**驗證方式**：純樣式與 HTML 順序調整，未執行 sass 重新編譯（`main.css` 已手動同步）；視覺上大頭照從左邊移到右邊、比例放大到約 36%，文字欄約占 64%，兩個 RED 修正（`flex-wrap` 防擠壓、頂端對齊）已在程式碼中確認到位。

### 23. `#resume` 補齊各群組的擴充欄位結構

**背景**：使用者用 `/plan` 請 Claude 分析「履歷/經歷」需要哪些必要資訊、哪些完整擴充資訊，Claude 先產出分析文件（未動程式碼），過程中一度誤判「站內完全沒有語言能力欄位」——後來核對發現 `#skills` 早就有「語言」子群組（`skills__name` + `skills__level`，`skills__level` 是自由文字，本來就能填檢定分數），這個「缺口」其實不存在，且依本站既有分工原則（`#resume` 不重複 `#skills`/`#contact` 內容），語言能力不該在 `#resume` 另開一組。排除語言能力後，使用者確認要把分析中列出的其他擴充欄位（教育背景/實習經歷/專案經歷/證照獎項）補進 HTML 結構，暫不填真實資料、也不寫 CSS。

**變更**：`src/pages/index.html` 的 `#resume` 四個群組，各自的 `<article>` 內新增擴充欄位（皆為結構性佔位文字）：
- 教育背景（`resume__edu`）：新增 `resume__edu-extra`（GPA／輔系或雙主修／交換學生經驗，註解註明「非必要，沒有可直接刪除這行」）。
- 實習/工讀經歷（`resume__job`）：新增 `resume__job-tools`（使用工具/技術）。
- 專案經歷（`resume__project`）：新增 `resume__project-role`（角色）、`resume__project-tags`/`resume__project-tag`（技術標籤列表）、`resume__project-link`（GitHub/Demo 連結）——class 命名刻意對齊 `#portfolio` 已有的 `portfolio__role`/`portfolio__tech-list`/`portfolio__link-list`，避免同一種資訊在站內有兩套不同命名。
- 證照/獎項（`resume__award`）：從單行 `<li>` 文字改成跟教育背景/實習經歷一致的 `<article><h4>+<p></article>` 結構，`<h4 class="resume__award-name">` 放名稱、新增 `<p class="resume__award-meta">` 放頒發單位／取得時間。

**取捨說明**：
- 分析中列出的「軟實力/工作風格」「推薦人/推薦信」兩項，因為分析階段已判定對大學生履歷「非必要、容易流於空泛」，這次沒有加入結構。
- 專案經歷的「遇到的挑戰與解法」這項擴充欄位刻意沒有加：本站已有 `#casestudy` 章節專門用五段式敘事深談 1–2 個作品的挑戰與過程，`#resume` 的專案經歷維持精簡版，避免跟 `#casestudy` 內容重複。
- 校園經歷（精簡版）群組沒有變動：分析階段已確認完整版留給 `#activities`，`#resume` 這裡只放 1 行重點，不需要再擴充欄位。

**驗證方式**：純 HTML 結構新增，未執行 sass 重新編譯（沒有動到任何 CSS/SCSS，`src/styles/pages/_resume.scss` 確認仍是空檔案）；用 Grep 確認新增的 class 都成對出現在對應的 `resume__group` 內，且 `<article>` 巢狀結構未被破壞。

### 24. `#resume` 改版：手風琴摺疊 + 時間軸（定案版套用到正式網站）

**背景**：使用者先在 `claude助手-設計範例展示資料夾/示範.html` 規劃六種 `#resume` 排版方向（時間軸／頁籤／手風琴／卡片網格／終端機／側邊導覽），並用 adversarial-ux-test 找出兩個問題：①分頁需要額外開發互動邏輯，②手風琴預設全摺疊會讓忙碌訪客漏看重點經歷。定案採用「手風琴摺疊（教育/實習/專案預設展開）」，後續又加碼「教育/實習/專案三組內部套用時間軸」與「證照/獎項拆成兩個獨立摺疊面板」。這次用 `/plan` 走完整規劃流程（讀示範檔案最終版本、規劃改動範圍、跟使用者確認兩個未定案的細節）後正式套用到 `src/pages/index.html` 與 `src/styles/pages/_resume.scss`。

**變更**：
- `src/pages/index.html` 的 `#resume` 整段改寫：
  - 標題列 `<h2 class="section__title">` 改成比照 `#about` 的 `about__eyebrow` 做法：`resume__eyebrow` + `resume__eyebrow-bar`（短豎線色塊）。
  - 五個 `<div class="resume__group"><h3>...</h3><ul>...</ul></div>` 全部改成原生 `<details class="resume__group">`/`<summary class="resume__subtitle">`，不需要 JavaScript；教育背景／實習工讀經歷／專案經歷預設 `open`，校園經歷（精簡版）／證照／獎項維持摺疊。
  - 原本合併的「證照 / 獎項」拆成兩個獨立 `<details>`：新增「證照」面板（`resume__cert-list`/`resume__cert`/`resume__cert-name`/`resume__cert-meta`，結構比照既有 `resume__award-list`），「獎項」沿用原結構搬進新面板；兩者依使用者確認都放 2 筆佔位條目，展示同面板內多筆資料的虛線分隔效果。
  - 教育背景／實習工讀經歷／專案經歷各自的清單也補成 2 筆佔位條目，展示時間軸在多筆資料下的排列效果。
  - 更新區塊最上方的說明註解，改成描述手風琴摺疊＋時間軸的新結構邏輯與各群組預設展開/摺疊的理由。
- `src/styles/pages/_resume.scss`（原本空白，整份新寫）：
  - `.resume__eyebrow`/`&-bar`：比照 `.about__eyebrow`，依使用者確認**加上閃爍動畫**（沿用 `layout/_header.scss` 的 `@keyframes blink`）。
  - `.resume__pdf-link`：改成磚紅色文字＋磚紅細外框的膠囊樣式，不做色塊填滿。
  - `.resume__group`/`.resume__subtitle`：手風琴摺疊樣式，`summary` 拿掉瀏覽器預設箭頭（`list-style: none` + `::-webkit-details-marker`），改用 Space Mono 等寬字的 `+`/`−` 當展開/收合圖示（`[open]` 狀態切換）。
  - 時間軸（`resume__edu-list`/`resume__job-list`/`resume__project-list` 當線、對應的 `li` 當圓點）：完全照使用者指定的「線跟圓點共用同一個 x 座標 + `transform: translateX(-50%)` 各自置中」做法實作，不用手動疊加 padding/border 負值對齊。
  - 無時間軸的三組（校園經歷/證照/獎項）：同面板內第二筆以後用 `+` 相鄰選擇器加虛線分隔（`border-top: 1px dashed #eef0f2`）。
  - 補上內容欄位（h4 名稱／meta／desc／tags／link）的字級顏色，色碼沿用 `$color-deep-space-blue`／`$color-accent` 與 `#about` 已用過的灰階寫死值（`#9aa8b0`/`#32424d`/`#e2e6e9`），沒有新增變數。
- `src/styles/main.css`：執行 `npx sass src/styles/main.scss src/styles/main.css` 整份重新編譯（這次改動範圍大，不採用過去小改動時手動同步片段 CSS 的做法）。

**取捨說明**：
- PDF 連結文字維持「下載完整履歷 PDF」，沒有加示範檔案裡的 `↓` 箭頭字元——這次範圍是排版風格改版，不是新增裝飾性內容。
- 標題短豎線動畫、證照佔位筆數兩點是示範檔案本身沒有寫死答案（或跟站內既有慣例衝突）的地方，執行前用 AskUserQuestion 跟使用者確認過，不是自行假設：短豎線比照 `about`/`header` 加閃爍動畫；證照/獎項都採 2 筆佔位（跟其他群組目前只放 1 筆佔位的慣例不同，但使用者確認要優先呈現分隔線效果）。
- 時間軸只套用教育/實習/專案三組，校園經歷/證照/獎項不套用——因為後者本身沒有強烈的時間先後意涵，比較像清單而非流程，這是使用者在需求裡明確指定的範圍，不是自行擴大。

**驗證方式**：`npx sass src/styles/main.scss src/styles/main.css` 重新編譯成功、無錯誤；用 `browser-use`（Playwright）啟動本機靜態伺服器（需從專案根目錄啟動，不能只從 `src/pages` 啟動，因為 `index.html` 的 `<link>` 用的是 `/src/styles/main.css` 絕對路徑）並截圖確認：教育/實習/專案三組預設展開且時間軸線與圓點對齊、校園經歷/證照/獎項預設摺疊且圖示為 `+`、強制展開後證照/獎項的兩筆佔位間有虛線分隔、PDF 連結呈現磚紅膠囊外框。過程中發現一個**站內既有、非本次引入**的問題：`.site-header` 是 `position: fixed`，用錨點（`#resume`）直接跳轉或 `scrollIntoView` 時，區塊標題會被固定 header 蓋住（因為全站都沒有設定 `scroll-margin-top`），這是所有區塊共通的問題，不只 `#resume`，這次沒有動手修，記錄在這裡供之後排查。

### 23. `#resume` 加上 clamp() 流體留白 + 誤用沙盒內 `npx sass` 導致 `main.css` 一度被覆蓋成錯誤訊息、已手動修復

**背景**：使用者希望 `#resume` 也比照 `#about` 左右留空、上下間距加大並保持彈性。這次改動本身很單純（沿用 `.about` 已確認的 `clamp()` 方案），但過程中發生一個工具面的意外：Claude 在這個對話環境的 shell（Linux 沙盒）裡執行 `npx sass src/styles/main.scss src/styles/main.css` 想重新編譯，沙盒掛載到的專案資料夾版本比較舊、部分檔案（`abstracts/_variables.scss` 等）內容不完整，導致編譯失敗；dart-sass 遇到編譯錯誤時預設行為是把「錯誤訊息」當成一份 CSS（`body::before { content: "Error: ..." }`）寫進輸出檔案，而這個寫入動作是真的寫到使用者電腦上的 `src/styles/main.css`，等於把原本正確、已經編譯好的樣式表整個覆蓋掉。

**變更**：
- `src/styles/pages/_resume.scss`：新增 `.resume { padding: clamp(2.5rem, 9vw, 4.5rem) clamp(1rem, 6vw, 3.5rem); }`，數值跟 `.about` 完全一致。
- `src/styles/main.css`：發現被覆蓋成錯誤訊息後，改用 `Read` 工具（對應使用者電腦上的實際檔案，不是沙盒掛載版本）逐一重新讀取 `abstracts/_variables.scss`、`base/_reset.scss`、`base/_typography.scss`、`layout/_header.scss`、`components/_section.scss`（僅 mixin，無輸出）、`pages/_about.scss`、`pages/_resume.scss` 目前的真實內容，手動比對每個 `$變數` 對應的實際色碼／數值，重新組回一份完整、正確的 `main.css`（含這次新增的 `.resume` 留白規則）。

**取捨說明**：
- 之後這個對話環境如果還要「重新編譯確認」，不應該在這裡的 shell 執行 `npx sass`，因為沙盒掛載到的檔案版本可能跟使用者電腦上的實際檔案不同步；比較安全的做法是像這次一樣，用 `Read`/`Edit` 工具直接對照實際 `.scss` 內容手動同步 `main.css`，或請使用者在自己電腦上執行編譯後告知結果。
- 手動重建 `main.css` 時，是逐一比對「當下」每個 `.scss` 檔案的真實內容而不是憑記憶／舊筆記回推，避免又出現另一層對不上的問題；但這代表如果使用者自己電腦上的 `main.css` 曾經跟 `.scss` 原始碼有過細微差異（例如手動微調過某個數值而沒有同步回 `.scss`），這次的重建會以 `.scss` 為準，蓋掉那類差異。

**驗證方式**：手動核對 `main.css` 內容跟目前 `.about`／`.resume`／`.site-header`／`.site-nav` 對應的 `.scss` 規則逐條比對過一致；未在沙盒 shell 裡再次執行 `npx sass`。建議使用者之後有空時，在自己電腦上執行一次正式的 `npx sass` 編譯，確認輸出結果跟這次手動重建的版本一致。

### 25. `#about`／`#resume` 全部字體 ×1.25 等比例放大

**背景**：使用者用 `/plan` 要求把「個人介紹、履歷」兩個區塊的字體全部等比例放大，沒有指定放大多少倍。先盤點 `src/styles/pages/_about.scss`、`src/styles/pages/_resume.scss` 兩個檔案目前所有 `font-size`（各 9 處），用 AskUserQuestion 確認放大倍率後（1.15×／1.25×／1.4× 三選一），使用者選定 **1.25×**。

**變更**：
- `src/styles/pages/_about.scss`：`about__eyebrow`（1.5→1.88rem）、`about__info-list li`（0.85→1.06rem）、`about__info-list b`（0.72→0.9rem）、`about__avatar` 佔位文字（0.75→0.94rem）、`about__tagline`（1.6→2rem）、`about__identity`（0.92→1.15rem）、`about__bio`（0.94→1.18rem）、`about__tag`（0.78→0.98rem）、`about__motto`（1.15→1.44rem），全部乘以 1.25 並四捨五入到小數兩位。
- `src/styles/pages/_resume.scss`：`resume__eyebrow`（1.5→1.88rem）、`resume__pdf-link`（0.8→1rem）、`resume__subtitle`（0.95→1.19rem）、摺疊圖示 `::after`（1.1→1.38rem）、`-edu-school`/`-job-title`/`-project-title`/`-cert-name`/`-award-name`（0.92→1.15rem）、`-edu-meta`/`-job-meta`/`-cert-meta`/`-award-meta`（0.78→0.98rem）、`-edu-extra`/`-job-desc`/`-job-tools`/`-project-desc`/`-project-role`/`.resume__campus`（0.86→1.08rem）、`resume__project-tag`（0.72→0.9rem）、`resume__project-link`（0.82→1.03rem），同樣乘以 1.25。
- `src/styles/main.css`：執行 `npx sass src/styles/main.scss src/styles/main.css` 整份重新編譯。

**取捨說明**：
- `letter-spacing`（例如 `about__tagline` 的 `-0.01em`）跟 `max-width: 26ch`（`about__tagline`）都是相對單位，會自動跟著新字級等比縮放，這次沒有另外調整。
- 只放大 `font-size`，沒有連動放大 `padding`／`gap`／`border-radius` 等非字體相關的間距數值——使用者要求的是「字體」放大，不是整體區塊等比放大，兩者是不同範圍的需求。
- 放大後每個 class 的相對大小順序（例如 tagline 仍是全區塊最大字）完全不變，因為是同一個倍率乘上所有數值，數學上必然維持順序。

**驗證方式**：`npx sass` 重新編譯成功、無錯誤；用 Playwright 開啟本機靜態伺服器（從專案根目錄啟動）截圖比對 `#about`／`#resume` 放大前後，確認字級明顯變大、排版沒有破版（tagline 換行位置、時間軸圓點對齊、標籤列、證照/獎項虛線分隔皆正常）。
