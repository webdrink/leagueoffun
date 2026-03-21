interface SpotifyPlayerInit {
  name: string;
  getOAuthToken: (callback: (token: string) => void) => void;
  volume?: number;
}

interface SpotifyWebPlaybackError {
  message: string;
}

interface SpotifyWebPlaybackPlayerState {
  paused: boolean;
}

interface SpotifyWebPlaybackPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  addListener: (
    event:
      | 'ready'
      | 'not_ready'
      | 'initialization_error'
      | 'authentication_error'
      | 'account_error'
      | 'playback_error'
      | 'player_state_changed',
    listener:
      | ((payload: { device_id: string }) => void)
      | ((error: SpotifyWebPlaybackError) => void)
      | ((state: SpotifyWebPlaybackPlayerState | null) => void)
  ) => boolean;
}

interface Window {
  Spotify?: {
    Player: new (options: SpotifyPlayerInit) => SpotifyWebPlaybackPlayer;
  };
  onSpotifyWebPlaybackSDKReady?: () => void;
}
