export interface GameInfo {
  id: string;
  name: string;
  description: string;
  entryUrl: string;
  icon: string;
  tags: string[];
}

export const games: GameInfo[] = [
  {
    id: 'blamegame',
    name: 'BlameGame',
    description: 'Who would most likely...?',
    entryUrl: 'https://blamegame.leagueoffun.de',
    icon: '/assets/blamegame-icon.svg',
    tags: ['party', 'friends']
  },
  {
    id: 'hookhunt',
    name: 'HookHunt',
    description: 'Guess the hit from the hook!',
    entryUrl: 'https://hookhunt.leagueoffun.de',
    icon: '/assets/hookhunt-icon.svg',
    tags: ['music', 'guessing']
  }
];
