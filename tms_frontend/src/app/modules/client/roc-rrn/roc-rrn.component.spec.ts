import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RocRrnComponent } from './roc-rrn.component';

describe('RocRrnComponent', () => {
  let component: RocRrnComponent;
  let fixture: ComponentFixture<RocRrnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RocRrnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RocRrnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
