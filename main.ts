import { FileSystemAdapter, Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { CodexChatView, CODEX_VIEW_TYPE } from "./src/chat-view";
import { CodexClient } from "./src/codex-client";
import type { CodexProgressEvent } from "./src/codex-events";
import { CodexSettingTab } from "./src/settings-tab";
import type { ChatMessage, PluginSettings } from "./src/types";

const DEFAULT_SETTINGS: PluginSettings = {
  codexPath: "codex",
  sandboxMode: "workspace-write",
  approveForMe: true,
  sessionId: null,
  messages: []
};

export default class CodexWorkspacePlugin extends Plugin {
  declare settings: PluginSettings;
  readonly codex = new CodexClient();

  async onload(): Promise<void> {
    await this.loadSettings();

    this.registerView(
      CODEX_VIEW_TYPE,
      (leaf: WorkspaceLeaf) => new CodexChatView(leaf, this)
    );

    this.addRibbonIcon("bot", "開啟 Codex", () => void this.activateView());
    this.addCommand({
      id: "open-codex-chat",
      name: "開啟 Codex 對話",
      callback: () => void this.activateView()
    });
    this.addCommand({
      id: "new-codex-chat",
      name: "開始新的 Codex 對話",
      callback: async () => {
        await this.startNewChat();
        await this.activateView();
      }
    });
    this.addSettingTab(new CodexSettingTab(this.app, this));
  }

  onunload(): void {
    this.codex.stop();
  }

  async activateView(): Promise<void> {
    const workspace = this.app.workspace;
    let leaf = workspace.getLeavesOfType(CODEX_VIEW_TYPE)[0];
    if (!leaf) {
      leaf = workspace.getRightLeaf(false) ?? workspace.getLeaf("split", "vertical");
      await leaf.setViewState({ type: CODEX_VIEW_TYPE, active: true });
    }
    await workspace.revealLeaf(leaf);
  }

  async sendToCodex(
    prompt: string,
    onStatus: (status: string) => void,
    onProgress: (event: CodexProgressEvent) => void
  ): Promise<string> {
    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof FileSystemAdapter)) {
      throw new Error("Codex CLI 僅支援使用本機檔案系統的 Obsidian Vault。");
    }

    return await this.codex.send(prompt, adapter.getBasePath(), this.settings, {
      onThreadId: (threadId) => {
        if (this.settings.sessionId !== threadId) {
          this.settings.sessionId = threadId;
          void this.persistSettings();
        }
      },
      onStatus,
      onProgress
    });
  }

  async startNewChat(): Promise<void> {
    this.settings.sessionId = null;
    this.settings.messages = [];
    await this.persistSettings();
    new Notice("已開始新的 Codex 對話。", 3000);
  }

  createMessage(role: ChatMessage["role"], text: string): ChatMessage {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      text,
      createdAt: Date.now()
    };
  }

  async persistSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async loadSettings(): Promise<void> {
    const stored = (await this.loadData()) as Partial<PluginSettings> | null;
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(stored ?? {}),
      messages: Array.isArray(stored?.messages) ? stored.messages : []
    };
  }
}
