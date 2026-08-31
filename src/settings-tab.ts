import { App, PluginSettingTab, Setting } from "obsidian";
import type CodexWorkspacePlugin from "../main";
import type { SandboxMode } from "./types";

export class CodexSettingTab extends PluginSettingTab {
  constructor(app: App, private readonly plugin: CodexWorkspacePlugin) {
    super(app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setName("Codex Workspace").setHeading();

    new Setting(containerEl)
      .setName("Codex CLI 路徑")
      .setDesc("留空或填 codex 會自動尋找；也可填完整執行檔路徑。")
      .addText((text) =>
        text
          .setPlaceholder("codex")
          .setValue(this.plugin.settings.codexPath)
          .onChange(async (value) => {
            this.plugin.settings.codexPath = value.trim() || "codex";
            await this.plugin.persistSettings();
          })
      );

    new Setting(containerEl)
      .setName("Vault 權限")
      .setDesc("唯讀只允許分析；工作區寫入允許 Codex 整理與修改目前 Vault。")
      .addDropdown((dropdown) =>
        dropdown
          .addOption("read-only", "唯讀")
          .addOption("workspace-write", "工作區寫入")
          .setValue(this.plugin.settings.sandboxMode)
          .onChange(async (value) => {
            this.plugin.settings.sandboxMode = value as SandboxMode;
            await this.plugin.persistSettings();
          })
      );

    new Setting(containerEl)
      .setName("自動審核核准要求")
      .setDesc("交由 Codex 的自動審核機制判斷工作區寫入與命令；不會停用沙箱。")
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.approveForMe).onChange(async (value) => {
          this.plugin.settings.approveForMe = value;
          await this.plugin.persistSettings();
        })
      );

    const security = containerEl.createDiv({ cls: "codex-obsidian-settings-note" });
    security.createEl("strong", { text: "安全邊界" });
    security.createEl("p", {
      text: "此外掛不保存 API Key，也不繞過 Codex 沙箱。對話與 session ID 只保存在此 Vault 的外掛資料中。"
    });
  }
}
