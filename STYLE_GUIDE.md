# 寫作規範 / Style Guide

這份規範讓全書的風格保持一致，也讓之後的翻譯更容易。修改或新增內容之前，請先讀一遍。第 1～8 節是繁體中文原文的規範，第 9 節是英文版的規範，第 10 節是日文版與韓文版的格式。

Sections 1–8 cover the Traditional Chinese original. Section 9 covers the English version.

---

## 1. 讀者與深度

- **讀者**：理工背景、但不是半導體專業的人，以及準備進入半導體業的新人。
- **深度**：停在「流程、原理、為什麼」。讀完一章，讀者要能說出這一步在做什麼、為什麼要這樣做、做壞了會怎樣。
- **不寫公式**。需要說明原理時，用比喻和例子。
- **長度**：每章大約與[第 5 章 微影](zh-TW/2-process-modules/05-lithography/README.md)相當，約 150 行以內。

---

## 2. 用語

### 使用台灣的繁體中文用語

| 使用 | 不使用 |
|---|---|
| 晶片 | 芯片 |
| 晶圓 | 硅片 |
| 電晶體 | 晶體管 |
| 記憶體 | 內存、存儲器 |
| 矽 | 硅 |
| 製程 | 工藝 |
| 微影、曝光機 | 光刻、光刻機 |
| 光阻 | 光刻膠 |
| 蝕刻 | 刻蝕 |
| 離子佈植 | 離子注入 |
| 化學機械研磨 | 化學機械拋光 |
| 濺鍍 | 濺射 |
| 導通孔 | 通孔 |
| 臨界電壓 | 閾值電壓 |
| 奈米 | 納米 |
| 程式 | 程序（指 program 時） |
| 軟體、硬體 | 軟件、硬件 |
| 介面 | 接口 |
| 品質 | 質量 |
| 網路 | 網絡 |

### 術語

- 第一次出現時，寫成「中文（English，縮寫）」，例如「化學機械研磨（Chemical Mechanical Planarization，CMP）」。
- 之後使用晶圓廠實際的說法。現場習慣直接講英文的（例如 CD、Overlay、CMP、Q-Time），就直接使用英文。
- 用詞以[附錄 A 術語總表](zh-TW/appendix/glossary.md)為準。新增術語時，請一併更新術語總表。

---

## 3. 排版

- 中文與英文、數字之間加一個半形空格，例如「300 mm 晶圓」「EUV 的波長」。
- 數字與單位之間加空格，例如「13.5 nm」「775 微米」「1,400 °C」；百分比不加空格，例如「98%」。
- 中文使用全形標點；引號使用「」，引號中再引用使用『』。
- 範圍使用全形波浪號，例如「第 4～10 章」。
- 描述一連串步驟時，先用一行粗體的箭頭流程，例如 **塗佈 → 曝光 → 顯影**，再用編號清單逐步說明。

---

## 4. 章節結構

每一章依照以下順序撰寫，可以直接複製[章節範本](templates/chapter-template.md)開始（英文版使用 [chapter-template.en.md](templates/chapter-template.en.md)）：

1. **標題**：`# 第 N 章　主題：副標題`（「章」後面是一個全形空格）
2. **📍 晶圓位置**
3. **本文**：依內容分節。製程模組的章節，大致依照「為什麼需要 → 原理 → 流程與設備 → 關鍵指標 → 常見異常」的順序。
4. **📖 名詞框、🔧 Know-how 框**：放在相關段落的後面。每章各約 2～4 個。
5. **本章重點**：3～5 點。
6. **延伸閱讀**：2～3 項公開資料。
7. **導覽列**：上一章、目錄、下一章。

---

## 5. 三種提示框

### 📍 晶圓位置

```markdown
> 📍 **晶圓位置**
>
> - 前一站：……
> - **本章：……**
> - 下一站：……
```

### 📖 名詞框

```markdown
> [!NOTE]
> **📖 名詞｜中文（English，縮寫）**
>
> - **定義**：一句話說明它是什麼。
> - **現場用法**：在晶圓廠裡實際怎麼說，最好附一句例句。
> - **相關名詞**：二到四個相關的術語。
> - **常見混淆**：最容易和什麼搞混，差別在哪裡。
```

### 🔧 Know-how 框

```markdown
> [!TIP]
> **🔧 Know-how｜用一句話點出重點**
>
> - **情境**：在什麼情況下會遇到。
> - **做法**：現場怎麼做。
> - **為什麼**：背後的原因。
> - **沒做會怎樣**：後果是什麼。
> - **相關章節**：[第 N 章 標題](相對路徑)
```

「沒做會怎樣」是 Know-how 框最重要的一欄。現場的規則大多是從出事學來的，讀者理解了後果，才記得住規則。

> [!IMPORTANT]
> 框裡的每個欄位都要寫成清單項目，也就是每一行都以 `> -` 開頭。GitHub 顯示 `.md` 檔案時，不會把單一換行顯示成換行；如果不用清單，所有欄位會擠成同一段。

Know-how 只寫業界通用的做法與原則，不寫任何公司的實際參數或內部流程。

---

## 6. 圖片

- 優先使用 SVG；照片或截圖使用 PNG。
- **圖上不放文字**。需要標示時使用數字編號，在圖下方的說明文字解釋，讓所有語言版本可以共用同一張圖。
- 檔名格式為「章節編號-描述」，例如 `17-wafer-map-patterns.svg`，統一放在根目錄的 `images/` 資料夾，所有語言共用。
- 只能使用自己繪製或授權相容的圖片，不可以直接使用書籍、論文或公司網站的圖。
- 還沒畫好的圖，先用註解標出位置和內容，例如 `<!-- 圖：CMP 機台示意 -->`。執行 `python3 scripts/list_figures.py` 可以列出所有待補的圖。
- 簡單的流程圖可以用 Mermaid 繪製，GitHub 會直接顯示，文字也能跟著內文一起翻譯。

圖片的寫法：

```markdown
![替代文字，描述圖片內容](../../../images/17-wafer-map-patterns.svg)

*圖說：說明圖中每個編號代表什麼。*
```

---

## 7. 內容原則

- 以流程為主軸，不以公司為主角；不寫特定公司的產品名稱與商標。
- 只寫公開資料與業界通用的知識，不寫任何公司的機密。
- 數字使用量級或概略值，例如「數百層」「大約 26 mm × 33 mm」。
- 會隨時間改變的資訊，例如最新世代的量產時間，寫成「2020 年代中期」這類較大的範圍，必要時註明「截至某年」。
- 句子盡量短，一句話說一件事。避免雙關、俚語和只有特定地區讀者才懂的梗，翻譯會比較順利。

---

## 8. 連結

- 一律使用相對路徑。
- 章節之間的引用寫成 `[第 N 章 標題](../../資料夾/章節資料夾/README.md)`。
- 新增、移動或改名檔案之後，執行 `python3 scripts/check_book.py`，確認沒有失效的連結。

---

## 9. English version

The English version in `en/` is a translation of the Traditional Chinese original in `zh-TW/`. It follows the same structure, depth and principles as sections 1–8.

### Language

- Use American English spelling, such as "color" and "analyze."
- Write short, plain sentences. Prefer everyday words over academic ones.
- Use the terms in [Appendix A: Glossary](en/appendix/glossary.md). Spell out a term with its abbreviation the first time it appears in a chapter, for example "chemical mechanical planarization (CMP)," and then use the form engineers actually say on the floor.
- In the "On the floor" field, write how English-speaking fab engineers would really say it, not a word-for-word translation of the Chinese. When a Taiwanese expression is useful to know, add it in parentheses, as with 黃光 ("yellow light") for the lithography area.
- Use a space between numbers and units, such as "13.5 nm" and "300 mm."
- Use an en dash for ranges, such as "Chapters 4–10."

### Chapter structure

- Title: `# Chapter N: Topic — Subtitle`
- 📍 **Where the wafer is**, with "Previous stop," "**This chapter**" and "Next stop"
- `## Key takeaways` (3–5 points) and `## Further reading`
- Navigation bar: `[← Chapter N-1: Title](...) | [Contents](../../README.md) | [Chapter N+1: Title →](...)`
- Figure placeholders: `<!-- Figure: description -->`

### Boxes

```markdown
> [!NOTE]
> **📖 Term | English term (中文術語)**
>
> - **Definition**: One sentence that says what it is.
> - **On the floor**: How it is said in a fab, ideally with an example sentence.
> - **Related terms**: Two to four related terms.
> - **Common confusion**: What it is most often confused with, and the difference.
```

```markdown
> [!TIP]
> **🔧 Know-how | One sentence that states the point**
>
> - **Situation**: When you run into it.
> - **Practice**: What the fab does.
> - **Why**: The reason behind it.
> - **If you skip it**: What goes wrong.
> - **Related chapters**: [Chapter N: Title](relative/path/README.md)
```

As in the Chinese version, every field must be a list item, because GitHub does not render a single line break as a new line in `.md` files.

---

## 10. Japanese and Korean versions

The Japanese (`ja/`) and Korean (`ko/`) versions follow the same structure as the English version. Only the labels differ. `scripts/check_book.py` checks these labels.

| Element | 日本語 (`ja/`) | 한국어 (`ko/`) |
|---|---|---|
| Title | `# 第 N 章　トピック：サブタイトル` | `# 제N장 주제: 부제` |
| Where the wafer is | 📍 **ウェーハの現在地**（前の工程／**この章**／次の工程） | 📍 **웨이퍼의 현재 위치**（이전 단계／**이 장**／다음 단계） |
| Term box | `**📖 用語｜用語（中文）**`: 定義／現場での使い方／関連用語／よくある混同 | `**📖 용어｜용어（中文）**`: 정의／현장에서는／관련 용어／흔한 혼동 |
| Know-how box | `**🔧 ノウハウ｜要点**`: 状況／やり方／理由／やらないとどうなる／関連する章 | `**🔧 노하우｜요점**`: 상황／방법／이유／안 하면 어떻게 되나／관련 장 |
| End sections | `## この章のポイント`, `## 参考文献` | `## 이 장의 핵심`, `## 참고 자료` |
| Navigation | `[← 第 N 章　タイトル](...) ｜ [目次](../../README.md) ｜ [第 N 章　タイトル →](...)` | `[← 제N장 제목](...) ｜ [목차](../../README.md) ｜ [제N장 제목 →](...)` |
| Style | Prose in です・ます; boxes in plain だ・である | Prose in 합니다체; boxes in plain ~다 |

Use the terms in each language's glossary ([日本語](ja/appendix/glossary.md), [한국어](ko/appendix/glossary.md)).
