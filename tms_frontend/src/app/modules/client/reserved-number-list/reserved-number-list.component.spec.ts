import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservedNumberListComponent } from './reserved-number-list.component';

describe('ReservedNumberListComponent', () => {
  let component: ReservedNumberListComponent;
  let fixture: ComponentFixture<ReservedNumberListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReservedNumberListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservedNumberListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
