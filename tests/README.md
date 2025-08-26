# BlameGame Testing System

## Overview

This directory contains a comprehensive testing suite for the BlameGame application, implementing the testing strategy outlined in `docs/COMPREHENSIVE_TESTING_PLAN.md`.

## Test Structure

```
tests/
├── foundation/          # Core infrastructure tests
├── flows/              # Complete user journey tests
│   ├── classic-mode/   # Classic game mode flows
│   └── nameblame-mode/ # Multiplayer mode flows
├── components/         # Individual component tests
├── edge-cases/         # Error handling and edge cases
├── performance/        # Performance and load tests
├── accessibility/      # Accessibility compliance tests
├── cross-platform/     # Browser and device compatibility
└── utils/             # Testing utilities and helpers
```

## Quick Start

### Run All Tests
```bash
pnpm test
```

### Run Specific Test Categories
```bash
# Foundation tests (core infrastructure)
pnpm test:foundation

# Classic mode flow tests
pnpm test:classic

# NameBlame mode tests
pnpm test:nameblame

# Quick smoke tests
pnpm test:smoke

# Full comprehensive test suite
pnpm test:full
```

### Debug and Development
```bash
# Run tests with visual browser
pnpm test:headed

# Debug specific test
pnpm test:debug

# Run with trace recording
pnpm test:trace

# Open test report
pnpm test:report
```

## Test Categories

### Foundation Tests
Test core application infrastructure:
- **app-initialization.spec.ts**: App startup and data loading
- **translation-system.spec.ts**: i18n functionality
- **local-storage.spec.ts**: Data persistence
- **audio-system.spec.ts**: Sound system functionality

### Flow Tests
Test complete user journeys:
- **Classic Mode**: Default game flow from start to finish
- **NameBlame Mode**: Multiplayer setup and gameplay

### Edge Case Tests
Test error handling and unusual conditions:
- **network-failures.spec.ts**: Offline mode, slow connections, asset failures

## Enhanced Debugging

The testing system includes comprehensive logging with emoji-coded console output:

- 🎯 **USER ACTION**: User interactions and clicks
- 🔄 **STATE CHANGE**: Component state updates
- 🎮 **GAME LOGIC**: Game mechanics and rules
- 🌐 **DATA FLOW**: API calls and data loading
- ❌ **ERROR**: Errors and warnings
- ⚡ **PERFORMANCE**: Timing and performance metrics
- 🎵 **AUDIO**: Sound system events
- 💾 **PERSISTENCE**: LocalStorage operations

## Test Utilities

### GameStateTracker
Comprehensive debugging and monitoring:
```typescript
const tracker = createGameStateTracker(page, 'test-name');
tracker.logUserAction('Button clicked', 'start-button');
tracker.logGameEvent('Game started');
tracker.takeScreenshot('game-start');
const report = tracker.generateReport();
```

### Helper Functions
- `waitForQuestionsLoaded()`: Wait for game data to load
- `verifyAudioSystem()`: Check audio functionality
- `verifyTranslationSystem()`: Validate i18n system
- `simulateNetworkConditions()`: Test offline/slow network

## Playwright Configuration

The test suite uses multiple Playwright projects for organized testing:

- **foundation-tests**: Core infrastructure validation
- **classic-mode-flows**: Classic game mode testing
- **nameblame-mode-flows**: Multiplayer mode testing
- **cross-browser-***: Firefox and Safari compatibility
- **mobile-***: Mobile device testing
- **accessibility-tests**: WCAG compliance validation

## Performance Standards

Tests enforce performance standards:
- **Load Time**: < 5 seconds initial app load
- **Interaction Time**: < 1 second for user interactions
- **Navigation**: < 500ms between questions

## Success Criteria

✅ **Zero Critical Bugs**: No infinite loops, crashes, or data loss  
✅ **Complete Flow Coverage**: All user journeys tested end-to-end  
✅ **Performance Standards**: Fast load times and responsive interactions  
✅ **Cross-Browser Support**: Works on Chrome, Firefox, Safari, Edge  
✅ **Error Handling**: Graceful degradation for network issues  

## CI/CD Integration

The test suite is designed for continuous integration with:
- Automatic test execution on code changes
- Multiple browser and device testing
- Performance regression detection
- Accessibility compliance checking

## Contributing

When adding new tests:
1. Follow the existing directory structure
2. Use the GameStateTracker for comprehensive logging
3. Include both positive and negative test cases
4. Add performance assertions where relevant
5. Update this README if adding new test categories

## Test Reports

After running tests, view detailed reports:
- HTML Report: `playwright-report/index.html`
- JSON Results: `playwright-report/results.json`
- Screenshots: `test-results/screenshots/`
- Video Recordings: `test-results/videos/`
