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
  readonly MAX_SIZE_BYTES = 1024; // 1KB

  async processFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    
    const file = input.files[0];
    this.error.set('');
    this.success.set(false);

    try {
      // Validate file extention
      if (!file.name.toLowerCase().endsWith('.txt')) {
        throw new Error("Invalid file format. Please upload a .txt file.");
      }

      // Validate file type
      if (file.type !== "text/plain" && file.type !== "") {
         throw new Error("File type validation failed. Expected text/plain.");
      }

      // Validate file size
      if (file.size === 0) {
        throw new Error("Error: File is empty (0 bytes).");
      }
      if (file.size > this.MAX_SIZE_BYTES) {
        const sizeKB = (file.size / 1024).toFixed(2);
        throw new Error(`File is too large. Max size is 1KB. (Your file: ${sizeKB}KB)`);
      }

      console.log("File is valid:", file.name);

      const text = await file.text();

      // File contains only spaces, tabs, or newlines
      if (!text.trim()) {
        throw new Error("Error: File content is empty or contains only whitespace.");
      }

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
