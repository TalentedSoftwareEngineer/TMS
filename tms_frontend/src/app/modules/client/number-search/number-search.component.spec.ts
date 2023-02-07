import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberSearchComponent } from './number-search.component';

describe('NumberSearchComponent', () => {
  let component: NumberSearchComponent;
  let fixture: ComponentFixture<NumberSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NumberSearchComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
