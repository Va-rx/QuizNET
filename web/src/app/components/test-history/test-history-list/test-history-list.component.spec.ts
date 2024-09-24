import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestHistoryListComponent } from './test-history-list.component';

describe('TestHistoryListComponent', () => {
  let component: TestHistoryListComponent;
  let fixture: ComponentFixture<TestHistoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestHistoryListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHistoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
