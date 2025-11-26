# API Reference

Complete reference documentation for the React Party Game Framework's APIs, components, hooks, and utilities.

## 📚 API Categories

### 🎣 [Hooks](hooks/)
Custom React hooks for game state management, UI interactions, and framework integration:
- **[useGameState](hooks/useGameState.md)** - Core game state management
- **[useQuestions](hooks/useQuestions.md)** - Question loading and management
- **[usePlayerSetup](hooks/usePlayerSetup.md)** - Player management functionality
- **[useFramework](hooks/useFramework.md)** - Framework context and utilities
- **[useLanguage](hooks/useLanguage.md)** - Internationalization support

### 🧩 [Components](components/)
Reusable UI components for building game interfaces:
- **[Core Components](components/core.md)** - Basic UI primitives (Button, Card, Input, etc.)
- **[Framework Components](components/framework.md)** - Game layout and shell components
- **[Game Components](components/game.md)** - Specialized game UI components

### ⚙️ [Framework](framework/)
Core framework APIs for building and extending games:
- **[Game Modules](framework/game-modules.md)** - Creating and registering game modules
- **[Phase Controllers](framework/phase-controllers.md)** - Managing game state transitions
- **[Event Bus](framework/event-bus.md)** - Inter-component communication
- **[Router System](framework/router.md)** - Navigation and screen management

### 🛠️ [Utilities](utilities/)
Helper functions and utility libraries:
- **[Asset Management](utilities/assets.md)** - Handling static assets and paths
- **[Translation Utils](utilities/translations.md)** - i18n helper functions
- **[Test Utilities](utilities/testing.md)** - Testing helpers and mocks
- **[Type Definitions](utilities/types.md)** - TypeScript interfaces and types

## 🎯 Quick Reference

### Common Patterns

#### Game Component Structure
```typescript
import { useTranslation } from 'react-i18next';
import { useGameState } from '../hooks/useGameState';
import { Button } from '../components/core/Button';

const MyGameScreen: React.FC = () => {
  const { t } = useTranslation('mygame');
  const { currentPhase, transitionTo } = useGameState();
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <Button onClick={() => transitionTo('next-phase')}>
        {t('continue')}
      </Button>
    </div>
  );
};
```

#### Game Module Registration
```typescript
import { GameModule } from '../framework/core/modules';

const MyGameModule: GameModule = {
  id: 'mygame',
  async init(ctx) { /* Initialize */ },
  registerScreens() { /* Map screens */ },
  getPhaseControllers() { /* Define controllers */ }
};
```

#### Custom Hook Pattern
```typescript
import { useState, useEffect } from 'react';
import { useFramework } from '../hooks/useFramework';

const useMyFeature = (config: FeatureConfig) => {
  const { eventBus } = useFramework();
  const [state, setState] = useState(initialState);
  
  useEffect(() => {
    const unsubscribe = eventBus.on('feature:update', setState);
    return unsubscribe;
  }, [eventBus]);
  
  return { state, actions };
};
```

### Type Reference Quick Links

```typescript
// Core types
interface GameConfig { /* ... */ }
interface PhaseController { /* ... */ }  
interface GameModule { /* ... */ }

// Component props
interface ButtonProps { /* ... */ }
interface CardProps { /* ... */ }
interface GameLayoutProps { /* ... */ }

// Hook returns
interface GameStateHook { /* ... */ }
interface QuestionsHook { /* ... */ }
```

## 📖 Documentation Conventions

### Parameter Documentation
- **Required parameters** are marked with `*`
- **Optional parameters** show default values
- **Union types** list all possible values
- **Generic types** include usage examples

### Code Examples
- All examples include complete, runnable code
- TypeScript types are always included
- Error handling patterns are demonstrated
- Performance considerations are noted

### Version Information
- **Stable APIs** - Safe to use in production
- **Beta APIs** - May change in future versions
- **Experimental APIs** - Subject to breaking changes
- **Deprecated APIs** - Will be removed in future versions

## 🔍 Finding What You Need

### By Use Case

| I want to... | Check this API |
|-------------|---------------|
| **Manage game state** | [useGameState](hooks/useGameState.md) |
| **Load questions** | [useQuestions](hooks/useQuestions.md) |
| **Create reusable UI** | [Core Components](components/core.md) |
| **Handle navigation** | [Router System](framework/router.md) |
| **Add translations** | [useLanguage](hooks/useLanguage.md) |
| **Create animations** | [Framework Components](components/framework.md) |
| **Test components** | [Test Utilities](utilities/testing.md) |

### By Component Type

| Component | Purpose | API Reference |
|----------|---------|---------------|
| **Button** | User actions | [Core Components](components/core.md#button) |
| **Card** | Content containers | [Core Components](components/core.md#card) |
| **GameLayout** | Page structure | [Framework Components](components/framework.md#gamelayout) |
| **QuestionCard** | Game questions | [Game Components](components/game.md#questioncard) |

### By Framework Feature

| Feature | Description | API Reference |
|---------|-------------|---------------|
| **Modules** | Game organization | [Game Modules](framework/game-modules.md) |
| **Phases** | State transitions | [Phase Controllers](framework/phase-controllers.md) |
| **Events** | Communication | [Event Bus](framework/event-bus.md) |
| **Routing** | Navigation | [Router System](framework/router.md) |

## 🧪 Testing APIs

All framework APIs include comprehensive examples for testing:

```typescript
// Component testing
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

test('component behavior', () => {
  render(<MyComponent prop="value" />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});

// Hook testing  
import { renderHook } from '@testing-library/react';
import { useMyHook } from './useMyHook';

test('hook behavior', () => {
  const { result } = renderHook(() => useMyHook());
  expect(result.current.value).toBe(expectedValue);
});

// Framework testing
import { createMockFramework } from '../test-utils';

test('framework integration', () => {
  const framework = createMockFramework();
  // Test framework interactions
});
```

## 📊 Performance Guidelines

### Hook Performance
- Use `useMemo` for expensive calculations
- Use `useCallback` for stable function references
- Minimize re-renders with proper dependencies

### Component Performance
- Use `React.memo` for pure components
- Avoid inline objects and functions in JSX
- Optimize animation performance with `transform` and `opacity`

### Framework Performance
- Lazy load game modules when possible
- Batch event bus emissions
- Use efficient state update patterns

## 🚫 Common Mistakes

### Hook Usage
```typescript
// ❌ Don't call hooks conditionally
if (condition) {
  const data = useMyHook();
}

// ✅ Always call hooks at the top level
const data = useMyHook();
if (condition && data) {
  // Use data
}
```

### Component Props
```typescript  
// ❌ Don't mutate props directly
props.config.value = newValue;

// ✅ Use proper state management
const [config, setConfig] = useState(props.config);
setConfig(prev => ({ ...prev, value: newValue }));
```

### Event Bus Usage
```typescript
// ❌ Don't forget to unsubscribe
eventBus.on('event', handler);

// ✅ Always clean up subscriptions
useEffect(() => {
  const unsubscribe = eventBus.on('event', handler);
  return unsubscribe;
}, []);
```

---

**Need help finding something?** Check the specific API category that matches your use case, or search this documentation for relevant keywords.