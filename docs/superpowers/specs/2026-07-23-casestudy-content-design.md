# #casestudy（案例故事）內容架構規劃

## Context

`#casestudy` 目前只有 1 筆佔位案例（5 段式敘事：背景/目標/過程/挑戰/成果與收穫），對應的 `_casestudy.scss` 幾乎沒有樣式（只有 section padding 跟這次順手加的 `.casestudy__back-link`，內文完全吃瀏覽器預設樣式），是全站目前唯一還沒被認真規劃過內容架構的核心區塊之一。

依專案已確立的「設計新區塊固定流程」（`CLAUDE.md`），這輪先做內容架構規劃、只出規格文件，不動程式碼；使用者確認文件後才會另開一輪請求落地實作。

已用 AskUserQuestion 確認三個方向：
1. **`#casestudy` 與 `src/pages/portfolio/project-1.html`（作品詳細頁）分工不同目的，不用合併**：`#casestudy` 是首頁不用離開就能看到的 1-2 篇精選故事，portfolio 詳細頁是有獨立網址、可以更深入/更長的完整版，兩者內容可能重疊但用途不同。
2. **每篇案例故事要連結回對應的 `#portfolio` 項目**，比照 `#resume`/`#portfolio` 已有的「詳略版本」治理模式——名稱、技術標籤等事實性資訊只在 `#portfolio` 維護一份，`#casestudy` 用連結引用，不重複打字。
3. **規模預期是少量（1-3 篇精選）**，維持原始設計定位（從 portfolio 挑最想被看到的作品），這代表不需要規劃篩選/列表機制，JSON 資料驅動的必要性也比 portfolio/activities/skills 低（規模小、維護頻率低），留給技術選型清單讓使用者決定。

## 現況盤點

- `src/pages/index.html` 第 855–901 行：`#casestudy` 1 筆佔位，`<h2 class="section__title">`（尚未升級成 eyebrow 樣式，跟 `#portfolio`/`#activities` 這次一起升級的狀態不同步）。每筆案例 `casestudy__name` + 5 個 `casestudy__block`（`-block-title` + `-block-text`）。**沒有**日期/期間、沒有角色、沒有技術標籤、沒有連回 `#portfolio` 的連結、沒有任何圖片/視覺元素、沒有一句話摘要/亮點——是四個已規劃區塊之外，欄位最單薄的一個。
- `src/styles/pages/_casestudy.scss`：只有 `.casestudy` section padding 與 `.casestudy__back-link`（給 portfolio 詳細頁的返回連結用），`casestudy__name`/`-block-title`/`-block-text` 完全無樣式。
- `src/pages/portfolio/project-1.html` 直接重用 `casestudy__block`/`-block-title`/`-block-text`/`-name` class 做「深度說明」內容，證實這套 5 段式敘事語彙已經是全站認定的「作品深度敘事」標準格式，這次規劃 `#casestudy` 應該延續、不要另創一套。
- `src/data/*.json` + `src/build/`：本輪之前才完成 resume/skills/portfolio/activities 四區塊的 JSON + 建置時產生靜態 HTML 遷移（見 `claude_core_assistant.md` 第 39–42 筆），`#casestudy` 目前不在範圍內，這次規劃需要決定要不要納入同一套機制。
- `#portfolio` 每個項目已有穩定 id（`id="portfolio-{slug}"`），可直接作為 `#casestudy` 連結回 `#portfolio` 的錨點依據，不需要新增額外的對照表。

## 內容架構：必要資訊 vs. 補充資訊

### 必要資訊（每篇案例故事都要有）

| 欄位 | 說明 | 現況 |
|---|---|---|
| 案例名稱 | | 已有 `casestudy__name` |
| 一句話亮點摘要 | 電梯簡報式的「這篇案例最想讓人記住的一句話」，放在 5 段敘事之前，供快速掃描——比照 `portfolio__summary` 的角色，目前完全缺席 | **目前沒有**，補上 |
| 對應 `#portfolio` 項目連結 | 例如「延伸閱讀：查看作品資訊 →」連到 `#portfolio-{slug}`，取代重複打一次名稱/技術標籤 | **目前沒有**，這是治理決策（governance）要求新增的欄位 |
| 背景／目標／過程／挑戰／成果與收穫 | 既有 5 段式敘事 | 已有，維持不變 |

### 補充資訊

#### Tier 1：現在就該定案命名（即使案例數量少，這些是敘事格式本身的核心強化）

| 欄位 | 說明 |
|---|---|
| 段落內圖片/圖表佐證 | 每個 `casestudy__block` 可選配一張圖（架構圖、畫面截圖、前後對比），全站目前唯一完全沒有圖片元素的核心內容區塊；案例故事作為「說服力最強」的內容，缺乏視覺佐證是最大缺口 |
| 量化成果標註 | 在「成果與收穫」段落內，用類似 `portfolio__outcome`/`activities__badge` 的量化語彙標註具體數字（使用者數、效能提升 %、得獎名次），呼應全站「陳姐不信自誇形容詞」的誠實感原則 |

#### Tier 2：量多或有實際素材時再加

| 欄位 | 說明 |
|---|---|
| 引用/回饋語錄 | 使用者、隊友、主管的回饋引言，增加可信度 |
| 多篇排序/精選標記 | 目前規模（1-3 篇）不需要，之後真的變多再規劃 |

## Governance 決策

1. **`#casestudy` 與 `#portfolio` 詳細頁分工不同目的，不合併**：前者是首頁精選故事，後者是獨立完整版，兩者敘事格式（5 段式）相同但服務不同情境，允許內容重疊。
2. **每篇案例故事必須連結回對應的 `#portfolio` 項目**，名稱/技術標籤等事實性資訊不在 `#casestudy` 重複維護，只在 `#portfolio` 一份，`#casestudy` 用連結引用——這跟 `#resume`↔`#portfolio`、`#activities`↔`#resume` 已經確立的「詳略同一份資料」治理邏輯一致。
3. `#casestudy` 標題目前落後於 `#portfolio`/`#activities` 的 eyebrow 樣式升級進度，這輪規劃要不要一併補上，列入下方技術選型清單讓使用者決定（避免這次分析範圍蔓延到沒問過的視覺升級）。

## 如何展現特色

- 圖片/圖表佐證與量化成果標註都呼應全站「誠實感優先」的內容設計原則——用具體證據（畫面、數字）取代自誇形容詞，跟 `#skills` 65 年尺標、`#portfolio` NDA 誠實標註是同一套價值觀延伸。
- 一句話亮點摘要沿用 `portfolio__summary` 同樣的「電梯簡報」語氣，不需要另創寫作語調。
- 連回 `#portfolio` 的連結沿用全站既有的磚紅色 dashed underline 連結語彙。

## 建議的 HTML 欄位命名對照表（實作階段參考，這次不落地）

| 用途 | 建議命名 | 說明 |
|---|---|---|
| 一句話亮點摘要 | `.casestudy__summary` | 沿用 `portfolio__summary` 命名慣例 |
| 對應作品連結 | `.casestudy__portfolio-link`（`href="#portfolio-{slug}"`） | 錨點直接指向 `#portfolio` 既有的穩定 id，不需要額外對照表 |
| 段落圖片 | `.casestudy__block-image`（放在 `.casestudy__block` 內，選填） | |
| 量化成果標註 | `.casestudy__metric`（沿用 `activities__badge`/`portfolio` 的量化語彙） | |

## 實作前必須確認的技術選型清單

供使用者確認這份規格文件時一併回答：

1. **要不要納入 JSON + 建置腳本範圍**：這輪剛完成 resume/skills/portfolio/activities 四區塊的資料驅動遷移，`#casestudy` 規模小（1-3 篇）且變動頻率低，資料驅動的效益不如其他四區塊明顯。是否也要一併納入，還是維持手寫 HTML（比照案例數量少、不太需要頻繁新增的 `#about`）？
2. **標題要不要一併升級成 eyebrow 樣式**：`#portfolio`/`#activities` 已升級，`#casestudy` 目前還是 `<h2 class="section__title">`，這輪是否順便統一？
3. **圖片佐證要不要這輪就準備好版型**（即使目前沒有真實圖片素材，先把 `.casestudy__block-image` 的容器/佔位框做出來），還是先只在規格文件記錄、等真的有素材時才實作？

## 本次分析範疇

這份文件只是內容架構規劃，尚未動任何程式碼——`_casestudy.scss` 仍維持目前狀態，`index.html` 的 `#casestudy` 結構也還是原本的最小佔位版本。是否要接著進入實作，需要使用者確認這份規劃（含上方技術選型清單）後才進行。
