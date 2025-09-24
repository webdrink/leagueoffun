# Internationalization Guide

Learn how to implement comprehensive multi-language support in your party games using the framework's built-in internationalization system.

## 🎯 Overview

The framework provides a complete i18n (internationalization) solution built on **i18next** with:

- **Automatic language detection** based on browser settings
- **Namespace organization** for modular translations  
- **Translation management tools** including auto-translation with OpenAI
- **React integration** with hooks and components
- **Fallback support** for missing translations
- **Dynamic language switching** without page reload

## 📋 Prerequisites

- Basic understanding of React and TypeScript
- Familiarity with the framework's component system
- Node.js 18+ for translation management tools

## 🚀 Quick Start

### 1. Basic Translation Setup

The framework comes with i18n pre-configured. To add translations to your game:

```typescript
// In your component
import { useTranslation } from 'react-i18next';

const MyGameScreen: React.FC = () => {
  const { t } = useTranslation('mygame'); // Use your game's namespace
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('start_button')}</button>
    </div>
  );
};
```

### 2. Add Translation Files

Create translation files for each language:

```json
// public/locales/en/mygame.json
{
  "title": "My Awesome Game",
  "description": "The most fun party game ever!",
  "start_button": "Start Playing",
  "game": {
    "question": "What would you do?",
    "answer": "Choose Answer"
  }
}
```

```json
// public/locales/de/mygame.json  
{
  "title": "Mein Tolles Spiel",
  "description": "Das lustigste Partyspiel aller Zeiten!",
  "start_button": "Spiel Starten",
  "game": {
    "question": "Was würdest du tun?",
    "answer": "Antwort Wählen"
  }
}
```

### 3. Use Nested Translations

```typescript
const GamePlayScreen: React.FC = () => {
  const { t } = useTranslation('mygame');
  
  return (
    <div>
      <h2>{t('game.question')}</h2>
      <button>{t('game.answer')}</button>
    </div>
  );
};
```

## 🏗️ Translation Architecture

### Namespace Organization

The framework uses **namespaces** to organize translations by feature:

```
public/locales/
├── en/
│   ├── common.json          # Shared UI elements
│   ├── navigation.json      # Menu and navigation
│   ├── nameblame.json       # NameBlame game translations
│   └── mygame.json          # Your game translations
├── de/
│   ├── common.json
│   ├── navigation.json
│   ├── nameblame.json
│   └── mygame.json
└── [other-languages]/
```

### Translation Key Structure

Use **hierarchical keys** for organization:

```json
{
  "game": {
    "setup": {
      "title": "Player Setup",
      "add_player": "Add Player",
      "min_players": "Minimum {{count}} players required"
    },
    "play": {
      "question_count": "Question {{current}} of {{total}}",
      "time_remaining": "{{seconds}} seconds left"
    }
  },
  "errors": {
    "network": "Connection failed. Please try again.",
    "validation": "Please check your input."
  }
}
```

## 🔧 Advanced Features

### 1. Interpolation (Variables)

Use variables in your translations:

```typescript
// Translation file
{
  "welcome": "Welcome, {{playerName}}!",
  "question_progress": "Question {{current}} of {{total}}",
  "players_count": "{{count}} player",
  "players_count_plural": "{{count}} players"
}

// Component usage
const { t } = useTranslation();

return (
  <div>
    <h1>{t('welcome', { playerName: 'John' })}</h1>
    <p>{t('question_progress', { current: 5, total: 20 })}</p>
    <p>{t('players_count', { count: playerCount })}</p>
  </div>
);
```

### 2. Pluralization

Handle singular/plural forms automatically:

```json
{
  "player": "{{count}} player",
  "player_plural": "{{count}} players",
  "minute": "{{count}} minute remaining",
  "minute_plural": "{{count}} minutes remaining"
}
```

```typescript
// Automatically selects singular or plural
<p>{t('player', { count: playerCount })}</p>
<p>{t('minute', { count: timeLeft })}</p>
```

### 3. Context-Specific Translations

Use different translations based on context:

```json
{
  "button": "Submit",
  "button_loading": "Submitting...",
  "button_error": "Try Again"
}
```

```typescript
const getButtonText = (state: 'idle' | 'loading' | 'error') => {
  const keys = {
    idle: 'button',
    loading: 'button_loading', 
    error: 'button_error'
  };
  return t(keys[state]);
};
```

### 4. Formatted Values

Format numbers, dates, and currencies:

```typescript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation();

// Format numbers
const score = 1234.56;
const formattedScore = score.toLocaleString(i18n.language);

// Format dates
const gameDate = new Date();
const formattedDate = gameDate.toLocaleDateString(i18n.language);

// Use in component
<p>{t('score')}: {formattedScore}</p>
<p>{t('date')}: {formattedDate}</p>
```

## 🛠️ Translation Management

### Automatic Translation with OpenAI

The framework includes tools for automatic translation:

```bash
# Check which translations are missing
npm run translate:check

# Preview what would be translated (dry run)
npm run translate:dry-run

# Automatically translate missing keys
npm run translate

# Recover from backup if needed
npm run translate:recover
```

### Translation Configuration

Configure automatic translation in `scripts/translate.js`:

```javascript
const translationConfig = {
  // OpenAI API key (set in environment)
  apiKey: process.env.OPENAI_API_KEY,
  
  // Source language (what you write your code in)
  sourceLang: 'en',
  
  // Target languages to translate to
  targetLangs: ['de', 'es', 'fr'],
  
  // Directories to scan for translation keys
  scanDirs: ['components', 'games', 'hooks'],
  
  // Translation prompt for context
  translationPrompt: `
    You are translating a party game application.
    Keep translations fun, casual, and appropriate for social games.
    Maintain any game-specific terminology.
  `
};
```

### Manual Translation Workflow

For sensitive or creative content, use manual translation:

```json
// Mark translations that need manual review
{
  "game": {
    "funny_question": "TODO: Translate this joke carefully",
    "cultural_reference": "TODO: Adapt for German culture"
  }
}
```

### Translation Validation

Ensure translation quality with validation:

```typescript
// Translation validation test
import { validateTranslations } from '../utils/translationValidation';

describe('Translation Validation', () => {
  test('all required keys exist', () => {
    const requiredKeys = [
      'game.title',
      'game.start_button',
      'game.rules'
    ];
    
    validateTranslations('mygame', requiredKeys);
  });
  
  test('interpolation variables match', () => {
    const englishText = 'Welcome {{playerName}}!';
    const germanText = 'Willkommen {{playerName}}!';
    
    expect(extractVariables(englishText))
      .toEqual(extractVariables(germanText));
  });
});
```

## 🎮 Game-Specific Patterns

### 1. Game Content Translations

For games with dynamic content (questions, categories):

```typescript
// Load content with translations
const useGameQuestions = (language: string) => {
  const [questions, setQuestions] = useState([]);
  
  useEffect(() => {
    const loadQuestions = async () => {
      const data = await fetch(`/questions/${language}/questions.json`);
      const questions = await data.json();
      setQuestions(questions);
    };
    
    loadQuestions();
  }, [language]);
  
  return questions;
};

// Use in component
const GameScreen: React.FC = () => {
  const { i18n } = useTranslation();
  const questions = useGameQuestions(i18n.language);
  
  return (
    <div>
      {questions.map(question => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
};
```

### 2. Category and Content Organization

```json
// public/questions/en/categories.json
{
  "categories": {
    "funny": {
      "name": "Funny Situations",
      "emoji": "😂",
      "description": "Hilarious blame scenarios"
    },
    "serious": {
      "name": "Serious Moments", 
      "emoji": "🤔",
      "description": "Thoughtful blame questions"
    }
  }
}
```

```typescript
// Use category translations
const CategorySelector: React.FC = () => {
  const { t } = useTranslation('questions');
  const categories = t('categories', { returnObjects: true });
  
  return (
    <div>
      {Object.entries(categories).map(([id, category]) => (
        <div key={id}>
          <span>{category.emoji}</span>
          <h3>{category.name}</h3>
          <p>{category.description}</p>
        </div>
      ))}
    </div>
  );
};
```

### 3. Language-Specific Game Rules

```json
{
  "rules": {
    "overview": "Players take turns answering questions and blaming each other.",
    "steps": [
      "Read the question aloud",
      "Choose who to blame",
      "Everyone votes on the blame",
      "Continue to next question"
    ],
    "winning": "The player with the most blames wins!",
    "cultural_note": "Remember to keep it fun and lighthearted!"
  }
}
```

## 🎨 Language Selector Component

Create a language selector for your game:

```typescript
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' }
];

const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  
  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    
    // Optionally persist choice
    localStorage.setItem('preferred-language', languageCode);
  };
  
  return (
    <div className="language-selector">
      <label>{t('common.language')}</label>
      <select 
        value={i18n.language} 
        onChange={(e) => changeLanguage(e.target.value)}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};
```

## 🧪 Testing Internationalization

### 1. Translation Key Tests

```typescript
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

// Test that all keys render correctly
test('displays all required translation keys', () => {
  render(
    <I18nextProvider i18n={i18n}>
      <MyGameScreen />
    </I18nextProvider>
  );
  
  // Check that no translation keys are visible (would show as 'key.name')
  expect(screen.queryByText(/\w+\.\w+/)).not.toBeInTheDocument();
});
```

### 2. Language Switching Tests

```typescript
test('switches language correctly', async () => {
  const { rerender } = render(
    <I18nextProvider i18n={i18n}>
      <GameScreen />
    </I18nextProvider>
  );
  
  // Check English content
  expect(screen.getByText('Start Game')).toBeInTheDocument();
  
  // Change language
  await i18n.changeLanguage('de');
  rerender(
    <I18nextProvider i18n={i18n}>
      <GameScreen />
    </I18nextProvider>
  );
  
  // Check German content
  expect(screen.getByText('Spiel Starten')).toBeInTheDocument();
});
```

### 3. Interpolation Tests

```typescript
test('handles variable interpolation', () => {
  render(
    <I18nextProvider i18n={i18n}>
      <WelcomeMessage playerName="John" playerCount={5} />
    </I18nextProvider>
  );
  
  expect(screen.getByText('Welcome, John!')).toBeInTheDocument();
  expect(screen.getByText('5 players joined')).toBeInTheDocument();
});
```

## 🔧 Performance Optimization

### 1. Lazy Loading Translations

```typescript
// Load translations only when needed
const LazyGameScreen = lazy(() => import('./GameScreen'));

const GameWithTranslations: React.FC = () => {
  const { i18n } = useTranslation();
  
  useEffect(() => {
    // Preload game translations
    i18n.loadNamespaces('mygame');
  }, [i18n]);
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LazyGameScreen />
    </Suspense>
  );
};
```

### 2. Translation Caching

```typescript
// Cache translations in localStorage
const i18nConfig = {
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
    addPath: '/locales/{{lng}}/{{ns}}.json',
    
    // Cache in localStorage
    backends: [
      'localStorage',
      'http'
    ],
    
    cacheHitMode: 'refreshAndUpdateStore'
  }
};
```

## 🚫 Common Pitfalls

### 1. **Hardcoded Strings**
```typescript
// ❌ Don't do this
<button>Start Game</button>

// ✅ Do this
<button>{t('start_button')}</button>
```

### 2. **Missing Translation Keys**
```typescript
// ❌ Keys that don't exist will show as-is
<h1>{t('non.existent.key')}</h1> // Shows: "non.existent.key"

// ✅ Always define your keys
<h1>{t('game.title')}</h1> // Shows: "My Game Title"
```

### 3. **Inconsistent Interpolation**
```json
// ❌ Different variable names
{
  "en": "Welcome {{name}}!",
  "de": "Willkommen {{playerName}}!" 
}

// ✅ Consistent variable names
{
  "en": "Welcome {{playerName}}!",
  "de": "Willkommen {{playerName}}!"
}
```

### 4. **Missing Pluralization**
```typescript
// ❌ Manual plural handling
<p>{playerCount === 1 ? '1 player' : `${playerCount} players`}</p>

// ✅ Use i18n pluralization
<p>{t('player', { count: playerCount })}</p>
```

## 📈 Best Practices

### 1. **Namespace Organization**
- Use separate namespaces for different game features
- Keep common UI translations in 'common' namespace
- Group related translations logically

### 2. **Key Naming**
- Use descriptive, hierarchical keys: `game.setup.add_player`  
- Avoid abbreviations: `button` not `btn`
- Be consistent across all languages

### 3. **Translation Quality**
- Provide context to translators
- Review auto-translations carefully
- Test with native speakers when possible
- Consider cultural adaptation, not just literal translation

### 4. **Performance**
- Load only needed namespaces
- Use lazy loading for large translation files
- Cache translations appropriately
- Minimize translation file sizes

---

**Next Steps:**
- Learn about [Testing](testing.md) to validate your i18n implementation
- Explore [Animations](animations.md) to enhance the language switching experience
- Check out [Deployment](deployment.md) for multi-language build optimization