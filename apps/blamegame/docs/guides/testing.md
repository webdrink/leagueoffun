# Testing Guide

Learn how to implement comprehensive testing for your party games using Playwright, React Testing Library, and the framework's built-in testing utilities.

## 🎯 Overview

The framework provides a complete testing ecosystem with:

- **Playwright E2E Testing** - Full user journey testing
- **React Testing Library** - Component unit and integration testing  
- **Framework Test Utilities** - Helper functions for game testing
- **Test Organization** - Structured test suites by concern
- **CI/CD Integration** - Automated testing in deployment pipeline

## 📋 Prerequisites

- Basic understanding of JavaScript testing concepts
- Familiarity with React components and hooks
- Knowledge of the framework's component system

## 🚀 Quick Start

### 1. Running Tests

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit          # React Testing Library tests
pnpm test:e2e           # Playwright E2E tests
pnpm test:nameblame     # Game-specific tests
pnpm test:framework     # Framework core tests

# Run tests in watch mode (development)
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### 2. Basic Component Test

```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../components/core/Button';

describe('Button Component', () => {
  test('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  test('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('applies variant styles', () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole('button')).toHaveClass('btn-secondary');
  });
});
```

### 3. Basic E2E Test

```typescript
// tests/flows/basic-game-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete game flow', async ({ page }) => {
  await page.goto('/');
  
  // Start game
  await page.click('[data-testid="start-game"]');
  
  // Setup players
  await page.fill('[data-testid="player-input"]', 'Alice');
  await page.click('[data-testid="add-player"]');
  await page.fill('[data-testid="player-input"]', 'Bob');
  await page.click('[data-testid="add-player"]');
  await page.click('[data-testid="continue"]');
  
  // Play game
  await expect(page.locator('[data-testid="question-card"]')).toBeVisible();
  await page.click('[data-testid="blame-button"]');
  
  // Check summary
  await expect(page.locator('[data-testid="game-summary"]')).toBeVisible();
});
```

## 🏗️ Test Architecture

### Test Organization

The framework organizes tests by concern:

```
tests/
├── components/           # Component unit tests
│   ├── core/            # Core component tests
│   ├── framework/       # Framework component tests
│   └── game/            # Game component tests
├── flows/               # E2E user journey tests
│   ├── nameblame-mode/  # NameBlame game flows
│   ├── classic-mode/    # Classic game flows
│   └── shared/          # Common game flows
├── foundation/          # Basic app functionality
├── edge-cases/          # Error states and edge cases
├── utils/               # Testing utilities
└── fixtures/            # Test data and mocks
```

### Test Types and Purposes

| Test Type | Purpose | Tools | When to Use |
|-----------|---------|-------|------------|
| **Unit** | Single component behavior | React Testing Library | Component logic, props, rendering |
| **Integration** | Component interaction | RTL + Test Utils | Multiple components working together |
| **E2E** | Full user journeys | Playwright | Complete game flows, user scenarios |
| **Visual** | UI appearance | Playwright Screenshots | Layout, styling, responsive design |
| **Performance** | Speed and efficiency | Playwright Metrics | Loading times, animation performance |

## 🧪 Component Testing

### Testing Core Components

```typescript
// tests/components/core/Card.test.tsx
import { render, screen } from '@testing-library/react';
import { Card } from '../../../components/core/Card';

describe('Card Component', () => {
  test('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(
      <Card className="custom-class">Content</Card>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(
      <Card onClick={handleClick} clickable>
        Clickable card
      </Card>
    );
    
    fireEvent.click(screen.getByText('Clickable card'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Testing Game Components

```typescript
// tests/components/game/QuestionCard.test.tsx
import { render, screen } from '@testing-library/react';
import { QuestionCard } from '../../../components/game/QuestionCard';
import { mockQuestion } from '../../fixtures/questions';

describe('QuestionCard Component', () => {
  test('displays question and category', () => {
    render(<QuestionCard question={mockQuestion} />);
    
    expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
    expect(screen.getByText(mockQuestion.categoryName)).toBeInTheDocument();
    expect(screen.getByText(mockQuestion.categoryEmoji)).toBeInTheDocument();
  });

  test('calls onAnswer when answered', () => {
    const handleAnswer = jest.fn();
    render(
      <QuestionCard 
        question={mockQuestion} 
        onAnswer={handleAnswer}
        interactive 
      />
    );
    
    fireEvent.click(screen.getByTestId('answer-button'));
    expect(handleAnswer).toHaveBeenCalledWith(mockQuestion.id);
  });

  test('shows loading state', () => {
    render(<QuestionCard question={mockQuestion} loading />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Testing Hooks

```typescript
// tests/hooks/useGameState.test.ts
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../../hooks/useGameState';

describe('useGameState Hook', () => {
  test('initializes with default state', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(result.current.currentPhase).toBe('intro');
    expect(result.current.players).toEqual([]);
    expect(result.current.currentQuestionIndex).toBe(0);
  });

  test('transitions phases correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.transitionToPhase('play');
    });
    
    expect(result.current.currentPhase).toBe('play');
  });

  test('manages players correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    act(() => {
      result.current.addPlayer('Alice');
      result.current.addPlayer('Bob');
    });
    
    expect(result.current.players).toHaveLength(2);
    expect(result.current.players[0].name).toBe('Alice');
  });
});
```

## 🎮 Game Flow Testing

### E2E Game Testing Pattern

```typescript
// tests/flows/nameblame-mode/complete-game.spec.ts
import { test, expect } from '@playwright/test';
import { GameTestHelper } from '../../utils/GameTestHelper';

test.describe('NameBlame Complete Game Flow', () => {
  let gameHelper: GameTestHelper;
  
  test.beforeEach(async ({ page }) => {
    gameHelper = new GameTestHelper(page);
    await gameHelper.navigateToGame();
  });

  test('full game with 3 players', async ({ page }) => {
    // Setup phase
    await gameHelper.startNameBlameMode();
    await gameHelper.addPlayers(['Alice', 'Bob', 'Charlie']);
    await gameHelper.proceedToGame();
    
    // Play phase - answer multiple questions
    for (let i = 0; i < 5; i++) {
      await gameHelper.answerQuestion();
      await gameHelper.assignBlame('Alice'); // Blame Alice each time
      await gameHelper.proceedToNextQuestion();
    }
    
    // Summary phase
    await gameHelper.expectGameSummary();
    const results = await gameHelper.getGameResults();
    
    expect(results.totalQuestions).toBe(5);
    expect(results.playerStats['Alice'].blamesReceived).toBe(5);
  });

  test('handles minimum player requirement', async ({ page }) => {
    await gameHelper.startNameBlameMode();
    await gameHelper.addPlayers(['Alice', 'Bob']); // Only 2 players
    
    // Should show error about minimum players
    await expect(page.locator('[data-testid="min-players-error"]'))
      .toContainText('at least 3 players');
    
    // Continue button should be disabled
    await expect(page.locator('[data-testid="continue"]'))
      .toBeDisabled();
  });
});
```

### Testing Game State Transitions

```typescript
// tests/flows/state-transitions.spec.ts
import { test, expect } from '@playwright/test';

test('game phase transitions', async ({ page }) => {
  await page.goto('/');
  
  // Intro → Setup
  await page.click('[data-testid="nameblame-mode"]');
  await expect(page).toHaveURL(/.*setup/);
  
  // Setup → Game (after adding players)
  await page.fill('[data-testid="player-input"]', 'Player1');
  await page.click('[data-testid="add-player"]');
  await page.fill('[data-testid="player-input"]', 'Player2');
  await page.click('[data-testid="add-player"]');
  await page.fill('[data-testid="player-input"]', 'Player3');
  await page.click('[data-testid="add-player"]');
  
  await page.click('[data-testid="continue"]');
  await expect(page).toHaveURL(/.*game/);
  
  // Game → Summary (after completing questions)
  await page.click('[data-testid="skip-to-summary"]'); // Dev helper
  await expect(page).toHaveURL(/.*summary/);
  
  // Summary → Intro (restart)
  await page.click('[data-testid="play-again"]');
  await expect(page).toHaveURL(/.*intro/);
});
```

## 🌍 Internationalization Testing

### Testing Translation Keys

```typescript
// tests/i18n/translations.test.ts
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../lib/i18n/config';

describe('Translation Tests', () => {
  test('all game keys exist in all languages', async () => {
    const languages = ['en', 'de', 'es', 'fr'];
    const requiredKeys = [
      'game.title',
      'game.start',
      'game.rules',
      'players.add',
      'players.min_required'
    ];
    
    for (const lang of languages) {
      await i18n.changeLanguage(lang);
      
      for (const key of requiredKeys) {
        const translation = i18n.t(key);
        
        // Key should not be returned as-is (indicates missing translation)
        expect(translation).not.toBe(key);
        expect(translation.length).toBeGreaterThan(0);
      }
    }
  });

  test('interpolation works correctly', () => {
    const TestComponent = () => {
      const { t } = useTranslation();
      return <p>{t('welcome_message', { playerName: 'John' })}</p>;
    };
    
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent />
      </I18nextProvider>
    );
    
    expect(screen.getByText(/Welcome.*John/)).toBeInTheDocument();
  });
});
```

### E2E Language Testing

```typescript
// tests/flows/language-switching.spec.ts
import { test, expect } from '@playwright/test';

test('language switching works correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check default language (English)
  await expect(page.locator('h1')).toContainText('BlameGame');
  
  // Switch to German
  await page.selectOption('[data-testid="language-selector"]', 'de');
  
  // Check German content appears
  await expect(page.locator('h1')).toContainText('BlameGame'); // Title stays same
  await expect(page.locator('[data-testid="start-button"]'))
    .toContainText('Spiel starten');
  
  // Switch to Spanish
  await page.selectOption('[data-testid="language-selector"]', 'es');
  await expect(page.locator('[data-testid="start-button"]'))
    .toContainText('Empezar juego');
  
  // Language preference should persist on reload
  await page.reload();
  await expect(page.locator('[data-testid="start-button"]'))
    .toContainText('Empezar juego');
});
```

## 🎨 Visual Regression Testing

### Screenshot Testing

```typescript
// tests/visual/game-screens.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('intro screen appearance', async ({ page }) => {
    await page.goto('/');
    
    // Wait for animations to complete
    await page.waitForTimeout(1000);
    
    // Take screenshot
    await expect(page).toHaveScreenshot('intro-screen.png');
  });

  test('question screen layout', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to question screen
    await page.click('[data-testid="start-game"]');
    await page.fill('[data-testid="player-input"]', 'TestPlayer');
    await page.click('[data-testid="add-player"]');
    await page.click('[data-testid="continue"]');
    
    // Wait for question to load
    await page.waitForSelector('[data-testid="question-card"]');
    
    await expect(page).toHaveScreenshot('question-screen.png');
  });

  test('responsive design - mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    
    await expect(page).toHaveScreenshot('intro-mobile.png');
  });
});
```

### Accessibility Testing

```typescript
// tests/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('intro screen is accessible', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('keyboard navigation works', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="start-button"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); 
    await expect(page.locator('[data-testid="language-selector"]')).toBeFocused();
    
    // Enter should activate buttons
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="player-setup"]')).toBeVisible();
  });
});
```

## 🛠️ Testing Utilities

### Framework Test Helpers

```typescript
// tests/utils/GameTestHelper.ts
export class GameTestHelper {
  constructor(private page: Page) {}

  async navigateToGame() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async startNameBlameMode() {
    await this.page.click('[data-testid="nameblame-mode"]');
    await this.page.waitForURL(/.*setup/);
  }

  async addPlayers(playerNames: string[]) {
    for (const name of playerNames) {
      await this.page.fill('[data-testid="player-input"]', name);
      await this.page.click('[data-testid="add-player"]');
    }
  }

  async proceedToGame() {
    await this.page.click('[data-testid="continue"]');
    await this.page.waitForURL(/.*game/);
    await this.page.waitForSelector('[data-testid="question-card"]');
  }

  async answerQuestion() {
    await this.page.waitForSelector('[data-testid="question-card"]');
    await this.page.click('[data-testid="answer-button"]');
  }

  async assignBlame(playerName: string) {
    await this.page.click(`[data-testid="blame-${playerName}"]`);
    await this.page.click('[data-testid="confirm-blame"]');
  }

  async getGameResults() {
    const resultsElement = await this.page.locator('[data-testid="game-results"]');
    const resultsText = await resultsElement.textContent();
    return JSON.parse(resultsText || '{}');
  }
}
```

### Mock Data and Fixtures

```typescript
// tests/fixtures/questions.ts
export const mockQuestion = {
  id: 'test-question-1',
  text: 'Who would forget to charge their phone before a long trip?',
  categoryId: 'travel',
  categoryName: 'Travel Troubles',
  categoryEmoji: '✈️'
};

export const mockQuestions = [
  mockQuestion,
  {
    id: 'test-question-2', 
    text: 'Who would accidentally double-book their weekend?',
    categoryId: 'planning',
    categoryName: 'Planning Problems',
    categoryEmoji: '📅'
  }
];

export const mockPlayers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
  { id: '3', name: 'Charlie' }
];
```

### Custom Testing Matchers

```typescript
// tests/utils/custom-matchers.ts
import { expect } from '@playwright/test';

// Custom matcher for checking game state
expect.extend({
  async toHaveGamePhase(page: Page, expectedPhase: string) {
    const currentPhase = await page.getAttribute('[data-testid="game-container"]', 'data-phase');
    
    return {
      pass: currentPhase === expectedPhase,
      message: () => `Expected game phase to be ${expectedPhase}, but got ${currentPhase}`
    };
  }
});

// Usage in tests
await expect(page).toHaveGamePhase('play');
```

## 🔧 Test Configuration

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  
  // Test organization
  projects: [
    {
      name: 'foundation',
      testDir: './tests/foundation'
    },
    {
      name: 'nameblame-flows',
      testDir: './tests/flows/nameblame-mode'
    },
    {
      name: 'visual-regression',
      testDir: './tests/visual',
      use: { screenshot: 'only-on-failure' }
    }
  ],
  
  // Global settings
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  
  // Test timeout and retries
  timeout: 30000,
  retries: 2,
  
  // Web server
  webServer: {
    command: 'pnpm dev',
    port: 5173,
    reuseExistingServer: !process.env.CI
  }
});
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@components/(.*)$': '<rootDir>/components/$1',
    '^@hooks/(.*)$': '<rootDir>/hooks/$1'
  },
  
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.stories.{ts,tsx}'
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80, 
      lines: 80,
      statements: 80
    }
  }
};
```

## 📊 Continuous Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test:unit --coverage
      - run: pnpm test:framework
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm playwright install
      - run: pnpm test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-results
          path: test-results/
```

## 🚫 Common Testing Pitfalls

### 1. **Testing Implementation Details**
```typescript
// ❌ Don't test internal state
expect(component.state.internalCounter).toBe(5);

// ✅ Test user-visible behavior  
expect(screen.getByText('Counter: 5')).toBeInTheDocument();
```

### 2. **Brittle Selectors**
```typescript
// ❌ Fragile CSS selectors
await page.click('.btn.btn-primary.large');

// ✅ Stable test IDs
await page.click('[data-testid="start-game-button"]');
```

### 3. **Missing Async Handling**
```typescript
// ❌ Not waiting for async operations
fireEvent.click(button);
expect(screen.getByText('Loading...')).toBeInTheDocument();

// ✅ Properly wait for changes
fireEvent.click(button);
await waitFor(() => {
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### 4. **Over-Mocking**
```typescript
// ❌ Mocking everything
jest.mock('../../hooks/useGameState');
jest.mock('../../components/QuestionCard');

// ✅ Mock only external dependencies
jest.mock('../../api/questionService');
```

## 📈 Best Practices

### 1. **Test Organization**
- Group tests by feature/component
- Use descriptive test and suite names
- Keep tests focused and isolated
- Use setup/teardown appropriately

### 2. **Test Data**
- Use realistic test data
- Create reusable fixtures
- Avoid hardcoded values
- Test edge cases and boundaries

### 3. **Assertions**
- Test user-visible behavior
- Use meaningful error messages
- Test positive and negative cases
- Avoid testing implementation details

### 4. **Performance**
- Keep tests fast and reliable
- Use proper waiting strategies
- Clean up after tests
- Run tests in parallel when possible

---

**Next Steps:**  
- Learn about [Animations](animations.md) to test animated components
- Explore [Deployment](deployment.md) to set up automated testing in CI/CD
- Check out [Creating Components](creating-components.md) for testable component patterns