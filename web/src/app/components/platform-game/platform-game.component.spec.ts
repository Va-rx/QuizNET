import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformGameComponent } from './platform-game.component';

describe('PlatformGameComponent', () => {
  let component: PlatformGameComponent;
  let fixture: ComponentFixture<PlatformGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlatformGameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlatformGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
