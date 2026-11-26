# 圖片 / Images

全書共用的圖片都放在這個資料夾。中文版、英文版和之後的每一種語言都使用同一套圖片，所以**圖上不放文字**；需要標示時使用數字編號，在各語言的圖說中解釋。

All images are shared by every language version, so **images contain no text**. Use numbers as labels and explain them in the caption of each language.

---

## 規範 / Guidelines

| 項目 Item | 規則 Rule |
|---|---|
| 格式 Format | 優先使用 SVG；照片或截圖使用 PNG / SVG preferred; PNG for photos and screenshots |
| 檔名 File name | 「章節編號-描述」，例如 `17-wafer-map-patterns.svg` / chapter number and description |
| 文字 Text | 圖上不放文字，只用數字編號 / No text in images, numbers only |
| 顏色 Color | 在 GitHub 的淺色與深色主題下都要看得清楚，避免只靠紅綠色區分 / Readable in light and dark themes; never rely on red versus green alone |
| 授權 License | 只能使用自己繪製或授權相容的圖片 / Only images you drew yourself or that have a compatible license |

從章節引用圖片的寫法（每種語言的路徑都一樣） / Referencing an image from a chapter (the path is the same in every language):

```markdown
![替代文字 / alt text](../../../images/17-wafer-map-patterns.svg)
```

---

## 已完成的圖 / Finished images

| 檔案 File | 用在哪裡 Used in |
|---|---|
| `cover.svg` | 首頁封面 / Cover on the home pages |
| `17-wafer-map-patterns.svg` | 第 17 章，常見的晶圓圖型態 / Chapter 17, common wafer map patterns |
| `social-preview.png` | GitHub 社群預覽圖，在 Settings → General → Social preview 上傳。只用於社群分享，所以含有文字 / GitHub social preview, uploaded under Settings → General → Social preview. It contains text because it is only used for sharing |

---

## 待補的圖 / Figures to draw

以下是中文原文中以 `<!-- 圖：… -->` 標記、還沒有畫好的圖（英文版對應的標記是 `<!-- Figure: … -->`）。完成一張圖之後，把兩種語言章節中的註解都換成圖片與圖說，並更新這份清單。

These are the figures still marked as placeholders in the original (`<!-- Figure: … -->` in the English version). When a figure is done, replace the placeholder with the image and a caption in every language, and update this list.

```bash
python3 scripts/list_figures.py --markdown
```

- [ ] `zh-TW/0-before-you-start/00-overview/README.md`：晶片的一生全景圖（設計、光罩、晶圓廠、測試、封裝、出貨，依序排列）
- [ ] `zh-TW/0-before-you-start/00-overview/README.md`：晶圓、晶粒、晶片的關係（整片晶圓 → 放大一顆晶粒 → 封裝後的晶片）
- [ ] `zh-TW/0-before-you-start/01-how-a-fab-works/README.md`：晶圓廠剖面示意（上層空調與過濾、中層無塵室、下層管線與附屬設備）
- [ ] `zh-TW/0-before-you-start/01-how-a-fab-works/README.md`：天車在天花板軌道上，把 FOUP 放到機台 Load Port 的示意圖
- [ ] `zh-TW/1-fundamentals/02-transistor-basics/README.md`：MOSFET 剖面圖，標出源極、汲極、閘極、閘極氧化層、通道（以編號標示）
- [ ] `zh-TW/1-fundamentals/03-sand-to-wafer/README.md`：CZ 長晶示意（坩堝、熔融矽、晶種、旋轉上拉的晶棒）
- [ ] `zh-TW/2-process-modules/05-lithography/README.md`：攝影與微影的對照圖（光源、底片／光罩、鏡頭、相紙／光阻）
- [ ] `zh-TW/2-process-modules/05-lithography/README.md`：微影流程示意（塗佈、曝光、顯影三個階段的晶圓剖面）
- [ ] `zh-TW/2-process-modules/06-thin-films/README.md`：四種沉積方式的示意對照（熱氧化、CVD、PVD、ALD）
- [ ] `zh-TW/2-process-modules/07-etching/README.md`：等向蝕刻與非等向蝕刻的剖面對照（側壁形狀、光阻下方的側蝕）
- [ ] `zh-TW/2-process-modules/08-ion-implantation/README.md`：離子佈植機示意（離子源、質量分析磁鐵、加速段、掃描、晶圓）
- [ ] `zh-TW/2-process-modules/09-cmp/README.md`：CMP 機台示意（旋轉平台、研磨墊、研磨頭、研磨液噴嘴、修整器）
- [ ] `zh-TW/2-process-modules/09-cmp/README.md`：Dishing 與 Erosion 的剖面對照
- [ ] `zh-TW/2-process-modules/10-cleaning/README.md`：批次式濕式清洗槽與單片式旋轉清洗的對照
- [ ] `zh-TW/2-process-modules/11-metallization/README.md`：多層金屬導線剖面（下層細密、上層粗寬，層與層之間以導通孔連接）
- [ ] `zh-TW/2-process-modules/11-metallization/README.md`：雙大馬士革流程剖面（挖洞 → 阻障層 → 電鍍 → CMP → 覆蓋層）
- [ ] `zh-TW/3-integration/12-cmos-process-flow/README.md`：FEOL 剖面演進（隔離 → 井 → 閘極 → Spacer → 源汲極 → 金屬矽化物）
- [ ] `zh-TW/3-integration/13-advanced-transistors/README.md`：平面電晶體、FinFET、GAA 的立體對照（閘極包覆通道的面數）
- [ ] `zh-TW/3-integration/14-memory/README.md`：DRAM 記憶單元剖面（埋入式字元線、位元線、高聳的圓柱電容）
- [ ] `zh-TW/3-integration/14-memory/README.md`：3D NAND 剖面（交替堆疊層、垂直通道孔、邊緣的階梯結構）
- [ ] `zh-TW/3-integration/15-process-nodes/README.md`：閘極間距與金屬間距示意（從上方看的閘極與導線排列，標出間距）
- [ ] `zh-TW/4-yield-and-quality/16-metrology/README.md`：缺陷檢測流程（全片掃描 → 比對相鄰晶粒 → 標出差異 → 電子顯微鏡複檢）
- [ ] `zh-TW/4-yield-and-quality/17-yield-analysis/README.md`：同樣的缺陷分佈下，大晶粒與小晶粒的良率差異
- [ ] `zh-TW/4-yield-and-quality/18-process-control/README.md`：管制圖示意（中心線、管制界限、規格界限，以及超出界限和連續偏移的例子）
- [ ] `zh-TW/5-backend/20-wafer-test/README.md`：CP 測試示意（測試機、探針卡、針測機與晶圓的相對位置）
- [ ] `zh-TW/5-backend/21-packaging/README.md`：打線封裝剖面（晶粒、金屬線、導線架或基板、封膠）
- [ ] `zh-TW/5-backend/21-packaging/README.md`：覆晶封裝剖面（翻轉的晶粒、凸塊、底部填充、基板、錫球）
- [ ] `zh-TW/5-backend/22-advanced-packaging/README.md`：2.5D 封裝剖面（處理器與 HBM 並排於中介層上，中介層下方為基板）
- [ ] `zh-TW/5-backend/23-final-test-and-reliability/README.md`：浴缸曲線（早期失效期、穩定期、老化期）
