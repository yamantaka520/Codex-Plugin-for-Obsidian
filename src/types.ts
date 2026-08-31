export type SandboxMode = "read-only" | "workspace-write";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  createdAt: number;
}

export interface PluginSettings {
  codexPath: string;
  sandboxMode: SandboxMode;
  approveForMe: boolean;
  sessionId: string | null;
  messages: ChatMessage[];
}

export interface CodexRunCallbacks {
  onThreadId: (threadId: string) => void;
  onStatus: (status: string) => void;
}
