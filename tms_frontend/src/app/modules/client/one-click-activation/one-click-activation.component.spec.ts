import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneClickActivationComponent } from './one-click-activation.component';

describe('OneClickActivationComponent', () => {
  let component: OneClickActivationComponent;
  let fixture: ComponentFixture<OneClickActivationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneClickActivationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneClickActivationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
