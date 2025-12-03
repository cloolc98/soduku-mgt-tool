import { Component, signal, output, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
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
  
  // use observables approach
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    this.readFile(file).pipe(take(1)).subscribe({
      next: (text) => {
        try {
          // do parseText logic
        } catch (e: any) {
          // handle errors: failed to do the logic
        }
      },
      error: (err) => {
        // failed to read file
      },
      complete: () => {
        // clear input
        input.value = '';
      }
    });
  }

  private readFile(file: File): Observable<string> {
    return new Observable<string>(observer => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          observer.next(text);
          observer.complete();
        } else {
          observer.error(new Error('File content could not be read as text.'));
        }
      };

      reader.onerror = () => {
        observer.error(new Error('Error reading file.'));
      };

      reader.readAsText(file);

      // for unsubscribed calls
      return () => {
        if (reader.readyState === 1) { // 1 = LOADING
          reader.abort();
        }
      };
    });
  }
}
