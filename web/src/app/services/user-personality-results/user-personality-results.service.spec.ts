import { TestBed } from '@angular/core/testing';

import { UserPersonalityResultsService } from './user-personality-results.service';

describe('UserPersonalityResultsService', () => {
  let service: UserPersonalityResultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserPersonalityResultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
