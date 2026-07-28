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

### 26. `#about`／`#resume` 全部字體 ×0.9 微幅縮小（在 ×1.25 放大版基礎上）

**背景**：使用者用 `/plan` 覺得上一筆（第 25 筆）×1.25 放大後的字級偏大，要求把「個人介紹、履歷」兩個區塊的字體全部等比例縮小，沒有指定倍率。先派 Explore agent 重新盤點目前 `_about.scss`、`_resume.scss` 兩檔案各 9 處 `font-size` 現況，確認專案沒有中央字體變數系統（`_variables.scss` 只有顏色/字體家族/header 高度），字體仍是逐一寫死的 rem 值。用 AskUserQuestion 確認縮小倍率（×0.8／×0.85／×0.9 三選一），使用者選定 **×0.9**（比放大版略小，但仍比最原始字級大一點，非完全復原）。

**變更**：
- `src/styles/pages/_about.scss`：`about__eyebrow`（1.88→1.69rem）、`about__info-list li`（1.06→0.95rem）、`about__info-list b`（0.9→0.81rem）、`about__avatar` 佔位文字（0.94→0.85rem）、`about__tagline`（2→1.8rem）、`about__identity`（1.15→1.04rem）、`about__bio`（1.18→1.06rem）、`about__tag`（0.98→0.88rem）、`about__motto`（1.44→1.3rem），全部乘以 0.9 並四捨五入到小數兩位。
- `src/styles/pages/_resume.scss`：`resume__eyebrow`（1.88→1.69rem）、`resume__pdf-link`（1→0.9rem）、`resume__subtitle`（1.19→1.07rem）、摺疊圖示 `::after`（1.38→1.24rem）、`-edu-school`/`-job-title`/`-project-title`/`-cert-name`/`-award-name`（1.15→1.04rem）、`-edu-meta`/`-job-meta`/`-cert-meta`/`-award-meta`（0.98→0.88rem）、`-edu-extra`/`-job-desc`/`-job-tools`/`-project-desc`/`-project-role`/`.resume__campus`（1.08→0.97rem）、`resume__project-tag`（0.9→0.81rem）、`resume__project-link`（1.03→0.93rem），同樣乘以 0.9。
- 每處都在原本「×1.25 放大」註解下方**加一行**「×0.9 微幅縮小」的新註解，保留兩次調整的完整歷史脈絡，不刪舊註解。
- `src/styles/main.css`：執行 `npx sass src/styles/main.scss src/styles/main.css` 整份重新編譯。

**取捨說明**：
- 沿用第 25 筆放大時的慣例：只動 `font-size`，不連動調整 `padding`／`gap`／`border-radius`；`letter-spacing`、`max-width: 26ch` 等相對單位隨字級自動縮放，不需另外處理。
- 因為專案沒有中央字體變數（`$font-size-*` 或 CSS 自訂屬性），這次跟上次一樣採逐一手動改數值的做法，而不是新增變數系統——避免在字體需求還沒穩定前，為了單次調整就引入額外的抽象層。
- 兩個區塊的 `.about`／`.resume` 各自獨立 scss 檔、獨立 class 命名，其他區塊（skills/portfolio/activities/casestudy/notes/goals/contact 等）不共用字體規則，確認這次縮小不會誤傷其他區塊。

**驗證方式**：`npx sass` 重新編譯成功、無錯誤，且用 `grep` 核對編譯後的 `main.css` 確實含新數值（如 `1.69rem`、`0.95rem`、`1.8rem`）；用 Playwright 開啟本機靜態伺服器（從專案根目錄啟動，`python -m http.server`）截圖 `#about`／`#resume` 全頁，確認字級明顯變小、排版沒有破版（tagline 換行正常、摺疊 +/− 圖示與文字對齊、時間軸圓點與虛線分隔正常）。

### 27. `#skills` 資訊架構與視覺設計分析（`/brainstorming` + `/adversarial-ux-test`，未動程式碼）

**背景**：使用者請 Claude 用 `/brainstorming` 搭配 `/adversarial-ux-test` 分析「技能」（`#skills`）需要哪些必要資訊、哪些是完整擴充資訊、以及如何展現特色。先用 Playwright 檢視現況才發現 `_skills.scss` 幾乎是空檔案（只有一行註解），編譯後 `main.css` 查無任何 `.skills` 規則——這個區塊完全沒有視覺樣式，跟全站已確立的深空藍/磚紅/等寬字語彙完全脫節。接著模擬一位每天看 40–50 份新鮮人履歷網站的挑剔 HR persona（陳姐）檢視，找出「視覺斷層」（RED）與「熟練度自評形容詞不可信」（GREEN，內容架構問題）兩個真實問題；瀏覽器截圖過程中出現的「文字呈現藍色底線」現象經核對 `getComputedStyle` 為黑色/無底線，判斷是本機真實 Chrome 的擴充功能疊加效果，非網站本身樣式問題，未列入分析。

之後用 `/brainstorming` 一次問一個問題釐清方向，並在「熟練度視覺化」這個明顯需要用看的而非用講的問題上，依規範先用 AskUserQuestion 徵求使用者同意後，才啟動 brainstorming skill 附帶的瀏覽器視覺化輔助伺服器（`scripts/start-server.sh`），來回畫了多版 mockup 讓使用者直接點選比較，逐步收斂出最終設計。

**產出**：`docs/superpowers/specs/2026-07-23-skills-redesign-design.md`（設計規格文件，尚未修改 `index.html`／`_skills.scss` 任何程式碼）。重點決定：
- `#skills` 與 `#resume` 專案標籤的分工：`#skills` 是完整技能庫，`#resume` 標籤只標記「這個專案用了什麼」，兩者不去重複、互為總覽與實例佐證。
- 熟練度呈現：技術/工具類用 CEFR 六級量表（入門/基礎/中等/中高/高等/精通，6 顆圓點）＋ 65 年尺標長條（100% = 65 年，畫面不顯示尺標倍率文字，年資數字才是主要資訊，長條刻意淡化避免被誤讀成技術強弱）；語言類不套 CEFR，改成沿用 `.resume__cert-meta` 既有「檢定名稱・取得時間」文字語彙（例如「JLPT N3・2024 年取得」）。
- 作品佐證：不做成彩色標籤（避免視覺上跟 `#portfolio` 卡片重複），改成預設收合的「用於 N 個作品 ▾」一行文字，點擊展開成 6 欄網格連結清單，手機窄螢幕降為 3–4 欄。
- 順手補上 `.gitignore` 排除 `.superpowers/`（brainstorming 視覺化輔助工具的暫存 mockup 目錄，非網站原始碼）。

**取捨說明**：
- 沒有把 `#skills` 熟練度做成單純「進度條=強弱」的量表，是刻意設計：陳姐這個persona明確表達「不信自誇形容詞」，65 年尺標與 CEFR 六級量表都是「有外部參照系統、不是自吹自擂」的呈現方式，用來回應這個真實找到的 UX 問題，而不是為了炫技加圖表。
- 語言類技能不跟技術/工具共用 CEFR 圓點量表，是因為語言早就有公認的外部檢定（JLPT/TOEIC），硬套一個通用框架反而比直接秀真實檢定失真；這也是為什麼設計文件把三個子群組分成兩套不同的熟練度呈現邏輯，而不是強求外觀統一。
- 這次刻意不比照 `#resume` 用中央 `.claude/plans/` 的 `/plan` 流程，而是照 `/brainstorming` skill 預設走 `docs/superpowers/specs/` 路徑，因為使用者這次明確呼叫的是 `/brainstorming` 而非 `/plan`，兩者是不同流程、不應該混用彼此的產物路徑。
- 沒有依 brainstorming skill 預設「寫完設計文件後自動 commit」，因為使用者沒有明確要求 commit，維持「只在使用者明確要求時才 commit」的既有規則優先於 skill 的預設步驟。

**驗證方式**：這次是分析/設計階段，沒有程式碼可驗證；設計文件本身經過 placeholder/內部矛盾/範疇/歧義的自我審查（spec self-review）後才交付，等使用者確認規格文件內容無誤。

### 28. `#skills` 依規格文件實作（改 HTML 結構 + 補齊 `_skills.scss`）

**背景**：使用者確認第 27 筆的設計文件（`docs/superpowers/specs/2026-07-23-skills-redesign-design.md`）後，回覆「好」，接續請 Claude 落地實作。因為 `/brainstorming` skill 預期的下一步 `writing-plans` skill 在這個環境沒有安裝，改用 Claude Code 內建的 `EnterPlanMode`／`ExitPlanMode` 規劃流程（跟先前 `/plan` 走同一套機制）產生實作計畫，經使用者核准後動手。

**變更**：
- `src/pages/index.html`（`#skills` 整段）：標題從 `<h2 class="section__title">技能</h2>` 改成比照 `about__eyebrow`/`resume__eyebrow` 的短豎線色塊+文字結構；技術/工具子群組項目改成兩行＋可選第三行（標籤+CEFR 六點量表、年資數字+65年尺標長條、原生 `<details>` 展開式作品佐證或「尚無對應作品連結」文字）；語言子群組改成標籤 + `.skills__cert-meta`「檢定名稱・取得時間」文字，不套用圓點/長條。圓點填色數量與長條 `width` 百分比都是手動寫死的示範值（3年/65≈4.6%、1年/65≈1.5%），之後填真實資料要手動調整。
- `src/styles/pages/_skills.scss`（原本只有 1 行註解，整份改寫）：新增 `.skills` 留白、`.skills__eyebrow`（沿用全域 `@keyframes blink`）、`.skills__group`/`.skills__subtitle`、`.skills__item` 虛線分隔、`.skills__name`（`#` 前綴 Space Mono chip，沿用 `about__tag`/`resume__project-tag` 語彙）、`.skills__level`/`.skills__level-dot`（6 顆圓點，磚紅實心/淺灰空心）、`.skills__tenure-track`/`-fill`（中性灰藍色刻意不用強調色，避免被誤讀成實力強弱）、`.skills__evidence`（`<details>`，沿用 `#resume` 手風琴「不用 JS」慣例）、`.skills__evidence-grid`（6 欄網格，`@media (max-width:600px)` 降為 3 欄）、`.skills__cert-meta`（沿用 `.resume__cert-meta` 數值）。
- 實作過程中發現一個設計文件沒預料到的問題：`.skills__row1` 用 `justify-content: space-between`，但 `.skills` 沒有像 `.about__layout` 那樣的雙欄配置限制寬度，導致熟練度圓點被推到滿版視窗（約 1520px）最右邊，跟左邊標籤中間留下大片不合理空白；修正方式是幫 `.skills__list` 加上 `max-width: 640px`，讓標籤跟熟練度指標保持在合理距離內，這是規格文件跟 mockup（在較窄的視覺化輔助分頁裡預覽，沒有暴露這個問題）都沒抓到的實作階段發現。
- 補上兩個作品連結的 `title` 屬性，因為 6 欄網格欄寬窄，連結文字會被 `ellipsis` 截斷，用 `title` 讓 hover 時能看到完整作品名稱。

**取捨說明**：
- 6 欄網格在只有 1–2 個作品時，仍會保留 6 欄的網格容器寬度，右側留白看起來稍微空——這是使用者兩輪確認過的「6 欄」設計本身的已知取捨（原本設計是為了容納「未來作品很多」的情境），這次沒有另外加邏輯讓網格寬度隨項目數量收縮，避免為了稀疏情境的美觀，讓「多筆作品要換行」的核心情境變複雜。
- 沒有引入任何 JavaScript：作品佐證展開/收合完全靠原生 `<details>/<summary>`，跟 `#resume` 手風琴一致，維持全站「不需要 JS」的慣例。

### 29. `#skills` 各分類卡片改多欄格線排列、佔位卡片擴充為 4／4／2 個

**背景**：第 28 筆實作完成後，技術/工具/語言三個分類都各只有 1 個佔位卡片、`.skills__list` 是單欄堆疊（`max-width:640px`），使用者截圖指出卡片右側留有大片空白，要求把同分類底下的卡片並排利用這塊空白，技術/工具各給 4 個佔位、語言給 2 個。過程中一度誤解成「技術＋工具兩個分類左右配對成兩欄」，經使用者澄清「技術、工具、語言是三個分類，各自內部給 4／4／2 個佔位」後修正方向：改動的是**同一分類內部**的多欄排列，不是跨分類配對。

**變更**：
- `src/pages/index.html`（`#skills` 區塊）：技術組 `.skills__item` 從 1 個擴充為 4 個「技能名稱佔位（一）～（四）」，圓點/年資/evidence 內容複製第 1 項示範值；工具組同樣擴充為 4 個「工具名稱佔位（一）～（四）」；語言組擴充為 2 個「語言名稱佔位（一）／（二）」。命名比照檔案內既有的 `resume__award-name`／`skills__evidence-link` 編號慣例。
- `src/styles/pages/_skills.scss`：`.skills__list` 從「單欄 block 清單＋`max-width:640px`」改成 `display:grid; grid-template-columns: repeat(auto-fit, minmax(320px,1fr)); gap:0.9rem 2.4rem; max-width:960px`，讓同分類卡片依容器寬度自動排成多欄，變窄時自動收成單欄（比照全站唯一的多欄慣例 `.about__layout` 的 `flex-wrap` 精神，不寫死 `@media` 斷點）。`.skills__item + .skills__item` 的虛線上框分隔線移除（格線排列後卡片不再單純是「上下相鄰」關係，改靠 grid 的 `gap` 留白區分）。`.skills__evidence-grid` 從 6 欄改為 3 欄（卡片欄寬縮到約 320px 後 6 欄太擠），連帶移除原本重複做同一件事的 `@media (max-width:600px)` 降欄規則。
- `src/styles/main.css`：執行 `./node_modules/.bin/sass styles/main.scss styles/main.css` 重新編譯。

**取捨說明**：
- 欄數用 `auto-fit, minmax(320px, 1fr)` 讓瀏覽器依寬度自動決定（寬螢幕下技術/工具會是 2 欄 2x2、語言 2 欄 1 列），沒有寫死 `repeat(2, ...)`，理由是沿用全站「不寫死斷點、靠內容自然收斂」的既有手法；若之後使用者期望的是「無論多寬都固定 2 欄」而非「夠寬時可能撐到 3 欄」，可以再改成寫死欄數。
- 4 個技術/工具佔位卡片的圓點填色數量、年資數字、evidence 內容都先完整複製第 1 項的示範值，只改名稱編號，不刻意做假的視覺差異化——這些本來就是要手動覆蓋的佔位值，之後填真資料時逐一取代即可，改動範圍最小、最好找。
- 移除 `.skills__item + .skills__item` 虛線分隔線後，格線本身的 `gap` 留白已足夠區分卡片，沒有另外設計「同列」vs「換列」的差異化間距。

**驗證方式**：`./node_modules/.bin/sass styles/main.scss styles/main.css` 編譯成功、無錯誤；用 Playwright 開啟本機靜態伺服器（從專案根目錄 `python -m http.server` 啟動，因為 `index.html` 的 CSS/資源路徑是 `/src/...` 絕對路徑，需從專案根目錄而非 `src/pages/` 起服務）截圖確認：桌面寬度（1400px）下技術/工具皆呈現 2x2 格線、語言 2 張並排；展開技術組任一張卡片的 `<details>`，3 欄 evidence-grid 排版正常；縮到手機寬度（420px）確認格線自然收成單欄、卡片沒有被擠壓變形。測試用截圖與臨時起的 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

**驗證方式**：`npx sass` 重新編譯成功、無錯誤；用 Playwright 開啟本機靜態伺服器截圖確認：桌面寬度下標籤、六點量表、年資長條、展開式作品佐證排版正常且彼此距離合理（修正 `max-width` 後）；點擊展開 `<details>` 後 6 欄網格正確顯示兩個作品連結；縮到 375px 手機寬度後網格降為 3 欄、內容沒有橫向溢出；`browser_console_messages` 確認 0 個錯誤；語言子群組確認沒有圓點/長條，只有檢定文字。

### 30. `#skills` 多欄卡片寬度修正：拿掉人為的 960px 壓縮

**背景**：第 29 筆改成多欄格線後，使用者截圖指出兩欄並排的卡片沒有剛好佔滿螢幕可用寬度，右側仍留有明顯空白，懷疑寬度被壓縮了。用 Grep 核對 `.section` class 並沒有套用 `components/_section.scss` 裡定義的 `section-card` mixin（該 mixin 只定義未套用），確認 `#skills` 本身沒有其他寬度限制，可用內容寬度＝視窗寬度－`.skills` 左右 padding（寬螢幕下頂到 `3.5rem`＝56px，兩側共 112px）。回頭檢查第 29 筆加的 `.skills__list { grid-template-columns: repeat(auto-fit, minmax(320px,1fr)); max-width:960px; }`，`max-width:960px` 是人為上限，兩欄各自被壓到約 461px，比改版前單欄卡片原本的 640px 還窄，右側自然留下空白，確認是這行造成的。

**變更**：
- `src/styles/pages/_skills.scss`：`.skills__list` 拿掉 `max-width: 960px`，`minmax` 基準從 `320px` 提高到 `600px`（貼近改版前單欄設計的舒適寬度），讓 grid 撐滿 `.skills__group`（無寬度限制）的可用寬度，而不是被塞進一個比原本單欄還窄的框裡。
- `.skills__evidence-grid` 從 3 欄改回原設計的 6 欄——3 欄是配合上一輪「欄寬縮到 320px」才降的，欄寬改回 ~600px+ 後 6 欄不會太擠，跟著改回去。
- `src/styles/main.css`：執行 `./node_modules/.bin/sass styles/main.scss styles/main.css` 重新編譯。

**取捨說明**：
- 只拿掉 `max-width` 上限、提高 `minmax` 基準，沒有改成寫死的 `repeat(2, 1fr)`：`auto-fit` 讓瀏覽器依實際可用寬度自動決定夠不夠放 2 欄，比寫死欄數更能對應「螢幕變窄時自然收成單欄」的既有設計慣例，不需要額外的 `@media` 判斷。
- `minmax` 基準選 `600px` 而非精確的 `640px`：略為保守一點，避免兩欄總寬度（含 gap）在部分螢幕寬度下剛好卡在收成單欄的臨界點，實際渲染時兩欄仍會被 `1fr` 撐開到接近原本 640px 的觀感。

**驗證方式**：`./node_modules/.bin/sass` 重新編譯成功、無錯誤；用 Playwright 開啟本機靜態伺服器（`python -m http.server`，從專案根目錄啟動），桌面寬度（1400px）截圖確認技術/工具兩欄卡片的右邊界貼齊 section 可用寬度右緣（跟上方 `#resume` 內容右邊界對齊），不再有大片空白；展開技術組任一張卡片確認 6 欄 evidence-grid 排版正常；縮到手機寬度（420px）確認格線仍自然收成單欄、沒有擠壓變形。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

### 31. `#portfolio`／`#casestudy` 內容架構分析（`/plan` 模式，未動程式碼）

**背景**：`#portfolio`（作品集）與 `#casestudy`（案例故事）從網站建立以來一直維持最初的最小佔位結構（各 1 筆佔位、對應 `_portfolio.scss`／`_casestudy.scss` 都是空檔案），從未像 `#skills` 一樣被認真盤點過內容欄位。使用者要求比照 `#skills` 當初的 brainstorming 流程，規劃作品集需要哪些必要資訊、哪些是可補充資訊，盡可能詳細。這次使用者是透過 Claude Code 原生 `/plan`（`EnterPlanMode`/`ExitPlanMode`）流程提出，而非 `/brainstorming` skill。先派 Explore agent 盤點 `#portfolio`／`#casestudy`／`#resume` 專案經歷／`#skills` evidence link 四處的現況與彼此關係，並讀取 `FuturePlan.md` 確認「作品集是否拆頁」的既有決策（已確認暫不拆頁，維持單頁錨點架構）。用 AskUserQuestion 確認三個方向：(1) 這次只出規格文件不動程式碼；(2) `#resume` 專案經歷與 `#portfolio` 視為同一份專案清單的詳略版本；(3) 使用者表示長期會有大量作品、作品集是本站重點內容，因此分類篩選／精選標記／穩定錨點 ID 這類支援規模化的欄位現在就該定案命名。

**產出**：`docs/superpowers/specs/2026-07-23-portfolio-casestudy-content-design.md`（規格文件，比照 `2026-07-23-skills-redesign-design.md` 的文件風格，尚未修改 `index.html`／`_portfolio.scss`／`_casestudy.scss` 任何程式碼）。重點決定：
- 必要資訊：封面圖、名稱、一句話摘要、作品類型、技術標籤、角色與分工、成果與收穫、對外連結或不可公開原因（NDA，從補充資訊提升為必要）、完成期間（新欄位）、穩定錨點 ID（新欄位，基礎建設用）。
- 補充資訊分兩層：Tier 1（分類篩選標籤、精選代表作標記、案例故事雙向連結、NDA 標註——因為長期作品量大，現在就該定案命名）；Tier 2（更新日期、團隊規模、結構化量化指標、影音動圖 demo——等實際素材多了再加）。
- Governance：`#resume`／`#portfolio` 視為同一份專案清單的詳略版本；`#skills` 的「用於 N 個作品」連結要等 `.portfolio__item` 有穩定 id 後才能真正指向具體項目。

**取捨說明**：
- 沒有把「分類篩選標籤」跟現有「作品類型」標籤合併，因為兩者回答不同問題（「這是什麼場合做的」vs「這是哪個技術領域的」），合併會讓之後做篩選 UI 時語意互相干擾。
- NDA／無法公開標註被提升為必要資訊而非停留在補充資訊，因為資訊管理/全端開發學生常見有實習專案不能公開，缺席這個欄位會讓讀者誤以為忘記放連結，影響專業印象；建議實作時與「對外連結」欄位合併處理，而非兩個並存的獨立欄位。
- 穩定錨點 ID 定調為「基礎建設現在就該定案命名，但視覺/篩選 UI 可以晚點做」，因為 `#skills` evidence link／`#resume`／`#casestudy` 都已經預留了要指向具體作品的設計意圖，只是目前 `.portfolio__item` 沒有 id 可以指，越晚補這個 id 越麻煩（要回頭處理已經寫好的一堆佔位資料）。
- 延續 `#skills` 規劃時「陳姐不信自誇形容詞」的原則：精選標記建議走安靜的差異化（小徽章/排序），NDA 標註建議用中性專業語氣，避免整體風格落入自我宣傳感。

**驗證方式**：這次是內容架構分析階段，沒有程式碼可驗證；規格文件本身經過欄位前後矛盾、必要/補充分級、命名是否沿用現有 BEM 慣例的自我檢查後才交付，等使用者確認規格文件內容後才會另開一輪請求進入 HTML/SCSS 實作。

### 32. `#portfolio` 落地實作：卡片集＋篩選器＋獨立詳細頁面（全站首次引入 JS 與多頁）

**背景**：使用者確認第 31 筆規格文件後，接續請 Claude 規劃並落地 `#portfolio` 的實際版型，想法是卡片集＋篩選器，卡片可點擊跳轉到「同一網站、不同 HTML 檔案」的詳細專案說明頁（如果該作品需要）。這次用 Claude Code 原生 `/plan` 流程，用 AskUserQuestion 確認三個關鍵分歧：(1)「跳轉到分頁」是真的另開一支 HTML 檔案，不是頁內錨點跳到 `#casestudy`；(2) 篩選器「大量應用 JS」，不侷限於純 CSS 技巧；(3) 這輪先做核心版型（必要資訊欄位＋篩選器＋1 個詳細頁示範），規格文件裡的 Tier 1 補充欄位（分類篩選標籤、精選標記、案例故事雙向連結）留到之後擴充。這是全站首次出現：卡片視覺、JavaScript、`index.html` 以外的第二個網頁。

**變更**：
- `src/pages/index.html`（`#portfolio` 區塊）：新增 `.portfolio__filter` 篩選按鈕列（全部＋5 種作品類型，對應 `data-filter` slug：課程作業=course／自主練習=practice／專題競賽=competition／實習成果=intern／Side Project=side）；`.portfolio__list` 從 1 筆佔位擴充為 2 筆示範卡片——卡片 A（一般案例，`id="portfolio-project-1"`，有 `.portfolio__detail-link` 連到詳細頁）、卡片 B（NDA 案例，`id="portfolio-project-2"`，連結區改用 `.portfolio__nda-note` 說明無法公開原因，且不提供詳細頁連結，示範「不是每個作品都需要深度版」）。兩張卡片都新增 `.portfolio__date`（完成期間）與 `data-type` 屬性（供 JS 篩選比對）。`</body>` 前加入全站第一個 `<script src="/src/scripts/portfolio-filter.js" defer>`。
- `src/styles/pages/_portfolio.scss`（原本只有 1 行註解，整份撰寫）：`.portfolio__filter`／`-filter-btn`（is-active 用磚紅底反白）、`.portfolio__list`（`display:grid; auto-fit minmax(320px,1fr)`，沿用 `#skills` 已驗證的自動收欄手法）、`.portfolio__item`（這次明確做成卡片：白底/圓角/輕量陰影，數值參考但不直接沿用 `_section.scss` 的 `section-card` mixin，因為那是給整個 section 用的固定寬度）、`.portfolio__cover`（16:9 佔位框）、`.portfolio__tech`（沿用 `skills__name` 的 # + Space Mono chip）、`.portfolio__date`／`-detail-link`／`-nda-note`。
- `src/scripts/portfolio-filter.js`（新檔案，全站第一支 JS）：原生 vanilla JS，不引入框架/建置工具，監聽篩選按鈕點擊，用 `data-filter`/`data-type` 比對，切換 `.portfolio__item--hidden`（`display:none`）class。
- `src/pages/portfolio/project-1.html`（新檔案，第一個 `index.html` 以外的網頁）：手動複製 `index.html` 的 head/header/nav/footer；nav 錨點連結改成 `/src/pages/index.html#xxx` 絕對路徑（因為裸 `#about` 在子頁面裡找不到對應區塊）；加上「← 回作品集」返回連結；主要內容沿用 `#casestudy` 已設計好的五段式敘事 class（`casestudy__block`/`-block-title`/`-block-text`），不另外發明新 class。
- `src/styles/pages/_casestudy.scss`：新增 `.casestudy__back-link`（返回連結樣式）與 `.casestudy` 的 section padding（原本完全空白/無留白，這次補上跟其他 section 一致的 `clamp()` padding，因為新的詳細頁面完全依賴這個 class 當版面留白；`casestudy__name`/`-block-title`/`-block-text` 等內文排版這輪仍維持不動，保持跟首頁 `#casestudy` 一致的未上樣狀態）。
- `FuturePlan.md`「規劃三」章節補記：使用者這次決定不等建置工具、直接手動拆出詳細頁面，接受「header/nav/footer 需手動同步維護」的已知風險，並記錄目前只有 1 支手動頁面，供之後若要導入建置工具時參考遷移範圍。
- `src/styles/main.css`：執行 `./node_modules/.bin/sass styles/main.scss styles/main.css` 重新編譯。

**取捨說明**：
- 篩選器選擇原生 vanilla JS、不引入框架或打包工具：跟全站目前「無建置工具、純靜態 HTML/CSS」的技術選型一致，避免為了一個篩選功能就改變整個專案的技術棧。
- 篩選只做「作品類型」單一維度（既有欄位），沒有一併做規格文件提過的「分類篩選標籤」第二維度：使用者確認這輪先做核心版型，避免範圍一次擴太大；未來要加時，建議另開 `data-category` 屬性＋第二排按鈕，不要跟 `data-type` 合併。
- 詳細頁面用手動複製而非等待建置工具：這是使用者在權衡過已知維護風險（`FuturePlan.md` 先前已分析過）後的明確選擇，這次只做 1 支示範頁而非大量套用，降低「之後要回頭改很多份」的風險。
- 詳細頁面重用 `#casestudy` 的五段式敘事 class 而非另創新 class：因為「作品的深度說明」本來就是 `casestudy__block` 這套視覺語彙要處理的事，沒有理由為了「換了個容器（獨立頁面 vs 頁內錨點）」就重新設計一套內容結構。
- 只幫 `.casestudy` 補上 section padding，沒有連帶補齊 `casestudy__name`/`-block-*` 的內文排版：因為這輪範圍是 `#portfolio`，`#casestudy` 本身的完整視覺設計是另一個獨立任務，只補了「詳細頁面離不開的最小留白」，避免範圍蔓延。

**驗證方式**：`./node_modules/.bin/sass` 編譯成功、無錯誤；用 Playwright 開啟本機靜態伺服器（`python -m http.server`，從專案根目錄啟動）驗證：桌面寬度下篩選列與 2 張卡片版面正常；點擊「Side Project」篩選按鈕後只剩卡片 A 顯示（用 DOM 查詢確認可見卡片數為 1），點回「全部」恢復兩張；點擊卡片 A 的「查看完整專案說明 →」正確導向 `src/pages/portfolio/project-1.html` 且該頁 header/nav/footer/五段式敘事正常顯示；點擊該頁「← 回作品集」正確導回 `index.html#portfolio`；確認卡片 B 沒有詳細頁連結、改顯示 NDA 說明文字；縮到手機寬度（420px）確認卡片格線自然收成單欄、篩選按鈕列換行不溢出；`browser_console_messages` 確認除了無關的 favicon 404 外沒有其他錯誤（JS 執行正常無例外）。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

### 33. `#portfolio` 卡片改成固定大小（寬高皆固定，不隨內容/欄數彈性伸縮）

**背景**：第 32 筆用 `grid-template-columns: repeat(auto-fit, minmax(320px, 1fr))` 讓卡片寬度用 `1fr` 彈性撐滿欄位，且卡片高度純粹由內容決定——這導致卡片 A（有 Demo/GitHub 連結＋深度連結）跟卡片 B（NDA 說明，內容較短）兩張卡片明顯不等高、單張卡片被篩選出來時會被拉伸撐滿整列寬度。使用者要求「固定作品集卡片大小」，即卡片寬高都應該是固定值，不因為同列卡片數量或內容長短而改變。

**變更**：
- `src/styles/pages/_portfolio.scss`：
  - `.portfolio__list`：`grid-template-columns` 從 `repeat(auto-fit, minmax(320px, 1fr))` 改成 `repeat(auto-fill, minmax(300px, 300px))`——`minmax(300px, 300px)` 是固定 300px 欄寬（不用 `1fr` 彈性拉伸），`auto-fill` 讓容器依可用寬度自動決定塞得下幾欄固定寬度的卡片，欄位不足 300px 時一樣自然收成單欄。
  - `.portfolio__item`：新增固定 `height: 560px`；`article` 改成 `height:100%` 的 flex column，並用 `> :last-child { margin-top: auto; }` 把卡片最後一個可見欄位（連結列／深度連結／NDA 說明三者之一，一定是各卡片最後一個子元素）推到卡片底部，讓卡片不論內容多寡都維持同一個高度、且底部元素對齊。
  - `.portfolio__summary`／`.portfolio__outcome`：新增 `-webkit-line-clamp`（分別限制 2/3 行）＋ `overflow:hidden`，因為卡片高度固定後，之後填入較長的真實文字可能撐破固定高度，用截斷＋ellipsis 處理，跟全站既有的 `evidence-link` `text-overflow` 慣例一致（寧可截斷也不要破版）。
- `src/styles/main.css`：執行 `./node_modules/.bin/sass styles/main.scss styles/main.css` 重新編譯。

**取捨說明**：
- 固定寬度選 `auto-fill` 而非 `auto-fit`：兩者在欄位「塞得滿」時行為相同，差異只在欄數不足以塞滿一整列時——`auto-fill` 會保留空的軌道（卡片靠左对齊，不會被拉伸），`auto-fit` 則會把僅有的欄位拉伸填滿剩餘空間；這次要的正是「固定大小、不被拉伸」，所以選 `auto-fill`。
- 用 `margin-top:auto` 對齊底部而非幫每個欄位都設固定高度：因為卡片內部欄位數量/型態本來就會因作品而異（有沒有深度連結、是否為 NDA），只固定「卡片外框高度」＋「最後一項貼齊底部」是最小改動就能達到視覺對齊效果的做法，不需要對每個內部欄位分別訂高度。
- `line-clamp` 只加在 summary／outcome 這兩個「長度會因真實內容而變化較大」的欄位，其餘欄位（名稱、日期、標籤、角色）維持原樣不截斷，因為這些欄位在設計時就預期是短文字，沒有必要為了尚未發生的情況加防禦。

**驗證方式**：`./node_modules/.bin/sass` 編譯成功、無錯誤；用 Playwright 開啟本機靜態伺服器截圖確認：桌面寬度下兩張卡片寬（300px）高（560px）完全一致，連結列/NDA 說明都對齊卡片底部；篩選到只剩 1 張卡片時，該卡片維持 300px 寬、不會被拉伸撐滿整列；縮到手機寬度（420px）確認卡片本身未造成任何橫向溢出（用 `getBoundingClientRect` 逐一檢查 `.portfolio__filter`／`.portfolio__list`／`.portfolio__item` 皆未超出視窗寬度）。驗證過程中意外發現 `#skills`（跟這次改動無關的既有區塊）在 420px 窄螢幕下因為 `.skills__list` 的 `minmax(600px, 1fr)` 導致橫向溢出（`.skills__item` 寬度被強制撐到 600px，超出容器與視窗寬度）——這是第 30 筆遺留的既有問題，不在這次「固定作品集卡片大小」的範圍內，已回報給使用者但未在這次一併修改。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

### 34. `CLAUDE.md` 補上「設計新區塊時的固定流程」規則（`/plan` 模式，研究性總結）

**背景**：使用者用 `/plan` 詢問「有總結出目前製作網站的規律嗎」，第一次理解錯方向（以為要總結網站本身的視覺/程式碼慣例），使用者澄清是要總結**使用者本人在請 Claude 設計新區塊時，慣用的下指令流程**。比對 `#skills`（第 27–30 筆）與 `#portfolio`（第 31–33 筆）兩輪從 0 到落地的實際過程，歸納出重複出現的五階段流程（內容架構規劃 → 只出規格文件 → 授權後才實作核心版 → 遇高歧義詞主動確認 → 交付前自我審查），並針對使用者追問的「效率／歧義／預期性／審查」四個面向提出對應優化建議。使用者認可後，要求把這套流程寫進 `CLAUDE.md`。

**變更**：
- `CLAUDE.md`：在「變更程式碼後的固定流程」與「Git commit 訊息語言」之間新增「設計新區塊時的固定流程」章節，內容涵蓋五階段流程說明，並具體化三項優化建議：(1) 規格文件結尾固定加「實作前必須確認的技術選型清單」；(2) 建立「高歧義詞彙表」（並排/分頁/篩選器/卡片）並要求動手前主動複述理解；(3) 交付前自我審查常見盲點清單（等寬等高、橫向溢出、間距字級一致性、RWD 中間寬度）。

**取捨說明**：
- 沒有把「高歧義詞彙表」做成一個可以無限擴充的獨立檔案，而是直接寫在 CLAUDE.md 這個章節裡：目前只累積了 4 個詞，規模還小，之後如果詞彙表變得很長再考慮拆成獨立檔案，避免現階段就過度設計。
- 五階段流程與優化建議都附上對應的實際案例（`#skills`/`#portfolio` 第幾筆），沒有寫成空泛的原則，方便之後回頭核對這條規則是不是還適用。

**驗證方式**：這次是文件/流程規則異動，沒有程式碼可驗證；內容經使用者在 `/plan` 對話中逐步審閱、澄清方向、認可優化建議後才落筆，寫入前有比對 `claude_core_assistant.md` 既有紀錄確保案例引用正確。

### 35. `#activities`（課外經歷）內容架構分析（`/plan` 模式，未動程式碼）

**背景**：使用者用 `/plan` 要求「開始規劃課外經歷」，依第 34 筆新寫入 `CLAUDE.md` 的「設計新區塊時的固定流程」執行：先派 Explore agent 盤點 `#activities`（社團/競賽/志工三個子群組）、`#resume` 校園經歷精簡版、`#skills` evidence link、`docs/superpowers/specs/` 既有格式慣例、`FuturePlan.md`。發現三個子群組欄位結構完全不統一（社團兩欄、競賽兩欄且混寫、志工零欄），且 `_activities.scss` 仍是空檔案。用 AskUserQuestion 確認三個方向：(1) 三個子群組統一成同一套必要欄位（名稱/期間/角色/內容/成果）；(2) 這次一併規劃 `#skills`↔`#activities` 交叉引用欄位（目前 `#skills` 的「用於 N 個作品」只連 `#portfolio`）；(3) 使用者判斷規模中高，並主動要求提案「還能新增哪些資訊」，因此補充資訊清單比照 `#portfolio` 更具創意地展開（新提出軟實力標籤、名次徽章、服務對象、時數量化等欄位）。

**產出**：`docs/superpowers/specs/2026-07-23-activities-content-design.md`（規格文件，比照 `#skills`/`#portfolio` 既有文件格式慣例，尚未修改 `index.html`／`_activities.scss`／`_skills.scss` 任何程式碼）。重點決定：
- 必要資訊：名稱、期間（新欄位，三子群組現況皆缺）、角色、具體參與內容（跟成果分開）、成果與收穫，三個子群組統一套用。
- 補充資訊 Tier 1：佐證連結/證書、名次/成果徽章、`#skills`/`#activities` 交叉引用（拆成獨立於「用於 N 個作品」的「透過 N 個經歷習得」展開區塊，因為「應用場景」跟「養成來源」語意不同不該合併）、軟實力/可轉移技能標籤、精選標記、服務對象、時數/次數量化、組織規模/層級。Tier 2：時間軸視覺整合、角色演進軌跡、合作對象。
- Governance：`#resume` 校園經歷精簡版與 `#activities` 視為同一份清單詳略版本（沿用程式碼既有註解，不重新討論）；`#activities` 每筆經歷需要穩定 id（比照 `#portfolio` 的 `id="portfolio-{slug}"` 模式）供未來 `#skills` 交叉引用指向。
- 文件結尾依 `CLAUDE.md` 新規則附上「實作前必須確認的技術選型清單」：視覺呈現方式（清單式 vs 卡片集）、是否需要篩選 UI、`#skills` 交叉引用要不要這輪一起落地、軟實力標籤要不要建立標準化分類系統。

**取捨說明**：
- 三個子群組欄位統一，沒有比照 `#skills` 語言類刻意跟技術/工具不同調的做法：因為社團/競賽/志工本質上都是「經歷紀錄」，不像語言有「外部檢定 vs 自評」這種本質差異，統一欄位反而更一致好維護。
- 「用於 N 個作品」與「透過 N 個經歷習得」刻意設計成兩個獨立展開區塊而非合併：因為兩者分別是「應用場景（果）」與「養成來源（因）」，語意方向相反，合併會讓讀者搞不清楚這個技能是「用在哪裡」還是「從哪裡學來的」。
- 軟實力標籤、名次徽章等新提出的欄位，都是回應使用者主動要求「提案還能新增哪些資訊」，不是憑空擴充範圍——每項都有明確對應到履歷/課外活動描述的實際需求（例如志工的服務對象、量化時數）。

**驗證方式**：這次是內容架構分析階段，沒有程式碼可驗證；規格文件經欄位前後矛盾、必要/補充分級、命名是否沿用現有 BEM 慣例（`portfolio__date`/`-outcome`/`-link-list` 等既有詞彙）的自我檢查後才交付，等使用者確認規格文件內容（含技術選型清單）後才會另開一輪請求進入 HTML/SCSS 實作。

### 36. `#activities` 落地實作：統一欄位＋合併清單＋篩選器，並把篩選 JS 通用化

**背景**：使用者確認第 35 筆規格文件後回覆「可以」，但規格文件結尾的「實作前必須確認的技術選型清單」使用者還沒逐項回答，依規則用 AskUserQuestion 補問四題：(1) 視覺呈現（清單式 vs 卡片集）；(2) 要不要篩選 UI；(3) `#skills` 交叉引用要不要這輪一起做；(4) 軟實力標籤要不要標準化分類。使用者選「清單式＋要篩選器＋交叉引用分開兩輪＋軟實力標籤自由填寫」。其中「篩選器」的具體版面結構有兩種合理做法（維持三個子群組各自加篩選 vs 合併成一個清單），這是會大幅影響改動範圍的分歧點，再追加一題確認，使用者選「合併成一個清單＋篩選器，跟 `#portfolio` 同構」。

**變更**：
- `src/pages/index.html`（`#activities` 區塊）：拿掉「社團/競賽/志工」三個獨立 `.activities__group` 區塊，合併成單一 `.activities__list`，比照 `#portfolio` 加上 `.activities__filter` 篩選按鈕（全部/社團/競賽/志工）。三筆示範項目（社團/競賽/志工各一）統一套用「類型/名稱/期間/角色/內容/成果」欄位，各自的 `data-type` 屬性供篩選比對，並加上穩定錨點 `id="activities-{slug}"`（供未來 `#skills` 交叉引用指向）；額外示範 Tier 1 欄位：競賽筆加 `.activities__badge` 名次徽章、志工筆加 `.activities__audience`/`-quantity`、社團筆加 `.activities__skill-tags`（自由填寫）與 `.activities__link-list`。
- `src/styles/pages/_activities.scss`（原本只有 1 行註解，整份撰寫）：篩選按鈕沿用 `.portfolio__filter-btn` 視覺；清單走單欄堆疊＋虛線分隔（比照 `#resume` 校園經歷/證照/獎項既有做法，**不做卡片**，維持這次確認的「清單式」方向）；`.activities__badge`/`-skill-tag` 分別沿用 `skills__evidence-grid`／`#` chip 既有視覺語彙。
- **篩選 JS 通用化重構**：`src/scripts/portfolio-filter.js` 改名為 `src/scripts/filter.js`，選擇器從硬寫 `.portfolio__filter-btn`/`.portfolio__item` 改成通用的 `[data-filter]`/`[data-type]`，以最近的 `.section` 祖先為篩選範圍自動判斷是否啟用，讓 `#portfolio`／`#activities` 共用同一份邏輯，之後第三個區塊要做同樣的篩選互動也能直接沿用。連帶把隱藏用的 class 從 `#portfolio` 自己的 `.portfolio__item--hidden` 改成共用的 `.js-filter-hidden`（新增在 `src/styles/components/_section.scss`），`_portfolio.scss` 拿掉重複定義。
- `src/styles/main.css`：執行 `./node_modules/.bin/sass styles/main.scss styles/main.css` 重新編譯。
- `FuturePlan.md`：新增「規劃四：`#skills`↔`#activities` 交叉引用」，記錄設計要點（兩個獨立展開區塊，不合併）與觸發條件（使用者另開一輪請求時再做）。

**取捨說明**：
- 篩選器選擇「合併成一個清單」而非「維持三個子群組各自加篩選」：後者的篩選其實沒有意義（子群組標題本身已經是分類），只有合併成同一份清單，篩選按鈕才有實際區分作用，這也是問使用者這個分歧點的原因。
- 篩選 JS 通用化是這次順手做的重構，不是使用者要求的範圍，但因為 `#activities` 需要一模一樣的篩選行為，重複寫一份幾乎相同的邏輯不如直接抽成通用版本，符合「避免重複」的既有專案原則。
- `#skills` 交叉引用刻意不在這輪做：使用者明確選擇分兩輪，這輪只確保 `#activities` 有穩定 id 可供之後指向，避免範圍蔓延。
- 名次徽章、服務對象、時數等 Tier 1 補充欄位這次直接示範進去（而非像 `#portfolio` 核心版只做必要資訊），因為使用者一開始就要求「提案還能新增哪些資訊」且判斷是中高規模，這些欄位命名已經在規格文件定案，順勢做進示範版更能讓使用者一次看到完整樣貌。

**驗證方式**：`./node_modules/.bin/sass` 編譯成功、無錯誤；用 Playwright 開啟本機靜態伺服器驗證：桌面寬度下篩選列與 3 筆合併清單項目版面正常（含徽章、服務對象、標籤）；點擊「競賽」篩選按鈕後只剩競賽筆顯示（DOM 查詢確認可見項目數為 1）；**重點回歸測試**：確認 `#portfolio` 的篩選器在共用同一份 `filter.js` 之後仍正常運作（點擊「實習成果」篩選按鈕，確認只剩對應卡片顯示，固定卡片大小未受影響）；縮到手機寬度（420px）用 `getBoundingClientRect` 逐一檢查 `.activities__filter`/`-list`/`-item` 皆未超出視窗寬度。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

### 37. `#portfolio`／`#activities` 標題升級為 eyebrow 樣式，全站標題統一為 2rem

**背景**：使用者要求「作品集與課外經歷的標題也要製作特效(打字機)，全部標題統一2rem」。因為「打字機特效」這個詞有兩種可能實作（延伸現有的短豎線色塊閃爍樣式，或做真正逐字輸入的動畫），且「全部標題」的範圍也不明確（只算已有 eyebrow 的區塊，還是全站含 `#casestudy`／`#notes`／`#goals`／`#contact` 都算），依 `CLAUDE.md`「遇到高歧義詞彙主動確認」的規則，用 AskUserQuestion 問清楚兩題。使用者選擇：(1) 延伸現有「短豎線色塊＋blink 閃爍」樣式（不是新的逐字輸入動畫）；(2) 全站所有區塊標題都統一 2rem（含目前還沒有 eyebrow 的 `#casestudy`／`#notes`／`#goals`／`#contact`）。

**變更**：
- `src/pages/index.html`：`#portfolio`、`#activities` 的 `<h2 class="section__title">` 改成跟 `#about`／`#resume`／`#skills` 一致的 eyebrow 結構（`<div class="xxx__eyebrow"><span class="xxx__eyebrow-bar"></span>文字</div>`）。
- `src/styles/pages/_about.scss`／`_resume.scss`／`_skills.scss`：`.about__eyebrow`／`.resume__eyebrow`／`.skills__eyebrow` 字級從 1.69rem 統一調整為 2rem。
- `src/styles/pages/_portfolio.scss`／`_activities.scss`：新增 `.portfolio__eyebrow`／`.activities__eyebrow`（含 `-bar`），字級 2rem，`-bar` 沿用 `layout/_header.scss` 已定義的全域 `@keyframes blink`，跟其他區塊的 eyebrow-bar 用同一組動畫，不重複定義。
- `src/styles/components/_section.scss`：新增 `@use '../abstracts/variables'`，並補上 `.section__title { font-size: 2rem; font-weight: 800; color: $color-deep-space-blue; }`，讓 `#casestudy`／`#notes`／`#goals`／`#contact` 這四個目前還沒升級 eyebrow 樣式的區塊，標題字級也統一成 2rem（但不加短豎線色塊/閃爍效果，因為這次沒有被要求，留給之後升級 eyebrow 時再處理）。
- `src/styles/main.css`：執行 `./node_modules/.bin/sass styles/main.scss styles/main.css` 重新編譯。
- 順手修正一個發現的既有問題：`#portfolio` 卡片 A 的 `.portfolio__outcome` 佔位文字不知何時被異常重複貼上約 10 次（連成一長串），跟卡片 B 乾淨的單句佔位文字不一致，判斷是意外的內容毀損而非刻意測試，已還原成單句佔位文字。

**取捨說明**：
- 沒有做「真正逐字輸入」的打字機動畫：使用者確認要的是延伸現有樣式，避免在沒被要求的情況下引入更複雜的動畫邏輯（需要額外處理觸發時機、動畫時長等）。
- `#casestudy`／`#notes`／`#goals`／`#contact` 只調字級不加 eyebrow 樣式：使用者這次只點名作品集/課外經歷要有「特效」，其餘四個區塊沒有被要求要有短豎線色塊/閃爍效果，只把「全部標題統一 2rem」這個獨立要求套用上去，避免過度延伸範圍。
- `.section__title` 規則放在 `components/_section.scss`（共用元件樣式檔）而非個別 page scss：因為這個 class 同時被 4 個不同區塊共用，符合這個檔案原本「共用樣式放這裡」的定位。

**驗證方式**：`./node_modules/.bin/sass` 編譯成功、無錯誤；用 Playwright 檢查 `getComputedStyle` 確認 `.about__eyebrow`／`.resume__eyebrow`／`.skills__eyebrow`／`.portfolio__eyebrow`／`.activities__eyebrow`／`#casestudy`／`#notes`／`#goals`／`#contact` 的 `.section__title` 字級皆為 32px（2rem），且 `.portfolio__eyebrow-bar`／`.activities__eyebrow-bar` 的 `animation-name` 皆為 `blink`；截圖確認桌面（1400px）與手機（420px）寬度下標題排版正常、無破版；順手發現並修正的 `portfolio__outcome` 重複文字問題也已截圖確認復原正常。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

### 38. `#activities` 改回三個獨立分組＋組內 3 欄格線（比照 #skills），並補齊示範佔位

**背景**：上一輪（commit `30c1eaf`）落地的是「合併成一個清單＋篩選器」版本。使用者看過後回覆「我是指類似技能那樣，而不是分類並排」，要求改回三個獨立分組；當時已經做出對應修正，但使用者接著要求「回到上一個commit」，把這個修正連同其他未提交變更一起丟棄（已用 AskUserQuestion 確認過這是使用者明確要的操作，且清楚說明這會復原成使用者不滿意的合併版本）。這次使用者重新提出同樣的需求——「課外資料中同一分組資料變多時會自動排成一列 3 欄，順便幫我新增佔位」——等於是重做上次被丟棄的修正，這次額外要求補上更多示範佔位資料，讓「資料變多時自動排成 3 欄」的效果真正可見（先前每組只有 1 筆佔位，格線效果看不出來）。

**變更**：
- `src/pages/index.html`：`#activities` 拿掉合併後的 `.activities__filter` 篩選列與單一 `.activities__list`，改回三個獨立 `.activities__group`（社團/競賽/志工），各自 `<h3 class="activities__subtitle">` 標題 + 自己的 `.activities__list`。拿掉不再需要的 `data-type` 屬性與重複標示分類的 `.activities__type` 標籤，名稱從 `<h3 class="activities__name">` 改成 `<h4>`（正確巢狀在分組 `<h3>` 標題之下）。**每組從 1 筆佔位擴充為 3 筆**（社團/競賽/志工各補 2 筆，命名比照全站既有的「（一）（二）（三）」編號慣例，圓點/日期/標籤等示範值複製第 1 筆），讓 3 欄格線有實際內容可以展示。穩定 id（`activities-{slug}`）維持不變。
- `src/styles/pages/_activities.scss`：拿掉 `.activities__filter`／`-filter-btn`；新增 `.activities__group`／`-subtitle`（比照 `.skills__group`／`-subtitle`）；`.activities__list` 改成組內 auto-fit 格線 `grid-template-columns: repeat(auto-fit, minmax(min(380px, 100%), 1fr))`——用 `min(380px, 100%)` 而不是單純 `380px`，預防容器窄於 380px 時（例如手機寬度）欄位被強制撐寬溢出（這是先前同一份修正就已經抓到並修過的既有 bug 類型，這次直接沿用修正版寫法，不重蹈覆轍）。
- `src/styles/main.css`：執行 `./node_modules/.bin/sass styles/main.scss styles/main.css` 重新編譯。

**取捨說明**：
- 拿掉篩選器：分組標題本身已經是分類區隔，跟上次的判斷一致——只是這次是使用者主動要求的方向，不需要再用 AskUserQuestion 確認。
- 佔位資料統一補到每組 3 筆：3 筆剛好能展示「一列 3 欄」的完整效果，比補到 4 筆（會多出一個只有 1 個項目的第二列）更乾淨地示範這個版面規則。
- 3 筆佔位的示範數值（日期/角色/標籤等）直接複製第 1 筆，只改名稱編號：沿用全站「佔位期最小改動、之後手動覆蓋」的既有慣例（`#skills`／`#portfolio` 擴充佔位時都是同樣做法）。

**驗證方式**：`./node_modules/.bin/sass` 編譯成功、無錯誤；用 Playwright 開啟本機靜態伺服器截圖確認：桌面寬度（1400px）下三個分組（社團/競賽/志工）各自的 3 筆佔位排成一列 3 欄，版面結構跟 `#skills` 一致；縮到手機寬度（420px）用 `getBoundingClientRect` 逐一核對所有 `.activities__group`／`-list`／`-item` 寬度皆與容器一致（無強制撐寬溢出），格線自然收成單欄；`#portfolio` 篩選器回歸測試確認未受影響（點擊「Side Project」篩選按鈕，只剩對應卡片顯示）。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

### 39. 導入 JSON + 建置時產生靜態 HTML（一）：新增建置基礎設施＋`#resume` 遷移

**背景**：使用者指出網站重複結構的區塊會持續增加，要求改用 JS + JSON 優化，降低 HTML 維護難度、方便新增資料。用 `/plan` 規劃，先讀 `FuturePlan.md`「規劃一」（雙語頁面規劃時已比較過「JS 動態切換」vs「資料驅動+建置時產生靜態頁面」，明確建議後者），確認這次是同一種抉擇；用 AskUserQuestion 確認三個方向：(1) 採建置時產生靜態 HTML（不是瀏覽器端動態渲染），維持上線內容是純 HTML/CSS、不需要 JS 才能看到內容；(2) 一次把 `#resume`／`#skills`／`#portfolio`／`#activities` 四個區塊都改，不分批試點；(3) 不順便處理 `#portfolio` 現有手動複製頁面（`project-1.html`）的技術債，範圍只限這四區塊內部重複資料列表。派 Plan agent 設計具體架構（JSON schema、渲染邏輯、注入機制、package.json、驗收策略、遷移順序），確認後開始依「resume → activities → skills → portfolio」順序遷移（依功能風險排序：resume 無 JS 依賴/無衍生運算，最安全先做）。

**變更**：
- 新增 `src/data/*.json`（四份資料檔，這輪先建 `resume.json`，其餘三份的資料同時準備好供後續遷移使用）與 `src/build/`（`build.js` 進入點、`inject.js` 標記注入工具、`render/html-utils.js` 共用跳脫函式、`render/resume.js` 履歷渲染邏輯）。`src/build/` 跟 `src/scripts/` 刻意分開資料夾：前者只在開發者機器用 Node 執行（不出貨給瀏覽器），後者是會被 `<script src>` 載入的瀏覽器端 JS。
- `src/pages/index.html`：`#resume` 的 6 個 `<details class="resume__group">` 面板外圈包上 `<!-- BUILD:resume:start/end -->` 標記註解，供建置腳本原地取代——採用「標記注入」而非「拆成 `index.template.html` + 產生 `index.html`」，因為前者仍然只有一份 `index.html` 是「真的」，開發者可以直接開檔案預覽，跟 `FuturePlan.md` 規劃三批評「兩份手寫檔案不同步」的風險性質不同（這裡永遠只有一份檔案），複雜度也更低。`inject.js` 找不到標記就直接 `throw`，防止標記被誤刪後建置腳本悄悄不生效。
- `src/package.json`（原本 0 bytes 空檔案）：補上 `build:html`（跑 `node build/build.js`）、`build:css`（`sass styles/main.scss styles/main.css --no-source-map`，沿用全站既有的 `--no-source-map` 慣例）、`build`（合併兩者）三個 scripts。不新增任何 npm 套件，渲染程式碼用 CommonJS。

**取捨說明**：
- 6 個面板哪些預設展開（open）、標題文字與順序，屬於版面設計決策而非「內容資料」，維持寫死在 `render/resume.js` 裡，不進 JSON，避免 schema 為了遷就固定不變的結構性資訊而變複雜。
- `resume__edu-extra` 這種選填欄位用「有值才輸出對應段落」處理，不在 JSON 存空字串佔位。
- 沒有引入任何模板引擎套件（nunjucks/handlebars 等），純用 Node 內建 `fs` + 模板字串，維持全站「零額外依賴」的既有精神。

**驗證方式**：跑 `node build/build.js`，用 `git diff src/pages/index.html` 確認 `BUILD:resume` 範圍內只有註解位置/空行/文字換行風格差異，class 名稱、屬性、文字內容完全一致（DOM 等價）；用 Playwright 截圖確認視覺呈現與遷移前一致；故意把 JSON 裡一筆學校名稱改成測試字串、重跑建置，確認 `index.html` 對應位置真的更新，證明是「資料驅動」而非建置腳本裡不小心寫死字串，驗證完改回原始佔位文字。

### 40. 導入 JSON + 建置時產生靜態 HTML（二）：`#activities` 遷移

**背景**：延續第 39 筆的遷移順序，`#activities` 是第二個遷移對象——驗證「同一 render 函式要吃多種選填欄位組合」（`badge`／`skillTags`／`links`／`audience`／`quantity` 皆選填，依分組類型有不同組合），且目前無運作中的 JS 依賴（篩選器已在第 38 筆拿掉），風險低。

**變更**：
- `src/build/render/activities.js`：`renderItem()` 用「有值才輸出對應標籤」的方式處理 5 種選填欄位；`renderGroup()` 組出三個分組（社團/競賽/志工）各自的 `<div class="activities__group">`。
- `src/pages/index.html`：3 個 `.activities__group` 外圈包上 `<!-- BUILD:activities:start/end -->` 標記。

**驗證方式**：同第 39 筆做法，`git diff` 確認 DOM 等價、Playwright 截圖確認 9 筆示範資料（3 組×3 筆）版面與 id（`activities-{slug}`）皆正確輸出。

### 41. 導入 JSON + 建置時產生靜態 HTML（三）：`#skills` 遷移

**背景**：延續遷移順序，`#skills` 是四區塊中結構最複雜的——每筆技術/工具項目有 6 顆圓點重複標記＋65 年尺標長條，這次改成完全由 `level`（1–6 整數）與 `tenureYears`（數字）兩個原始欄位運算推導，JSON 不存已經算好的衍生值。

**變更**：
- `src/build/render/skills.js`：內建 `LEVEL_LABELS = ['入門','基礎','中等','中高','高等','精通']` 固定對照表（依 `docs/superpowers/specs/2026-07-23-skills-redesign-design.md` 的 CEFR 六級定義），`level` 查表得出圓點 on/off 數量與熟練度文字；`tenureWidthPercent(years) = (years/65*100).toFixed(1)+'%'`，已驗算現有兩筆示範值 3→4.6%、1→1.5%，跟原本手寫的 `width` 完全吻合。`evidence` 陣列有值輸出 `<details>` 展開版本，空值輸出「尚無對應作品連結」。語言類項目（`group.id === 'lang'`）走不同的 `renderLangItem` 分支（無圓點/尺標，只有 `certName`/`certTime` 文字）。
- `src/data/skills.json`：技術/工具各 4 筆、語言 2 筆，欄位對應現有示範值。
- `src/pages/index.html`：3 個 `.skills__group` 外圈包上 `<!-- BUILD:skills:start/end -->` 標記。

**取捨說明**：`levelLabel`（如「中高」）不存進 JSON，只存 `level` 數字，靠對照表推導——避免兩處資料源（數字＋文字）不同步的風險（例如手動改了 level 卻忘記改對應文字）。

**驗證方式**：`git diff` 確認 DOM 等價；用 Playwright 檢查每筆項目的 `.skills__level-dot--on` 數量與 `.skills__tenure-fill` 的 `style.width` 是否跟資料吻合（技術類 4 顆/4.6%、工具類 2 顆/1.5%）；展開 `<details class="skills__evidence">` 確認連結數量正確；確認工具類顯示「尚無對應作品連結」、語言類顯示正確的檢定文字。

### 42. 導入 JSON + 建置時產生靜態 HTML（四）：`#portfolio` 遷移，四區塊全數完成

**背景**：`#portfolio` 依計畫放最後遷移——唯一同時具備 (a) 運作中的 JS 篩選器依賴（`data-type`/`data-filter`）(b) `links`／`ndaNote` 互斥欄位 (c) `id` 被範圍外的 `src/pages/portfolio/project-1.html` 外部連結引用，三個風險同時存在。

**變更**：
- `src/build/render/portfolio.js`：`renderLinksOrNda()` 在渲染前做防呆檢查——`links`／`ndaNote` 必須恰好其中一個有值，兩者同時有值或同時沒值就丟出明確錯誤中止建置（不靜默吃掉），避免未來新增資料漏填造成卡片缺欄位。`id`/`data-type` 由 `slug`/`type` 欄位組出，不重複存整串字串。
- `src/data/portfolio.json`：2 張示範卡片（一般案例含 `detailLink`；NDA 案例改用 `ndaNote`，不含 `detailLink`），對應現有欄位。
- `src/pages/index.html`：`.portfolio__filter` + `.portfolio__list` 外圈包上 `<!-- BUILD:portfolio:start/end -->` 標記。
- 四個區塊全數遷移完成後，跑過一次完整 `npm run build`（`build:html` + `build:css`）確認整條指令鏈可一次執行到底。

**取捨說明**：`links`／`ndaNote` 互斥檢查選擇「直接丟錯中止建置」而非「靜默擇一顯示」：因為這種資料錯誤如果不中止，後果是某張卡片的連結區塊整個消失且不會有任何警示，比建置失敗更難排查。

**驗證方式**：`git diff` 確認 DOM 等價（僅註解位置/換行風格差異）；用 Playwright 點擊全部 6 個 `.portfolio__filter-btn` 確認篩選行為與遷移前一致（`data-type` 正確輸出，固定卡片尺寸未受影響）；用瀏覽器實際點擊「查看完整專案說明 →」確認能正確導向 `src/pages/portfolio/project-1.html`（範圍外、未修改的手寫頁），該頁連結正常；縮到手機寬度（420px）確認無橫向溢出；跑 `npm run build` 確認 `build:html`＋`build:css` 兩步驟都能順利執行；`build:css` 的 sass 指令補上 `--no-source-map`，跟全站既有的手動編譯慣例保持一致（原始 Plan agent 建議的指令沒帶這個旗標，實測發現會多產生 sourcemap 註解，已修正）。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

### 43. `CLAUDE.md` 強化「排版分歧要先給範例選項」規則（使用者回饋，未動程式碼）

**背景**：使用者指出「再實作課外經歷中你沒有先給我幾款範例就直接實作是很嚴重的錯誤」——回顧 `#activities`「同一分組資料變多時會自動排成一列 3 欄」這次請求，當時直接選了「合併成一個清單＋3 欄格線」的解讀就動手實作，結果使用者要的是「類似 #skills 那樣，分組內格線」，導致要求「回到上一個 commit」整個丟棄重做（見第 38 筆）。這個代價遠高於實作前先問清楚。

**變更**：
- `CLAUDE.md`「設計新區塊時的固定流程」第 3 點：原本只要求「若使用者只給抽象詞彙，先用文字或簡易排版說明描述預計呈現的樣子」，這次強化成硬性規則——**只要排版/結構類指令存在超過一種合理解讀，一律先提供 2–3 款具體範例（用 AskUserQuestion 附 preview 手繪示意圖，或至少文字清楚描述每款差異）讓使用者選定方向，才能動手實作**，不是自己選一種做完再用截圖確認。純文字描述容易被略讀，使用者未必真的意識到有分歧點；具體範例才能逼自己先想清楚有哪些合理選項。

**取捨說明**：
- 這條規則只在「排版/結構類指令存在超過一種合理解讀」時觸發，若指令已經帶有具體可量化描述（例如「卡片固定 300×560px」）或明確只有一種合理實作方式，仍然可以直接照做，不需要為了走流程而硬生選項出來。

**驗證方式**：這次是流程規則異動，沒有程式碼可驗證；內容直接引用第 38 筆的實際案例作為佐證，之後遇到類似的排版分歧指令時，這條規則應該要能避免同樣的「做錯方向、整個丟棄重做」情況重演。

### 44. `#casestudy`（案例故事）內容架構分析（未動程式碼）

**背景**：使用者要求規劃 `#casestudy`，依 `CLAUDE.md`「設計新區塊時的固定流程」執行第一階段（內容架構規劃、只出規格文件）。盤點現況發現 `#casestudy` 是四個已規劃區塊（skills/portfolio/activities/resume）之外最單薄的一個：只有 1 筆佔位、5 段式敘事（背景/目標/過程/挑戰/成果），沒有日期、角色、技術標籤、連回作品的連結、圖片，也沒有一句話摘要；標題仍是 `<h2 class="section__title">`，落後於 `#portfolio`/`#activities` 已升級的 eyebrow 樣式。同時發現 `src/pages/portfolio/project-1.html`（作品詳細頁）直接重用了 `casestudy__block` 等 class 做深度說明，證實這套 5 段式敘事已是全站認定的「作品深度敘事」標準格式。用 AskUserQuestion 確認三個方向：(1) `#casestudy`（首頁精選故事）與 portfolio 詳細頁（獨立完整版）分工不同目的，不合併；(2) 每篇案例故事要連結回對應 `#portfolio` 項目，比照 `#resume`/`#portfolio` 已有的「詳略版本」治理模式，不重複打字名稱/技術標籤；(3) 規模預期少量（1-3 篇精選），維持原始設計定位。

**產出**：`docs/superpowers/specs/2026-07-23-casestudy-content-design.md`（規格文件，比照既有四份 spec 文件格式慣例，尚未修改 `index.html`／`_casestudy.scss` 任何程式碼）。重點決定：
- 必要資訊：案例名稱、一句話亮點摘要（新欄位，比照 `portfolio__summary`）、對應 `#portfolio` 項目連結（新欄位，治理決策要求）、既有 5 段式敘事。
- 補充資訊 Tier 1：段落內圖片/圖表佐證（全站唯一完全沒有圖片元素的核心內容區塊）、量化成果標註。Tier 2：引用/回饋語錄、多篇排序/精選標記（規模小暫不需要）。
- 文件結尾依慣例附上「實作前必須確認的技術選型清單」：要不要納入這輪才完成的 JSON+建置腳本範圍（規模小、維護頻率低，效益不如其他四區塊明顯）、標題要不要一併升級 eyebrow 樣式、圖片佐證要不要這輪就準備版型。

**取捨說明**：
- 案例故事跟 portfolio 詳細頁刻意不合併：兩者敘事格式相同但服務情境不同（首頁快速瀏覽 vs 獨立分享網址），允許內容重疊比強行合併更符合各自的使用情境。
- 名稱/技術標籤等事實性資訊不在 `#casestudy` 重複維護，改用連結引用 `#portfolio` 既有的穩定 id——延續這次遷移 resume/activities/portfolio 時反覆驗證過的「同一份資料只維護一處」原則，不是這次額外發明的新規則。
- 圖片佐證被列為 Tier 1（現在就定案命名）而非必要資訊：因為目前沒有任何真實圖片素材，欄位命名可以先定案，但要不要真的做出版型留給技術選型清單讓使用者決定，避免規劃文件替使用者做視覺決策。

**驗證方式**：這次是內容架構分析階段，沒有程式碼可驗證；規格文件經欄位前後矛盾、必要/補充分級、命名是否沿用現有 BEM 慣例（`portfolio__summary`/`activities__badge` 等既有詞彙）的自我檢查後才交付，等使用者確認規格文件內容（含技術選型清單）後才會另開一輪請求進入 HTML/SCSS 實作。

### 45. `#casestudy` 落地實作：Pull Request 框架＋誠實圓點，並納入 JSON 建置範圍

**背景**：使用者確認第 44 筆規格文件後，用「/plan規劃案例故事，按照流程開始」再次請求（該次 `/plan` 指令未真正進入 Plan Mode，改在一般模式下依既定流程處理），接著要求「給予排版與裝飾範例6款」。依第 43 筆剛強化的 CLAUDE.md 規則，先做了第一輪 6 款範例（時間軸/手風琴/終端機/編輯摘要卡/圖文並排/引言強調），使用者回饋「都缺乏創新與特色」——這些範例只是「換裝飾套上敘事文字」，沒有真正的觀點。第二輪改借資訊管理／全端開發背景本來就會用的工具語彙重新設計 4 款（Git Commit Log／終端機 Session／Pull Request／誠實指標儀表板），使用者選定 C（Pull Request 框架），並指定「查看關聯作品」連結套用 D 的誠實圓點語彙。用 AskUserQuestion 確認剩餘 3 個技術選型：(1) 納入這輪剛完成的 JSON+建置腳本範圍；(2) 標題升級 eyebrow 樣式；(3) 圖片佐證這輪就準備空佔位版型。

**變更**：
- 新增 `src/data/casestudy.json`：`items[].blocks[]` 統一結構（`key`/`label`/`text`/可選 `image`/`metric`），沿用四區塊已建立的 JSON+建置腳本模式；`portfolioSlug` 欄位供連結回對應 `#portfolio` 項目使用。
- 新增 `src/build/render/casestudy.js`：依 `block.key` 分流渲染——`challenge` 套用審查意見（review comment）樣式框；`outcome` 可選配量化成果標註（`metric`，只有真的有數字才輸出）；其餘一般段落可選配圖片佐證（`image`，只有真的有素材才輸出）。footer 的「誠實圓點」**代表「幾個階段附有圖片佐證」（`imageCount / 總階段數`），會隨真實資料變動，不是固定滿分的裝飾數字**——呼應全站「陳姐不信自誇形容詞」的誠實感原則，這點在設計階段被特別排除了「固定 5/5 裝飾」的做法。
- `src/build/build.js`：加入 `casestudy` 區塊的讀取與注入。
- `src/pages/index.html`：標題升級為 `.casestudy__eyebrow`（比照 `#portfolio`/`#activities`）；`#casestudy` 內容區包上 `<!-- BUILD:casestudy:start/end -->` 標記。
- `src/styles/pages/_casestudy.scss`：整份重寫，實作 PR 框架視覺（`MERGED` 徽章、序號、審查意見框、量化標註、圖片佔位框、誠實圓點）。`.casestudy__item` 這次明確做成卡片（白底、磚紅細框），跟全站「預設不做卡片」慣例不同——這是使用者透過範例比較明確選定的方向，比照 `#portfolio` 先前的例外。`.casestudy__back-link`（給 `portfolio/*.html` 詳細頁用）維持不動，跟這次新增的 `.casestudy__portfolio-link`（案例故事內部連回作品）是兩個獨立用途的連結，沒有共用或改名。

**取捨說明**：
- 拿掉了設計探索階段 mockup 裡的假 diff 統計數字（例如「+42 −9」）：那些是純裝飾用的虛構數字，正式實作時如果照抄會違反全站「不灌水」的誠實感原則，所以只保留 PR 框架的視覺語彙（徽章、審查意見框、標籤語氣），數字類裝飾一律換成有真實資料支撐的欄位（圖片佐證計數、量化成果標註）。
- 序號（`#01`）用清單中的實際索引位置，不是虛構值——之後案例故�變多時會自動遞增，不需要手動維護。
- `.casestudy__item` 卡片化選擇明確記錄取捨：因為這是使用者透過具體範例比較（而非文字描述）確認的方向，避免之後被誤認為「隨意違反全站慣例」。

**驗證方式**：`npm run build`（`build:html`＋`build:css`）成功執行；用瀏覽器截圖確認桌面（1400px）呈現與選定的最終 mockup 一致（MERGED 徽章、序號、審查框、量化標註、圖片佔位框、1/5 誠實圓點）；點擊「查看關聯作品 portfolio/project-1 →」確認正確導向 `#portfolio-project-1`；縮到手機寬度（420px）確認無橫向溢出；`#portfolio` 篩選器回歸測試確認未受影響；故意把 JSON 案例名稱改成測試字串、重跑建置，確認 `index.html` 對應位置真的更新，驗證完畢改回原始佔位文字。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

### 46. `#casestudy` 拿掉過程圖片佔位、改 2 欄格線，擴充為 4 筆佔位

**背景**：使用者看過第 45 筆的實作後回饋：不放「過程圖片」佔位框（否則卡片顯得過高過空），改成卡片兩個一列，並擴充為 4 筆佔位資料。

**變更**：
- `src/data/casestudy.json`：拿掉 `project-1` 的 `process.image` 欄位（`.casestudy__block-image` 的渲染邏輯本來就是「有值才輸出」，移除欄位即可，不需要改 `render/casestudy.js`）；新增 3 筆佔位案例（`project-2`／`project-3`／`project-4`，命名比照全站「（一）～（四）」編號慣例），交錯連結到 `#portfolio` 現有的兩個作品（`project-1`／`project-2`），示範值複製第 1 筆。
- `src/styles/pages/_casestudy.scss`：`.casestudy__list` 從單欄堆疊改成 `display:grid; grid-template-columns: repeat(auto-fit, minmax(min(520px, 100%), 1fr))`——520px 基準在桌面可用寬度下排成 2 欄，容器變窄時自動收成 1 欄；用 `min(520px, 100%)` 預防容器窄於 520px 時（手機寬度）欄位被強制撐寬溢出，直接沿用 `#activities` 先前修過的同一種寫法，這次一開始就用對，沒有重蹈覆轍。`.casestudy__item` 拿掉原本靠 `& + &` margin-top 做的單欄間距，改靠 grid 的 `gap` 留白區分。
- `npm run build` 重新產生 `index.html`／`main.css`。

**取捨說明**：
- 沒有把「圖片佐證」這個 render 能力整個拿掉，只是這次示範資料不使用：`.casestudy__block-image` 仍然是「有值才輸出」的選填欄位（規格文件的 Tier 1 補充資訊），之後真的有截圖素材時可以直接在 JSON 加回 `image` 欄位就會顯示，不需要改程式碼。
- 4 筆佔位交錯連結到 `#portfolio` 現有的 2 個作品（而非虛構不存在的 `project-3`/`project-4` portfolio 項目）：避免「查看關聯作品」連結指向不存在的錨點，維持連結的真實可用性。

**驗證方式**：`npm run build` 成功執行；用 Playwright 截圖確認桌面寬度（1400px）下 4 筆案例排成 2 欄，卡片因為少了圖片佔位框而更緊湊；確認 4 個「查看關聯作品」連結的 `href` 正確交錯指向 `#portfolio-project-1`／`#portfolio-project-2`；縮到手機寬度（420px）用 `getBoundingClientRect` 逐一核對 `.casestudy__item` 寬度與容器一致（`min(520px,100%)` 生效，無強制撐寬溢出）；`#portfolio` 篩選器回歸測試確認未受影響。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。

### 47. `#notes`（學習筆記）內容架構分析（未動程式碼）

**背景**：使用者要求規劃 `#notes`，依 `CLAUDE.md`「設計新區塊時的固定流程」執行第一階段（內容架構規劃、只出規格文件）。盤點現況發現 `#notes` 是繼 `#casestudy` 之後另一個完全沒規劃過的核心區塊：只有 1 筆佔位（標題連結、摘要、日期），`_notes.scss` 完全空白，`href="#"` 尚未指向任何實際目標。用 AskUserQuestion 確認三個方向：(1) 筆記連結最終連到外部平台（Medium／個人部落格／Notion），不規劃站內獨立詳情頁——這跟 `FuturePlan.md`「規劃三」當初設想的「未來可能站內列表頁＋內文頁」部落格式方向不同，這次明確選擇外部連結模式；(2) 「分類/類型」獨立成必要欄位，比照 `portfolio__type` 做法；(3) 規模預期中高量（部落格性質、會持續累積），跟 `#casestudy` 的「少量精選」明顯不同。

**產出**：`docs/superpowers/specs/2026-07-23-notes-content-design.md`（規格文件，比照既有五份 spec 文件格式慣例，尚未修改 `index.html`／`_notes.scss` 任何程式碼）。重點決定：
- 必要資訊：筆記標題、分類/類型（新欄位）、摘要、日期、外部連結（補上真正的目標語意，取代 `href="#"`）。
- 補充資訊 Tier 1（中高規模預期，現在就該定案命名）：分類篩選 slug（比照 `data-type` 模式）、來源平台標示、精選/置頂標記。Tier 2：細部標籤、閱讀時間/字數估計、系列/專題分組。
- Governance：筆記全文只在外部平台維護，本站不重複打字，這跟 `#portfolio` 詳細頁（全文在站內）是不同治理模式；分類欄位命名比照 `portfolio__type` 兩層結構（顯示文字+slug），為未來篩選打底。
- 文件結尾附上技術選型清單：要不要納入 JSON 建置範圍、標題要不要升級 eyebrow、這輪要不要就做分類篩選器 UI、外部連結視覺提示怎麼呈現。

**取捨說明**：
- 拿掉了 `FuturePlan.md` 原本設想的「站內獨立文章頁」方向：因為使用者這次明確選擇外部平台模式，這個決策比之前的展望更具體，之後若要改變方向需要使用者重新確認，不是自動延續舊展望。
- 分類欄位不只當顯示用途，同時定案 `data-type` slug 命名：因為規模預期中高，現在决定比之後回頭幫每篇筆記補欄位便宜。

**驗證方式**：這次是內容架構分析階段，沒有程式碼可驗證；規格文件經欄位前後矛盾、必要/補充分級、命名是否沿用現有 BEM 慣例（`portfolio__type`/`data-type` 等既有詞彙）的自我檢查後才交付，等使用者確認規格文件內容（含技術選型清單）後才會另開一輪請求進入 HTML/SCSS 實作。

### 48. `#notes`（學習筆記）落地實作——RSS 訂閱源版型，納入 JSON + 建置腳本範圍

**背景**：使用者確認第 47 筆規格文件的視覺方向為「A方案」（RSS 訂閱源：每篇筆記是指向外部平台的一筆索引，不是站內全文），並用 AskUserQuestion 確認四項技術選型：(1) 納入 JSON + 建置腳本範圍；(2) 標題一併升級成 eyebrow 樣式；(3) 分類篩選 UI 這輪先不做，只定義 `data-type` 欄位命名；(4) 外部連結視覺提示只加箭頭符號（↗），不寫完整句子。

**變更**：
- `src/data/notes.json`（新增）：3 筆佔位筆記（`note-1`/tech/Medium、`note-2`/course/Notion、`note-3`/reading/個人部落格），每筆含 `slug`／`type`／`typeLabel`／`title`／`excerpt`／`date`／`platform`／`href`。
- `src/build/render/notes.js`（新增）：`renderIcon()` 直接取 `platform` 欄位的第一個字當圖示文字，不另外在 JSON 存一個 icon 欄位，避免兩份資料要手動保持同步；`renderItem()`／`renderNotes()` 輸出 `.notes__head` 摘要列（共 N 篇）＋ `.notes__list`，每筆 `<li class="notes__item" id="notes-{slug}" data-type="{type}">` 包 icon／`.notes__meta`（type+date）／標題連結／摘要／`.notes__platform`（平台名稱 + ↗ 箭頭）。
- `src/build/build.js`：加入 `renderNotes` 的 require 與 sections 陣列項目，console.log 訊息同步補上 notes。
- `src/pages/index.html`：`#notes` 標題從 `<h2 class="section__title">` 改成 `.notes__eyebrow`（比照 `#portfolio`/`#activities`/`#casestudy` 已升級的樣式），內容區塊加上 `<!-- BUILD:notes:start/end -->` 標記，交給建置腳本產生。
- `src/styles/pages/_notes.scss`（原本完全空白）：新增 RSS 訂閱源版型樣式——`.notes__item` 用細框（`border-top`）分隔取代卡片外框/陰影（比照全站「預設不做卡片」原則）、`.notes__icon` 色塊圓角方框、`.notes__meta`（type 磚紅 Space Mono + date 灰階）、`.notes__platform` 磚紅色配合 ↗ 箭頭。

**取捨說明**：
- 圖示（icon）不另存欄位，直接從 `platform` 首字動態算，減少一份需要手動同步的資料；之後若某平台首字重複或想要用真正的品牌圖示，再回頭改 `renderIcon()` 邏輯即可，不影響 JSON 結構。
- 分類篩選 UI 這輪刻意不做：只在每個 `.notes__item` 上輸出 `data-type` 屬性把命名定案，等筆記數量真的累積到需要篩選的規模，直接複用全站共用的 `src/scripts/filter.js`（已經是通用邏輯，只認 `[data-filter]`/`[data-type]`），屆時只需要加篩選按鈕，不需要改資料結構。
- 沒有額外幫 `.notes__item` 加卡片外框/陰影，維持全站「.section 內容區塊預設不做卡片」的既定原則，只用細框分隔呈現 RSS/feed 清單感。

**驗證方式**：`node build/build.js` 成功執行，`git diff` 確認只有 `#notes` 區塊被改動（60 行新增/12 行刪除），其餘五區塊輸出不受影響；`sass` 重新編譯成功。Playwright 截圖確認桌面寬度（1400px）圖示/分類/日期/標題/摘要/平台箭頭正確呈現；縮到手機寬度（420px）截圖與 `getBoundingClientRect` 確認 `.notes__item`/`#notes` 本身寬度跟容器一致、無強制撐寬溢出（頁面其餘位置量到的橫向捲動是既有、與本次變更無關的問題）；`document.querySelectorAll('.notes__item')` 逐筆核對 `id`/`data-type` 屬性正確；`#portfolio` 篩選器回歸測試（點擊「課程作業」／「全部」按鈕，核對 `.portfolio__item` 的 `display` 正確切換）確認未受影響；修改 `notes.json` 其中一筆 `date` 欄位、重新建置、`grep` 確認新值出現在 `index.html`，驗證資料驅動生效後，改回原始佔位值並重新建置還原。測試用截圖與臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。


### 49. `#goals`（目標願景）內容架構規劃＋落地實作

**背景**：`#goals` 是「大學生版九大區塊」加分四項中唯一從 2026-07-20 建立後就沒再被規劃過的區塊——只有短期/中長期各一段佔位文字，`_goals.scss` 完全空白，`src/data/` 底下唯獨缺 `goals.json`，是進度最落後的一個。這輪依 `CLAUDE.md`「設計新區塊時的固定流程」完整走了一輪：內容架構規劃（Plan Mode）→ 5 項技術選型全數確認採用（清單結構化／行動佐證／對應技能作品連結／eyebrow 標題／納入 JSON 建置範圍）→ 排版方向先用文字/ASCII 給 6 款範例，使用者認為「缺乏創新」→ 改用 `frontend-design` skill 設計一版獨立的深色 `goals.log` 終端機面板方向（背景沿用 header 已在用的 `$color-deep-space-blue`／`$color-accent-on-dark`）→ 使用者要求「重新設計 2 款，參考本網頁整體風格」，顯示深色面板偏離全站淺色調性太多→ 改成完全重組全站既有元素（`#about__motto` 斜體引言、`#skills` 圓點與 details/summary 收合語彙、`#notes` 清單分隔線）的 2 款新方向→ 使用者指出「缺乏一些目標願景需要有的資訊」，用 AskUserQuestion 確認追加「動機/原因」「整體願景總述」「具體衡量標準/完成定義」「時間範圍」四項欄位→ 補齊欄位後的整合版 demo 確認方向，並要求把 ↗ 連結移到「為什麼／完成定義」收合區下方→ 使用者下達「可以開始實作」，正式落地。

**產出**：`docs/superpowers/specs/2026-07-24-goals-content-design.md`（規格文件，記錄完整內容架構與三輪視覺方向迭代過程）。

**變更**：
- `src/data/goals.json`（新增）：`vision`（整體願景總述）＋兩個 `groups`（`short-term`／`long-term`，各帶 `dotPosition: near/far`），每組 `items` 陣列可放多筆，每筆含 `slug`／`desc`／`timeframe`／`why`／`criteria`／`evidence`／`link`。
- `src/build/render/goals.js`（新增）：`renderDots()` 依 `group.dotPosition` 決定兩顆時間感標記圓點哪一顆點亮（整組共用同一個判斷，不逐筆目標各算一次）；`renderWhy()` 只要 `why`/`criteria` 任一有值就輸出 `<details>` 收合區，都沒有才整段省略；連結刻意排在收合區「之後」（比照 `#skills`/`#activities` 的「有值才輸出對應標籤」慣例）。
- `src/build/build.js`：加入 `renderGoals` 的 require 與 sections 陣列項目，console.log 訊息同步補上 goals。
- `src/pages/index.html`：`#goals` 標題升級為 `.goals__eyebrow`，內容區塊加上 `<!-- BUILD:goals:start/end -->` 標記。
- `src/styles/pages/_goals.scss`（原本完全空白）：新增完整樣式——`.goals__vision` 沿用 `#about__motto` 的斜體強調色+上緣虛線；`.goals__dots`/`.goals__dot` 沿用 `#skills` 等級圓點語彙；`.goals__time` 用中性灰底 pill（不用強調色，跟 `#skills` 65 年尺標同一個「不讓時間長短被誤讀成重要度」的原則）；`.goals__why`/`.goals__why-summary` 完全比照 `.skills__evidence`/`.skills__evidence-summary` 的 details/summary 做法；`.goals__link` 沿用全站磚紅色 dashed underline + ↗ 箭頭語彙。

**取捨說明**：
- 深色 `goals.log` 終端機面板方向雖然有明確論述（呼應 header 既有的深底配色、blink 游標象徵「還在寫、還沒寫完」），但使用者判斷它偏離全站一貫的淺色、無卡片調性太多，最終選擇完全不引入新視覺系統的方向——這比「規劃新區塊時，排版有歧義就先給範例」的既有規則又更進一步：即使給出有設計論述支撐的大膽方向，仍然可能不符合使用者對「跟全站風格一致」的期待，需要視覺化 demo 才能發現這個落差，純文字描述不容易察覺。
- 雙點時間感標記只標示「短期/中長期」這個既有分類，沒有做成連續的量化進度指示，避免無中生有捏造使用者尚未提供的百分比資料，維持全站「誠實感優先」原則。
- 動機/完成定義收進 `<details>` 而非常態展開：6 個欄位全部平鋪會讓清單變成文字牆，比照 `#skills__evidence` 已驗證過的收合模式，讓快速掃描（目標/時間/佐證/連結）與深入閱讀（動機/完成定義）分成兩層。

**驗證方式**：`node build/build.js` 成功執行，`git diff --stat` 確認只有 `#goals` 相關檔案被改動（`src/build/build.js`／`src/pages/index.html`／`src/styles/main.css`／`_goals.scss` 修改，`goals.json`／`render/goals.js` 新增）；`sass` 重新編譯成功。Playwright 截圖確認桌面寬度（1400px）eyebrow／願景引言／雙點標記／時間標籤／佐證／連結呈現正確；點擊「為什麼／完成定義」確認 `<details>` 展開收合正常運作，且展開後連結確實排在收合區下方；縮到手機寬度（420px）用 `getBoundingClientRect`/`scrollWidth` 確認 `#goals` 本身無橫向溢出（頁面其餘位置與 header 導覽列的橫向捲動/重疊是既有、與本次變更無關的問題，在 `#about` 區塊也能重現）；`#portfolio` 篩選器回歸測試（點擊「課程作業」／「全部」）確認未受影響。測試用截圖、臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾、暫存目錄下的排版比較 demo 檔事後已清除，不留在版控中。


### 50. `#contact`（聯絡方式）內容架構規劃＋落地實作——全站最後一個區塊補齊

**背景**：`#contact` 是全站九大區塊中最後一個還沒被認真規劃過的區塊：只有一句 Email（真實資料）、GitHub/LinkedIn 兩個佔位社群連結，以及一份完全沒有 `action`/後端的聯絡表單骨架（2026-07-20 建立時就刻意「只搭骨架、不串接」，見第 9 筆）。這輪依 `CLAUDE.md` 固定流程完整走了一輪：內容架構規劃（Plan Mode）→ 三輪 AskUserQuestion 確認技術選型（mailto 表單改用 JS 組連結／社群連結清單納入 JSON+建置範圍／圖示改用 inline SVG 品牌標誌而非 Google Material Symbols 通用圖示／標題升級 eyebrow）＋內容擴充（求職合作意向 CTA、回覆時間/聯絡偏好說明、新增 Discord或LINE／Instagram）→ 排版方向先給「單欄堆疊 vs. 左右兩欄」兩款通用骨架，使用者認為「缺乏創新」→ 改給 4 款各自有明確論述的方向（終端機提示列／Email 簽名檔式收尾／狀態列／回音式對話預覽）→ 使用者選定「方向 A：終端機提示列」→ 落地實作。

**產出**：`docs/superpowers/specs/2026-07-24-contact-content-design.md`（規格文件，記錄完整內容架構、技術選型確認結果、兩輪排版方向迭代）。

**變更**：
- `src/data/contact.json`（新增）：`email`／`cta`（求職意向）／`replyNote`（聯絡偏好）／`socialLinks` 陣列（每筆含 `platform`／`label`／`href`）。
- `src/build/render/contact.js`（新增）：`BRAND_ICONS` 品牌 SVG 對照表（GitHub/LinkedIn/Discord/Instagram 的 Simple Icons 標準 path data），依 `item.platform` 查表產生對應圖示，圖示本身不存進 JSON 避免跟內容資料重複維護；`renderContact()` 輸出終端機提示列（CTA + 閃爍游標）／聯絡偏好／Email／社群圖示列。
- `src/build/build.js`：加入 `renderContact` 的 require 與 sections 陣列項目。
- `src/scripts/contact-mailto.js`（新增）：全站第二支自訂 JavaScript（第一支是 `filter.js`）。表單送出時攔截預設行為，讀取姓名/Email/訊息欄位值，組出帶 `subject`/`body`（URL encode）的 `mailto:` 連結後導頁，比純 HTML `action="mailto:"` 跨瀏覽器可靠。目的地信箱由 `<form data-mailto="...">` 屬性提供，不寫死在 JS 裡。
- `src/pages/index.html`：`#contact` 標題升級為 `.contact__eyebrow`；JSON 驅動的部分（提示列/偏好/Email/社群列）包進 `<!-- BUILD:contact:start/end -->`；表單本身（不依賴 JSON 資料）維持手寫，加上 `data-mailto` 屬性；`</body>` 前加 `<script src="/src/scripts/contact-mailto.js" defer>`。
- `src/styles/pages/_contact.scss`（原本完全空白）：`.contact__prompt-bar`／`-cursor` 沿用全站既有 `@keyframes blink`（不新增動畫）；`.contact__social-link` 圓形灰底 + hover 變強調色實心圓，`svg { fill: currentColor }` 讓圖示顏色跟著文字色切換；表單樣式（input/textarea/submit）補齊。

**取捨說明**：
- 社群圖示原本考慮用 Google Fonts 的 Material Symbols，但那套圖示字型只有通用 UI 符號（箭頭、設定等），沒有 GitHub/LinkedIn 等品牌專屬圖示，改用 inline SVG 品牌標誌——不需要外部 CDN/字型依賴，圖示可辨識度也更高。
- 排版方向的第一輪（單欄/兩欄）被使用者認為「缺乏創新」，第二輪吸取上一次 `#goals` 規劃「深色 goals.log 面板被打槍」的教訓，4 款新方向都刻意維持全站淺色調性、不引入新視覺系統，只是重組已有語彙（header 閃爍游標、`#about__motto`、`#goals`/`#skills` 圓點）——這次一次選中，沒有再被要求修改方向，顯示「先問清楚會不會偏離全站調性」比「先給論述充分的大膽方向」更重要。
- mailto 表單改用 JS 組連結而非純 HTML `action="mailto:"`：雖然讓 `#contact` 變成全站第二個用 JS 的區塊，但純 HTML 版本的換行/編碼在瀏覽器間行為不一致，這是使用者明確選擇「加」JS 換取可靠度的取捨。

**驗證方式**：`node build/build.js` 與 `sass` 編譯成功；`git diff --stat` 確認只有 `#contact` 相關檔案被改動。Playwright 截圖確認桌面寬度（1400px）提示列/游標/社群 SVG 圖示呈現正確；填寫姓名/Email/訊息後點擊送出，透過 `browser_console_messages` 確認瀏覽器印出「Launched external handler for 'mailto:asyray951223@gmail.com?subject=...&body=...'」且 `subject`/`body` 內容與編碼正確、頁面 URL 未變成表單預設的 GET 查詢字串（證明 `preventDefault()` 生效）；縮到手機寬度（420px）用 `getBoundingClientRect`/`scrollWidth` 確認 `#contact` 本身無橫向溢出（頁面其餘位置與 header 導覽列的橫向捲動/重疊是既有、與本次變更無關的問題，前幾輪已確認過）；`#portfolio` 篩選器回歸測試（點擊「課程作業」／「全部」，`browser_console_messages` 確認錯誤數沒有增加，唯一的錯誤是既有、無關的 favicon 404）確認未受影響。測試用截圖、臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾、暫存目錄下的排版比較 demo 檔事後已清除，不留在版控中。

**里程碑**：至此全站九大區塊（about/resume/skills/portfolio/activities/casestudy/notes/goals/contact）皆已完成內容架構規劃與落地實作。


### 51. `#contact` 表單與品牌圖示列重新排版：表單置中，圖示移到表單下方

**背景**：使用者看過第 50 筆的實作後，要求把表單欄位置中，並把品牌 SVG 圖示列從 Email 下方移到表單下方，也置中呈現。

**變更**：
- `src/build/render/contact.js`：`renderContact()` 拆成 `renderContactTop()`（提示列/聯絡偏好/Email，位置不變）與 `renderContactSocial()`（社群圖示列，獨立輸出）——因為表單本身不吃 JSON 資料、要插在兩段 JSON 驅動內容中間，原本單一個 BUILD 區塊沒辦法讓表單「夾」在提示列與圖示列之間。
- `src/build/build.js`：`sections` 陣列改成兩筆 contact 相關項目（`contact`／`contact-social`），共用同一份 `contact.json`，分別對應 index.html 裡兩組獨立的 BUILD 標記。
- `src/pages/index.html`：`<!-- BUILD:contact:end -->` 提前到 Email 那行之後；表單移到第一組 BUILD 區塊之後；社群圖示列移到表單之後，包進新增的 `<!-- BUILD:contact-social:start/end -->`。
- `src/styles/pages/_contact.scss`：`.contact__form` 加 `margin: 0 auto`（欄位內部文字維持左對齊，只置中整個表單區塊）；`.contact__social-list` 加 `justify-content: center`、調整 `margin`（從表單下方的間距改為 `2.2rem 0 0`）。

**取捨說明**：拆成兩個 BUILD 區塊而不是把表單也塞進 render 函式：表單是純結構、不隨 `contact.json` 內容變動，維持手寫在 `index.html` 裡更直接，也符合其他區塊「JSON 驅動的部分才進 render 函式」的既有慣例（例如 `#skills` 的 details/summary 是 render 函式產生，但 `#contact` 表單本身跟資料無關，沒有理由塞進去）。

**驗證方式**：`node build/build.js` 與 `sass` 編譯成功（`BUILD:contact` 與 `BUILD:contact-social` 兩組標記都正確找到並替換，沒有拋出 `inject.js` 的找不到標記錯誤）；`git diff` 確認範圍正確。Playwright 截圖確認桌面寬度（1400px）表單置中於區塊內、圖示列在表單下方也置中對齊；縮到手機寬度（420px）截圖與 `scrollWidth`/`clientWidth` 確認 `#contact` 本身無橫向溢出。測試用截圖與臨時 HTTP 伺服器事後已清除，不留在版控中。


### 52. 導覽列「目前狀態」標示＋點擊跳轉動畫

**背景**：導覽列（`.site-nav__link`）原本只有 hover 底線展開的互動，捲動頁面看不出目前所在區塊；點擊導覽連結跳轉是瀏覽器預設的瞬間跳轉、沒有動畫。用 Plan Mode 規劃並以 AskUserQuestion 確認兩個方向：(1) 目前所在區塊的視覺標示延伸現有 hover 底線語彙（不引入新視覺元素）；(2) 跳轉動畫自寫 JS（換取可控制的時長/緩動曲線，而非瀏覽器原生 `scroll-behavior: smooth`）。

**變更**：
- `src/styles/components/_section.scss`：新增 `.section { scroll-margin-top: $header-height; }`——不依賴 JS 的安全網，涵蓋直接帶 `#hash` 開啟頁面、瀏覽器上一頁/下一頁等情境，避免固定 header 蓋住錨點跳轉後的區塊頂端。
- `src/styles/layout/_header.scss`：`.site-nav__link` 原本的 `&:hover` / `&:hover::after` 規則改寫成 `&:hover, &.is-active` / `&:hover::after, &.is-active::after`，讓「目前所在區塊」共用 hover 既有的「變白＋底線展開」效果，不新增獨立的視覺語彙。
- `src/scripts/nav-scroll.js`（新增，全站第三支自訂 JavaScript，前兩支是 `filter.js`／`contact-mailto.js`）：
  - 平滑捲動：攔截 `.site-nav__link` 的 click，用 `requestAnimationFrame` + `easeInOutCubic` 緩動曲線 animate `window.scrollTo`（600ms），目標位置扣掉 `.site-header` 實際渲染高度（`header.offsetHeight`，不是寫死換算的 px 值，跟 `_section.scss` 的 `scroll-margin-top` 概念一致）；動畫開始後用 `history.pushState` 補上 URL hash（`preventDefault` 蓋掉了瀏覽器預設的 hash 更新行為）；`prefers-reduced-motion: reduce` 時改用 `scrollIntoView()` 直接跳過動畫。
  - Scrollspy：用 `IntersectionObserver` 搭配 `rootMargin: '-45% 0px -50% 0px'`（抓視窗垂直中段一條窄帶）偵測目前經過的區塊，命中時把對應 nav 連結標成 `.is-active`、其餘移除。用「區塊是否經過視窗中段」判斷而非捲動百分比，區塊高度不一也能正確運作。
- `src/pages/index.html`：`</body>` 前加上 `<script src="/src/scripts/nav-scroll.js" defer>`。

**取捨說明**：
- `.is-active` 完全複用 hover 的 CSS 規則（同一組 `color`/`::after` width），不是另外寫一套顏色系統，維持「一個視覺語彙、兩種觸發時機」的簡潔對應。
- Scrollspy 用 `rootMargin` 抓視窗中段窄帶，而不是「哪個區塊佔螢幕面積最大」之類的計算：後者在區塊高度差異很大時（例如 `#casestudy` 遠比 `#notes` 高）容易誤判，中段窄帶的做法只看「使用者視線大概落在哪個區塊」，判斷更貼近直覺。
- `headerHeight` 在 JS 裡讀 `.site-header` 的 `offsetHeight` 而非寫死 `4rem` 換算的 64px：跟 `_section.scss` 的 `scroll-margin-top: $header-height` 概念一致，之後 header 高度改變不用兩邊分別手動同步數字。

**驗證方式**：`sass` 編譯成功；`git diff --stat` 確認範圍正確。Playwright 驗證：載入頁面時 `#about` 對應的 nav 連結預設是 `.is-active`；點擊「目標願景」連結後，`getBoundingClientRect()` 確認 `#goals` 頂端落在 64px（跟 `.site-header` 的 `offsetHeight` 64px 幾乎完全吻合，誤差 0.09px），且只有 `#goals` 對應的 nav 連結被標成 `.is-active`；用 `browser_run_code_unsafe` 搭配 `page.emulateMedia({ reducedMotion: 'reduce' })` 驗證點擊後 50ms 內就捲動完成（`scrollY` 已跳到目標值），確認有正確跳過動畫；`#portfolio` 篩選器（點擊「課程作業」／「全部」）與 `#contact` mailto 表單（送出後 `browser_console_messages` 確認正確印出 mailto handler 訊息）皆回歸測試通過，確認第三支 JS 沒有互相干擾；手機寬度（420px）確認點擊 nav 連結仍能正確觸發跳轉（功能本身不受既有的手機版面重疊問題影響，該版面問題本次不處理）。測試用截圖、臨時 HTTP 伺服器、`.playwright-mcp` 暫存資料夾事後已清除，不留在版控中。


### 53. Adversarial UX Test（persona：忙碌人資主管「林姐」）——修掉全站最大的兩個真實 bug

**背景**：用 `/adversarial-ux-test` skill，以「46 歲科技業人資主管、一天篩 30-40 份履歷網站、只給每個候選人 20-30 秒、通勤時用手機滑」的persona 實測全站，找 UI/UX 真的會擋住使用者的問題（不含「內容還是佔位文字」這種已知、預期中的半成品狀態）。

**發現並修正的 RED 項目**：

1. **`#skills` 格線寫死 `minmax(600px, 1fr)`，手機寬度整頁橫向溢出 248px**——這正是好幾輪先前驗證（`#notes`/`#goals`/`#contact`）都量到、卻每次都被誤判成「別的區塊、與本次變更無關」的既有橫向捲動問題，這次終於查到根源在 `_skills.scss`：唯獨這裡沒有比照 `#activities`/`#casestudy` 用 `minmax(min(Xpx, 100%), 1fr)` 的手機安全寫法。改成 `minmax(min(600px, 100%), 1fr)` 後，390px/800px/1400px 三個寬度都確認 `scrollWidth === clientWidth`，溢出完全消失。
2. **手機寬度（390px）導覽列文字互疊在標題上**——`.site-header` 原本是固定 `height: $header-height`，導覽列 9 個連結塞不下一行時文字被迫在原本那行內換行，溢出到下方內容上（螢幕截圖顯示「個人梓介紹睿」字疊字）。改成 `.site-header { flex-wrap: wrap; min-height: ... }`、`.site-nav__list { flex-wrap: wrap; }`，讓標題與導覽列改用自然換行（不新增全站第一個 `@media`，維持既有的純 fluid/no-breakpoint 慣例）。連動問題：header 高度變成動態，`.site-main` 的 `padding-top`／`.section` 的 `scroll-margin-top` 原本假設的固定 `$header-height` 不再準確，改成讀 `nav-scroll.js` 動態寫入的 `--header-height` CSS 變數（`header.offsetHeight`，load 與 resize 時都重算一次）。
3. **全站十幾處連結（`resume__project-link`／`portfolio__link`／`activities__link`／`skills__evidence-link`／`notes__link`／`goals__link`／`contact__social-link`）href 都是佔位用的裸 `"#"`，點下去會觸發瀏覽器預設的「跳到頁面最頂端」行為**——使用者點擊任何一個看起來像正常連結的元素，畫面會忽然被彈回最上面，像網站壞掉。在 `src/build/render/html-utils.js` 新增共用的 `hrefAttr(href)`：href 是純占位的 `"#"` 時直接不輸出 `href` 屬性（連結變不可點擊、游標維持預設樣式，視覺上先誠實地表示「還不能點」），之後填入真實網址會自動恢復正常，不用改程式碼。7 個 render 模組（`resume.js`/`portfolio.js`/`activities.js`/`skills.js`/`notes.js`/`goals.js`/`contact.js`）都改用這個共用函式；另外手寫在 `index.html`（非 JSON 驅動）的 `resume__pdf-link` 也同樣拿掉 `href="#"`，文案補上「（佔位連結）」比照全站「誠實標註」慣例。
4. **`#contact` 表單輸入框字級 0.94rem（≈15px）低於 16px**——iOS Safari 對 <16px 的表單欄位聚焦時會自動放大畫面，是很多真實手機使用者都會踩到的體驗問題。改成 `1rem`（16px）。

**檢查後確認沒問題（WHITE，不算缺陷）**：
- 大量「佔位」文字內容：這是網站建置中的已知狀態，不是 UI 缺陷。
- 鍵盤 Tab 的 focus 樣式：全站 CSS 沒有任何地方 `outline: none`，瀏覽器預設 focus ring 保持完整可見。

**取捨說明**：
- 手機導覽列改成自然換行而不是做漢堡選單：後者需要額外的展開/收合 JS 狀態與圖示，換行方案零 JS（純 CSS flex-wrap）就能達到「不重疊、不溢出」的目標，且不偏離全站「沒有 `@media`、靠 fluid 手法自適應」的既有架構慣例。
- `hrefAttr()` 用「href 是否恰好等於 `"#"`」判斷要不要輸出屬性，而不是更複雜的網址驗證：因為全站目前佔位資料的慣例就是統一填 `"#"`，之後填入真實網址（不會剛好是 `"#"`）就會自動變回正常連結，不需要額外欄位或標記。

**驗證方式**：`sass` 編譯成功，`node build/build.js` 成功且 `grep -n 'href="#"' src/pages/index.html` 確認產出結果不再有任何裸 `#` 連結。Playwright 驗證：390px/800px/1400px 三個寬度皆 `scrollWidth === clientWidth`；點擊多個原本會觸發跳頂行為的連結（`skills__evidence-link`、`resume__pdf-link`）確認 `window.scrollY` 不再變動；`#contact` 表單輸入框 `getComputedStyle().fontSize` 確認為 16px；`#portfolio` 篩選器、`#contact` mailto 表單、`nav-scroll.js` 的跳轉/scrollspy 皆回歸測試通過，`browser_console_messages` 確認無新增錯誤。測試用截圖與臨時 HTTP 伺服器已清除，不留在版控中。

**尚未處理（使用者要求先在此總結，之後可視需要繼續）**：
- 篩選器按鈕觸控高度約 35px，略低於 44px 的建議觸控目標尺寸（YELLOW，非阻擋性問題）。
- 部分次要文字（reply-note、meta 說明）用的 `#9aa8b0` 灰色對白底的對比度偏低（初步估算約 2.4:1，低於 WCAG AA 一般文字建議的 4.5:1），已定位到使用位置（`_about.scss`／`_activities.scss`／`_casestudy.scss`／`_contact.scss`／`_notes.scss`／`_portfolio.scss`／`_resume.scss`／`_skills.scss` 共用同一色號），尚未修正，留待下一輪處理。

### 54. Adversarial UX Test（persona：人資主管「陳姐」）——修掉 2 個真實 bug + 2 個經使用者確認方向的體驗缺口

**背景**：再次用 `/adversarial-ux-test` skill，persona 改為「45 歲人資主管，一天篩 20-30 份候選人網站，只給 30 秒決定要不要約面試，通勤時用手機看」。這輪測到的是「上一輪（第 53 筆）之後新增的區塊（`#casestudy`／`#goals`／`#contact`）跟新功能（漢堡選單以外的篩選器/表單）」有沒有新的真實缺陷，不是重測第 53 筆已修過的項目。

**發現並修正的 RED 項目（任何使用者都會踩到，不分裝置）**：

1. **`#casestudy`「查看關聯作品」連結跳轉後，目標卡片頂端被固定 header 蓋住一截**——實測 `#portfolio-project-1` 跳轉後 `getBoundingClientRect().top` 恰好落在 `0px`（貼齊視窗頂端），但 header 是 `position: fixed` 且高度 64px（桌機）～238px（手機），導致封面圖＋標題整個被蓋住，跟第 53 筆修過的「連結跳頂」是同一類問題，但這次是漏在 `.portfolio__item`（案例故事連結真正跳轉的目標，是巢狀在 `.section` 裡的 `<li>`，不是 `.section` 本身）。修法：`src/styles/pages/_portfolio.scss` 的 `.portfolio__item` 補上跟 `components/_section.scss` 的 `.section` 同一個 `scroll-margin-top: var(--header-height, ...)`。
2. **`#portfolio` 篩選鈕點到「零筆資料」的分類，畫面直接開天窗，沒有任何提示文字**——`src/scripts/filter.js` 原本只有隱藏/顯示邏輯，篩選後如果全部項目都被隱藏，畫面留一大片空白直接接到下一個區塊，容易讓人誤以為網站壞掉。修法：`src/build/render/portfolio.js` 在 `<ul class="portfolio__list">` 後面補一段預設 `hidden` 的 `<p class="portfolio__empty js-filter-empty">這個分類目前還沒有作品。</p>`；`filter.js` 篩選時額外算一個 `anyVisible`，全部不吻合時取消該段落的 `hidden`。這是通用邏輯（用 `.js-filter-empty` 找同一個 `.section` 底下的提示元素），之後 `#activities` 若也做篩選器可以直接沿用，不用重寫。

**經使用者用 AskUserQuestion 確認方向後修正的 YELLOW 項目**：

3. **`#contact` 表單沒有必填驗證，且送出後頁面上完全沒有回饋**——三個欄位空白也能觸發 `mailto:`，且 `mailto:` 表單本身無法得知使用者裝置是否真的開啟郵件軟體，裝置沒設定預設郵件 App 時可能悄悄沒反應。使用者選擇「必填驗證 + 送出提示文字 + 複製 Email 按鈕」全套修正（而不是只加必填）：`src/pages/index.html` 三個欄位補 `required`；`src/scripts/contact-mailto.js` 新增 `.contact__form-status`（`role="status" aria-live="polite"`）在送出後顯示「已為你開啟郵件軟體...如果沒有反應，可以直接複製下方 Email」，並新增「複製 Email」按鈕（`navigator.clipboard.writeText`，失敗時退回顯示文字讓人手動複製）；`src/styles/pages/_contact.scss` 新增 `.contact__form-actions`（送出鈕＋複製鈕並排）與對應樣式。
4. **手機版 header 固定佔用視窗約 29%（238px／812px），且是「捲到哪都持續佔用」**——根因是 9 個導覽項目在窄螢幕換行成 3 排。使用者從三個方向（漢堡選單／精簡標題文字／導覽列橫向捲動）中選擇「導覽列收進漢堡選單」，標題區文字不變。修法：`src/pages/index.html` 的 `<nav class="site-nav">` 新增 `.site-nav__toggle` 按鈕（3 條線的 CSS 圖示，開啟時變 X）；`src/styles/layout/_header.scss` 新增 **全站第一個 `@media (max-width: 768px)`**——768px 以下 `.site-nav` 改用 `position: absolute` 釘死在 header 右上角（不再參與 header 本身的 flex 排版，避免標題换行變高時把漢堡鈕一起擠到不可預期的位置），`.site-nav__list` 預設 `max-height: 0` 收合、`.is-open` 時展開成疊在內容上方的下拉選單；`src/scripts/nav-scroll.js` 新增開關邏輯（點漢堡鈕切換、點導覽連結後自動收合、點選單外側也收合）。手機視窗 header 高度從 238px（29.4%）降到 152px（18.7%），且不再隨捲動位置變動。

  **重要：這筆改動推翻了第 53 筆記錄過的架構決策**——第 53 筆當時選擇「導覽列自然換行」而非漢堡選單，明確理由是「維持全站沒有 `@media`、純 fluid 手法自適應的既有慣例」。這次因為换行方案本身在 9 個項目的情境下讓 header 佔用手機視窗近 3 成，經使用者這輪重新確認方向後，改採漢堡選單、正式引入全站第一個 `@media` 斷點。**之後如果有人依第 53 筆的舊記錄以為「這個專案不用 `@media`」，那筆假設在手機導覽列這裡已經不成立，此為使用者本輪重新選擇後的結果，不是疏漏。**

**取捨說明**：
- `.portfolio__item` 的 `scroll-margin-top` 直接複用跟 `.section` 同一個 CSS 變數（`--header-height`），不是另外定義一個數值，避免之後 header 高度再變動時要多處同步。
- 空狀態文字用「這個分類目前還沒有作品。」而不是「即將推出」之類的字眼，因為這是通用邏輯（也會在真實內容都填完、但剛好某個分類沒有作品時繼續生效），不是專門講給現在的佔位資料聽的。
- `.site-nav__toggle` 用 `position: absolute` 脫離 header 的 flex 排版，而不是調整 `justify-content`／`align-items` 去將就標題换行：因為標題本身的换行高度會隨內容變動，硬要用 flex 排版讓漢堡鈕跟著「猜」標題有多高，位置會不穩定；直接釘死在 header 右上角最簡單也最穩定。
- 768px 斷點沒有特別跟設計稿或既有數值對齊，是抓「9 個導覽項目明顯塞不下一行」的常見手機/平板交界值；已實測 375px（手機）、900px（斷點以上）皆正常，768px 前後沒有做逐 px 微調。

**驗證方式**：`node build/build.js` 重新產生 `index.html`（`#portfolio` 的空狀態段落來自 render 模板，不是手改產出檔）、`npx sass` 編譯成功。Playwright 驗證（本機 `python -m http.server`，測完即關閉，暫存截圖與伺服器皆未留在版控中）：手機寬度（375px）點擊「查看關聯作品」確認 `#portfolio-project-1` 頂端貼齊 header 底部（`itemTop` 151.6px vs `headerHeight` 151.65px，桌機 1440px 同樣驗證通過）；點擊「課程作業」篩選鈕（目前資料无匹配項目）確認 `.portfolio__empty` 的 `hidden` 變 `false` 且文字正確顯示；聯絡表單空白送出觸發瀏覽器原生必填提示（無 `mailto` console 訊息代表沒送出）、填寫後送出正確顯示提示文字、點擊「複製 Email」正確顯示複製成功文字；手機版點擊漢堡鈕確認選單展開／點導覽連結後選單自動收合並正確捲動且 `.is-active` 正確更新；額外測試 900px 中間寬度確認斷點上下沒有版面斷層（沒有漢堡鈕卡在導覽列旁邊的過渡態）。

### 55. RWD 分階段實作 Phase 0——建立斷點共用基礎設施（純重構，行為不變）

**背景**：使用者要求「開始分階段實作 RWD，請先規畫需求」。用 3 個 Explore agent 盤點全站 SCSS 後，確認全站是 fluid-first（`clamp()`／`minmax(min(Xpx,100%),1fr)`／`auto-fit`），只有第 54 筆新增的 header 漢堡選單斷點（`@media (max-width: 768px)`）是例外，且該斷點是寫死的 magic number，沒有共用來源。使用者確認採用業界慣用的「fluid 為主、必要時才用斷點，且斷點值統一管理」策略後，先做這個不改變任何視覺輸出的基礎設施重構，讓之後（Phase 1 起）如果真的需要斷點時有地方可以直接複用。

**變更**：
- `src/styles/abstracts/_variables.scss`：新增 `$bp-tablet: 768px;`（沿用 header 原本就用、已測過的數值，不是新設數字）。
- `src/styles/abstracts/_mixins.scss`（原本是空檔案）：新增 `@mixin below($breakpoint) { @media (max-width: $breakpoint) { @content; } }`。
- `src/styles/layout/_header.scss`：`@use "../abstracts/mixins" as *;`，把寫死的 `@media (max-width: 768px)` 改成 `@include below($bp-tablet)`。

**取捨說明**：只重構「來源」，不改任何數值或行為——編譯後 `main.css` 該處的 `@media (max-width: 768px)` 輸出跟修改前逐字相同（純粹是變數/mixin 展開結果），這是刻意的：這一步的目的只是把「斷點值」跟「斷點寫法」各自收斂到單一來源，之後其他區塊如果真的需要斷點，直接 `@include below($bp-tablet)` 就好，不會有人在不同檔案各寫一個 767/768/800 的情況；不在這筆順便調整任何視覺，避免這筆重構的影響範圍跟之後的實際修復（Phase 1 起）混在一起難以追蹤。

**驗證方式**：`npx sass` 編譯成功；`grep` 確認編譯後 `main.css` 的 `@media (max-width: 768px)` 字串與重構前完全一致；Playwright 於 375px 驗證 header 高度仍為 151.65px、漢堡鈕 `display: flex`，跟重構前數值相同，確認純重構沒有引入任何行為變化。

### 56. RWD 分階段實作 Phase 1——修 `#portfolio` 格線在極窄寬度會橫向溢出的 bug

**背景**：延續第 55 筆的分階段 RWD 規劃，Phase 1 處理盤點中風險最高（「會真的壞」）的項目：`_portfolio.scss` 的 `.portfolio__list` 格線用 `repeat(auto-fill, minmax(300px, 300px))`，下限寫死 300px，是全站唯一沒有套用 `min(Xpx, 100%)` 包法的地方（`_activities.scss`／`_casestudy.scss`／`_skills.scss` 都已經用這個包法修過同一類問題）。容器寬度低於「300px + 左右 padding」（實測約 &lt;330-340px）時，格線仍會撐出 300px 欄位，造成整頁橫向捲動。

**變更**：`src/styles/pages/_portfolio.scss` 的 `.portfolio__list`：`grid-template-columns: repeat(auto-fill, minmax(300px, 300px))` 改成 `repeat(auto-fill, minmax(min(300px, 100%), min(300px, 100%)))`。

**取捨說明**：上下限都用 `min(300px, 100%)`，不是只修下限、上限改成 `1fr`——原本這段程式碼的註解明確寫「固定欄寬（不是 auto-fit + 1fr 彈性拉伸），讓每張卡片維持固定大小，不會因為同一列卡片數量或視窗寬度不同而忽寬忽窄」，這是刻意的設計決策（避免卡片隨同列數量忽寬忽窄）。第一次修改時誤把上限也改成 `1fr`，會讓卡片變成彈性拉伸、違背原本註解講的設計意圖，動手途中自行發現並改正——確認上下限都用 `min(300px, 100%)` 才能「容器夠寬時維持固定 300px、容器窄於 300px 時才縮小」，同時滿足「不溢出」跟「不改變既有固定欄寬設計」兩個要求。

**驗證方式**：`npx sass` 編譯成功。Playwright 驗證：320px（比一般手機更窄）確認 `document.documentElement.scrollWidth`（319px）不超過 `window.innerWidth`（320px），無橫向捲動，且截圖確認卡片正確縮小填滿可用寬度；1440px 確認 `.portfolio__item` 實際寬度仍是 300px（`getBoundingClientRect().width`），沒有被改成彈性拉伸，與修正前的固定欄寬視覺一致。

### 57. RWD 分階段實作 Phase 2——修 `#skills` 佐證格線擁擠 + `#portfolio` 卡片高度改用 min-height

**背景**：延續分階段 RWD 規劃，Phase 2 處理「擁擠但不會壞」的兩個問題。

1. `_skills.scss` 的 `.skills__evidence-grid` 原本寫死 `repeat(6, minmax(0, 1fr))`，假設父層 `.skills__list` 永遠 ≥600px 寬；但父層本身是 `minmax(min(600px,100%),1fr)`，手機寬度會縮到 ~340px，6 欄硬擠導致每欄只剩 ~50px，連結文字被截斷到看不出內容。
2. `_portfolio.scss` 的 `.portfolio__item` 固定 `height: 560px` + `overflow: hidden`，但 `.portfolio__role`／`.portfolio__tech-list`／`.portfolio__type` 沒有行數限制，真實內容（角色描述較長、技術標籤較多）會被悄悄裁掉、完全看不出來——這是內容量風險，跟螢幕寬度無關。這裡有兩種合理修法（維持固定高度並幫其餘欄位也加裁切限制／改成 min-height 讓內容決定實際高度），依專案慣例（排版類決策有多種合理解讀時要先問）用 AskUserQuestion 請使用者選，使用者選擇「改成 min-height」。

**變更**：
- `src/styles/pages/_skills.scss`：`.skills__evidence-grid` 的 `grid-template-columns` 改成 `repeat(auto-fill, minmax(min(110px, 100%), 1fr))`。
- `src/styles/pages/_portfolio.scss`：`.portfolio__item` 的 `height: 560px` 改成 `min-height: 560px`。

**取捨說明**：
- `.skills__evidence-grid` 刻意用 `auto-fill` 不是 `auto-fit`：多數技能只有 2 個作品佐證，`auto-fit` 會把沒有內容的空欄收合、把多出來的寬度整個讓給僅有的 2 個項目，變成兩顆異常寬、被拉伸撐滿整行的膠囊，跟全站其他標籤類元件（`.skills__name`／`.about__tag`）都是「依內容寬度」的緊湊樣式不一致；`auto-fill` 會保留空欄、不把寬度分給既有項目，讓連結維持原本緊湊的樣子，只是不再寫死 6 欄。110px 的欄寬下限是抓佔位資料「作品名稱佔位（一）」這類 7-8 字短連結名稱的大半可讀範圍。
- `.portfolio__item` 改 `min-height` 而非「維持固定高度＋幫欄位加裁切限制」：使用者確認「資訊被藏起來」的代價比「同一批卡片高度不完全一致」更高。改完後因為 `.portfolio__list` 是 `display: grid` 且預設 `align-items: stretch`，同一列的卡片仍會互相撐到同一列最高卡片的高度，只有「列與列之間」才可能高度不同，不是每張卡片各自零散不一致，等高視覺紀律大致保留。

**驗證方式**：`npx sass` 編譯成功。Playwright 驗證：`.skills__evidence-grid` 展開後在 375px 確認兩則佐證連結文字完整可讀（截圖確認）、1440px 確認連結寬度回落到 ~116px（接近 110px 下限，沒有被拉伸撐滿整行）；`.portfolio__item` 用 JS 模擬塞入 10 個技術標籤＋長角色描述文字，確認卡片從 560px 自然長高到 744px、內容完整可見無裁切，且同一列兩張卡片高度仍一致（grid stretch 生效）。

### 58. RWD 分階段實作 Phase 3——系統性複查全站三種寬度（實測，未發現新問題）

**背景**：延續分階段 RWD 規劃，Phase 1/2 修完兩個真實風險點後，使用者要求「系統性複查」而不只是依賴程式碼審查判斷——實際打開瀏覽器在 375px（手機）／768px（平板/斷點邊界）／1440px（桌機）三種寬度逐一檢查 about/resume/skills/portfolio/activities/casestudy/notes/goals/contact 九個區塊，並額外加測 900px 交叉驗證先前盤點提到「768-900px 之間 header nav 是否還會擠成多排」的疑慮。

**檢查結果**：
- 375px／768px／1440px 三個寬度皆用 `document.documentElement.scrollWidth <= window.innerWidth` 確認全站無橫向溢出（`scrollWidth`／`innerWidth` 分別為 360/375、753/768、1425/1440）。
- 九個區塊逐一截圖檢查（about／resume／skills／portfolio／activities／casestudy／notes／goals／contact），375px 下皆為單欄堆疊、無文字重疊或截斷；768px 下 portfolio 兩欄、skills 維持單欄（600px 下限在 768px 扣除留白後的可用寬度裝不下兩欄）、casestudy 單欄；1440px 下 portfolio/skills/casestudy 皆順利展開多欄，卡片等高、無跑版。
- **900px header 交叉驗證**：`.site-nav__list` 的 `flex-wrap` 計算高度僅 21.6px（單行），header 總高度 91.35px，9 個導覽項目在 900px 仍完整排在同一行，沒有換行變擠的情況——先前盤點階段推測的「768-900px 中間可能擠成多排」風險，實測後確認**沒有發生**（900px 對這份標題文字長度／導覽項目數量而言，剩餘寬度仍夠排單行），不需要額外調整斷點或延伸漢堡選單的觸發範圍。

**取捨說明**：這個 Phase 主要是實測驗證，不是修復——大部分區塊經前期程式碼審查判斷已經安全，這輪逐一截圖確認「實際畫面」跟「程式碼審查的判斷」一致，沒有發現程式碼審查漏掉的新問題，因此本筆沒有程式碼變更。

**驗證方式**：如上所述，Playwright 於 4 個寬度（375/768/900/1440）分別截圖 + `scrollWidth`/`innerWidth` 檢查，測試用截圖與本機伺服器皆於驗證後清除，不進版控。

### 59. RWD 分階段實作 Phase 4——修正 `project-1.html` class 名稱不一致，並意外發現、修正該頁漢堡選單完全打不開的功能缺陷

**背景**：延續分階段 RWD 規劃，Phase 4 原訂範圍只有一件事：`src/pages/portfolio/project-1.html` 用了 `casestudy__block-title`，但 `_casestudy.scss` 只定義了 `.casestudy__block-label`，導致這支子頁面的「▸ 背景／目標／過程／挑戰／成果與收穫」小標吃不到樣式、退回瀏覽器預設 `<h4>`。修正這個之後，依計畫對這支頁面做三寬度複查時，意外發現一個嚴重許多的問題：這支頁面的 `<nav class="site-nav">` 是第 54 筆新增手機漢堡選單「之前」就手動複製過來的舊版本，沒有同步補上 `.site-nav__toggle` 按鈕；但 CSS（`_header.scss` 的 `@include below($bp-tablet)`）已經全站套用「768px 以下 `.site-nav__list` 收合成 `max-height:0`」的規則。結果是這支頁面在手機/平板寬度下，整份導覽選單完全打不開（沒有任何按鈕可以展開），只剩「← 回作品集」這個獨立連結還能用。因為嚴重度明顯高於一般「擁擠但不會壞」的問題，動手前先跟使用者確認是否要擴大這個 Phase 的範圍，使用者確認「現在就修」。

**變更**：
- `src/pages/portfolio/project-1.html`：
  - `casestudy__block-title` → `casestudy__block-label`（5 處）。
  - `<nav class="site-nav">` 補上跟 `index.html` 同步的 `.site-nav__toggle` 漢堡按鈕（含 `aria-expanded`/`aria-controls`/`aria-label`），`<ul class="site-nav__list">` 補上 `id="site-nav-list"` 供 `aria-controls` 對應。
  - `</body>` 前新增 `<script src="/src/scripts/nav-scroll.js" defer></script>`（這支頁面原本沒有引入任何 JavaScript，補上按鈕的 HTML 沒有對應的開關邏輯還是打不開）。
- `src/scripts/nav-scroll.js`：補上這支腳本後，測出一個連帶的既有缺陷——Scrollspy 區段用 `document.querySelector(link.getAttribute('href'))`，但 `project-1.html` 的 nav 連結 href 是指回首頁的絕對路徑（例如 `/src/pages/index.html#about`），不是本頁錨點，直接丟給 `querySelector` 會因為選擇器字串不合法丟出 `SyntaxError`。改成跟上面點擊處理同一個判斷式：只有 `href` 以 `#` 開頭才查詢，否則回傳 `null`（會被後面的 `.filter(Boolean)` 濾掉）。

**取捨說明**：
- 漢堡按鈕跟開關邏輯選擇「完整同步 index.html 現有版本」，不是重新設計一套子頁面專用的簡化版：這支頁面的 header/nav 從一開始就是刻意跟首頁維持外觀一致（`project-1.html` 自己的註解也寫明「header/nav/footer 是從 index.html 手動複製過來的...之後改版時記得同步」），維持一致是既有慣例，不是這次新引入的規則。
- `nav-scroll.js` 的 scrollspy 修正用「只處理 `#` 開頭的 href」而不是用 `try/catch` 包住 `querySelector` 吞掉錯誤：前者是修正邏輯本身的假設錯誤（scrollspy 概念上就只對「本頁錨點」有意義，跨頁連結不應該被納入 IntersectionObserver 觀察名單），後者只是掩蓋症狀；且這個修正是全站共用腳本的一部分，之後如果有其他子頁面比照 `project-1.html` 做法（nav 連結指回首頁絕對路徑），也會自動受益，不用每支子頁面各自處理。
- 這個 bug 沒有在最初的 Phase 4 規劃範圍內（規劃時只知道 class 名稱問題），是複查過程中才發現；因為嚴重度是「功能完全無法使用」而不是「視覺不夠好」，跟使用者確認後才擴大範圍處理，沒有自行決定擴大。

**驗證方式**：`.casestudy__block-label` 套用樣式後截圖確認 Space Mono 字體／灰階色／▸ 前綴皆正確顯示（`getComputedStyle` 確認 `font-family`/`color`）。漢堡選單修正後：375px 點擊按鈕確認 `.site-nav__list` 正確加上 `is-open`、截圖確認選單正確展開顯示 9 個連結；點擊「履歷」連結確認正確導向 `index.html#resume`。`nav-scroll.js` 修正前後對照 `browser_console_messages`：修正前每次載入都印出 `SyntaxError: ... is not a valid selector`，修正後 0 錯誤（曾一度懷疑修正沒生效，後確認是瀏覽器分頁快取了舊版 script，改用 `about:blank` 中繼再重新導航後確認錯誤消失，非真實迴歸）。375px／768px／1440px 三個寬度皆確認 `scrollWidth === innerWidth`，無橫向溢出。

---

## RWD 分階段實作總結（Phase 0-4 全部完成）

依 `全站 RWD 分階段實作規劃`（使用者核准的規劃文件）完成五個階段：Phase 0 建立斷點共用基礎設施（`$bp-tablet` 變數 + `below()` mixin）、Phase 1 修 `#portfolio` 格線溢出、Phase 2 修 `#skills` 佐證格線擁擠 + `#portfolio` 卡片高度改用 `min-height`、Phase 3 系統性複查全站三種寬度（實測無新問題）、Phase 4 修正 `project-1.html` class 名稱不一致並意外發現修正該頁漢堡選單完全打不開的問題。明確排除範圍（篩選鈕觸控高度、灰色文字對比度）維持未處理，留待之後另外排時間。
