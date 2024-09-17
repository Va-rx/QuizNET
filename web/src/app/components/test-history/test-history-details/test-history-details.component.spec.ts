import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestHistoryDetailsComponent } from './test-history-details.component';

describe('TestHistoryDetailsComponent', () => {
  let component: TestHistoryDetailsComponent;
  let fixture: ComponentFixture<TestHistoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestHistoryDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHistoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
