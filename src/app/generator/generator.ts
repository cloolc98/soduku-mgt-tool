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

  generate() {
    let grid = Array(9).fill(0).map(() => Array(9).fill(0));
    
    // Fill diagonal boxes
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

    // Get full board
    const solutions: number[][][] = [];
    SudokuUtils.findAllSolutions(grid, solutions, 1, { steps: 0 });
    grid = solutions[0];

    // Remove digits
    let targetClues = { 'Easy': 32, 'Medium': 27, 'Hard': 25, 'Samurai': 24 }[this.difficulty()];
    let clues = 81;
    let coords = [];
    for(let r=0; r<9; r++) for(let c=0; c<9; c++) coords.push([r,c]);
    coords.sort(() => Math.random() - 0.5);

    for (let [r, c] of coords) {
      if (clues <= targetClues!) break;
      if (grid[r][c] === 0) continue;
      
      const val = grid[r][c];
      const valSym = grid[8-r][8-c];
      
      grid[r][c] = 0;
      grid[8-r][8-c] = 0;

      const check: number[][][] = [];
      SudokuUtils.findAllSolutions(grid.map(row=>[...row]), check, 2, { steps: 0 });
      
      if (check.length !== 1) {
        grid[r][c] = val;
        grid[8-r][8-c] = valSym; 
      } else {
        clues -= (r === 8-r && c === 8-c) ? 1 : 2;
      }
    }

    this.boardGenerated.emit(grid.map((row, r) => row.map((v, c) => ({
      value: v, isFixed: v !== 0, row: r, col: c
    }))));
  }

  private isSafeBox(grid: number[][], startRow: number, startCol: number, num: number) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (grid[startRow + i][startCol + j] === num) return false;
    return true;
  }  
}
