import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiDialQueryComponent } from './multi-dial-query.component';

describe('MultiDialQueryComponent', () => {
  let component: MultiDialQueryComponent;
  let fixture: ComponentFixture<MultiDialQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiDialQueryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiDialQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
