import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareHealthComponent } from './share-health.component';

describe('ShareHealthComponent', () => {
  let component: ShareHealthComponent;
  let fixture: ComponentFixture<ShareHealthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShareHealthComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShareHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
