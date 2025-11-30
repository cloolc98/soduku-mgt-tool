import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { SudokuBoard } from '../model/cell';
import { SudokuUtils } from '../utils/sudoku-utils';

@Component({
  selector: 'app-reader',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reader.html',
  styleUrl: './reader.css',
})
export class Reader {
  boardLoaded = output<SudokuBoard>();
  error = signal('');
  success = signal(false);

  async processFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    this.error.set('');
    this.success.set(false);

    try {
      const text = await input.files[0].text();
      const board = SudokuUtils.parse(text);
      this.boardLoaded.emit(board);
      this.success.set(true);
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      input.value = '';
    }
  }
}
