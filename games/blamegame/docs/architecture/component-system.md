# Component System

The framework provides a comprehensive component system designed for building interactive party games with consistent UX patterns and reusable components.

## 🏗️ Component Architecture

The component system is organized into three main layers:

```
components/
├── core/           # Reusable, generic UI components
├── framework/      # Framework-specific game components  
├── game/           # Game-specific feature components
├── debug/          # Development and debugging components
├── language/       # Language selection and display
└── settings/       # Application settings components
```

## 🧩 Core Components

Core components are **highly reusable UI primitives** that work across all games:

### Input & Form Components
```tsx
// Basic input controls
<Input placeholder="Enter player name" />
<Checkbox checked={isEnabled} onChange={setEnabled} />
<Switch checked={isDarkMode} onChange={setDarkMode} />
<Slider min={1} max={10} value={playerCount} onChange={setPlayerCount} />
```

### Layout & Container Components
```tsx
// Layout primitives
<Card className="p-4">
  <Label>Game Settings</Label>
  <Button variant="primary" size="lg">Start Game</Button>
</Card>

<GameLayout>
  <GameLayout.Header>Game Title</GameLayout.Header>
  <GameLayout.Body>Game Content</GameLayout.Body>
  <GameLayout.Footer>Action Buttons</GameLayout.Footer>
</GameLayout>
```

### Feedback & Display Components
```tsx
// User feedback
<ErrorDisplay error={gameError} />
<Confetti trigger={gameWon} />
<VolumeControl volume={soundVolume} onChange={setSoundVolume} />
```

### Advanced Components
```tsx
// Complex reusable components
<InfoModal 
  isOpen={showRules} 
  onClose={() => setShowRules(false)}
  title="Game Rules"
>
  <p>How to play...</p>
</InfoModal>

<DataLoader
  loader={() => loadGameData()}
  render={({ data, loading, error }) => (
    loading ? <Spinner /> : <GameContent data={data} />
  )}
/>
```

### Component API Pattern

All core components follow consistent patterns:

```tsx
interface ComponentProps {
  // Standard props
  className?: string;
  children?: React.ReactNode;
  
  // Component-specific props
  size?: 'sm' | 'md' | 'lg';
  variant?: string;
  disabled?: boolean;
  
  // Event handlers
  onClick?: () => void;
  onChange?: (value: unknown) => void;
}
```

## 🎮 Framework Components

Framework components provide **game-agnostic layouts and patterns** used across different games:

### Layout Components
```tsx
// Main game shell with persistent header/footer
<GameShell>
  <GameShell.Header />
  <GameShell.Content />
  <GameShell.Footer />
</GameShell>

// Game-specific layouts
<FrameworkIntroScreen />
<FrameworkQuestionScreen />
<FrameworkSummaryScreen />
```

### Animation Components
```tsx
// Text animations
<SplitText 
  text="BlameGame" 
  animation="fadeInUp"
  stagger={0.1}
/>

// Page transitions
<AnimatePresence mode="wait">
  <motion.div key={currentPhase}>
    {renderCurrentScreen()}
  </motion.div>
</AnimatePresence>
```

## 🎯 Game Components

Game components implement **specific game features and screens**:

### Screen Components
```tsx
// Game flow screens
<IntroScreen onStartGame={handleStart} />
<PlayerSetupScreen minPlayers={3} onContinue={handleSetup} />
<QuestionScreen 
  question={currentQuestion}
  onAnswer={handleAnswer}
/>
<SummaryScreen results={gameResults} onRestart={handleRestart} />
```

### Game-Specific UI
```tsx
// Question display
<QuestionCard 
  question={question}
  category={category}
  onSelect={handleSelect}
/>

// Player interaction
<PlayerGrid players={players} currentPlayer={activePlayer} />
<BlameSelector players={players} onBlame={handleBlame} />

// Progress tracking
<QuestionProgress current={5} total={20} />
<GameTimer duration={30} onExpire={handleTimeout} />
```

## 🔧 Component Development Patterns

### 1. **Composition Over Inheritance**

Build complex components by composing simpler ones:

```tsx
const PlayerSetupScreen: React.FC = () => {
  return (
    <GameLayout>
      <Card className="max-w-md mx-auto">
        <Label>Add Players</Label>
        {players.map(player => (
          <Input 
            key={player.id}
            value={player.name}
            onChange={(name) => updatePlayer(player.id, { name })}
          />
        ))}
        <Button onClick={addPlayer}>Add Player</Button>
      </Card>
    </GameLayout>
  );
};
```

### 2. **Custom Hooks for Logic**

Separate business logic from presentation:

```tsx
// Custom hook
const usePlayerSetup = (gameMode: GameMode) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const minPlayers = gameMode === 'nameblame' ? 3 : 2;
  
  const addPlayer = (name: string) => {
    setPlayers(prev => [...prev, { id: generateId(), name }]);
  };
  
  const canContinue = players.length >= minPlayers;
  
  return { players, addPlayer, canContinue, minPlayers };
};

// Component using hook
const PlayerSetupScreen: React.FC = () => {
  const { players, addPlayer, canContinue } = usePlayerSetup('nameblame');
  
  return (
    <GameLayout>
      {/* UI using hook data */}
    </GameLayout>
  );
};
```

### 3. **TypeScript Props Definition**

Use comprehensive TypeScript interfaces:

```tsx
interface QuestionCardProps {
  /** The question to display */
  question: Question;
  
  /** Whether the card is interactive */
  interactive?: boolean;
  
  /** Called when user selects an answer */
  onAnswer?: (answer: string) => void;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Animation configuration */
  animation?: {
    duration: number;
    delay?: number;
  };
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  interactive = true,
  onAnswer,
  className,
  animation = { duration: 0.3 }
}) => {
  // Component implementation
};
```

### 4. **Animation Integration**

Use Framer Motion consistently:

```tsx
const GameScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Screen content */}
    </motion.div>
  );
};
```

### 5. **Internationalization**

Support multiple languages:

```tsx
const IntroScreen: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <Card>
      <h1>{t('intro.title')}</h1>
      <p>{t('intro.description')}</p>
      <Button>{t('intro.start_button')}</Button>
    </Card>
  );
};
```

## 🎨 Styling System

### Tailwind CSS Integration

Components use Tailwind for consistent styling:

```tsx
const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  className,
  ...props 
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-colors';
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900'
  };
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
};
```

### Theme Support

Components support theming through CSS custom properties:

```css
:root {
  --color-primary: 59 130 246;    /* blue-600 */
  --color-secondary: 107 114 128; /* gray-500 */
  --color-accent: 249 115 22;     /* orange-500 */
}

.dark {
  --color-primary: 96 165 250;    /* blue-400 */
  --color-secondary: 156 163 175; /* gray-400 */
}
```

## 🧪 Component Testing

### Unit Testing Pattern

```tsx
// Component test
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
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

  test('applies custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});
```

### Integration Testing

```tsx
// Screen component test
import { render, screen } from '@testing-library/react';
import { IntroScreen } from './IntroScreen';

test('intro screen displays game options', async () => {
  render(<IntroScreen />);
  
  // Check for key elements
  expect(screen.getByText('BlameGame')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument();
  
  // Test interaction
  fireEvent.click(screen.getByRole('button', { name: /start/i }));
  await expect(screen.getByTestId('player-setup')).toBeVisible();
});
```

## 📱 Responsive Design

Components are designed mobile-first:

```tsx
const GameLayout: React.FC = ({ children }) => {
  return (
    <div className="
      min-h-screen 
      p-4 
      sm:p-6 
      lg:p-8
      max-w-4xl 
      mx-auto
      grid 
      grid-rows-[auto_1fr_auto]
    ">
      {children}
    </div>
  );
};
```

## 🔧 Development Tools

### Component Documentation

Each component includes comprehensive JSDoc:

```tsx
/**
 * QuestionCard - Displays a game question with category information
 * 
 * This component renders a question in a card format with the category
 * name and emoji. It supports interaction for answer selection and
 * includes loading states and error handling.
 * 
 * @example
 * <QuestionCard 
 *   question={currentQuestion}
 *   onAnswer={(answer) => handleAnswer(answer)}
 *   loading={false}
 * />
 */
const QuestionCard: React.FC<QuestionCardProps> = (props) => {
  // Implementation
};
```

### Debug Components

Development-only components for testing:

```tsx
// Only rendered in development
{process.env.NODE_ENV === 'development' && (
  <DebugPanel>
    <DebugPanel.Section title="Game State">
      <pre>{JSON.stringify(gameState, null, 2)}</pre>
    </DebugPanel.Section>
  </DebugPanel>
)}
```

## 📚 Component Library

### Available Components

| Category | Components | Description |
|----------|------------|-------------|
| **Input** | Button, Input, Checkbox, Switch, Slider | Form controls and user input |
| **Layout** | Card, GameLayout, Container | Structure and organization |
| **Display** | Label, ErrorDisplay, Confetti | Information display |
| **Advanced** | InfoModal, DataLoader, SplitText | Complex interactions |
| **Game** | QuestionCard, PlayerGrid, GameTimer | Game-specific UI |
| **Framework** | GameShell, FrameworkScreen | Framework layout |

### Usage Examples

See the [Examples section](../examples/) for complete implementations and usage patterns.

---

**Next**: Learn about [State Management](state-management.md) to understand how components interact with application state.