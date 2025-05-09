# League of Fun

A collection of interactive party games for social gatherings.

## Project Structure

- **game-picker/**: Game selection menu application
- **games/**: Individual game applications
  - **blamegame/**: The Blame Game - question-based party game
  - **truthordrink/**: Truth or Drink game (coming soon)
- **scripts/**: Deployment and utility scripts
- **public/**: Shared public assets 

## Development Setup

### Prerequisites
- Node.js v18+ 
- npm v9+

### Setting up the development environment

1. Clone the repository
```bash
git clone https://github.com/yourusername/leagueoffun.git
cd leagueoffun
```

2. Install dependencies for the game picker
```bash
cd game-picker
npm install
```

3. Install dependencies for individual games
```bash
cd ../games/blamegame
npm install
```

### ESLint v9+ Configuration Notes

This project uses ESLint v9+'s flat configuration system. When working with ESLint in this project:

- Ensure you're using ESLint v9+ and compatible plugins
- All ESLint configs use the ESM format with `export default [...]`
- Package.json files include `"type": "module"` for ESM compatibility
- Each project has its own eslint.config.js tuned for its specific needs

For more detailed information about ESLint configuration, see the TODO.md file.
