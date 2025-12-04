import { SudokuBoard, Cell } from "../model/cell";

export class SudokuUtils {
    static parse(text: string): SudokuBoard {
    const lines = text.split(/\r\n|\n|\r/).map(l => l.trim()).filter(l => l); // eg: "53..7.... \r\n6..195...\n\n"
    if (lines.length !== 9) throw new Error(`Invalid file: Found ${lines.length} rows.`);

    const board = lines.map((line, r) => {
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

    // Check rows, cols, and 3*3 subgrids for duplicates
    for (let i = 0; i < 9; i++) {
      const rowSet = new Set<number>();
      const colSet = new Set<number>();

      for (let j = 0; j < 9; j++) {
        // Check row
        const rowVal = board[i][j].value;
        if (rowVal !== 0) {
          if (rowSet.has(rowVal)){
            throw new Error(`Invalid Board: Duplicate ${rowVal} in Row ${i + 1}`);
          } 
          rowSet.add(rowVal);
        }

        // Check col
        const colVal = board[j][i].value;
        if (colVal !== 0) {
          if (colSet.has(colVal)){
            throw new Error(`Invalid Board: Duplicate ${colVal} in Column ${i + 1}`);
          } 
          colSet.add(colVal);
        }
      }
    }

    // Check subgrids
    for (let startRow = 0; startRow < 9; startRow += 3) {
      for (let startCol = 0; startCol < 9; startCol += 3) {
        
        const subgridSet = new Set<number>();
        // Inside the subgrid
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const val = board[startRow + r][startCol + c].value;
            
            if (val !== 0) {
              if (subgridSet.has(val)) {
                throw new Error(`Invalid Board: Duplicates Existed in Subgrids!`);
              }
              subgridSet.add(val);
            }
          }
        }

      }
    }

    return board;
  }

  static findAllSolutions(grid: number[][], results: number[][][], limit: number, stats: { steps: number }): void {
    // A process of DFS with backtracking

    stats.steps++;
    // Check uniqueness of solutions
    if (results.length >= limit) return;

    // Check empty cells, if none, we say there is a solution.
    // const empty = this.findEmpty(grid); // old version
    const empty = this.findBestEmpty(grid);
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

  static findBestEmpty(grid: number[][]): [number, number] | null {
    let bestCell: [number, number] | null = null;
    let minOptions = 10;

    for(let r = 0; r < 9; r++){
      for(let c = 0; c < 9; c++){
        if (grid[r][c] !== 0) continue;

        const options = this.countOptions(grid, r, c);
        // Hit a dead end
        if(options === 0){
          return [r, c];
        }
        // Found the best option
        if(options === 1){
          return [r, c];
        }

        if(options < minOptions){
          minOptions = options;
          bestCell = [r, c];
        }
      }
    }

    return bestCell;
  }

  static countOptions(grid: number[][], r: number, c: number){
    let count = 0;
    for(let num = 1; num <= 9; num++){
      if(this.isValid(grid, r, c, num)){
        count++;
      }
    }

    return count;
  }
}
