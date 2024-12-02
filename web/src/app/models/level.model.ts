export interface Level {
    id?: number;
    gameId: number;
    name: string;
    difficulty: Difficulty;
    time: number;
    map: File;
}

export enum Difficulty {
    EASY = 'DIFFICULTY.EASY',
    MEDIUM = 'DIFFICULTY.MEDIUM',
    HARD = 'DIFFICULTY.HARD',
  }
