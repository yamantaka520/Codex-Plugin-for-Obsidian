# Changelog

All notable changes to Codex Workspace are documented here.

## 0.2.0 - 2026-08-31

### Added

- Live, privacy-preserving progress timeline for Codex turn, command, file-change, and tool events.
- Explicit active-note and text-selection attachments with an exact local preview before sending.
- Runtime-validated Codex JSONL normalization with forward-compatible handling of unknown events.

### Changed

- Context attachments are one-shot and reject empty or oversized content.
- Test coverage now includes parser, context, new-session, resume, failure, stop, cleanup, and process reuse paths.

### Fixed

- Avoid passing the mutually exclusive `--sandbox` and `--approve-for-me` flags to current Codex CLI versions.
- Keep the most recently focused Markdown view available for context attachment after focus moves to the Codex sidebar.

### Security

- Raw command payloads, unknown event fields, hidden reasoning, and environment dumps are not rendered or persisted.

## 0.1.1 - 2026-08-31

### Fixed

- Use Obsidian's native `Setting.setHeading()` API in the settings screen.
- Replace the deprecated `builtin-modules` build dependency with Node.js `builtinModules`.

### Security

- Generate GitHub artifact attestations for `main.js` and `styles.css` on tagged releases.

## 0.1.0 - 2026-08-31

### Added

- Left-ribbon button and command-palette actions.
- Native right-sidebar Codex conversation view.
- Existing Codex CLI / ChatGPT login integration without an API key.
- Multi-turn session continuation with `codex exec resume`.
- Read-only and workspace-write sandbox settings.
- Stop and new-conversation controls.
- Local Markdown conversation history.

### Known limitations

- Desktop only.
- Tool events are not streamed into the panel yet.
- Windows and full Obsidian GUI end-to-end testing remain pending.
