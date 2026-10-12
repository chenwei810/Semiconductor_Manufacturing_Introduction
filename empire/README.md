# 晶圓帝國 Wafer Empire

經營晶圓廠 + 製程解謎的網頁小遊戲。從 180 nm 的 Fab 1 起家：買機台、排產線、賣晶圓；通過製程解謎（沉積、微影、蝕刻、佈植、CMP、金屬化）來開通更先進的廠，解謎星數會永久降低缺陷率。每個事件與關卡都附一則取自《半導體製造概論》的知識。純 HTML / CSS / JS（ES modules），無打包、無外部資源。

- 線上玩：<https://paul931130.github.io/Semiconductor_Manufacturing_Introduction/empire/>
- 本機執行（需用伺服器，因為會 `fetch` JSON）：

  ```bash
  python -m http.server 8000 --directory empire
  # 開啟 http://localhost:8000/
  ```

設計文件見 [DESIGN.md](DESIGN.md)。

## 檔案

| 路徑 | 說明 |
|---|---|
| `index.html` | 入口：標題、遊戲外殼、`#puzzle-root` |
| `js/main.js` | 啟動、hash 路由（`#hub #fab/f2 #unlock/f3 #puzzle/f3`）、總覽、圖鑑、接線 |
| `js/tutorial.js` | 教學（`data-tut` 高亮、可跳過、進度存在存檔） |
| `js/audio.js` | WebAudio 合成音效與靜音（localStorage `waferEmpire.mute`） |
| `js/shared/` | `bus`、`rng`、`storage`（存檔）、`content`（載入 content.json） |
| `js/tycoon/` | 經營層：狀態、時鐘、模擬、事件、HUD、產線畫面、解鎖面板、`bridge.js`（`window.EmpireBridge`） |
| `js/puzzle/` | 解謎層：`engine.js`（純函式）、`renderer.js`、`ui.js`、`levels.json`（21 關）；註冊 `window.startPuzzleSet` |
| `css/base.css` | 共用設計代幣 `--we-*`（深色科技底 + 無塵室黃光）與外殼樣式 `.we-` |
| `css/tycoon.css`、`css/puzzle.css` | 各層樣式（前綴 `.ty-` / `.pz-`），顏色讀取 `--we-*` |
| `data/` | `content.json`（知識）、`balance.json`、`events.json` |
| `tycoon-dev.html`、`puzzle-dev.html` | 各層獨立開發頁 |

## 測試

```bash
node js/tycoon/economy.test.js
node js/puzzle/levels.test.js
```
