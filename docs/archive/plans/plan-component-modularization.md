## Plan: Game Framework Architecture + Component Modularization + NameBlame Flow Fixes

### 0. Framework Vision & Architecture

#### **Game Framework Goals**
- **Reusable Components**: Build components that can be used across multiple games (not just BlameGame)
- **State Management**: Centralized game state with Zustand for predictable state transitions
- **Modularity**: Clean separation between game logic, UI components, and game-specific content
- **Extensibility**: Easy to add new game modes, question types, and interaction patterns
- **Test-Driven**: Comprehensive test coverage with iterative development approach

#### **Framework Architecture**
```
Game Framework Core
├── State Management (Zustand stores)
│   ├── GameStateStore (current phase, round, player management)
│   ├── UIStateStore (modals, loading, error states)
│   └── GameSpecificStore (blame logs, scores, custom data)
├── Layout Components (reusable across games)
│   ├── GameContainer (outer shell)
│   ├── GameMain (content area with header/screen/footer)
│   └── GameFooter (debug, social, credits)
├── Game Components (game-agnostic patterns)
│   ├── PlayerManager (setup, selection, rotation)
│   ├── ProgressTracker (rounds, questions, completion)
│   └── ActionButtons (blame, next, back, custom actions)
└── Content Adapters (game-specific implementations)
    ├── QuestionRenderer (how questions are displayed)
    ├── GameRules (validation, flow control)
    └── GameActions (custom game behaviors)
```

### 1. Component Architecture Redesign (Framework-First)

#### **Proposed New Structure (Framework-Compatible)**
```
GameContainer (framework component)
├── GameHeader (framework component - title, branding)
├── GameMain (framework component - main content area)
│   ├── GameMainHeader (framework - progress, player info, state indicators)
│   ├── GameMainScreen (framework - content wrapper with animations)
│   └── GameMainFooter (framework - action buttons, navigation)
└── GameFooter (framework - debug, social, app info)
```

#### **State-Driven Component Design**
All components will subscribe to Zustand stores and react to state changes:

**GameStateStore**:
```typescript
interface GameState {
  // Core game flow
  gamePhase: 'intro' | 'setup' | 'loading' | 'playing' | 'summary';
  gameMode: 'classic' | 'nameBlame' | string; // extensible for new games
  currentRound: number;
  totalRounds: number;
  
  // Player management
  players: Player[];
  currentPlayerIndex: number;
  
  // Game-specific state
  nameBlameState?: NameBlameState;
  customGameData?: Record<string, any>;
}
```

**UIStateStore**:
```typescript
interface UIState {
  isLoading: boolean;
  showDebug: boolean;
  activeModal?: string;
  errors: string[];
  loadingMessage?: string;
}
```

### 2. Component Creation Plan (Framework-First Design)

#### **A. GameMain Component (Framework Core)** 
```typescript
interface GameMainProps {
  header?: React.ReactNode;
  screen: React.ReactNode;
  footer?: React.ReactNode;
  gameType?: string; // 'blame' | 'trivia' | 'custom' - for game-specific styling
}
```
- Framework-agnostic layout container
- Supports any game type through composition
- State-aware sizing and animations

#### **B. GameMainHeader Component (Framework Core)**
```typescript
interface GameMainHeaderProps {
  // Framework-standard props
  currentStep?: number;
  totalSteps?: number;
  currentPlayer?: Player;
  gamePhase?: GamePhase;
  
  // Game-specific customization
  customContent?: React.ReactNode;
  showPhaseIndicator?: boolean;
  gameSpecificState?: Record<string, any>;
}
```
- Reusable across all game types
- Subscribes to GameStateStore
- Supports custom game-specific indicators

#### **C. GameMainScreen Component (Framework Core)**
```typescript
interface GameMainScreenProps {
  children: React.ReactNode;
  gameType?: string;
  animationType?: 'slide' | 'fade' | 'scale' | 'custom';
  className?: string;
}
```
- Framework wrapper for any game content
- Standardized animations
- Game-type aware styling

#### **D. GameMainFooter Component (Framework Core)**
```typescript
interface GameMainFooterProps {
  // Standard action patterns
  actionType: 'navigation' | 'selection' | 'custom';
  
  // Navigation actions
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  
  // Selection actions (blame, choose, vote)
  onSelect?: (selection: any) => void;
  selections?: Array<{id: string, label: string, disabled?: boolean}>;
  
  // Custom content
  children?: React.ReactNode;
  
  // State-driven behavior
  disabled?: boolean;
  loading?: boolean;
}
```
- Framework pattern for game actions
- Supports multiple interaction patterns
- State-aware button states

#### **E. Zustand Store Integration**

**GameStateStore.ts** (Framework Core):
```typescript
interface GameState {
  // Core framework state
  gamePhase: GamePhase;
  gameMode: string;
  players: Player[];
  currentPlayerIndex: number;
  
  // Progress tracking
  currentStep: number;
  totalSteps: number;
  
  // Game-specific state
  gameData: Record<string, any>;
  
  // Actions
  setGamePhase: (phase: GamePhase) => void;
  advancePlayer: () => void;
  updateGameData: (data: Record<string, any>) => void;
  resetGame: () => void;
}
```

**BlameGameStore.ts** (Game-Specific):
```typescript
interface BlameGameState {
  // Blame-specific state
  blamePhase: 'selecting' | 'blamed';
  currentBlamer?: string;
  currentBlamed?: string;
  blameLog: NameBlameEntry[];
  
  // Actions
  recordBlame: (from: string, to: string, question: string) => void;
  setBlamePhase: (phase: 'selecting' | 'blamed') => void;
  resetBlameState: () => void;
}
```

### 3. Test-Driven Development Strategy

#### **TDD Loop: Implement → Test → Check → Refine**

**Phase Structure for Each Component:**

1. **Write Tests First**
   - Unit tests for component behavior
   - Integration tests for state interactions
   - Visual regression tests for UI consistency

2. **Implement Component**
   - Create minimal implementation to pass tests
   - Focus on framework contracts first

3. **Integration Testing**
   - Test component within game context
   - Verify state store interactions
   - Run full test suite to check for regressions

4. **Refinement**
   - Performance optimization
   - Accessibility improvements
   - Documentation updates

#### **Testing Strategy by Component**

**GameMain Tests:**
```typescript
// Unit Tests
- Should render header, screen, footer in correct layout
- Should apply game-type specific classes
- Should handle missing header/footer gracefully

// Integration Tests  
- Should subscribe to gamePhase changes
- Should update layout based on game state
- Should pass props correctly to child components

// Visual Tests
- Should maintain consistent spacing across game types
- Should handle different screen sizes
- Should animate transitions smoothly
```

**GameMainHeader Tests:**
```typescript
// Unit Tests
- Should display progress correctly
- Should show current player information
- Should handle missing data gracefully

// State Tests
- Should update when gameState.currentStep changes
- Should show correct player when currentPlayerIndex changes
- Should display blame phase indicators

// Accessibility Tests
- Should have proper ARIA labels
- Should announce player changes to screen readers
```

### 4. Implementation Order (TDD Approach)

#### **Sprint 1: Framework Foundation + Critical NameBlame Fix**
1. **Setup Zustand Stores** (Test → Implement → Integrate)
   - Create GameStateStore with tests
   - Create BlameGameStore with tests
   - Test state synchronization

2. **Fix Auto-Advance Bug** (Test → Implement → Verify)
   - Write test that verifies blame doesn't auto-advance
   - Implement fix in handleBlame
   - Run full test suite for regressions

3. **Create GameMain Framework Components** (Test → Implement → Integrate)
   - GameMain layout component with tests
   - GameMainHeader with state integration
   - GameMainFooter with action patterns

#### **Sprint 2: NameBlame Integration + Player Requirements**
1. **Implement Blame Acknowledgement** (Test → Implement → Verify)
   - Test blame phase transitions
   - Implement blame context display
   - Test "Next to blame" functionality

2. **3-Player Minimum Requirement** (Test → Implement → Verify)
   - Test disabled state with <3 players
   - Implement hint display
   - Test translation integration

3. **Force Setup Screen** (Test → Implement → Verify)
   - Test setup screen navigation
   - Implement mode-change handlers
   - Test localStorage persistence

#### **Sprint 3: Framework Migration + Polish**
1. **Migrate Existing Screens** (Test → Migrate → Verify)
   - Update QuestionScreen to use new components
   - Migrate other screens to framework
   - Test backward compatibility

2. **Playwright End-to-End Tests** (Plan → Implement → Verify)
   - Complete NameBlame flow tests
   - Setup validation tests
   - Cross-browser compatibility

3. **Documentation & Examples** (Document → Review → Finalize)
   - Framework usage guide
   - Game development examples
   - Component API documentation

### 3. Refactoring Strategy

#### **Phase 1: Create New Components (Non-Breaking)**
1. Create `GameMain.tsx` in `components/core/`
2. Create `GameMainHeader.tsx` in `components/game/`
3. Create `GameMainScreen.tsx` in `components/game/`
4. Create `GameMainFooter.tsx` in `components/game/`
5. Create `GameFooter.tsx` in `components/core/`

#### **Phase 2: Refactor QuestionScreen (Breaking Changes)**
1. Extract header logic to GameMainHeader
2. Extract blame button logic to GameMainFooter
3. Keep question display in QuestionScreen (now used within GameMainScreen)
4. Update App.tsx to use new structure

#### **Phase 3: Update Other Screens**
1. Update IntroScreen to use GameMain layout
2. Update PlayerSetupScreen to use GameMain layout
3. Update LoadingContainer to use GameMain layout
4. Update SummaryScreen to use GameMain layout

### 4. NameBlame Fixes Integration

While refactoring, implement these fixes:

#### **A. GameMainHeader Updates**
- Add blame phase indicators
- Show current player in NameBlame mode
- Display blame context ("Seez blamed you for:")

#### **B. GameMainFooter Updates**
- Handle blame acknowledgement phase
- Disable auto-advance on blame selection
- Show "Next to blame" button in blamed phase
- Filter unnamed players from blame buttons

#### **C. App.tsx Updates**
- Remove auto-advance from handleBlame
- Implement proper blame flow phases
- Add 3-player minimum validation
- Force setup screen for NameBlame mode

### 5. File Structure After Framework Implementation

```
src/
├── framework/
│   ├── stores/
│   │   ├── GameStateStore.ts (core game state)
│   │   ├── UIStateStore.ts (UI state management)
│   │   └── index.ts (store exports)
│   ├── components/
│   │   ├── GameContainer.tsx (framework shell)
│   │   ├── GameMain.tsx (content layout)
│   │   ├── GameMainHeader.tsx (progress/player info)
│   │   ├── GameMainScreen.tsx (content wrapper)
│   │   ├── GameMainFooter.tsx (actions)
│   │   └── GameFooter.tsx (app footer)
│   ├── hooks/
│   │   ├── useGameState.ts (state hook)
│   │   ├── usePlayerManagement.ts (player utils)
│   │   └── useGameActions.ts (action helpers)
│   └── types/
│       ├── GameFramework.ts (core types)
│       └── index.ts (type exports)
├── games/
│   ├── blame/
│   │   ├── stores/
│   │   │   └── BlameGameStore.ts (blame-specific state)
│   │   ├── components/
│   │   │   ├── QuestionCard.tsx (blame question display)
│   │   │   ├── BlameSelector.tsx (player selection)
│   │   │   └── BlameContext.tsx (blame acknowledgement)
│   │   ├── types/
│   │   │   └── BlameGame.ts (blame-specific types)
│   │   └── BlameGame.tsx (main game component)
│   └── [future games]/
├── components/ (legacy - to be migrated)
└── tests/
    ├── framework/
    │   ├── components/
    │   ├── stores/
    │   └── integration/
    ├── games/
    │   └── blame/
    └── e2e/
        └── playwright/
```

### 6. Documentation Strategy

#### **Framework Documentation (docs/framework/)**
- **README.md**: Framework overview and quick start
- **ARCHITECTURE.md**: Detailed architecture decisions
- **COMPONENT_API.md**: Complete component API reference
- **STATE_MANAGEMENT.md**: Zustand store patterns
- **GAME_DEVELOPMENT.md**: How to create new games
- **TESTING_GUIDE.md**: Testing patterns and examples

#### **Implementation Documentation (docs/implementation/)**
- **MIGRATION_LOG.md**: Track component migrations
- **BREAKING_CHANGES.md**: Document any breaking changes
- **PERFORMANCE_NOTES.md**: Performance optimizations
- **ACCESSIBILITY.md**: A11y compliance notes

### 7. Benefits of Framework Architecture

1. **Reusability**: Components work across multiple game types
2. **Consistency**: Standardized patterns for common game features
3. **Maintainability**: Clear separation of framework vs game logic
4. **Testability**: Comprehensive test coverage with TDD approach
5. **State Predictability**: Centralized state management with Zustand
6. **Developer Experience**: Well-documented patterns and examples
7. **Performance**: Optimized re-renders through proper state slicing
8. **Accessibility**: Built-in A11y patterns across all components

### 8. Migration Strategy & Backward Compatibility

#### **Phased Migration Approach**
1. **Phase 1**: Create framework components alongside existing ones
2. **Phase 2**: Migrate critical screens (QuestionScreen) to new architecture  
3. **Phase 3**: Migrate remaining screens and remove legacy components
4. **Phase 4**: Extract reusable patterns into framework documentation

#### **Compatibility Guarantees**
- Existing game saves remain compatible
- Current URL routes continue working
- No breaking changes to external APIs
- Graceful fallbacks for missing framework features

### 9. Quality Assurance Process

#### **Per-Component Quality Gates**
1. **Unit Tests**: >90% code coverage
2. **Integration Tests**: State store interactions verified
3. **Visual Tests**: Screenshots for regression detection
4. **Accessibility Tests**: WCAG 2.1 AA compliance
5. **Performance Tests**: Render time benchmarks
6. **Documentation**: Complete API docs with examples

#### **Full System Quality Gates**
1. **E2E Tests**: Complete user journeys work
2. **Cross-Browser**: Chrome, Firefox, Safari, Edge support
3. **Mobile Responsive**: Touch and small screen compatibility
4. **Internationalization**: All text properly translated
5. **PWA Compliance**: Offline functionality maintained

---

This enhanced plan establishes a comprehensive game framework while addressing the immediate NameBlame issues through a test-driven, iterative approach that ensures quality and reusability.