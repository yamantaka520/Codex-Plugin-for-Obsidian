# Codex Workspace 0.3.0 plan

## Objective

Turn the single persisted chat into a small, reliable conversation workspace with named sessions, searchable history, explicit retention controls, and safe recovery after Obsidian restarts.

## Product scope

- Create, rename, switch, archive, export, and delete conversations.
- Persist a bounded list of visible messages and the associated Codex thread ID per conversation.
- Search conversation titles and visible message text locally; never index hidden Codex protocol payloads.
- Restore the last selected conversation after restart without automatically executing Codex.
- Keep the existing one-shot active-note and selection attachments independent of saved history.

## Data model and migration

- Introduce a versioned plugin data envelope with `schemaVersion`, `activeConversationId`, and `conversations`.
- Each conversation stores a stable local ID, user-editable title, optional Codex thread ID, timestamps, archive state, and visible messages.
- Migrate the current top-level `sessionId` and `messages` into one default conversation exactly once.
- Validate loaded data at runtime, tolerate unknown future fields, and recover malformed records individually instead of discarding the whole store.
- Use atomic full-envelope saves through Obsidian plugin data; cap conversation and message counts with documented limits.

## User interface

- Add a compact conversation switcher and new-chat action to the panel header.
- Provide a searchable management modal for active and archived conversations.
- Require confirmation for destructive deletion; archiving remains reversible.
- Export one conversation as Markdown with title, timestamps, roles, and visible content only.
- Preserve keyboard navigation, focus, narrow-sidebar layout, and readable empty/error states.

## Safety and privacy

- Never export thread protocol events, command payloads, hidden reasoning, environment values, or credentials.
- Do not persist unsent composer text or context previews by default.
- Clear the matching Codex thread ID when duplicating or importing a conversation so it cannot resume the wrong remote thread.
- Deleting local history does not claim to delete server-side Codex retention; state that boundary in the UI and docs.
- Keep all search and export generation local to the vault/plugin runtime.

## Implementation slices

1. **Completed:** versioned data schema, runtime validation, migration, repository methods, and unit tests.
2. **Completed in code; GUI acceptance pending:** conversation switcher, creation, rename, archive, restore, and deletion flows.
3. **Completed in code; GUI acceptance pending:** local search and Markdown export with privacy-focused fixtures.
4. Restart recovery, corrupted-data recovery, two-vault GUI matrix, docs, and release verification.

## Implementation status

- Added schema version 1 with stable local conversation IDs, titles, per-conversation thread IDs, timestamps, archive state, and visible messages.
- Legacy `sessionId` and `messages` migrate exactly once into a resumable default conversation.
- Runtime loading isolates malformed conversations/messages, preserves recognized data with future fields, restores a valid active conversation, and recovers all-archived stores.
- Repository operations cover create, select, rename, archive, restore, delete, thread updates, first-prompt titles, and bounded retention (100 conversations; 500 visible messages each).
- Existing send, resume, progress, and message persistence now use the selected conversation. Creating a new chat creates a separate record instead of erasing prior history.
- The sidebar header now includes a non-archived conversation switcher and a management modal. The modal supports title filtering, inline rename, select, archive, restore, and deletion with an explicit confirmation that deletion is local-only.
- Conversation search now matches titles and visible message text locally. Markdown export includes only the title, export time, visible roles, timestamps, and visible message content; it excludes Codex thread IDs and protocol data, sanitizes filenames, and avoids overwriting existing exports.
- `20/20` tests, production build, and production dependency audit pass. This remains development code and has not replaced the stable `0.2.1` installation in either vault.

## Acceptance criteria

- Existing 0.2.x users retain their current visible history and resumable Codex thread after migration.
- Switching conversations never mixes messages, progress events, attachments, or thread IDs.
- Archived conversations are hidden from the default switcher and can be restored.
- Deletion requires confirmation and removes only the selected local record.
- Export output contains only user-visible messages and opens as valid Markdown.
- Restarting Obsidian restores the selected conversation without launching a process.
- Malformed single records are isolated with a user-visible warning while valid conversations remain usable.
- Parser, process, migration, repository, UI-state, search, export, and recovery tests pass; both local vaults pass GUI smoke tests.

## Out of scope

- File diff review and accept/reject controls, planned for 0.4.0.
- Cross-device synchronization beyond whatever mechanism already syncs the vault/plugin data.
- Server-side deletion of Codex account history.
- Windows support claims until an independent GUI matrix is completed.
