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
- [ ] Test the release in a separate vault on supported desktop platforms.

## Submit the initial version

1. Go to <https://community.obsidian.md> and sign in with an Obsidian account.
2. Connect the GitHub account from the Community profile.
3. In the sidebar, open **Plugins** and select **New plugin**.
4. Enter `https://github.com/yamantaka520/Codex-Plugin-for-Obsidian` and choose the owner.
5. Agree to the developer policies and submit.
6. Review the automated scanner results. Fix errors, increment the version, rebuild, and publish a new matching release when required.
7. After approval, add listing copy, categories, icon, and up to five 1200×800 desktop screenshots.

Only the initial version needs manual directory submission. Later updates are discovered from matching GitHub releases.

## Official documentation

- <https://docs.obsidian.md/plugins/releasing/submit-plugin>
- <https://docs.obsidian.md/community-directory/submission-requirements-for-plugins>
- <https://docs.obsidian.md/community-directory/developer-policies>
- <https://docs.obsidian.md/community-directory/set-up-and-claim>
