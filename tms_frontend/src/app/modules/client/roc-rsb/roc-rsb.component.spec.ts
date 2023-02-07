import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RocRsbComponent } from './roc-rsb.component';

describe('RocRsbComponent', () => {
  let component: RocRsbComponent;
  let fixture: ComponentFixture<RocRsbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RocRsbComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RocRsbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
