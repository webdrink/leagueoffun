# Documentation Discrepancy Report & Improvement Plan

This document outlines identified discrepancies within the project documentation, suggests consolidations, and proposes a revised structure for better clarity and maintainability.

## 1. Identified Discrepancies

1.  **`component-structure.md` is Outdated:**
    *   `GameContainer.tsx` is listed under `components/core/`. However, `plan-game-header-refactor.md` (marked as complete) indicates it was moved to `components/game/`.
    *   `GameHeader.tsx` is not listed, but `plan-game-header-refactor.md` states it was created in `components/core/` and then moved to `components/game/`. It should be listed under `components/game/`.
    *   `QuestionProgress.tsx` (created in `components/game/` per `plan-game-header-refactor.md`) is missing from the component list.

2.  **`todo.md` Inconsistencies:**
    *   The task "Refactor Header and Progress Bar components" (linking to `plan-game-header-refactor.md`) is marked as completed (`[x]`) under the "UI Refinements & Bug Fixes" section but is listed as not completed (`[ ]`) under the "Feature Implementation" section. This should be consistently marked as complete.
    *   The task "[ ] Create `docs/plan-new-question-loading.md`" is confusing because the file `docs/plan-new-question-loading.md` already exists. The task likely means "Implement the features described in `plan-new-question-loading.md`."

3.  **`release_criteria.md` vs. `implementation-summary-final.md` on PWA Status:**
    *   `release_criteria.md` has "[ ] App installable as PWA" and "[ ] App works offline" (not met).
    *   `implementation-summary-final.md` states "Configured complete manifest.json for app installability" and "Set up comprehensive cache strategies for offline play." This conflict needs resolution; either the summary is premature, or the release criteria are not updated post-testing.

4.  **`optimization-summary.md` - Minor Inaccuracy on Category Data:**
    *   Under "Multilingual Support," it mentions "language-specific category index files." The current adopted structure (per `question-category-structure.md`, `multilingual-support.md`, `plan-localization-cleanup.md`) uses a single, unified `public/questions/categories.json` file containing all category metadata and translations. Only *question files* are language-specific per category. This point in the summary should be clarified.

5.  **`question-category-structure.md` - Pending Update Task:**
    *   `todo.md` includes "[ ] Update `docs/question-category-structure.md` to accurately reflect the current and planned data structures." While the document appears to describe the *current* data structure (unified `categories.json`, language-specific question files), this task implies it might require further updates. This could be to detail its interaction with the loading logic in `plan-new-question-loading.md` or to confirm its final state after all related tasks are complete.

## 2. Document Consolidation & Archival Suggestions

1.  **Redundant/Outdated Plan Files:**
    *   **`plan-complete-multilingual.md`**: This plan describes an older category index structure (e.g., `index.de.json`, `index.en.json`) which conflicts with the current unified `categories.json` approach.
        *   **Suggestion**: Mark as "Outdated" or "Superseded" and move to an archive folder. Alternatively, update it significantly if it contains other valuable, non-contradictory planning information.
    *   **`plan-question-header-refactor.md`**: This plan appears redundant. `plan-game-header-refactor.md` is more detailed, marked as completed in `todo.md`, and covers the same scope.
        *   **Suggestion**: Mark as "Redundant" and move to an archive folder.
    *   **`plan-questionscreen-refactor-fix.md`**: This file is currently empty.
        *   **Suggestion**: If it remains empty and unused, consider removing it.

2.  **Implementation Summaries:**
    *   **`implementation-summary.md`**: This seems to be an older, less complete version of `implementation-summary-final.md`.
        *   **Suggestion**: Archive `implementation-summary.md` and consider `implementation-summary-final.md` the current summary for that phase of work.

## 3. Proposed Documentation Structure

To improve navigation, reduce redundancy, and clarify the status of different documents, the following structure is proposed for the `/docs/` directory:

```
/docs/
├── README.md                       # Overview of documentation, links to main sections
│
├── 00_PROJECT_MANAGEMENT/
│   ├── TODO.md                     # Current tasks and high-level roadmap
│   ├── RELEASE_CRITERIA.md
│   └── ARCHIVE_TODO.md
│
├── 01_GUIDELINES_AND_STANDARDS/
│   ├── COPILOT_INSTRUCTIONS.md     # (Renamed from instructions.md)
│   ├── COMPONENT_STRUCTURE.md      # (To be updated)
│   ├── ASSET_ORGANIZATION.md       # (Guidance on organizing assets)
│   └── DEPENDENCY_MANAGEMENT.md    # (Based on dependency-installation.md)
│
├── 02_ARCHITECTURE_AND_DESIGN/
│   ├── DATA_STRUCTURE_OVERVIEW.md  # (High-level: game settings, player state, etc.)
│   ├── QUESTIONS_CATEGORIES.md     # (Primary doc, likely renamed question-category-structure.md)
│   └── MULTILINGUAL_STRATEGY.md    # (i18n setup, useTranslation, adding languages)
│
├── 03_FEATURES/                    # Detailed docs for specific features
│   ├── QUESTION_LOADING.md         # (How questions are selected & loaded)
│   ├── SOUND_SYSTEM.md             # (Sound implementation, volume control)
│   └── PWA_SETUP.md                # (PWA configuration, icons, service worker)
│
├── 04_PROCESSES_AND_HOW_TO/
│   ├── PLANNING_PROCESS.md         # (How to use plan-*.md files)
│   ├── TESTING_STRATEGY.md         # (Consolidated from testing-guide.md, multilingual-test-plan.md)
│   ├── TRANSLATION_GUIDE.md        # (For translators, linking to glossary)
│   └── MIGRATION_GUIDES/
│       └── QUESTION_MIGRATION.md   # (from question-migration-guide.md)
│
├── 05_PLANS/                       # Active development plans
│   ├── plan-[feature-name].md
│   └── ...
│
├── 06_SUMMARIES_AND_REPORTS/
│   ├── implementation-summary-final.md
│   └── optimization-summary.md
│
├── 07_GLOSSARIES/
│   └── TRANSLATION_GLOSSARY.md
│
└── ARCHIVE/                        # For outdated plans, old summaries, etc.
    ├── OBSOLETE_PLANS/
    └── OLD_SUMMARIES/
```

**Rationale for Proposed Structure:**

*   **Numbered Prefixes:** Help in ordering and grouping related topics.
*   **Clear Categorization:** Separates guidelines, architectural design, feature details, processes, active plans, and historical documents.
*   **Reduced Root Clutter:** Makes the `/docs/` root easier to navigate.
*   **Single Source of Truth:** Encourages consolidating information (e.g., `TESTING_STRATEGY.md`).
*   **Explicit Archive:** Clearly designates outdated materials.

This revised structure aims to make project documentation more accessible, maintainable, and useful for all contributors.
