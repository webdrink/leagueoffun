# Framework Core

The Framework Core provides the foundational architecture for building party games. It implements a modular, event-driven system that manages game flow, state transitions, and component lifecycle.

## 🏗️ Core Architecture

The framework core consists of several interconnected systems:

```
Framework Core
├── Event Bus        # Central communication system
├── Module Registry  # Game module management
├── Phase Router     # Game state transitions  
├── Action System    # Centralized command handling
└── Context Provider # Shared game context
```

## 🔄 Event Bus System

The Event Bus provides **decoupled communication** between framework components:

### Event Bus Interface

```typescript
interface EventBus {
  // Subscribe to events
  on<T>(event: string, handler: (data: T) => void): () => void;
  
  // Emit events
  emit<T>(event: string, data: T): void;
  
  // One-time event subscription
  once<T>(event: string, handler: (data: T) => void): () => void;
  
  // Remove all listeners
  clear(): void;
}
```

### Usage Examples

```typescript
// Subscribe to phase changes
const unsubscribe = eventBus.on('phase:changed', (data) => {
  console.log(`Transitioned to phase: ${data.phase}`);
});

// Emit game events
eventBus.emit('game:start', { players, settings });

// Handle user actions
eventBus.on('user:action', ({ action, payload }) => {
  handleUserAction(action, payload);
});

// Cleanup subscription
unsubscribe();
```

### Built-in Events

| Event | Description | Payload |
|-------|-------------|---------|
| `phase:enter` | Phase is entering | `{ phase: string, context: GameContext }` |
| `phase:exit` | Phase is exiting | `{ phase: string, context: GameContext }` |
| `phase:transition` | Requesting phase change | `{ from: string, to: string, action: GameAction }` |
| `game:start` | Game is starting | `{ config: GameConfig }` |
| `game:end` | Game has ended | `{ results: GameResults }` |
| `error:occurred` | Error happened | `{ error: Error, context: string }` |

## 🎮 Module System

The Module System enables **pluggable game architecture**:

### GameModule Interface

```typescript
interface GameModule {
  /** Unique module identifier */
  id: string;
  
  /** Initialize module (load data, setup state) */
  init(ctx: GameModuleContext): void | Promise<void>;
  
  /** Register screen components */
  registerScreens(): ScreenRegistry;
  
  /** Get phase controllers */
  getPhaseControllers(): PhaseControllerMap;
  
  /** Optional: provide translations */
  getTranslations?(): TranslationResources[];
  
  /** Optional: extend theme */
  getThemeExtensions?(): ThemeExtensions;
  
  /** Optional: provide module-specific store */
  getModuleStore?(): ModuleStore;
}
```

### Module Context

```typescript
interface GameModuleContext {
  /** Game configuration */
  config: GameConfig;
  
  /** Action dispatcher */
  dispatch: (action: GameAction, payload?: unknown) => void;
  
  /** Event bus for communication */
  eventBus: EventBus;
  
  /** Current player ID (for multiplayer) */
  playerId?: string | null;
  
  /** Current room ID (for multiplayer) */
  roomId?: string | null;
}
```

### Module Registration

```typescript
// Create a game module
const MyGameModule: GameModule = {
  id: 'mygame',
  
  async init(ctx) {
    // Load game data
    const questions = await loadQuestions();
    ctx.eventBus.emit('game:data-loaded', { questions });
  },
  
  registerScreens() {
    return {
      intro: MyIntroScreen,
      play: MyGameScreen,
      summary: MySummaryScreen
    };
  },
  
  getPhaseControllers() {
    return {
      intro: introController,
      play: playController,
      summary: summaryController
    };
  }
};

// Register with framework
gameModuleRegistry.register(MyGameModule);
```

## 🎯 Phase System

The Phase System manages **game state transitions and flow**:

### Phase Controller Interface

```typescript
interface PhaseController {
  /** Called when entering this phase */
  onEnter?(ctx: GameModuleContext): void | Promise<void>;
  
  /** Called when exiting this phase */
  onExit?(ctx: GameModuleContext): void | Promise<void>;
  
  /** Handle actions and determine transitions */
  transition(
    action: GameAction, 
    ctx: GameModuleContext, 
    payload?: unknown
  ): PhaseTransitionResult;
}
```

### Phase Transition Results

```typescript
type PhaseTransitionResult = 
  | { type: 'continue' }                    // Stay in current phase
  | { type: 'transition', phase: string }   // Move to new phase
  | { type: 'error', error: string };       // Error occurred
```

### Example Phase Controller

```typescript
const playController: PhaseController = {
  async onEnter(ctx) {
    // Setup play phase
    ctx.eventBus.emit('phase:play-started');
    
    // Load first question  
    const question = await getNextQuestion();
    ctx.dispatch('question:loaded', { question });
  },
  
  async onExit(ctx) {
    // Cleanup play phase
    ctx.eventBus.emit('phase:play-ended');
  },
  
  transition(action, ctx, payload) {
    switch (action.type) {
      case 'question:answered':
        // Check if more questions available
        if (hasMoreQuestions()) {
          loadNextQuestion();
          return { type: 'continue' };
        } else {
          return { type: 'transition', phase: 'summary' };
        }
        
      case 'game:quit':
        return { type: 'transition', phase: 'intro' };
        
      default:
        return { type: 'continue' };
    }
  }
};
```

## ⚡ Action System

The Action System provides **centralized command handling**:

### Action Interface

```typescript
interface GameAction {
  /** Action type identifier */
  type: string;
  
  /** Optional action metadata */
  meta?: {
    timestamp?: number;
    source?: string;
    priority?: 'low' | 'medium' | 'high';
  };
}
```

### Common Action Types

```typescript
// Game flow actions
const GAME_ACTIONS = {
  START: 'game:start',
  PAUSE: 'game:pause',
  RESUME: 'game:resume',
  END: 'game:end',
  QUIT: 'game:quit'
} as const;

// Phase actions  
const PHASE_ACTIONS = {
  NEXT: 'phase:next',
  PREVIOUS: 'phase:previous',
  JUMP: 'phase:jump'
} as const;

// Question actions
const QUESTION_ACTIONS = {
  LOAD: 'question:load',
  ANSWER: 'question:answer',
  SKIP: 'question:skip'
} as const;
```

### Action Dispatch

```typescript
// Dispatch actions from components
const handleStartGame = () => {
  dispatch(
    { type: 'game:start' },
    { players, settings }
  );
};

// Handle actions in phase controllers
transition(action, ctx, payload) {
  if (action.type === 'game:start') {
    return { type: 'transition', phase: 'play' };
  }
  return { type: 'continue' };
}
```

## 🔧 Router System

The Router System manages **screen navigation and component rendering**:

### Router Interface

```typescript
interface GameRouter {
  /** Current active phase */
  currentPhase: string;
  
  /** Navigate to a specific phase */
  navigateTo(phase: string): void;
  
  /** Get current screen component */
  getCurrentScreen(): React.ComponentType;
  
  /** Check if navigation is allowed */
  canNavigateTo(phase: string): boolean;
}
```

### Screen Registration

```typescript
// Modules register their screens
const screens = {
  intro: IntroScreen,
  setup: PlayerSetupScreen, 
  play: QuestionScreen,
  summary: SummaryScreen
};

// Router renders current screen
const CurrentScreen = router.getCurrentScreen();
return <CurrentScreen />;
```

### Navigation

```typescript
// Navigate programmatically
router.navigateTo('play');

// Navigate via events
eventBus.emit('phase:navigate', { phase: 'summary' });

// Navigate via actions
dispatch({ type: 'phase:next' });
```

## 🏪 Context Provider

The Context Provider gives **shared access to framework services**:

### Framework Context

```typescript
interface FrameworkContext {
  /** Current game configuration */
  config: GameConfig;
  
  /** Event bus instance */
  eventBus: EventBus;
  
  /** Action dispatcher */
  dispatch: (action: GameAction, payload?: unknown) => void;
  
  /** Current game phase */
  currentPhase: string;
  
  /** Module registry */
  modules: ModuleRegistry;
  
  /** Router instance */
  router: GameRouter;
}
```

### Using Context

```typescript
// In components
const { dispatch, eventBus, currentPhase } = useFramework();

// Subscribe to events
useEffect(() => {
  const unsubscribe = eventBus.on('game:start', handleGameStart);
  return unsubscribe;
}, [eventBus]);

// Dispatch actions
const handleUserAction = () => {
  dispatch({ type: 'user:action' }, { data });
};
```

## 🧪 Framework Initialization

### Initialization Sequence

```typescript
// 1. Create framework instance
const framework = new GameFramework();

// 2. Register modules
framework.registerModule(NameBlameModule);
framework.registerModule(MyCustomModule);

// 3. Load configuration
const config = await loadGameConfig();
framework.configure(config);

// 4. Initialize modules
await framework.initializeModules();

// 5. Start framework
framework.start();
```

### Configuration

```typescript
interface GameConfig {
  /** Active game module */
  gameId: string;
  
  /** Game phases configuration */
  phases: PhaseConfig[];
  
  /** Game-specific settings */
  gameSettings: Record<string, unknown>;
  
  /** UI configuration */
  ui: {
    theme: string;
    animations: boolean;
    sounds: boolean;
  };
  
  /** Internationalization */
  i18n: {
    defaultLanguage: string;
    availableLanguages: string[];
  };
}
```

## 🔍 Debugging and Development

### Development Tools

```typescript
// Enable debug mode
const framework = new GameFramework({ debug: true });

// Access framework globals (development only)
window.framework = framework;
window.eventBus = framework.eventBus;
window.gameState = framework.getCurrentState();

// Debug event logging
eventBus.on('*', (event, data) => {
  console.log(`[EventBus] ${event}:`, data);
});
```

### Error Handling

```typescript
// Global error handling
framework.onError((error, context) => {
  console.error('Framework error:', error);
  
  // Report to error service
  errorService.report(error, context);
  
  // Show user-friendly message
  showErrorNotification(error);
});

// Phase-specific error handling
const controller: PhaseController = {
  transition(action, ctx) {
    try {
      return handleAction(action);
    } catch (error) {
      ctx.eventBus.emit('error:occurred', { error, phase: 'play' });
      return { type: 'error', error: error.message };
    }
  }
};
```

## 📊 Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Modules load on-demand
2. **Event Batching**: Multiple events batched for performance
3. **Component Memoization**: Prevent unnecessary re-renders
4. **State Normalization**: Efficient state updates

### Performance Monitoring

```typescript
// Track phase transition times
eventBus.on('phase:enter', ({ phase }) => {
  performance.mark(`phase-${phase}-start`);
});

eventBus.on('phase:exit', ({ phase }) => {
  performance.mark(`phase-${phase}-end`);
  performance.measure(`phase-${phase}`, 
    `phase-${phase}-start`, 
    `phase-${phase}-end`
  );
});
```

---

**Next**: Learn about [Game Modules](game-modules.md) to understand how to create your own games using the framework core.