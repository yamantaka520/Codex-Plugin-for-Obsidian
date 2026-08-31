# Security

## Security model

Codex Workspace launches the user's existing Codex CLI with the current local vault as its working directory.

- The plugin never requests or stores an OpenAI API key.
- The plugin does not read or copy Codex authentication files.
- The plugin never passes `--dangerously-bypass-approvals-and-sandbox`.
- `workspace-write` is the default sandbox; `read-only` is available in settings.
- `--approve-for-me` is enabled by default because the current integration is non-interactive. This routes approval requests through Codex automatic review without disabling the sandbox.
- Messages and the current session ID are saved locally in Obsidian plugin data.
- There is no client-side telemetry or advertising.

Codex CLI itself communicates with OpenAI services and uses its own configuration, authentication, skills, plugins, MCP servers, and permission policies. Users should review those settings separately.

## Supported versions

Security fixes are provided for the latest published release.

## Report a vulnerability

Do not include credentials, private vault contents, or working exploit details in a public issue. Open a GitHub Security Advisory for this repository, or contact the maintainer privately through the address configured on the GitHub profile.
