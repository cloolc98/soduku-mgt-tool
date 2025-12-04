import { Component, input, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { SudokuBoard } from '../model/cell';
import { SudokuUtils } from '../utils/sudoku-utils';

@Component({
  selector: 'app-solver',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solver.html',
  styleUrl: './solver.css',
})
export class Solver {
  board = input<SudokuBoard | null>(null);
  
  solutionUpdate = output<{ solution: number[][], difficulty: string }>();
  visibilityToggle = output<boolean>();

  result = signal<{ unique: boolean, count: number, difficulty: string, clues: number, steps: number } | null>(null);
  error = signal('');
  isVisible = signal(false);
  solutionGrid: number[][] | null = null;

  solve() {
    const b = this.board();
    if (!b) return;
    
    this.error.set('');
    const grid = b.map(r => r.map(c => c.value));
    const solutions: number[][][] = [];
    const stats = { steps: 0 };
    
    SudokuUtils.findAllSolutions(grid, solutions, 2, stats);
    
    if (solutions.length === 0) {
      this.error.set("No solution found for this board!");
      this.result.set(null);
      return;
    }

    let givens = 0;
    b.forEach(r => r.forEach(c => { if(c.value !== 0) givens++; }));
    let diff = 'Hard';
    if (givens >= 31) diff = 'Easy';
    else if (givens >= 27) diff = 'Medium';
    else if (givens <= 24 && stats.steps >= 1000) diff = 'Samurai';

    this.solutionGrid = solutions[0];
    this.result.set({
      unique: solutions.length === 1,
      count: solutions.length,
      difficulty: diff,
      clues: givens,
      steps: stats.steps
    });
    
    this.isVisible.set(true);
    this.solutionUpdate.emit({ solution: this.solutionGrid, difficulty: diff });
    this.visibilityToggle.emit(this.isVisible());
  }

  toggle() {
    this.isVisible.update(v => !v);
    this.visibilityToggle.emit(this.isVisible());
  }
}
