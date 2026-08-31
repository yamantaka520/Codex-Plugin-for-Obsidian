<p align="center">
  <img src="assets/codex-for-obsidian-hero.png" alt="Codex Workspace 將知識庫與 AI 助理面板連接" width="100%">
</p>

<h1 align="center">Codex Workspace</h1>

<p align="center">把現有 Codex CLI 對話帶進 Obsidian——不需 API Key，也不嵌入網頁。</p>

<p align="center">
  <a href="README.md">English</a> · <strong>繁體中文</strong> ·
  <a href="README.zh-CN.md">简体中文</a> · <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a>
</p>

> [!IMPORTANT]
> Codex Workspace 是獨立的社群專案，並非 Obsidian 或 OpenAI 的官方產品，也未獲其背書。

## 讓 Vault 成為可對話的工作空間

點擊 Obsidian 左側 Ribbon 的 Codex 圖示，右側即開啟持續對話面板。外掛使用你已安裝並登入的
Codex CLI，並把目前 Vault 當作工作目錄。

你可以要求 Codex：

- 整理會議筆記並建立索引；
- 連結分散於 Markdown 檔案中的相關想法；
- 摘要研究資料夾並找出待解問題；
- 重構 frontmatter、Wiki 連結與命名規則；
- 共同制定計畫或尋找複雜問題的解法；
- 使用現有 Codex 設定中的技能、外掛與 MCP 整合。

## 核心功能

| 功能 | 說明 |
| --- | --- |
| 沿用 Codex 登入 | 使用本機 Codex CLI／ChatGPT 登入，不要求或保存 API Key。 |
| 原生右側面板 | 從左側 Ribbon 開啟 Obsidian 原生 `ItemView`。 |
| 多輪對話 | 透過 `codex exec resume` 延續同一個 session。 |
| 理解 Vault | 以目前本機 Vault 作為工作目錄。 |
| 權限控制 | 可選擇唯讀分析或允許工作區寫入。 |
| 本機記錄 | 面板訊息與 Codex session ID 只保存於外掛資料。 |

## 系統需求

- Obsidian 桌面版 1.7.2 或更新版本。
- 已安裝 Codex CLI，並以 `codex` 完成登入。
- 目前版本支援 macOS／Linux；Windows 尚未驗證。

## 安裝

1. 從[最新 Release](https://github.com/yamantaka520/Codex-Plugin-for-Obsidian/releases/latest)
   下載 `manifest.json`、`main.js`、`styles.css`。
2. 建立 `<Vault>/.obsidian/plugins/codex-workspace/`。
3. 將三個檔案放入該資料夾。
4. 重新啟動 Obsidian。
5. 進入「設定 → 第三方外掛」，啟用 **Codex Workspace**。

也可以透過 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 安裝 public beta。

## 使用方式

1. 點擊 Obsidian 左側 Ribbon 的機器人圖示。
2. 在右側面板輸入需求。
3. 按 <kbd>Enter</kbd> 傳送；<kbd>Shift</kbd> + <kbd>Enter</kbd> 換行。
4. 使用「停止」終止目前 turn，或點擊新對話圖示重設 session。

## 權限與隱私

- **需要帳號：**完整功能需要已登入的本機 Codex CLI／ChatGPT 帳號。
- **網路使用：**外掛只啟動 Codex CLI；CLI 依你的 Codex 設定與 OpenAI 服務連線。外掛本身不呼叫 OpenAI API。
- **Vault 外存取：**外掛會啟動 Vault 外的 Codex 執行檔；CLI 使用自己的設定與認證目錄。外掛不讀取或複製憑證。
- **Vault 權限：**預設 `workspace-write`，只允許目前 Vault；若只需分析，可在設定改成 `read-only`。
- **核准：**預設使用 `--approve-for-me` 讓非互動 turn 經 Codex 自動審核；絕不啟用危險的 sandbox bypass。
- **本機資料：**可見訊息與 session ID 保存在 Obsidian 外掛資料；沒有 client-side telemetry 或廣告。

執行重要修改前，建議先使用 Git 或備份建立還原點。詳情請見 [SECURITY.md](SECURITY.md)。

## 目前限制與 Roadmap

下一階段的里程碑與驗收條件請見[執行規劃](docs/NEXT_PHASE.md)。

0.3.0 是早期 public beta：一次只執行一個 Codex turn，已支援安全進度、多個具名對話、本機搜尋、封存、
Markdown 匯出與確認刪除；只支援本機檔案 Vault，Windows 驗證仍在進行中。

- [x] 在面板串流不洩漏原始 command payload 的安全進度與 tool event。
- [x] 多個具名對話與歷史管理。
- [x] 明確加入目前筆記或選取文字，並在傳送前於本機預覽。
- [ ] 檔案異動 review 與接受／拒絕操作。
- [ ] 完成跨平台 GUI 測試。
- [x] 已提交 Obsidian Community Directory；自動審查通過，人工審查已送出。

## 開發

```bash
npm install
npm run build
npm test
npm audit --omit=dev
```

請先閱讀 [CONTRIBUTING.md](CONTRIBUTING.md)。本專案採 [MIT License](LICENSE)。
