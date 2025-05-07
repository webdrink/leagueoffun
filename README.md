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

## Development
- Built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion
- Questions are loaded from JSON with CSV fallback for improved offline support
- PWA implementation using vite-plugin-pwa

### Progressive Web App (PWA)
This game supports installation as a Progressive Web App for offline play:

- Set up with vite-plugin-pwa
- Configured service worker for offline caching
- Optimized assets for faster loading
- Custom icon and splash screens

### CSV to JSON Conversion
For better offline support, questions are primarily loaded from `public/questions.json` with fallback to `blamegame_questions.csv`.

To convert the CSV to JSON:
```bash
# Run the conversion script
node scripts/convertCsvToJson.js

# Copy the generated JSON to the public folder
cp src/data/questions.json public/
```

### Sound Files
The game uses three sound effects which need to be placed in the `/assets` folder:

1. `new_question.mp3` - A subtle notification sound for when a new question appears
2. `round_start.mp3` - An attention-grabbing sound for the start of a new round
3. `summary_fun.mp3` - A celebratory sound for the end of the game

**Recommended sound sources**:
- [Pixabay](https://pixabay.com/sound-effects/) (Free for commercial use)
- [Freesound](https://freesound.org/) (Check license per sound)
- [Mixkit](https://mixkit.co/free-sound-effects/) (Free with attribution)

## Deployment
- Add a `CNAME` file with the domain `blamegame.leagueoffun.de` to the `dist/` folder before deploying to GitHub Pages.

---

© 2025 League of Fun
