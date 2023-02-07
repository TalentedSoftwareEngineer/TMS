import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RocRsnComponent } from './roc-rsn.component';

describe('RocRsnComponent', () => {
  let component: RocRsnComponent;
  let fixture: ComponentFixture<RocRsnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RocRsnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RocRsnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
