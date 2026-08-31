export const MAX_CONTEXT_CHARS = 50_000;

export interface ContextAttachment {
  kind: "active-note" | "selection";
  path: string;
  content: string;
}

export function buildPromptWithContext(prompt: string, attachment: ContextAttachment | null): string {
  if (!attachment) return prompt;
  return [
    prompt,
    "",
    "<obsidian_context>",
    `kind: ${attachment.kind}`,
    `path: ${attachment.path}`,
    "content:",
    attachment.content,
    "</obsidian_context>"
  ].join("\n");
}

export function validateContextAttachment(attachment: ContextAttachment): string | null {
  if (!attachment.path.trim()) return "目前筆記沒有可用路徑。";
  if (!attachment.content.trim()) return "沒有可附加的文字內容。";
  if (attachment.content.length > MAX_CONTEXT_CHARS) {
    return `內容超過 ${MAX_CONTEXT_CHARS.toLocaleString()} 字元，請改用選取文字或縮小內容。`;
  }
  return null;
}
