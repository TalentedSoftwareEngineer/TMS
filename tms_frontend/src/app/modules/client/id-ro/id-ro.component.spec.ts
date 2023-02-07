import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdRoComponent } from './id-ro.component';

describe('IdRoComponent', () => {
  let component: IdRoComponent;
  let fixture: ComponentFixture<IdRoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdRoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdRoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
