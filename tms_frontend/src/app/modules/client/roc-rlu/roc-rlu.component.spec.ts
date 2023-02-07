import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RocRluComponent } from './roc-rlu.component';

describe('RocRluComponent', () => {
  let component: RocRluComponent;
  let fixture: ComponentFixture<RocRluComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RocRluComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RocRluComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
