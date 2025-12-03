import { SudokuBoard, Cell } from "../model/cell";

export class SudokuUtils {
    static parse(text: string): SudokuBoard {
    const lines = text.split(/\r\n|\n|\r/).map(l => l.trim()).filter(l => l); // eg: "53..7.... \r\n6..195...\n\n"
    if (lines.length !== 9) throw new Error(`Invalid file: Found ${lines.length} rows.`);

    return lines.map((line, r) => {
      if (line.length !== 9) throw new Error(`Row ${r + 1} invalid length.`);
      const row: Cell[] = [];
      for (let c = 0; c < 9; c++) {
        const char = line[c];
        let val = 0;
        if (/[1-9]/.test(char)){
          val = parseInt(char, 10);
        }
        row.push({ value: val, isFixed: val !== 0, row: r, col: c });
      }
      return row;
    });
  }

  static findAllSolutions(grid: number[][], results: number[][][], limit: number, stats: { steps: number }): void {
    // A process of recursive backtracking 

    stats.steps++;
    // Check uniqueness of solutions
    if (results.length >= limit) return;

    // Check empty cells, if none, we say there is a solution.
    const empty = this.findEmpty(grid);
    if (!empty) {
      results.push(grid.map(r => [...r]));
      return;
    }

    // Fill the empty cell
    const [r, c] = empty;
    for (let num = 1; num <= 9; num++) {
      // if current digit fits the cell legally in a Sudoku
      if (this.isValid(grid, r, c, num)) {
        grid[r][c] = num;
        this.findAllSolutions(grid, results, limit, stats);
        grid[r][c] = 0;
        if (results.length >= limit) return;
      }
    }
  }

  static findEmpty(grid: number[][]): [number, number] | null {
    for (let r = 0; r < 9; r++){
      for (let c = 0; c < 9; c++){
        if (grid[r][c] === 0){
          return [r, c];
        }
      }
    }   
    return null;
  }

  static isValid(grid: number[][], row: number, col: number, num: number): boolean {
    for (let x = 0; x < 9; x++){
      if (grid[row][x] === num){
        return false;
      }
    }

    for (let x = 0; x < 9; x++){
      if (grid[x][col] === num){
        return false;
      }
    }

    const startRow = row - row % 3, startCol = col - col % 3;
    for (let i = 0; i < 3; i++){
      for (let j = 0; j < 3; j++){
        if (grid[startRow + i][startCol + j] === num){
          return false;
        }
      }
    }   
    return true;
  }
}
