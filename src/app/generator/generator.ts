import { Component, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { SudokuBoard, Difficulty } from '../model/cell';
import { SudokuUtils } from '../utils/sudoku-utils';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './generator.html',
  styleUrl: './generator.css',
})
export class Generator {
  boardGenerated = output<SudokuBoard>();
  difficulty = signal<Difficulty>('Medium');
  error = signal('');

  generate() {
    // A process of Digging Holes (seeding, filling and digging)

    this.error.set('');
    try {
      let targetClues = { 'Easy': 32, 'Medium': 28, 'Hard': 24, 'Samurai': 24 }[this.difficulty()] || 28;

      let attempts = 0;
      const MAX_ATTEMPTS = 100; // Safety break in case a infinite loops

      /**
       * Fixed issue: old generate code often fails to reach the target clue count (e.g., getting down to 24 clues for "Samurai"),
       * causing the loop to finish with a puzzle that is still "Easy" or "Medium" despite requesting "Samurai".
       * 
       * Cause: It might remove a "critical" number early on. 
       * Once that number is gone, removing any other number might break uniqueness.
       * The algorithm gets "stuck" because it dug the wrong holes early,
       * preventing it from digging deeper later.
       * 
       * Add retry mechanism to try to fix it, not perfect but works at least in most time;
       * it will fail to generate a puzzle sometimes.
       */
      while(attempts < MAX_ATTEMPTS){
        attempts++;
        let grid = Array(9).fill(0).map(() => Array(9).fill(0));

        // Fill diagonal boxes (seeding)
        for (let i = 0; i < 9; i += 3) {
          for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
              let num;
              do { num = Math.floor(Math.random() * 9) + 1; } 
              while (!this.isSafeBox(grid, i, i, num));
              grid[i+r][i+c] = num;
            }
          }
        }

        // Get full board (filling)
        const solutions: number[][][] = [];
        SudokuUtils.findAllSolutions(grid, solutions, 1, { steps: 0 });
        if (solutions.length === 0) continue; // if solver failed, retry 
        grid = solutions[0];

        // Remove digits (digging)
        let clues = 81;
        let coords = [];
        for(let r=0; r<9; r++){
          for(let c=0; c<9; c++){
            coords.push([r,c]);
          }
        }  
        coords.sort(() => Math.random() - 0.5);

        for (let [r, c] of coords) {
          if (clues <= targetClues) break;
          if (grid[r][c] === 0) continue;
          
          const val = grid[r][c];
          const valSym = grid[8-r][8-c];
          
          grid[r][c] = 0;
          grid[8-r][8-c] = 0;

          // Uniqueness check
          const check: number[][][] = [];
          SudokuUtils.findAllSolutions(grid.map(row=>[...row]), check, 2, { steps: 0 });
          
          if (check.length !== 1) {
            grid[r][c] = val;
            grid[8-r][8-c] = valSym; 
          } else {
            clues -= (r === 8-r && c === 8-c) ? 1 : 2;
          }
        }

        if (clues <= targetClues) {
            console.log(`Success! Generated puzzle with ${clues} clues in ${attempts} attempts.`);
            
            // Transform number[][] to SudokuBoard object and emit
            const finalBoard = grid.map((row, r) => row.map((v, c) => ({
              value: v, 
              isFixed: v !== 0, 
              row: r, 
              col: c
            })));

            this.boardGenerated.emit(finalBoard);
            return; // Exit while loop
        }

        // If we are here, clues > targetClues, so the while loop continues to next attempt
      }

      throw new Error("Failed to generate puzzle...");
      
    } catch (error: any) {
      this.error.set(error.message);
    }
  }

  private isSafeBox(grid: number[][], startRow: number, startCol: number, num: number) {
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
