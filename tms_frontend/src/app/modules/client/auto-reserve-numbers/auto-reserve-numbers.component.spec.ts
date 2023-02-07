import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoReserveNumbersComponent } from './auto-reserve-numbers.component';

describe('AutoReserveNumbersComponent', () => {
  let component: AutoReserveNumbersComponent;
  let fixture: ComponentFixture<AutoReserveNumbersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoReserveNumbersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoReserveNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
