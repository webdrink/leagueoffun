# Framework Architecture

This section provides a comprehensive overview of the React Party Game Framework's architecture, core concepts, and implementation patterns.

*"We built this architecture through tears, coffee, and the occasional breakthrough at 3 AM."*

## 📋 Table of Contents

- [Framework Core](framework-core.md) - Core concepts and patterns
- [Game Modules](game-modules.md) - Creating and organizing game logic  
- [Component System](component-system.md) - UI component architecture
- [State Management](state-management.md) - Data flow and state patterns
- [Phase System](phase-system.md) - Game progression and routing
- [Data Providers](data-providers.md) - Content and data management

## 🎯 Architecture Overview

The framework follows a **modular, event-driven architecture** designed for building interactive party games. It separates concerns into distinct layers while maintaining flexibility for different game types.

*(After trying and failing with 3 different architectural approaches, this is the one that didn't make us cry.)*

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Game Application                         │
├─────────────────────────────────────────────────────────────┤
│                     Game Modules                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │  NameBlame      │  │   TruthOrDare   │  │  Custom Game │ │
│  │  Module         │  │   Module        │  │  Module      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                   Framework Core                            │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │ Event Bus     │ │ Phase Router  │ │ Module Registry   │  │
│  └───────────────┘ └───────────────┘ └───────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                 Component System                            │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │ Framework     │ │ Core          │ │ Game              │  │
│  │ Components    │ │ Components    │ │ Components        │  │
│  └───────────────┘ └───────────────┘ └───────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                 Supporting Systems                          │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────┐  │
│  │ i18n System   │ │ State Stores  │ │ Data Providers    │  │
│  └───────────────┘ └───────────────┘ └───────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    React/Vite/TS                           │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Core Principles

### 1. **Modularity** *(Because Monoliths Are Evil)*
Games are self-contained modules that register with the framework:
- Independent game logic and screens *(no more spaghetti code)*
- Pluggable architecture *(like LEGO, but for code)*
- Clean module boundaries *(learned after our first 10,000-line file)*

### 2. **Event-Driven Communication** *(The Global State Alternative)*
Components communicate through a centralized event bus:
- Loose coupling between components *(because tight coupling is the devil)*
- Predictable data flow *(unlike our previous React Context nightmare)*
- Easy debugging and testing *(when it works, which is most of the time)*

### 3. **Phase-Based State Management** *(Game States That Make Sense)*
Games progress through defined phases:
- Clear state transitions *(no more "how did we get here?" moments)*
- Controllable game flow *(unlike our previous chaotic navigation)*
- Reusable phase patterns *(copy-paste, but make it architecture)*

### 4. **Component Composition** *(UI Building Blocks)*
UI built from composable components:
- Reusable across games *(finally, no more duplicate buttons)*
- Consistent styling and behavior *(Tailwind saves the day)*
- Easy customization *(when you inevitably want to change everything)*

### 5. **Developer Experience** *(Because We Suffered So You Don't Have To)*
Framework prioritizes ease of use:
- TypeScript for type safety *(caught 847 bugs at compile time)*
- Hot module replacement *(because waiting for rebuilds is soul-crushing)*
- Comprehensive testing tools *(after we learned testing is not optional)*
- Rich debugging features *(built from our debugging trauma)*

## 🎮 Game Development Flow

### 1. **Define Game Structure**
```json
{
  "gameId": "mygame",
  "phases": [
    { "id": "intro", "screen": "intro" },
    { "id": "play", "screen": "play" },
    { "id": "summary", "screen": "summary" }
  ]
}
```

### 2. **Create Game Module**
```typescript
const MyGameModule: GameModule = {
  id: 'mygame',
  async init(ctx) { /* Initialize game */ },
  registerScreens() { /* Map screens */ },
  getPhaseControllers() { /* Define phase logic */ }
};
```

### 3. **Build Screen Components**
```tsx
const MyGameScreen: React.FC = () => {
  // Use framework hooks and components
  const { currentPhase } = useGameState();
  return <GameLayout>/* Game UI */</GameLayout>;
};
```

### 4. **Test and Deploy**
```bash
pnpm test:mygame  # Run game-specific tests
pnpm build        # Build for production
```

## 🔄 Data Flow Patterns

### Request → Response Flow
```
User Interaction → Event Bus → Phase Controller → State Update → UI Re-render
```

### State Management Flow
```
Game Module → Zustand Store → React Components → User Interface
```

### Content Loading Flow
```
Data Provider → Question/Content → Game Logic → Screen Components
```

## 🧩 Extension Points

The framework provides multiple extension points:

### 1. **Custom Game Modules**
- Implement `GameModule` interface
- Define unique game logic
- Register custom screens

### 2. **Custom Components**
- Extend core components
- Create game-specific UI
- Implement custom animations

### 3. **Custom Data Providers**
- Implement data loading logic
- Support different content sources
- Add filtering and transformation

### 4. **Custom Phase Controllers**
- Define game state transitions
- Implement custom game rules
- Handle complex game flows

## 🎨 Design Patterns

### 1. **Module Pattern**
Each game is a self-contained module with clear interfaces.

### 2. **Observer Pattern** 
Event bus enables loose coupling between components.

### 3. **Strategy Pattern**
Different games implement the same interfaces with unique logic.

### 4. **Provider Pattern**
Data providers abstract content loading and management.

### 5. **Composition Pattern**
UI components compose to create complex layouts.

## 🔍 Architecture Benefits

### For Developers *(The People Who Have To Build This)*
- **Fast Development**: Pre-built components and patterns *(no more reinventing wheels)*
- **Type Safety**: Comprehensive TypeScript support *(your future self will thank you)*
- **Easy Testing**: Isolated components and clear interfaces *(testing that doesn't make you cry)*
- **Debugging**: Rich development tools and logging *(because console.log isn't a debugging strategy)*

### For Games *(The Things That Actually Matter)*
- **Consistent UX**: Shared components ensure consistency *(users won't get confused)*
- **Performance**: Optimized rendering and state management *(after we fixed all the performance issues)*
- **Accessibility**: Built-in accessibility features *(because everyone should be able to play)*
- **Internationalization**: Comprehensive i18n support *(Google Translate integration included)*

### For Teams *(The People Who Have To Maintain This)*
- **Maintainability**: Clear separation of concerns *(future developers won't hate you)*
- **Scalability**: Modular architecture supports growth *(when your game becomes the next big thing)*
- **Documentation**: Self-documenting through TypeScript *(because comments lie, but types don't)*
- **Standards**: Consistent patterns across codebase *(no more "why did they do it this way?")*

## 📈 Framework Evolution

The architecture supports continuous improvement:

### Current Capabilities
- Multiple game support
- Comprehensive i18n
- Rich component library
- Robust testing framework

### Future Extensibility
- Multiplayer support
- Advanced animations
- Plugin system
- Visual game builder

---

**Next Steps**: Dive deeper into specific architectural components:
- [Framework Core](framework-core.md) - Understanding the foundation
- [Game Modules](game-modules.md) - Building your game logic
- [Component System](component-system.md) - Creating engaging UIs