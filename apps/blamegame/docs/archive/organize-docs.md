# Documentation Cleanup Steps

This is a checklist for cleaning up the documentation folder. These steps should be performed manually:

## 1. Create Archive Directory Structure

```
mkdir -p c:/Users/pbziu/OneDrive/Dokumente/Development/blamegame/docs/archive/plans
```

## 2. Move Outdated Files to Archive

### Main Files to Archive:
- [ ] component-structure.md → archive/
- [ ] data-structure.md → archive/
- [ ] dependency-installation.md → archive/
- [ ] docu_diff.md → archive/
- [ ] implementation-summary.md → archive/
- [ ] multilingual-support.md → archive/
- [ ] multilingual-test-plan.md → archive/
- [ ] question-category-structure.md → archive/
- [ ] question-migration-guide.md → archive/
- [ ] testing-guide.md → archive/
- [ ] translation-glossary.md → archive/ (replaced by TRANSLATION_GLOSSARY.md)

### Plan Files to Archive:
- [ ] plan-category-display-fix.md → archive/plans/
- [ ] plan-complete-multilingual.md → archive/plans/
- [ ] plan-component-cleanup.md → archive/plans/
- [ ] plan-game-header-refactor.md → archive/plans/
- [ ] plan-i18n-fix.md → archive/plans/
- [ ] plan-json-fix-language-change.md → archive/plans/
- [ ] plan-localization-cleanup.md → archive/plans/
- [ ] plan-new-question-loading.md → archive/plans/
- [ ] plan-question-header-refactor.md → archive/plans/
- [ ] plan-questionscreen-fixes.md → archive/plans/
- [ ] plan-questionscreen-refactor-fix.md → archive/plans/

## 3. Verify Core Documentation Files

These should be kept in the main docs directory:
- [x] README.md - Main documentation overview
- [x] COMPONENT_STRUCTURE.md - Component organization guide
- [x] DATA_STRUCTURE_OVERVIEW.md - Data structure documentation
- [x] DEPENDENCY_MANAGEMENT.md - Dependency installation/management
- [x] DOCUMENTATION_STRUCTURE.md - Documentation organization guide
- [x] MULTILINGUAL_STRATEGY.md - Language support guide
- [x] QUESTIONS_CATEGORIES.md - Question/category organization
- [x] TESTING_STRATEGY.md - Testing procedures
- [x] TRANSLATION_GLOSSARY.md - Translation reference

## 4. Verify Implementation Reference Files

These should also be kept in the main docs directory:
- [x] implementation-summary-final.md - Feature implementation summary
- [x] optimization-summary.md - Optimization summary
- [x] pwa-icon-creation.md - PWA icon creation guide
- [x] release_criteria.md - Release requirements
- [x] sound-implementation.md - Sound implementation guide
- [x] todo.md - Current tasks

## 5. Update README.md References

Ensure all links in README.md point to the correct files (already done)