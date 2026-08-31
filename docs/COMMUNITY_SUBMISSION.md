# Official Obsidian Community directory submission

This checklist follows the current official Obsidian developer documentation.

## Release prerequisites

- [x] Public GitHub repository.
- [x] Root `README.md`, `LICENSE`, and `manifest.json`.
- [x] Plugin ID uses lowercase letters and hyphens and does not contain `obsidian`.
- [x] Display name does not contain `Obsidian` or `Plugin`.
- [x] Description is under 250 characters, ends with a period, and contains no emoji.
- [x] `isDesktopOnly` is `true` because Node.js APIs launch Codex CLI.
- [x] README discloses account requirements, network use, and outside-vault executable/config access.
- [x] Release tag exactly matches `manifest.json` version: `0.1.0`.
- [x] Release has individual `main.js`, `manifest.json`, and `styles.css` assets.
- [x] Test the release in BastetMind and a separate personal vault on macOS desktop.

## Submit the initial version

1. Go to <https://community.obsidian.md> and sign in with an Obsidian account.
2. Connect the GitHub account from the Community profile.
3. In the sidebar, open **Plugins** and select **New plugin**.
4. Enter `https://github.com/yamantaka520/Codex-Plugin-for-Obsidian` and choose the owner.
5. Agree to the developer policies and submit.
6. Review the automated scanner results. Fix errors, increment the version, rebuild, and publish a new matching release when required.
7. After approval, add listing copy, categories, icon, and up to five 1200×800 desktop screenshots.

Only the initial version needs manual directory submission. Later updates are discovered from matching GitHub releases.

## Current submission status

Submitted and published to the Community site on August 31, 2026:

- Entry: <https://community.obsidian.md/plugins/codex-workspace>
- Initial review: `0.1.0` / `799ce23` failed because the settings heading did not use `Setting.setHeading()`
- `0.1.1` / `f489a7f` passed release, network, dependency, attestation, and reproducible-build checks but failed because the settings heading repeated the plugin name.
- Feature release: `0.2.0` / `e9b36ce`, published successfully with verified release assets and attestations.
- Current review fix: `0.2.1` / `7fe49bd`, changes the settings heading to the generic `一般設定`; the Community automated review completed on August 31, 2026 with no errors.
- Manual review request is open. Its explanation documents why filesystem and child-process access are required for the desktop-only Codex CLI integration and points reviewers to README and SECURITY disclosures.
- Passed in the initial review: network request scan, dependency vulnerability scan, and byte-for-byte build reproduction
- Expected warnings: direct filesystem access and shell execution, both disclosed because the plugin launches Codex CLI and works with the local vault
- Recommendation addressed since `0.1.1`: GitHub artifact attestations for `main.js` and `styles.css` are generated and verified with GitHub CLI for every tagged release.

## Official documentation

- <https://docs.obsidian.md/plugins/releasing/submit-plugin>
- <https://docs.obsidian.md/community-directory/submission-requirements-for-plugins>
- <https://docs.obsidian.md/community-directory/developer-policies>
- <https://docs.obsidian.md/community-directory/set-up-and-claim>
