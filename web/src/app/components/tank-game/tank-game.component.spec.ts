import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TankGameComponent } from './tank-game.component';

describe('TankGameComponent', () => {
  let component: TankGameComponent;
  let fixture: ComponentFixture<TankGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TankGameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TankGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
