import assert from "node:assert/strict";
import test from "node:test";

test("documents the Codex JSONL event shapes consumed by the plugin", () => {
  const thread = JSON.parse('{"type":"thread.started","thread_id":"abc"}');
  const message = JSON.parse(
    '{"type":"item.completed","item":{"type":"agent_message","text":"完成"}}'
  );
  assert.equal(thread.thread_id, "abc");
  assert.equal(message.item.text, "完成");
});
