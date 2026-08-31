import { ItemView, MarkdownRenderer, Notice, setIcon, WorkspaceLeaf } from "obsidian";
import type CodexWorkspacePlugin from "../main";
import type { ChatMessage } from "./types";

export const CODEX_VIEW_TYPE = "codex-workspace-chat";

export class CodexChatView extends ItemView {
  private messagesEl!: HTMLElement;
  private inputEl!: HTMLTextAreaElement;
  private sendButton!: HTMLButtonElement;
  private stopButton!: HTMLButtonElement;
  private statusEl!: HTMLElement;

  constructor(leaf: WorkspaceLeaf, private readonly plugin: CodexWorkspacePlugin) {
    super(leaf);
  }

  getViewType(): string {
    return CODEX_VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Codex";
  }

  getIcon(): string {
    return "bot";
  }

  async onOpen(): Promise<void> {
    this.render();
    await this.renderMessages();
  }

  private render(): void {
    const root = this.contentEl;
    root.empty();
    root.addClass("codex-obsidian-view");

    const header = root.createDiv({ cls: "codex-obsidian-header" });
    const title = header.createDiv({ cls: "codex-obsidian-title" });
    const logo = title.createSpan({ cls: "codex-obsidian-logo" });
    setIcon(logo, "bot");
    title.createSpan({ text: "Codex" });

    const newChat = header.createEl("button", {
      cls: "clickable-icon codex-obsidian-icon-button",
      attr: { "aria-label": "開始新對話" }
    });
    setIcon(newChat, "square-pen");
    newChat.addEventListener("click", () => void this.startNewChat());

    this.statusEl = root.createDiv({ cls: "codex-obsidian-status" });
    this.setStatus(this.plugin.settings.sessionId ? "已連接既有對話" : "準備就緒");

    this.messagesEl = root.createDiv({ cls: "codex-obsidian-messages" });

    const composer = root.createDiv({ cls: "codex-obsidian-composer" });
    this.inputEl = composer.createEl("textarea", {
      cls: "codex-obsidian-input",
      attr: {
        placeholder: "請 Codex 整理筆記、分析資料或尋找解法…",
        rows: "3",
        "aria-label": "輸入給 Codex 的訊息"
      }
    });
    this.inputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void this.submit();
      }
    });

    const actions = composer.createDiv({ cls: "codex-obsidian-actions" });
    actions.createSpan({
      cls: "codex-obsidian-hint",
      text: this.plugin.settings.sandboxMode === "read-only" ? "唯讀" : "可編輯 Vault"
    });
    this.stopButton = actions.createEl("button", { text: "停止", cls: "mod-warning" });
    this.stopButton.hidden = true;
    this.stopButton.addEventListener("click", () => this.plugin.codex.stop());
    this.sendButton = actions.createEl("button", { text: "傳送", cls: "mod-cta" });
    this.sendButton.addEventListener("click", () => void this.submit());
  }

  private async renderMessages(): Promise<void> {
    this.messagesEl.empty();
    if (this.plugin.settings.messages.length === 0) {
      const empty = this.messagesEl.createDiv({ cls: "codex-obsidian-empty" });
      const icon = empty.createDiv({ cls: "codex-obsidian-empty-icon" });
      setIcon(icon, "sparkles");
      empty.createEl("h3", { text: "在 Obsidian 中與 Codex 協作" });
      empty.createEl("p", {
        text: "Codex 使用你現有的 CLI 登入，並以目前 Vault 作為工作區。"
      });
      return;
    }

    for (const message of this.plugin.settings.messages) {
      await this.appendMessage(message);
    }
    this.scrollToBottom();
  }

  private async appendMessage(message: ChatMessage): Promise<void> {
    const wrapper = this.messagesEl.createDiv({
      cls: `codex-obsidian-message is-${message.role}`
    });
    wrapper.createDiv({
      cls: "codex-obsidian-message-role",
      text: message.role === "user" ? "你" : message.role === "assistant" ? "Codex" : "系統"
    });
    const body = wrapper.createDiv({ cls: "codex-obsidian-message-body" });
    if (message.role === "assistant") {
      await MarkdownRenderer.render(this.app, message.text, body, "", this);
    } else {
      body.setText(message.text);
    }
  }

  private async submit(): Promise<void> {
    const prompt = this.inputEl.value.trim();
    if (!prompt || this.plugin.codex.running) return;

    this.inputEl.value = "";
    const userMessage = this.plugin.createMessage("user", prompt);
    this.plugin.settings.messages.push(userMessage);
    await this.plugin.persistSettings();
    await this.appendMessage(userMessage);
    this.setBusy(true);
    this.scrollToBottom();

    try {
      const response = await this.plugin.sendToCodex(prompt, (status) => this.setStatus(status));
      const assistantMessage = this.plugin.createMessage("assistant", response);
      this.plugin.settings.messages.push(assistantMessage);
      await this.plugin.persistSettings();
      await this.appendMessage(assistantMessage);
      this.setStatus("完成");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const systemMessage = this.plugin.createMessage("system", message);
      this.plugin.settings.messages.push(systemMessage);
      await this.plugin.persistSettings();
      await this.appendMessage(systemMessage);
      this.setStatus("執行失敗");
      new Notice(message, 8000);
    } finally {
      this.setBusy(false);
      this.scrollToBottom();
      this.inputEl.focus();
    }
  }

  private async startNewChat(): Promise<void> {
    if (this.plugin.codex.running) {
      new Notice("請先停止目前的 Codex 執行。", 5000);
      return;
    }
    await this.plugin.startNewChat();
    await this.renderMessages();
    this.setStatus("已開始新對話");
    this.inputEl.focus();
  }

  private setBusy(busy: boolean): void {
    this.sendButton.disabled = busy;
    this.inputEl.disabled = busy;
    this.stopButton.hidden = !busy;
  }

  private setStatus(text: string): void {
    this.statusEl.setText(text);
  }

  private scrollToBottom(): void {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
}
