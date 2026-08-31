# Changelog

All notable changes to Codex Workspace are documented here.

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
