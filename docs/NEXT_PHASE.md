# Next phase plan

## Objective

Make Codex Workspace feel like a native, observable Obsidian collaborator instead of a final-response-only CLI wrapper. The next feature release is `0.2.0`.

## Implementation status

- [x] Runtime-validated JSONL parser with normalized thread, final-message, failure, and progress outputs.
- [x] Safe progress timeline for turn, command, file-change, and tool events without raw payloads.
- [x] Unit coverage for malformed, unknown, failure, thread, assistant-message, and command events.
- [x] Process integration coverage for new and resumed sessions using a deterministic fake Codex executable.
- [x] Active-note and text-selection context controls with exact local preview, one-shot sending, and size validation.
- [x] Process integration tests for start, resume, failure, stop, cleanup, and reuse.
- [ ] Two-vault GUI acceptance for the `0.2.0` release candidate.

## 0.2.0 — Live progress and explicit context

### Workstream A: typed Codex event pipeline

- Replace ad-hoc JSON access with discriminated, runtime-validated event parsing.
- Preserve unknown events safely for forward compatibility.
- Separate user-visible progress from final assistant Markdown and diagnostic errors.
- Keep session resume, cancellation, and incomplete-line buffering reliable.

### Workstream B: progress timeline

- Stream status, command, file-operation, and completion events into the right panel.
- Use compact native Obsidian components with clear running, success, warning, and failure states.
- Avoid displaying hidden reasoning, credentials, raw environment data, or noisy protocol payloads.
- Keep the final answer readable and visually distinct from progress events.

### Workstream C: active-note context

- Add explicit controls for attaching the active note or current text selection.
- Preview the exact path and text that will be sent before transmission.
- Default to no implicit attachment; never copy context from unrelated open notes.
- Handle renamed, deleted, binary, oversized, and unsaved files safely.

### Workstream D: quality gates

- Unit tests for every supported JSONL event and malformed/unknown input.
- Integration tests for start, stream, resume, stop, CLI failure, and empty response.
- GUI verification in BastetMind and the personal notebook, in both read-only and workspace-write modes.
- Build, production dependency audit, reproducible release, and artifact-attestation verification.

## Acceptance criteria

- Progress appears before the final response without freezing Obsidian.
- Stop terminates the active Codex process and leaves the panel reusable.
- Resumed conversations keep the same Codex session and do not duplicate events.
- Active-note or selection context is sent only after an explicit user action and is visibly previewed.
- No raw reasoning, secrets, or environment dumps appear in saved conversation history.
- Both configured local vaults receive and pass the release smoke test.

## Later releases

### 0.3.0 — Conversation management

- Multiple named conversations, searchable history, rename, archive, export, and deletion.
- Session recovery after Obsidian restart and clear retention controls.

### 0.4.0 — Change review

- File-change summary and diff viewer.
- Per-file accept/reject and a recoverable rollback path.
- Conflict handling for files edited while Codex is running.

### Cross-cutting backlog

- Windows and Linux GUI matrix.
- Declarative settings search for Obsidian 1.13+ without breaking the current minimum version.
- Reduce Community scanner type-safety warnings.
- Accessibility, localization of plugin UI, and keyboard-only operation.

## Release discipline

Each tagged release must update the manifest, package version, versions map, changelog, multilingual README status, both local vault installations, BastetMind, and the Community review record. Release assets must include verifiable attestations.
