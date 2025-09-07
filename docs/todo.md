# TODO

- [x] [Fix GameInfoLoader path](plan-fix-gameinfo-loader-path.md)

## NameBlame Game Progression Fix (see [plan-fix-nameblame-game-progression.md](plan-fix-nameblame-game-progression.md))
**✅ IMPLEMENTATION COMPLETED - CRITICAL INFINITE LOOP BUG FIXED**
- [x] **CRITICAL**: Fix infinite loop after blame selection that prevented any progression
- [x] **CRITICAL**: Implement proper blame round progression (all players blame same question)
- [x] **CRITICAL**: Add BlameNotification component with visual feedback
- [x] **CRITICAL**: Create BlameRoundState tracking for per-player progression
- [x] **CRITICAL**: Update BlameGameStore with round management actions
- [x] **CRITICAL**: Refactor App.tsx handleBlame to remove blocking return
- [x] **CRITICAL**: Implement proper question advancement after all players blamed
- [x] **CRITICAL**: Add multilingual support for blame notifications (en/de/es/fr)
- [x] **CRITICAL**: Enhanced QuestionScreen with dynamic button text
- [x] **CRITICAL**: Edge case handling for corrupted state and insufficient players
- [x] Create comprehensive Playwright test suite for blame progression
- [x] Update plan documentation with implementation details

## NameBlame Flow Update (see [plan-nameblame-flow-update-revised.md](plan-nameblame-flow-update-revised.md))
**✅ IMPLEMENTATION COMPLETED - CRITICAL BUGS FIXED**
- [x] Add translation keys for 3-player hint & blame flow labels *(Added to all languages: en, de, es, fr)*
- [x] **CRITICAL**: Fix player rotation logic (currently causes wrong turn sequences) *(Auto-advance removed from handleBlame)*
- [x] **CRITICAL**: Fix blame acknowledgement flow (currently auto-advances) *(Proper blame phase transitions implemented)*
- [x] **CRITICAL**: Enforce 3 player minimum & disabled start button logic *(PlayerSetupScreen updated with validation)*
- [x] **CRITICAL**: Always show setup screen when entering NameBlame (even with stored players) *(IntroScreen navigation fixed)*
- [x] **CRITICAL**: Implement random starting player selection (currently missing) *(Player order logic updated)*
- [x] Hide unnamed players in selection UI *(Filtering implemented)*
- [x] Playwright tests: setup-validation *(Created critical-fixes.spec.ts)*
- [x] Playwright tests: flow-basic (exact user scenario: Seez, GitHub Copilot, Test) *(Comprehensive test coverage)*
- [x] Playwright tests: rotation integrity *(Player rotation test implemented)*
- [x] Playwright tests: persistence (setup screen forced) *(Forced navigation test created)*
- [x] Playwright tests: translation coverage *(Framework integration tests)*
- [x] Update plan & mark tasks complete with implementation notes *(Completed)*

## Framework Architecture Implementation (see [plan-component-modularization.md](plan-component-modularization.md))
**✅ FRAMEWORK COMPLETED - READY FOR PRODUCTION**
- [x] Create Zustand stores for game state management *(GameStateStore.ts and BlameGameStore.ts)*
- [x] Build framework components with TypeScript interfaces *(GameMain, GameMainHeader, GameMainScreen, GameMainFooter)*
- [x] Implement responsive design and animations *(Framer Motion integration)*
- [x] Add comprehensive test coverage *(Unit, integration, and E2E tests)*
- [x] Ensure type safety and error handling *(All TypeScript errors resolved)*

## Implementation Notes
- **Auto-advance bug**: Fixed by removing `advanceToNextPlayer()` call from `handleBlame` function
- **3-player minimum**: Implemented with dynamic validation and localized hint messages
- **Setup screen forcing**: Added proper navigation callbacks for NameBlame mode changes
- **Translation integration**: All required keys added across 4 languages (en, de, es, fr)
- **Framework architecture**: Complete component modularization with Zustand state management
- **Test coverage**: Comprehensive Playwright tests for critical user scenarios and framework integration
- **Code quality**: All TypeScript errors resolved, proper type safety maintained

## Ready for Production
All critical NameBlame issues have been resolved and the framework architecture is complete. The implementation follows the attached plans and provides a solid foundation for future game development.
