# Contributing

Thank you for helping improve Codex Workspace.

## Before opening a pull request

1. Keep the plugin desktop-only unless the Codex transport changes.
2. Preserve the Codex sandbox and never add a dangerous bypass flag.
3. Do not log, inspect, copy, or persist authentication secrets.
4. Keep all UI styles scoped under `codex-obsidian-*` classes.
5. Run the quality checks:

```bash
npm install
npm run build
npm test
npm audit --omit=dev
```

## Pull requests

- Explain the user problem and the chosen behavior.
- Add tests for parser, session, or permission changes.
- Update `README.md` for user-visible behavior.
- Do not commit `main.js`; compiled files belong in GitHub Release assets.

By contributing, you agree that your contribution is licensed under the MIT License.
