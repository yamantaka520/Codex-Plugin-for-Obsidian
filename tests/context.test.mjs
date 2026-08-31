import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPromptWithContext,
  MAX_CONTEXT_CHARS,
  validateContextAttachment
} from "../src/context.ts";

test("leaves prompts unchanged without explicit context", () => {
  assert.equal(buildPromptWithContext("整理一下", null), "整理一下");
});

test("adds an explicit path and exact selected text", () => {
  const prompt = buildPromptWithContext("解釋", {
    kind: "selection",
    path: "研究/測試.md",
    content: "選取內容"
  });
  assert.match(prompt, /kind: selection/);
  assert.match(prompt, /path: 研究\/測試\.md/);
  assert.match(prompt, /content:\n選取內容/);
});

test("rejects empty and oversized context", () => {
  assert.match(
    validateContextAttachment({ kind: "selection", path: "note.md", content: "" }) ?? "",
    /沒有可附加/
  );
  assert.match(
    validateContextAttachment({
      kind: "active-note",
      path: "note.md",
      content: "x".repeat(MAX_CONTEXT_CHARS + 1)
    }) ?? "",
    /超過/
  );
});
