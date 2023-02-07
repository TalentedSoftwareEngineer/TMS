import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiDialSpareComponent } from './multi-dial-spare.component';

describe('MultiDialSpareComponent', () => {
  let component: MultiDialSpareComponent;
  let fixture: ComponentFixture<MultiDialSpareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiDialSpareComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiDialSpareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
