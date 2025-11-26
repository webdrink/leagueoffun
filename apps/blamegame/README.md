# The Blame Game

> **Part of the League of Fun collection - the first game built on our React Party Game Framework**

A party game for friends! One person reads a question, passes the phone, and the group decides: Who's to blame?

*The Blame Game serves as both a fun party game and a showcase of our extensible party game framework. It's the first of many games to come in the League of Fun collection.*

## 🎮 How to Play
1. Press "Spiel starten" to begin
2. Choose your game mode:
   - **Classic**: Jump straight into random questions
   - **NameBlame**: Add friends' names for personalized fun
3. Read questions aloud and pass the device
4. Discuss and decide who fits the description best!

## ✨ Game Features
- **🎯 Two Game Modes**: Classic quick-play and personalized NameBlame
- **📱 Mobile-First Design**: Optimized for phone passing and group play
- **🌍 Multi-Language Support**: English, German, Spanish, French
- **⚙️ Config-Driven Settings**: Customize question count, categories, and behavior
- **🎨 Smooth Animations**: Engaging transitions and visual feedback
- **📱 Progressive Web App**: Install on your device for offline play
- **🎵 Sound Effects**: Optional audio feedback
- **🌙 Dynamic Themes**: Appearance adapts to time of day
- **♿ Accessibility**: Screen reader support and keyboard navigation

## 🏗️ Built on React Party Game Framework

The Blame Game is powered by our custom-built React Party Game Framework, designed for rapid development of interactive party games:

- **🎮 Modular Game System**: Easy to extend and customize
- **🌍 Internationalization**: Built-in i18n with automatic translation tools  
- **🧪 Testing Infrastructure**: Comprehensive Playwright test suite
- **⚡ Modern Tech Stack**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **📊 Config-Driven**: Game behavior controlled via JSON configuration

## 🌟 About League of Fun

The Blame Game is part of **League of Fun**, a collection of digital party games designed to bring people together. Each game in our collection is built using the same robust, extensible framework, ensuring consistent quality and rapid development.

### Why Config-Driven?
Our games are primarily **configuration-driven**, meaning:
- **Easy Customization**: Game behavior is controlled through JSON files
- **Rapid Development**: New games can be created by modifying configuration
- **Consistent Experience**: All games share the same proven UI patterns
- **Maintainable Code**: Logic is separated from content and configuration

### Framework Advantages
- **🔧 Reusable Components**: Shared UI elements across all League of Fun games
- **🌍 Built-in Internationalization**: Easy localization for global audiences  
- **📱 PWA-Ready**: All games support offline installation
- **🧪 Testing Infrastructure**: Comprehensive automated testing
- **⚡ Performance Optimized**: Fast loading and smooth animations

## 📚 Developer Documentation

Extensive documentation is available for developers interested in the framework:

- **[Framework Overview](docs/README.md)** - Complete framework documentation
- **[Getting Started](docs/getting-started/README.md)** - Build your first game
- **[Architecture Guide](docs/architecture/README.md)** - Framework design and concepts
- **[Developer Guides](docs/guides/README.md)** - Step-by-step implementation guides
- **[API Reference](docs/api-reference/README.md)** - Complete API documentation
- **[Testing Guide](docs/guides/testing.md)** - Testing strategies and tools

## 🚀 Development and Deployment

### Local Development
```bash
# Install dependencies
pnpm install

# Start development server  
pnpm dev

# Run tests
pnpm test

# Run specific game tests
pnpm test:nameblame
```

### Building for Production
```bash
# Standard build
pnpm build

# Build for custom domain
pnpm build:windows-domain  # Windows
pnpm build:domain          # Linux/macOS

# Preview production build
pnpm preview
```

### Testing
```bash
# Run all tests
pnpm test

# Run E2E tests only
pnpm test:e2e

# Run tests in specific browsers
pnpm test --project=chromium
pnpm test --project=firefox
pnpm test --project=webkit
```

## 🌐 Live Demo

The Blame Game is deployed at [blamegame.leagueoffun.de](https://blamegame.leagueoffun.de).

*Try it out with friends to see the framework in action!*

## 🛠️ Technical Architecture

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React 19 + TypeScript | Component-based UI |
| **Build System** | Vite | Fast development and building |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Animations** | Framer Motion | Smooth transitions and effects |
| **State Management** | Zustand | Lightweight global state |
| **Internationalization** | i18next | Multi-language support |
| **Testing** | Playwright | End-to-end testing |
| **PWA** | vite-plugin-pwa | Offline capabilities |

## 🤝 Contributing

We welcome contributions to both the game and the underlying framework!

### Game Content
- Add new question categories or translations
- Improve game balance and user experience
- Report bugs and suggest features

### Framework Development  
- Enhance framework capabilities
- Add new component patterns
- Improve testing infrastructure
- Contribute to documentation

See our [contribution guidelines](docs/guides/README.md) for more details.

## 📄 License

This project is available under the [MIT License](LICENSE).

## 🔮 What's Next?

The Blame Game is just the beginning. The League of Fun framework will power many more party games:

- **Truth or Dare** - Already in development as a framework example
- **Would You Rather** - Decision-based social gaming
- **Story Builder** - Collaborative storytelling games
- **Custom Games** - Build your own using our framework

*Each game leverages the same robust foundation, ensuring quality and consistency across the entire League of Fun collection.*

---

**🎮 Ready to play?** Visit [blamegame.leagueoffun.de](https://blamegame.leagueoffun.de)

**🛠️ Want to build your own game?** Check out our [Framework Documentation](docs/README.md)

---

© 2025 League of Fun
