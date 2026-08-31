import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { access } from "node:fs/promises";
import { delimiter, isAbsolute } from "node:path";
import type { CodexRunCallbacks, PluginSettings } from "./types";

const MAC_CODEX_CANDIDATES = [
  "/Applications/ChatGPT.app/Contents/Resources/codex",
  "/opt/homebrew/bin/codex",
  "/usr/local/bin/codex"
];

type JsonObject = Record<string, unknown>;

export class CodexClient {
  private child: ChildProcessWithoutNullStreams | null = null;

  async resolveExecutable(configuredPath: string): Promise<string> {
    const configured = configuredPath.trim();
    if (configured && configured !== "codex") {
      if (!isAbsolute(configured)) return configured;
      await access(configured);
      return configured;
    }

    const pathCandidates = (process.env.PATH ?? "")
      .split(delimiter)
      .filter(Boolean)
      .map((directory) => `${directory}/codex`);

    for (const candidate of [...pathCandidates, ...MAC_CODEX_CANDIDATES]) {
      try {
        await access(candidate);
        return candidate;
      } catch {
        // Try the next common installation location.
      }
    }
    return "codex";
  }

  async send(
    prompt: string,
    vaultPath: string,
    settings: PluginSettings,
    callbacks: CodexRunCallbacks
  ): Promise<string> {
    if (this.child) throw new Error("Codex is already processing a request.");

    const executable = await this.resolveExecutable(settings.codexPath);
    const args = settings.sessionId
      ? ["exec", "resume", "--json", settings.sessionId, "-"]
      : [
          "exec",
          "--json",
          "--skip-git-repo-check",
          "--sandbox",
          settings.sandboxMode,
          ...(settings.approveForMe ? ["--approve-for-me"] : []),
          "--cd",
          vaultPath,
          "-"
        ];

    callbacks.onStatus(settings.sessionId ? "正在繼續對話…" : "正在啟動 Codex…");

    return await new Promise<string>((resolve, reject) => {
      const child = spawn(executable, args, {
        cwd: vaultPath,
        env: process.env,
        stdio: ["pipe", "pipe", "pipe"]
      });
      this.child = child;

      let stdoutBuffer = "";
      let stderr = "";
      let finalText = "";

      const consumeLine = (line: string): void => {
        const event = parseJsonObject(line);
        if (!event) return;

        const threadId = readString(event, "thread_id") ??
          (event.type === "thread.started" ? readString(event, "threadId") : null);
        if (threadId) callbacks.onThreadId(threadId);

        const item = isJsonObject(event.item) ? event.item : null;
        if (event.type === "item.completed" && item?.type === "agent_message") {
          const text = readString(item, "text");
          if (text) finalText = text;
        }

        if (event.type === "turn.failed") {
          const error = isJsonObject(event.error) ? event.error : null;
          const message = error ? readString(error, "message") : null;
          if (message) stderr = `${stderr}\n${message}`.trim();
        }
      };

      child.stdout.setEncoding("utf8");
      child.stdout.on("data", (chunk: string) => {
        stdoutBuffer += chunk;
        const lines = stdoutBuffer.split(/\r?\n/);
        stdoutBuffer = lines.pop() ?? "";
        for (const line of lines) consumeLine(line);
      });

      child.stderr.setEncoding("utf8");
      child.stderr.on("data", (chunk: string) => {
        stderr += chunk;
      });

      child.on("error", (error) => {
        this.child = null;
        reject(new Error(`無法啟動 Codex CLI：${error.message}`));
      });

      child.on("close", (code, signal) => {
        this.child = null;
        if (stdoutBuffer.trim()) consumeLine(stdoutBuffer.trim());
        if (signal) {
          reject(new Error("Codex 執行已停止。"));
        } else if (code !== 0) {
          reject(new Error(cleanError(stderr) || `Codex CLI 結束碼：${code}`));
        } else if (!finalText) {
          reject(new Error("Codex 已完成，但沒有回傳可顯示的訊息。"));
        } else {
          resolve(finalText);
        }
      });

      child.stdin.end(prompt);
    });
  }

  stop(): void {
    this.child?.kill("SIGTERM");
  }

  get running(): boolean {
    return this.child !== null;
  }
}

function parseJsonObject(line: string): JsonObject | null {
  if (!line.trim()) return null;
  try {
    const value: unknown = JSON.parse(line);
    return isJsonObject(value) ? value : null;
  } catch {
    return null;
  }
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: JsonObject, key: string): string | null {
  return typeof value[key] === "string" ? value[key] : null;
}

function cleanError(stderr: string): string {
  return stderr
    .split(/\r?\n/)
    .filter((line) => !line.includes("could not create PATH aliases"))
    .join("\n")
    .trim();
}
