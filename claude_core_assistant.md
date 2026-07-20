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
