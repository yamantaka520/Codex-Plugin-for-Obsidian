import { ItemView, MarkdownRenderer, Notice, setIcon, WorkspaceLeaf } from "obsidian";
import type CodexWorkspacePlugin from "../main";
import type { CodexProgressEvent } from "./codex-events";
import {
  buildPromptWithContext,
  type ContextAttachment,
  validateContextAttachment
} from "./context";
import type { ChatMessage } from "./types";

export const CODEX_VIEW_TYPE = "codex-workspace-chat";

export class CodexChatView extends ItemView {
  private messagesEl!: HTMLElement;
  private inputEl!: HTMLTextAreaElement;
  private sendButton!: HTMLButtonElement;
  private stopButton!: HTMLButtonElement;
  private statusEl!: HTMLElement;
  private progressEl!: HTMLElement;
  private contextEl!: HTMLElement;
  private noteContextButton!: HTMLButtonElement;
  private selectionContextButton!: HTMLButtonElement;
  private contextAttachment: ContextAttachment | null = null;

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
    this.setStatus(this.plugin.activeConversation.threadId ? "已連接既有對話" : "準備就緒");

    this.progressEl = root.createDiv({ cls: "codex-obsidian-progress" });
    this.progressEl.hidden = true;

    this.contextEl = root.createDiv({ cls: "codex-obsidian-context" });
    this.contextEl.hidden = true;

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
    const contextActions = composer.createDiv({ cls: "codex-obsidian-context-actions" });
    this.noteContextButton = contextActions.createEl("button", { text: "附加目前筆記" });
    this.noteContextButton.addEventListener("click", () => this.attachContext("active-note"));
    this.selectionContextButton = contextActions.createEl("button", { text: "附加選取文字" });
    this.selectionContextButton.addEventListener("click", () => this.attachContext("selection"));

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
    const messages = this.plugin.activeConversation.messages;
    if (messages.length === 0) {
      const empty = this.messagesEl.createDiv({ cls: "codex-obsidian-empty" });
      const icon = empty.createDiv({ cls: "codex-obsidian-empty-icon" });
      setIcon(icon, "sparkles");
      empty.createEl("h3", { text: "在 Obsidian 中與 Codex 協作" });
      empty.createEl("p", {
        text: "Codex 使用你現有的 CLI 登入，並以目前 Vault 作為工作區。"
      });
      return;
    }

    for (const message of messages) {
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
    const codexPrompt = buildPromptWithContext(prompt, this.contextAttachment);

    this.inputEl.value = "";
    this.clearContext();
    const userMessage = this.plugin.createMessage("user", prompt);
    this.plugin.appendMessage(userMessage);
    await this.plugin.persistSettings();
    await this.appendMessage(userMessage);
    this.setBusy(true);
    this.scrollToBottom();

    try {
      this.resetProgress();
      const response = await this.plugin.sendToCodex(
        codexPrompt,
        (status) => this.setStatus(status),
        (event) => this.appendProgress(event)
      );
      const assistantMessage = this.plugin.createMessage("assistant", response);
      this.plugin.appendMessage(assistantMessage);
      await this.plugin.persistSettings();
      await this.appendMessage(assistantMessage);
      this.setStatus("完成");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const systemMessage = this.plugin.createMessage("system", message);
      this.plugin.appendMessage(systemMessage);
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
    this.resetProgress();
    await this.renderMessages();
    this.setStatus("已開始新對話");
    this.inputEl.focus();
  }

  private setBusy(busy: boolean): void {
    this.sendButton.disabled = busy;
    this.inputEl.disabled = busy;
    this.noteContextButton.disabled = busy;
    this.selectionContextButton.disabled = busy;
    this.stopButton.hidden = !busy;
  }

  private setStatus(text: string): void {
    this.statusEl.setText(text);
  }

  private resetProgress(): void {
    this.progressEl.empty();
    this.progressEl.hidden = true;
  }

  private appendProgress(event: CodexProgressEvent): void {
    this.progressEl.hidden = false;
    const row = this.progressEl.createDiv({ cls: `codex-obsidian-progress-row is-${event.state}` });
    const icon = row.createSpan({ cls: "codex-obsidian-progress-icon" });
    setIcon(icon, eventIcon(event));
    row.createSpan({ text: event.label });
    while (this.progressEl.childElementCount > 12) this.progressEl.firstElementChild?.remove();
    this.scrollToBottom();
  }

  private attachContext(kind: ContextAttachment["kind"]): void {
    const view = this.plugin.getContextMarkdownView();
    if (!view?.file) {
      new Notice("請先開啟一份 Markdown 筆記。", 5000);
      return;
    }

    const content = kind === "selection" ? view.editor.getSelection() : view.editor.getValue();
    const attachment: ContextAttachment = { kind, path: view.file.path, content };
    const error = validateContextAttachment(attachment);
    if (error) {
      new Notice(error, 6000);
      return;
    }

    this.contextAttachment = attachment;
    this.renderContextPreview();
  }

  private renderContextPreview(): void {
    this.contextEl.empty();
    const attachment = this.contextAttachment;
    if (!attachment) {
      this.contextEl.hidden = true;
      return;
    }

    this.contextEl.hidden = false;
    const header = this.contextEl.createDiv({ cls: "codex-obsidian-context-header" });
    header.createSpan({
      text: `${attachment.kind === "selection" ? "選取文字" : "目前筆記"} · ${attachment.path}`
    });
    const remove = header.createEl("button", {
      cls: "clickable-icon",
      attr: { "aria-label": "移除附加內容" }
    });
    setIcon(remove, "x");
    remove.addEventListener("click", () => this.clearContext());
    this.contextEl.createEl("pre", { text: attachment.content });
  }

  private clearContext(): void {
    this.contextAttachment = null;
    if (this.contextEl) {
      this.contextEl.empty();
      this.contextEl.hidden = true;
    }
  }

  private scrollToBottom(): void {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }
}

function eventIcon(event: CodexProgressEvent): string {
  if (event.state === "error") return "circle-x";
  if (event.state === "success") return "circle-check";
  if (event.kind === "command") return "terminal";
  if (event.kind === "file") return "file-pen-line";
  if (event.kind === "tool") return "wrench";
  return "loader-circle";
}
