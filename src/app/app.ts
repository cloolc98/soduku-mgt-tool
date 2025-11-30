import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { Header } from './header/header';
import { SudokuBoard } from './model/cell';
import { Reader } from './reader/reader';
import { Generator } from './generator/generator';
import { Solver } from './solver/solver';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Header, Reader, Generator, Solver],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Board State
  board = signal<SudokuBoard | null>(null);
  
  // Solver State
  solutionGrid = signal<number[][] | null>(null);
  showSolution = signal(false);
  consoleOutput = signal('');

  // Display
  displayBoard = computed(() => {
    const current = this.board();
    const solution = this.solutionGrid();
    const showing = this.showSolution();

    if (!current) return [];

    if (showing && solution) {
      // Merge solution into view
      return current.map((row, r) => row.map((cell, c) => ({
        ...cell,
        value: cell.value === 0 ? solution[r][c] : cell.value
      })));
    }
    return current;
  });

  onBoardLoad(newBoard: SudokuBoard) {
    this.board.set(newBoard);
    // Reset solver state on new board
    this.solutionGrid.set(null);
    this.showSolution.set(false);
    this.consoleOutput.set('');
  }

  onSolutionCalculated(event: { solution: number[][], difficulty: string }) {
    this.solutionGrid.set(event.solution);
    
    // Generate Console Log
    let output = `--- SUDOKU SOLUTION (Diff: ${event.difficulty}) ---\n`;
    event.solution.forEach(row => {
      output += row.join(' ') + '\n';
    });
    output += '-------------------------------------------';
    this.consoleOutput.set(output);
  }

  onVisibilityChange(isVisible: boolean) {
    this.showSolution.set(isVisible);
  }
}