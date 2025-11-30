export interface Cell {
  value: number | 0;
  isFixed: boolean;
  row: number;
  col: number;
}

export type SudokuBoard = Cell[][];
export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Samurai';
