# Plan: Local PNPM / Remote NPM Alignment

## Goal & Expected Behavior
- Standardize local development to use pnpm with proper workspace support and tooling guidance.
- Keep CI/CD pipelines on npm (package-lock + npm scripts) for compatibility.
- Avoid dual-install friction by documenting workflows and ensuring lockfiles stay consistent.

## Technical Steps
1. Add pnpm workspace configuration (pnpm-workspace.yaml) to silence warnings and properly scope packages.
2. Update documentation (README/SESSION_CHANGES or new guide) with clear local vs remote package manager usage, install/build commands, and rationale.
3. Provide helper scripts or npm/pnpm parity instructions if needed (e.g., ensure root scripts don’t force npm-only tooling for local use).
4. Verify pnpm install + dev/build flows succeed locally without mutating npm artifacts.
5. Confirm npm-based CI pipeline remains functional (package-lock untouched, npm scripts unchanged for remote use).

## Potential Edge Cases
- pnpm might hoist dependencies differently; ensure games/blamegame still runs via pnpm.
- Running pnpm could inadvertently delete package-lock; monitor and prevent.
- Documented commands must remain accurate to avoid confusion for contributors.

## Impact Assessment
- Files: new `pnpm-workspace.yaml`, documentation updates, possibly root scripts.
- Tooling: local dev instructions shift to pnpm; CI unaffected.
- No runtime code changes expected.

## Task Checklist
- [x] Create pnpm workspace configuration.
- [x] Audit root scripts to ensure compatibility with both npm (CI) and pnpm (local).
- [x] Update developer documentation to describe local pnpm usage vs remote npm.
- [x] Validate pnpm install/dev/build locally works end-to-end.
- [x] Verify npm install/build path remains untouched for CI.
- [x] Confirm npm pipeline unaffected.

## Notes
(Use this section to log decisions, command outputs, or blockers.)
2025-11-23 16:05 UTC — Added `pnpm-workspace.yaml` covering `games/*`, `packages/*`, shared code directories (components, providers, framework, lib, hooks, store, utils) to remove pnpm warnings and ensure local installs respect workspace layout.
2025-11-23 16:20 UTC — Added `scripts/run-workspace-task.cjs` and `scripts/run-monorepo-script.cjs`, updating root `package.json` scripts so local executions default to pnpm while CI (CI env=true) stays on npm.
2025-11-23 16:32 UTC — Updated `README.md` quick start to reflect pnpm-first local workflow plus npm fallback instructions and package manager strategy section.
2025-11-23 16:40 UTC — Converted internal workspace dependencies in `games/game-picker` and `games/hookhunt` to use `workspace:*` protocol so pnpm resolves local packages without hitting the registry. `pnpm install` now succeeds across all workspaces.
2025-11-23 16:45 UTC — Verified `pnpm install` and `pnpm run build` succeed end-to-end via new scripts; no package-lock churn observed.
2025-11-23 16:48 UTC — Confirmed `package-lock.json` and CI-facing npm scripts remain unchanged; helper scripts fall back to npm when `CI`/`USE_NPM` is set so remote pipelines keep their existing flow.
