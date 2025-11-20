# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 21-11-2025

### Added

- Initial release of **cmit**, the interactive commit helper CLI.
- Full interactive commit experience:
  - Stage / unstage files
  - Select commit type
  - Write message + optional description
  - Commit preview and confirmation
- Commit safety mechanisms:
  - Prevent empty messages
  - Prevent commits with no staged files
  - Detect merge conflicts before committing
  - Gracefully handle Git hook failures
- Amend support (`--amend`).
- Auto push option (`--push`) + config-based autoPush.
- Quick mode (`-q`) for instant commits without UI.
- Customizable commit types through `.cmitrc` or config files.
- Local commit statistics stored in `.cmit-stats.json`.
- Robust error handling for:
  - Missing upstream branches
  - Missing staged files
  - Cancelled prompts (SIGINT)
  - Failed push attempts
- Safe prompt wrapper with controlled exit behavior.
- Clean, friendly CLI output using chalk + ora spinners.

### Changed

- Migrated project structure to **CommonJS** for wider CLI compatibility (`fix: Simplified project structure with commonjs`)
- Reduced cognitive complexity across core functions (`fix`)

### Fixed

- Fixed bug where staged files incorrectly appeared in "unstaged" list (`fix: Fixed staged files showing up in unstagged files`)
- Removed `.cmit-stats.json` from version control (`Stop tracking .cmit-stats.json`)
- General internal fixes during early development (`fix: testing`)

### Chores

- Prettier configuration added (`chore: prettier configured`)

### Notes

- This is the **first functional alpha release** of cmit (`feat: initial scaffold`).
- This version is intended for **internal use**, active development, and validating the commit flow.
- The API, prompts, and options may evolve before the first stable release.

---
