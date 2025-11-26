# React Party Game Framework

> **A modern, extensible framework for building interactive party games with React, TypeScript, and comprehensive internationalization support.**
> 
> *"We've been through hell so you don't have to."* - The Development Team

## 🎯 What is this Framework?

After months of fighting with React state management, wrestling with TypeScript generics, and discovering that "it works on my machine" is not a deployment strategy, we've somehow managed to create a framework that actually works. 

This battle-tested foundation provides everything you need for building party games like BlameGame, complete with all the features we wish we had when we started this journey:

- **🎮 Multiple Game Types**: Modular architecture that actually makes sense (unlike our first 3 attempts)
- **🌍 Internationalization**: Full i18n support with automatic translation tools *(because manually translating 500+ questions in 4 languages is not fun)*
- **📱 Progressive Web App**: Offline support and app-like experience *(because sometimes the internet is as reliable as our initial estimates)*
- **🎨 Modern UI**: Framer Motion animations and Tailwind CSS styling *(after we gave up on making CSS Grid work like we wanted)*
- **🧪 Testing Ready**: Comprehensive Playwright test infrastructure *(learned the hard way that "it works" ≠ "it works reliably")*
- **⚡ Fast Development**: Vite build system with hot module replacement *(because life's too short to wait for webpack)*

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm (or npm/yarn)
- Basic knowledge of React and TypeScript

### Create Your First Game

```bash
# Clone the framework (this part usually works)
git clone <repository-url>
cd <framework-directory>

# Install dependencies (pray to the npm gods)
pnpm install

# Start development server (fingers crossed)
pnpm dev
```

Your game will be available at `http://localhost:999` *(assuming you don't have anything else running on that port)*

**✨ In 5 minutes, you'll have a working party game!**  
*(\*Results may vary. "Working" is subjective. Your definition of 5 minutes may differ from ours.)*

➡️ **[Complete Setup Guide](getting-started/installation.md)**
➡️ **[First Game Tutorial](getting-started/first-game.md)**

## 🏗️ Framework Architecture

### Core Concepts

```
🎮 Game Module System
├── Phase Controllers    # Game state management
├── Screen Components    # UI screens for each phase
├── Data Providers      # Question/content management
└── Framework Components # Reusable game UI

🔧 Supporting Systems
├── Internationalization # Multi-language support
├── State Management    # Zustand stores
├── Animation System    # Framer Motion integration
└── Testing Framework   # Playwright E2E tests
```

### Game Flow Example

```typescript
// Define your game phases
const gamePhases = [
  { id: 'intro', screen: 'intro' },
  { id: 'setup', screen: 'setup' },
  { id: 'play', screen: 'play' },
  { id: 'summary', screen: 'summary' }
];

// Create a game module
const MyGameModule: GameModule = {
  id: 'mygame',
  async init(ctx) {
    // Initialize game data
  },
  registerScreens() {
    return {
      intro: MyIntroScreen,
      setup: MySetupScreen,
      play: MyGameScreen,
      summary: MySummaryScreen
    };
  }
};
```

➡️ **[Architecture Deep Dive](architecture/README.md)**

## � Documentation Overview

### 🎯 Getting Started
- **[Installation Guide](getting-started/installation.md)** - Set up your development environment
- **[First Game Tutorial](getting-started/first-game.md)** - Build a complete game step-by-step
- **[Code Examples](getting-started/examples/)** - Working code snippets and templates

### 🏗️ Architecture
- **[Framework Core](architecture/framework-core.md)** - Core concepts and patterns
- **[Game Modules](architecture/game-modules.md)** - Creating and organizing game logic
- **[Component System](architecture/component-system.md)** - UI component architecture
- **[State Management](architecture/state-management.md)** - Data flow and state patterns
- **[Phase System](architecture/phase-system.md)** - Game progression and routing

### 📖 Developer Guides
- **[Creating Components](guides/creating-components.md)** - Component development patterns
- **[Internationalization](guides/internationalization.md)** - Multi-language support
- **[Testing](guides/testing.md)** - Testing strategies and tools
- **[Animations](guides/animations.md)** - Using Framer Motion effectively
- **[Theming](guides/theming.md)** - Customizing appearance
- **[PWA Setup](guides/pwa-setup.md)** - Progressive Web App features
- **[Deployment](guides/deployment.md)** - Building and deploying games

### 🔧 API Reference
- **[Hooks](api-reference/hooks/)** - Custom React hooks
- **[Components](api-reference/components/)** - Framework and core components
- **[Framework APIs](api-reference/framework/)** - Core framework interfaces
- **[Utilities](api-reference/utilities/)** - Helper functions and tools

### 💡 Examples
- **[NameBlame Game](examples/nameblame-game/)** - Complete implementation reference
- **[Simple Game](examples/simple-game/)** - Minimal game example
- **[Custom Components](examples/custom-components/)** - Component examples

## 🎮 Built-in Game: NameBlame

The framework includes a complete party game implementation that demonstrates all framework capabilities:

### Game Features
- **👥 3+ Player Support**: Dynamic player management
- **❓ Question Categories**: Humorous blame scenarios
- **🌍 4+ Languages**: English, German, Spanish, French
- **📱 Mobile Optimized**: Touch-friendly interface
- **🎨 Smooth Animations**: Engaging visual feedback

### NameBlame Flow
```
Intro → Player Setup → Question Play → Blame Selection → Summary
```

Each phase demonstrates different framework capabilities:
- **Intro**: Settings and configuration
- **Setup**: Dynamic UI based on game mode
- **Play**: Content loading and user interaction
- **Summary**: Data aggregation and presentation

## 🛠️ Key Technologies

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 19.x |
| **TypeScript** | Type Safety | 5.x |
| **Vite** | Build System | 5.x |
| **Tailwind CSS** | Styling | 3.x |
| **Framer Motion** | Animations | 11.x |
| **Zustand** | State Management | 5.x |
| **i18next** | Internationalization | 23.x |
| **Playwright** | Testing | 1.x |

## 🎯 Framework Benefits

### For Game Developers
- **⚡ Rapid Development**: Pre-built components and patterns *(no more reinventing the wheel for the 47th time)*
- **🔧 Flexible Architecture**: Easy to customize and extend *(because we learned from our rigid, unmaintainable first attempt)*
- **🌍 Global Ready**: Built-in internationalization *(so you don't have to hardcode strings and regret it later)*
- **📱 Modern UX**: Animations and responsive design *(that actually work across different screen sizes)*
- **🧪 Quality Assurance**: Comprehensive testing tools *(because "QA will catch it" is not a strategy)*

### For Teams
- **📚 Great Documentation**: Comprehensive guides and examples *(that we actually keep updated, unlike our first version)*
- **🔄 Consistent Patterns**: Standardized development approaches *(learned after creating 5 different button components)*
- **🛠️ Developer Tools**: Debug panels and development aids *(because `console.log` debugging gets old fast)*
- **📊 Performance**: Optimized build and runtime performance *(after we fixed all the memory leaks)*

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow our coding standards** (see [guides/](guides/))
4. **Add tests** for new functionality
5. **Submit a pull request**

### Development Workflow
```bash
# Set up development environment (hope it works on your machine too)
pnpm install

# Run tests (and watch some of them fail for mysterious reasons)
pnpm test

# Run specific test suites (when you need to debug just one thing)
pnpm test:nameblame
pnpm test:framework

# Build for production (cross your fingers)
pnpm build

# Preview production build (because prod is always different)
pnpm preview
```

## 🎯 Framework Extraction Analysis

**NEW (Nov 2025):** Comprehensive analysis of framework extraction feasibility and recommendations.

We've completed an in-depth analysis to answer: *"Is this framework ready to be extracted into its own repository?"*

**The short answer: YES ✅** (with a phased approach)

### 📊 Key Findings
- **Framework Maturity:** 9/10 - Highly config-driven and generic
- **Extraction Feasibility:** HIGH - Clear boundaries and solid architecture
- **Recommendation:** Extract after completing migration and validating with a second game
- **Expected ROI:** 50-70% faster game development, break-even after 2nd game

### 📚 Analysis Documents

Start here based on your role:

- **👔 Decision Makers** → [Executive Summary](FRAMEWORK_EXTRACTION_EXECUTIVE_SUMMARY.md) (10 min read)
  - Clear YES/NO answers, timeline, costs, ROI
- **👨‍💻 Technical Leads** → [Actionable Recommendations](FRAMEWORK_EXTRACTION_RECOMMENDATIONS.md) (20 min read)
  - Prioritized actions, decision tree, implementation guide
- **🏗️ Architects** → [Full Analysis](FRAMEWORK_EXTRACTION_ANALYSIS.md) (45 min read)
  - Comprehensive technical evaluation, metrics, trade-offs
- **💻 Developers** → [Code Mapping](FRAMEWORK_CODE_MAPPING.md) (30 min read)
  - Visual diagrams, component inventory, migration checklist

**📋 Not sure where to start?** See the [Document Index](FRAMEWORK_EXTRACTION_INDEX.md) for navigation help.

---

## 📄 License

This framework is available under the [MIT License](../LICENSE).

## � Getting Help

- **📖 Documentation**: Check the guides in this repository
- **💡 Examples**: Look at working implementations in `examples/`
- **🐛 Issues**: Report bugs via GitHub Issues
- **� Discussions**: Ask questions in GitHub Discussions

---

**Ready to build your party game?** Start with our **[First Game Tutorial](getting-started/first-game.md)** and have a working game in under 30 minutes!