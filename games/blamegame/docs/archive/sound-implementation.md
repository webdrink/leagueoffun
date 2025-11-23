# Sound Implementation Instructions

Follow these steps to replace the placeholder sound files with actual sound effects:

## Required Sounds

You need to download and replace three sound files in the `assets` folder:

1. `new_question.mp3` - A subtle sound effect for when a new question appears (e.g., card flip, swoosh)
2. `round_start.mp3` - An exciting sound effect for when a new round starts (e.g., game show bell, fanfare)
3. `summary_fun.mp3` - A celebratory sound for the end of the game (e.g., applause, celebration)

## Recommended Free Sound Sources

You can download royalty-free sound effects from these sources:

- [Mixkit](https://mixkit.co/free-sound-effects/) - Free sound effects with clear licensing
- [Freesound](https://freesound.org/) - Community-based sound repository (check licenses)
- [Zapsplat](https://www.zapsplat.com/) - Free sound effects library (requires account)

## Implementation Steps

1. Download the three required sound effects as MP3 files
2. Rename them to match the required filenames: 
   - `new_question.mp3`
   - `round_start.mp3`
   - `summary_fun.mp3`
3. Place them in the `/games/blamegame/assets/` folder, replacing the existing placeholder files
4. Keep file sizes small (under 100KB each) for better performance
5. Test the sounds by playing the game

## Optional: Sound Volume Control

A volume slider has been implemented in the game. You can adjust the volume by:

1. Accessing the VolumeControl component that appears next to the sound toggle button
2. Moving the slider to adjust the volume level from 0 to 100%

## Technical Notes

- Sound files are loaded using the JavaScript Audio API
- Volume can be adjusted through the `useSound` hook
- The volume setting is saved to localStorage for persistence
