import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberQueryComponent } from './number-query.component';

describe('NumberQueryComponent', () => {
  let component: NumberQueryComponent;
  let fixture: ComponentFixture<NumberQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumberQueryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
