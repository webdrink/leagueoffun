export interface GameInfo {
  id: string;
  name: string;
  description: string;
  entryUrl: string;
  icon: string;
  tags: string[];
  comingSoon?: boolean;
}

export const games: GameInfo[] = [
  {
    id: 'blamegame',
    name: 'BlameGame',
    description: 'The ultimate party game! Answer "Who would most likely..." questions and point fingers at your friends. Discover who your group really thinks would do the craziest things!',
    entryUrl: 'https://blamegame.leagueoffun.de',
    icon: '/assets/blamegame-icon.svg',
    tags: ['party', 'friends', 'social']
  },
  {
    id: 'hookhunt',
    name: 'HookHunt',
    description: 'Test your music knowledge! Listen to song hooks and race to guess the track. Connect your Spotify and challenge friends to see who knows their tunes best!',
    entryUrl: 'https://hookhunt.leagueoffun.de',
    icon: '/assets/hookhunt-icon.svg',
    tags: ['music', 'quiz', 'spotify']
  }
];
