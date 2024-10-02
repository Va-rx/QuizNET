import { TestBed } from '@angular/core/testing';

import { TestHistoryGuard } from './test-history.guard';

describe('TestHistoryGuard', () => {
  let guard: TestHistoryGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TestHistoryGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
