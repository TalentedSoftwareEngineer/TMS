import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RocRsrComponent } from './roc-rsr.component';

describe('RocRsrComponent', () => {
  let component: RocRsrComponent;
  let fixture: ComponentFixture<RocRsrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RocRsrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RocRsrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
