<p align="center"><img src="assets/codex-for-obsidian-hero.png" alt="Codex Workspace 连接知识库与 AI 助手面板" width="100%"></p>

<h1 align="center">Codex Workspace</h1>
<p align="center">把现有 Codex CLI 会话带进 Obsidian——无需 API Key，也不嵌入网页。</p>
<p align="center"><a href="README.md">English</a> · <a href="README.zh-TW.md">繁體中文</a> · <strong>简体中文</strong> · <a href="README.ja.md">日本語</a> · <a href="README.ko.md">한국어</a></p>

> [!IMPORTANT]
> Codex Workspace 是独立社区项目，并非 Obsidian 或 OpenAI 的官方产品，也未获其背书。

## 让 Vault 成为可对话的工作空间

点击 Obsidian 左侧 Ribbon 的 Codex 图标，右侧会打开持续对话面板。插件使用你已经安装并登录的
Codex CLI，并将当前 Vault 作为工作目录。

你可以让 Codex 整理会议笔记、连接相关想法、总结研究资料、重构 frontmatter 与 Wiki 链接、共同制定计划，
或使用现有 Codex 配置中的技能、插件和 MCP 集成寻找解决方案。

## 核心功能

| 功能 | 说明 |
| --- | --- |
| 沿用 Codex 登录 | 使用本机 Codex CLI／ChatGPT 登录，不要求或保存 API Key。 |
| 原生右侧面板 | 从左侧 Ribbon 打开 Obsidian 原生 `ItemView`。 |
| 多轮对话 | 通过 `codex exec resume` 延续同一 session。 |
| 理解 Vault | 以当前本机 Vault 作为工作目录。 |
| 权限控制 | 可选择只读分析或允许工作区写入。 |
| 本地记录 | 面板消息与 Codex session ID 只保存在插件数据中。 |

## 系统要求与安装

- Obsidian 桌面版 1.7.2 或更高版本。
- 已安装 Codex CLI，并通过 `codex` 完成登录。
- 当前版本支持 macOS／Linux；Windows 尚未验证。

从[最新 Release](https://github.com/yamantaka520/Codex-Plugin-for-Obsidian/releases/latest)
下载 `manifest.json`、`main.js`、`styles.css`，放入
`<Vault>/.obsidian/plugins/codex-workspace/`，重启 Obsidian 后在“设置 → 第三方插件”启用
**Codex Workspace**。也可以使用 [BRAT](https://github.com/TfTHacker/obsidian42-brat) 安装 beta。

## 使用方法

点击左侧机器人图标，在右侧面板输入需求。<kbd>Enter</kbd> 发送，
<kbd>Shift</kbd> + <kbd>Enter</kbd> 换行。“停止”会终止当前 turn，新会话图标会重置 session。

## 权限与隐私

- **需要账户：**完整功能需要已登录的本机 Codex CLI／ChatGPT 账户。
- **网络使用：**插件只启动 Codex CLI；CLI 按你的配置连接 OpenAI 服务。插件本身不调用 OpenAI API。
- **Vault 外访问：**插件会启动 Vault 外的 Codex 可执行文件；CLI 使用自己的配置和认证目录。插件不读取或复制凭据。
- **Vault 权限：**默认 `workspace-write`，只允许当前 Vault；也可切换到 `read-only`。
- **审批：**默认 `--approve-for-me`，但绝不启用危险的 sandbox bypass。
- **本地数据：**消息与 session ID 保存在本地插件数据中；没有客户端遥测或广告。

重要修改前请先使用 Git 或备份。详情见 [SECURITY.md](SECURITY.md)。

## 当前限制与 Roadmap

0.1.1 是早期 public beta：一次只执行一个 Codex turn、尚未流式显示 tool event、只支持本地文件 Vault，
完整 GUI E2E 与 Windows 验证仍在进行中。后续将加入多会话、当前笔记 context、文件变更 review，
并继续处理 Obsidian Community Directory 自动审查。详见[下一阶段执行计划](docs/NEXT_PHASE.md)。

## 开发

```bash
npm install
npm run build
npm test
npm audit --omit=dev
```

请先阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。项目采用 [MIT License](LICENSE)。
