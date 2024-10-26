import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveScoreBoardComponent } from './live-score-board.component';

describe('LiveScoreBoardComponent', () => {
  let component: LiveScoreBoardComponent;
  let fixture: ComponentFixture<LiveScoreBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiveScoreBoardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveScoreBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
