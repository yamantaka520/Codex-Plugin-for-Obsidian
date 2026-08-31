import type { Conversation } from "./types";

export function searchConversations(
  conversations: readonly Conversation[],
  query: string
): Conversation[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [...conversations];
  return conversations.filter((conversation) =>
    conversation.title.toLocaleLowerCase().includes(normalized)
      || conversation.messages.some(({ text }) => text.toLocaleLowerCase().includes(normalized))
  );
}

export function exportConversationMarkdown(conversation: Conversation, exportedAt = Date.now()): string {
  const lines = [
    `# ${conversation.title}`,
    "",
    `> Exported from Codex Workspace on ${new Date(exportedAt).toISOString()}.`,
    ""
  ];
  for (const message of conversation.messages) {
    lines.push(
      `## ${roleLabel(message.role)} — ${new Date(message.createdAt).toISOString()}`,
      "",
      message.text,
      ""
    );
  }
  return `${lines.join("\n").trimEnd()}\n`;
}

export function safeExportBasename(title: string): string {
  return title
    .normalize("NFKC")
    .replace(/[\\/:*?"<>|#^[\]]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.+$/g, "")
    .slice(0, 80) || "Codex conversation";
}

function roleLabel(role: "user" | "assistant" | "system"): string {
  if (role === "user") return "User";
  if (role === "assistant") return "Codex";
  return "System";
}
