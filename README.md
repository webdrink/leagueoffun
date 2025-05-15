# The Blame Game

A party game for friends! One person reads a question, passes the phone, and the group decides: Who's to blame?

## How to Play
1. Press "Spiel starten" to begin.
2. Categories are chosen at random.
3. Read the question aloud and pass the device.
4. Discuss and decide who fits the description best!

## Features
- Randomized categories and questions
- Fun loading animations
- Mobile-friendly design
- Dynamic themes based on time of day
- Sound effects
- NameBlame Mode for personalized play with friends
- Progressive Web App (PWA) support for offline play
- Accessibility improvements for all users
- Multilingual support with language selection (German/English)

## Development
- Built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion
- Questions are loaded from language-specific JSON files
- PWA implementation using vite-plugin-pwa
- Robust error handling for network and data loading issues

### Progressive Web App (PWA)
This game supports installation as a Progressive Web App for offline play:

- Set up with vite-plugin-pwa
- Configured service worker for offline caching
- Optimized assets for faster loading
- Custom icon and splash screens

### Multilingual Support
The game now supports multiple languages:

- Questions are organized in language-specific folders (`/public/questions/de/`, `/public/questions/en/`)
- Language detection based on browser settings
- Manual language selection in the settings
- Proper content-type headers for all API requests
- Fallback mechanisms when preferred language content is unavailable

### Recent Fixes
- Fixed JSON parsing errors when loading question data
- Implemented fetch attempt limits to prevent infinite loading loops
- Added proper error handling and user feedback for data loading issues
- Fixed game UI rendering issues (blank screen after intro)
- Enhanced internationalization support

### Sound Files
The game uses three sound effects which need to be placed in the `/assets` folder:

1. `new_question.mp3` - A subtle notification sound for when a new question appears
2. `round_start.mp3` - An attention-grabbing sound for the start of a new round
3. `summary_fun.mp3` - A celebratory sound for the end of the game

**Recommended sound sources**:
- [Pixabay](https://pixabay.com/sound-effects/) (Free for commercial use)
- [Freesound](https://freesound.org/) (Check license per sound)
- [Mixkit](https://mixkit.co/free-sound-effects/) (Free with attribution)

## Development and Deployment

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Standard build
npm run build

# Build for custom domain
npm run build:windows-domain  # Windows
npm run build:domain          # Linux/macOS
```

### Custom Domain
The game is deployed to [blamegame.leagueoffun.de](https://blamegame.leagueoffun.de).

For detailed instructions on custom domain setup, see [CUSTOM_DOMAIN_DEPLOYMENT.md](docs/CUSTOM_DOMAIN_DEPLOYMENT.md).

## Deployment
- Add a `CNAME` file with the domain `blamegame.leagueoffun.de` to the `dist/` folder before deploying to GitHub Pages.

---

© 2025 League of Fun
