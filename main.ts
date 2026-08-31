import { FileSystemAdapter, MarkdownView, normalizePath, Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { CodexChatView, CODEX_VIEW_TYPE } from "./src/chat-view";
import { CodexClient } from "./src/codex-client";
import type { CodexProgressEvent } from "./src/codex-events";
import { ConversationRepository, loadPluginSettings } from "./src/conversation-store";
import { exportConversationMarkdown, safeExportBasename } from "./src/conversation-utils";
import { CodexSettingTab } from "./src/settings-tab";
import type { ChatMessage, Conversation, PluginSettings } from "./src/types";

export default class CodexWorkspacePlugin extends Plugin {
  declare settings: PluginSettings;
  readonly codex = new CodexClient();
  private conversations!: ConversationRepository;
  private lastMarkdownView: MarkdownView | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();

    this.rememberMarkdownView(this.app.workspace.activeLeaf);
    this.registerEvent(
      this.app.workspace.on("active-leaf-change", (leaf) => this.rememberMarkdownView(leaf))
    );

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

  getContextMarkdownView(): MarkdownView | null {
    const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView?.file) {
      this.lastMarkdownView = activeView;
      return activeView;
    }

    if (this.lastMarkdownView?.file) return this.lastMarkdownView;

    const fallback = this.app.workspace
      .getLeavesOfType("markdown")
      .map((leaf) => leaf.view)
      .find((view): view is MarkdownView => view instanceof MarkdownView && view.file !== null);
    this.lastMarkdownView = fallback ?? null;
    return this.lastMarkdownView;
  }

  get activeConversation(): Conversation {
    return this.conversations.active;
  }

  get allConversations(): readonly Conversation[] {
    return this.settings.conversations;
  }

  async selectConversation(id: string): Promise<Conversation> {
    const conversation = this.conversations.select(id);
    await this.persistSettings();
    return conversation;
  }

  async renameConversation(id: string, title: string): Promise<Conversation> {
    const conversation = this.conversations.rename(id, title);
    await this.persistSettings();
    return conversation;
  }

  async setConversationArchived(id: string, archived: boolean): Promise<Conversation> {
    const conversation = this.conversations.setArchived(id, archived);
    await this.persistSettings();
    return conversation;
  }

  async deleteConversation(id: string): Promise<void> {
    this.conversations.delete(id);
    await this.persistSettings();
  }

  async exportConversation(id: string): Promise<string> {
    const conversation = this.settings.conversations.find((item) => item.id === id);
    if (!conversation) throw new Error("找不到指定的對話。");
    const folder = "Codex exports";
    if (!this.app.vault.getAbstractFileByPath(folder)) await this.app.vault.createFolder(folder);
    const base = safeExportBasename(conversation.title);
    let path = normalizePath(`${folder}/${base}.md`);
    let suffix = 2;
    while (this.app.vault.getAbstractFileByPath(path)) {
      path = normalizePath(`${folder}/${base} ${suffix}.md`);
      suffix += 1;
    }
    await this.app.vault.create(path, exportConversationMarkdown(conversation));
    return path;
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

    const conversation = this.activeConversation;
    return await this.codex.send(prompt, adapter.getBasePath(), {
      codexPath: this.settings.codexPath,
      sandboxMode: this.settings.sandboxMode,
      approveForMe: this.settings.approveForMe,
      sessionId: conversation.threadId
    }, {
      onThreadId: (threadId) => {
        if (conversation.threadId !== threadId) {
          conversation.threadId = threadId;
          conversation.updatedAt = Date.now();
          void this.persistSettings();
        }
      },
      onStatus,
      onProgress
    });
  }

  async startNewChat(): Promise<Conversation> {
    const conversation = this.conversations.create();
    await this.persistSettings();
    new Notice("已開始新的 Codex 對話。", 3000);
    return conversation;
  }

  createMessage(role: ChatMessage["role"], text: string): ChatMessage {
    return {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      text,
      createdAt: Date.now()
    };
  }

  appendMessage(message: ChatMessage): Conversation {
    return this.conversations.appendMessage(message);
  }

  async persistSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async loadSettings(): Promise<void> {
    const loaded = loadPluginSettings(await this.loadData());
    this.settings = loaded.settings;
    this.conversations = new ConversationRepository(this.settings);
    if (loaded.migratedLegacy || loaded.recoveredRecords > 0) {
      await this.persistSettings();
      if (loaded.recoveredRecords > 0) {
        new Notice(`已略過 ${loaded.recoveredRecords} 筆無法辨識的舊對話資料。`, 8000);
      }
    }
  }

  private rememberMarkdownView(leaf: WorkspaceLeaf | null): void {
    if (leaf?.view instanceof MarkdownView && leaf.view.file) {
      this.lastMarkdownView = leaf.view;
    }
  }
}
