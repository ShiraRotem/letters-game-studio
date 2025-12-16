export interface GameOption {
  word: string;
  emoji: string;
  isCorrect: boolean;
}

export interface RoundData {
  letter: string;
  options: GameOption[];
}

export enum GameState {
  INTRO = 'INTRO',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  SUCCESS = 'SUCCESS',
}

export interface AudioService {
  playYay: () => void;
  playTryAgain: () => void;
  speak: (text: string) => void;
}
