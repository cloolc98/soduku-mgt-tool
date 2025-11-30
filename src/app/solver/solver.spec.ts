import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Solver } from './solver';

describe('Solver', () => {
  let component: Solver;
  let fixture: ComponentFixture<Solver>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Solver]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Solver);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
