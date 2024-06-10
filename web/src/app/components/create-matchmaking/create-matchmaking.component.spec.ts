import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMatchmakingComponent } from './create-matchmaking.component';

describe('CreateMatchmakingComponent', () => {
  let component: CreateMatchmakingComponent;
  let fixture: ComponentFixture<CreateMatchmakingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateMatchmakingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMatchmakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
