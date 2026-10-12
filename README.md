<div align="center">

<img src="images/cover.svg" width="200" alt="A silicon wafer covered with dies">

# 半導體製造概論<br>Introduction to Semiconductor Manufacturing

## [繁體中文](zh-TW/README.md) ｜ [English](en/README.md) ｜ [日本語](ja/README.md) ｜ [한국어](ko/README.md)

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](LICENSE)
![Chapters](https://img.shields.io/badge/chapters-25-blue.svg)
![Languages](https://img.shields.io/badge/languages-zh--TW%20%7C%20en%20%7C%20ja%20%7C%20ko-red.svg)
[![Contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

An open, beginner-friendly book that follows one silicon wafer from sand, through the fab, test and packaging, until it becomes a chip. It skips heavy physics and focuses on process flow, terminology and know-how from the fab floor, with term boxes and know-how boxes in every chapter. No background in semiconductor physics is needed.

## 🎮 晶圓帝國 Wafer Empire

A free browser game that goes with the book: run a fab, solve process-flow puzzles (deposition, lithography, etching, implant, CMP, metallization) and unlock more advanced nodes, learning real fab facts along the way. Plays on phones and desktops, no install needed.

- **Play:** <https://paul931130.github.io/Semiconductor_Manufacturing_Introduction/empire/>
- **Run locally:**

  ```bash
  python -m http.server 8000 --directory empire
  # then open http://localhost:8000/
  ```

  (Use a local server rather than double-clicking `index.html`, because the game loads JSON files with `fetch`.)

More details are in [empire/README.md](empire/README.md).

---

## 目錄 · Contents · 目次 · 목차

### 第 0 部　開始之前 · Part 0: Before You Start · 第 0 部　はじめる前に · 제0부 시작하기 전에

| 章 | 繁體中文 | English | 日本語 | 한국어 |
|:---:|---|---|---|---|
| 0 | [半導體製造全景](zh-TW/0-before-you-start/00-overview/README.md) | [The Big Picture](en/0-before-you-start/00-overview/README.md) | [半導体製造の全体像](ja/0-before-you-start/00-overview/README.md) | [반도체 제조의 전체 그림](ko/0-before-you-start/00-overview/README.md) |
| 1 | [晶圓廠如何運作](zh-TW/0-before-you-start/01-how-a-fab-works/README.md) | [How a Fab Works](en/0-before-you-start/01-how-a-fab-works/README.md) | [ファブの仕組み](ja/0-before-you-start/01-how-a-fab-works/README.md) | [팹은 어떻게 돌아가는가](ko/0-before-you-start/01-how-a-fab-works/README.md) |

### 第 1 部　基礎 · Part 1: Fundamentals · 第 1 部　基礎 · 제1부 기초

| 章 | 繁體中文 | English | 日本語 | 한국어 |
|:---:|---|---|---|---|
| 2 | [從物理到電晶體](zh-TW/1-fundamentals/02-transistor-basics/README.md) | [From Physics to Transistors](en/1-fundamentals/02-transistor-basics/README.md) | [物理からトランジスタへ](ja/1-fundamentals/02-transistor-basics/README.md) | [물리에서 트랜지스터까지](ko/1-fundamentals/02-transistor-basics/README.md) |
| 3 | [從沙子到晶圓](zh-TW/1-fundamentals/03-sand-to-wafer/README.md) | [From Sand to Wafer](en/1-fundamentals/03-sand-to-wafer/README.md) | [砂からウェーハへ](ja/1-fundamentals/03-sand-to-wafer/README.md) | [모래에서 웨이퍼까지](ko/1-fundamentals/03-sand-to-wafer/README.md) |

### 第 2 部　製程模組 · Part 2: Process Modules · 第 2 部　プロセスモジュール · 제2부 공정 모듈

| 章 | 繁體中文 | English | 日本語 | 한국어 |
|:---:|---|---|---|---|
| 4 | [微影](zh-TW/2-process-modules/04-lithography/README.md) | [Lithography](en/2-process-modules/04-lithography/README.md) | [リソグラフィ](ja/2-process-modules/04-lithography/README.md) | [리소그래피](ko/2-process-modules/04-lithography/README.md) |
| 5 | [薄膜](zh-TW/2-process-modules/05-thin-films/README.md) | [Thin Films](en/2-process-modules/05-thin-films/README.md) | [薄膜](ja/2-process-modules/05-thin-films/README.md) | [박막](ko/2-process-modules/05-thin-films/README.md) |
| 6 | [蝕刻](zh-TW/2-process-modules/06-etching/README.md) | [Etching](en/2-process-modules/06-etching/README.md) | [エッチング](ja/2-process-modules/06-etching/README.md) | [식각](ko/2-process-modules/06-etching/README.md) |
| 7 | [離子佈植與熱處理](zh-TW/2-process-modules/07-ion-implantation/README.md) | [Ion Implantation and Thermal Processing](en/2-process-modules/07-ion-implantation/README.md) | [イオン注入と熱処理](ja/2-process-modules/07-ion-implantation/README.md) | [이온 주입과 열처리](ko/2-process-modules/07-ion-implantation/README.md) |
| 8 | [CMP](zh-TW/2-process-modules/08-cmp/README.md) | [CMP](en/2-process-modules/08-cmp/README.md) | [CMP](ja/2-process-modules/08-cmp/README.md) | [CMP](ko/2-process-modules/08-cmp/README.md) |
| 9 | [清洗與污染控制](zh-TW/2-process-modules/09-cleaning/README.md) | [Cleaning and Contamination Control](en/2-process-modules/09-cleaning/README.md) | [洗浄と汚染管理](ja/2-process-modules/09-cleaning/README.md) | [세정과 오염 관리](ko/2-process-modules/09-cleaning/README.md) |
| 10 | [金屬化](zh-TW/2-process-modules/10-metallization/README.md) | [Metallization](en/2-process-modules/10-metallization/README.md) | [メタライゼーション](ja/2-process-modules/10-metallization/README.md) | [금속 배선](ko/2-process-modules/10-metallization/README.md) |

### 第 3 部　製程整合 · Part 3: Process Integration · 第 3 部　プロセスインテグレーション · 제3부 공정 통합

| 章 | 繁體中文 | English | 日本語 | 한국어 |
|:---:|---|---|---|---|
| 11 | [走一遍完整的 CMOS 流程](zh-TW/3-integration/11-cmos-process-flow/README.md) | [A Complete CMOS Process Flow](en/3-integration/11-cmos-process-flow/README.md) | [CMOS プロセスフローを一通り](ja/3-integration/11-cmos-process-flow/README.md) | [CMOS 공정 흐름 한눈에 보기](ko/3-integration/11-cmos-process-flow/README.md) |
| 12 | [先進電晶體結構](zh-TW/3-integration/12-advanced-transistors/README.md) | [Advanced Transistor Structures](en/3-integration/12-advanced-transistors/README.md) | [先端トランジスタ構造](ja/3-integration/12-advanced-transistors/README.md) | [첨단 트랜지스터 구조](ko/3-integration/12-advanced-transistors/README.md) |
| 13 | [記憶體製程](zh-TW/3-integration/13-memory/README.md) | [Memory Processes](en/3-integration/13-memory/README.md) | [メモリのプロセス](ja/3-integration/13-memory/README.md) | [메모리 공정](ko/3-integration/13-memory/README.md) |
| 14 | [「幾奈米」是什麼意思](zh-TW/3-integration/14-process-nodes/README.md) | [What Does "3 nm" Really Mean?](en/3-integration/14-process-nodes/README.md) | [「何ナノ」とは何か](ja/3-integration/14-process-nodes/README.md) | ['몇 나노'란 무엇인가](ko/3-integration/14-process-nodes/README.md) |

### 第 4 部　品質與良率 · Part 4: Quality and Yield · 第 4 部　品質と歩留まり · 제4부 품질과 수율

| 章 | 繁體中文 | English | 日本語 | 한국어 |
|:---:|---|---|---|---|
| 15 | [量測與檢測](zh-TW/4-yield-and-quality/15-metrology/README.md) | [Metrology and Inspection](en/4-yield-and-quality/15-metrology/README.md) | [計測と検査](ja/4-yield-and-quality/15-metrology/README.md) | [계측과 검사](ko/4-yield-and-quality/15-metrology/README.md) |
| 16 | [良率與故障分析](zh-TW/4-yield-and-quality/16-yield-analysis/README.md) | [Yield and Failure Analysis](en/4-yield-and-quality/16-yield-analysis/README.md) | [歩留まりと故障解析](ja/4-yield-and-quality/16-yield-analysis/README.md) | [수율과 불량 분석](ko/4-yield-and-quality/16-yield-analysis/README.md) |
| 17 | [製程控制](zh-TW/4-yield-and-quality/17-process-control/README.md) | [Process Control](en/4-yield-and-quality/17-process-control/README.md) | [プロセス制御](ja/4-yield-and-quality/17-process-control/README.md) | [공정 제어](ko/4-yield-and-quality/17-process-control/README.md) |
| 18 | [異常處理與工程變更](zh-TW/4-yield-and-quality/18-abnormality-handling/README.md) | [Handling Abnormalities and Engineering Changes](en/4-yield-and-quality/18-abnormality-handling/README.md) | [異常処置と変更管理](ja/4-yield-and-quality/18-abnormality-handling/README.md) | [이상 처리와 엔지니어링 변경](ko/4-yield-and-quality/18-abnormality-handling/README.md) |

### 第 5 部　後段：測試與封裝 · Part 5: Back End — Test and Packaging · 第 5 部　後工程：テストとパッケージング · 제5부 후공정: 테스트와 패키징

| 章 | 繁體中文 | English | 日本語 | 한국어 |
|:---:|---|---|---|---|
| 19 | [晶圓測試](zh-TW/5-backend/19-wafer-test/README.md) | [Wafer Test](en/5-backend/19-wafer-test/README.md) | [ウェーハテスト](ja/5-backend/19-wafer-test/README.md) | [웨이퍼 테스트](ko/5-backend/19-wafer-test/README.md) |
| 20 | [封裝](zh-TW/5-backend/20-packaging/README.md) | [Packaging](en/5-backend/20-packaging/README.md) | [パッケージング](ja/5-backend/20-packaging/README.md) | [패키징](ko/5-backend/20-packaging/README.md) |
| 21 | [先進封裝](zh-TW/5-backend/21-advanced-packaging/README.md) | [Advanced Packaging](en/5-backend/21-advanced-packaging/README.md) | [先端パッケージング](ja/5-backend/21-advanced-packaging/README.md) | [첨단 패키징](ko/5-backend/21-advanced-packaging/README.md) |
| 22 | [最終測試與可靠度](zh-TW/5-backend/22-final-test-and-reliability/README.md) | [Final Test and Reliability](en/5-backend/22-final-test-and-reliability/README.md) | [最終テストと信頼性](ja/5-backend/22-final-test-and-reliability/README.md) | [최종 테스트와 신뢰성](ko/5-backend/22-final-test-and-reliability/README.md) |

### 第 6 部　走出晶圓廠 · Part 6: Beyond the Fab · 第 6 部　ファブの外へ · 제6부 팹 밖으로

| 章 | 繁體中文 | English | 日本語 | 한국어 |
|:---:|---|---|---|---|
| 23 | [工廠如何被系統管理](zh-TW/6-beyond-the-fab/23-fab-systems/README.md) | [How Systems Run the Fab](en/6-beyond-the-fab/23-fab-systems/README.md) | [システムによるファブ運営](ja/6-beyond-the-fab/23-fab-systems/README.md) | [시스템이 팹을 운영하는 방법](ko/6-beyond-the-fab/23-fab-systems/README.md) |
| 24 | [製程如何影響韌體](zh-TW/6-beyond-the-fab/24-process-and-firmware/README.md) | [How the Process Shapes Firmware](en/6-beyond-the-fab/24-process-and-firmware/README.md) | [プロセスとファームウェア](ja/6-beyond-the-fab/24-process-and-firmware/README.md) | [공정이 펌웨어에 미치는 영향](ko/6-beyond-the-fab/24-process-and-firmware/README.md) |

### 附錄 · Appendices · 付録 · 부록

| | 繁體中文 | English | 日本語 | 한국어 |
|:---:|---|---|---|---|
| A | [術語總表](zh-TW/appendix/glossary.md) | [Glossary](en/appendix/glossary.md) | [用語集](ja/appendix/glossary.md) | [용어집](ko/appendix/glossary.md) |
| B | [現場行話](zh-TW/appendix/fab-jargon.md) | [Fab Jargon](en/appendix/fab-jargon.md) | [現場用語](ja/appendix/fab-jargon.md) | [현장 용어](ko/appendix/fab-jargon.md) |
| C | [延伸閱讀](zh-TW/appendix/further-reading.md) | [Further Reading](en/appendix/further-reading.md) | [参考文献](ja/appendix/further-reading.md) | [참고 자료](ko/appendix/further-reading.md) |

---

## Reading paths

| Path | Chapters |
|---|---|
| 🚀 Quick overview | 0, 1, 11, 14 |
| 💻 Software and firmware engineers | 0, 2, 11, 13, 14, 22, 23, 24 |
| 🏭 Joining the industry | The whole book, especially 1, 11, 15–18 and Appendix B |
| 📦 Packaging and test | 0, 11, 19–22 |

---

## Contributing

- **Found a mistake?** Open an [issue](../../issues) with the "Erratum" template.
- **Want to add content or figures?** Read the [contributing guide](CONTRIBUTING.md) and the [style guide](STYLE_GUIDE.md).
- **Want to translate the book into another language?** Read the [translation guide](TRANSLATIONS.md).

The original text is written in Traditional Chinese, and the other languages are translations of it. If this book helps you, please give it a ⭐ star so that more people can find it.

---

## Disclaimer

This book is based on public information and general industry knowledge. It contains no confidential information, process parameters or internal procedures of any company, and it is not affiliated with any semiconductor company. Most numbers are orders of magnitude or approximate values; actual values vary by process, product and company.

## License

The text and images are licensed under [CC BY-NC-SA 4.0](LICENSE). You may share, adapt and translate them for non-commercial purposes, as long as you give credit and share your work under the same license.
