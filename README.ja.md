<p align="center"><img src="assets/codex-for-obsidian-hero.png" alt="Codex Workspace がナレッジ Vault と AI アシスタントを接続" width="100%"></p>

<h1 align="center">Codex Workspace</h1>
<p align="center">既存の Codex CLI セッションを Obsidian へ。API キーも埋め込み Web ページも不要です。</p>
<p align="center"><a href="README.md">English</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.zh-CN.md">简体中文</a> · <strong>日本語</strong> · <a href="README.ko.md">한국어</a></p>

> [!IMPORTANT]
> Codex Workspace は独立したコミュニティプロジェクトです。Obsidian または OpenAI の公式製品・提携製品ではありません。

## Vault を会話型ワークスペースに

Obsidian 左側 Ribbon の Codex アイコンをクリックすると、右サイドバーに継続的な会話パネルが開きます。
インストール・ログイン済みの Codex CLI を使い、現在の Vault を作業ディレクトリとして実行します。

会議ノートの整理、Markdown 間の関連付け、研究フォルダの要約、frontmatter や Wiki リンクの整理、
問題解決の共同検討、既存の Codex skills／plugins／MCP の利用を依頼できます。

## 主な機能

| 機能 | 内容 |
| --- | --- |
| 既存ログイン | ローカルの Codex CLI／ChatGPT ログインを利用し、API キーを要求・保存しません。 |
| ネイティブパネル | 左 Ribbon から Obsidian の右側 `ItemView` を開きます。 |
| 複数ターン | `codex exec resume` で同じ session を継続します。 |
| Vault 対応 | 現在のローカル Vault を作業ディレクトリにします。 |
| 権限制御 | 読み取り専用または workspace-write を選択できます。 |
| ローカル履歴 | メッセージと session ID はプラグインデータにのみ保存します。 |

## 必要環境とインストール

- Obsidian Desktop 1.7.2 以降。
- Codex CLI をインストールし、`codex` でログイン済みであること。
- 現在は macOS／Linux を対象とし、Windows は未検証です。

[最新 Release](https://github.com/yamantaka520/Codex-Plugin-for-Obsidian/releases/latest) から
`manifest.json`、`main.js`、`styles.css` をダウンロードし、
`<Vault>/.obsidian/plugins/codex-workspace/` に配置します。Obsidian を再起動し、
**Settings → Community plugins** から **Codex Workspace** を有効化してください。
[BRAT](https://github.com/TfTHacker/obsidian42-brat) でも beta を導入できます。

## 権限とプライバシー

- **アカウント：**完全な機能にはログイン済み Codex CLI／ChatGPT アカウントが必要です。
- **ネットワーク：**プラグインは Codex CLI を起動し、CLI が設定に従って OpenAI サービスと通信します。プラグイン自身は OpenAI API を呼びません。
- **Vault 外アクセス：**Vault 外の Codex 実行ファイルを起動します。CLI は自身の設定・認証ディレクトリを使い、プラグインは認証情報を読み取り・コピーしません。
- **Vault 権限：**既定は現在の Vault 内に限定された `workspace-write`。分析のみなら `read-only` に変更できます。
- **承認：**既定は `--approve-for-me` ですが、危険な sandbox bypass は使用しません。
- **ローカルデータ：**メッセージと session ID はローカルに保存し、クライアントテレメトリや広告はありません。

重要な変更前には Git またはバックアップを利用してください。詳細は [SECURITY.md](SECURITY.md) を参照してください。

## 現在の制限

0.2.0 は初期 public beta です。同時実行は 1 turn、安全な progress event ストリーミングに対応し、
ローカル Vault のみ対応です。今後は複数会話、現在ノートの context、変更 review、Windows 検証、
Obsidian Community Directory の自動レビュー対応を進めます。詳細は[次フェーズ計画](docs/NEXT_PHASE.md)をご覧ください。

## 開発

```bash
npm install
npm run build
npm test
npm audit --omit=dev
```

[CONTRIBUTING.md](CONTRIBUTING.md) を確認してください。ライセンスは [MIT](LICENSE) です。
