import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiDialResporgchangeComponent } from './multi-dial-resporgchange.component';

describe('MultiDialResporgchangeComponent', () => {
  let component: MultiDialResporgchangeComponent;
  let fixture: ComponentFixture<MultiDialResporgchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiDialResporgchangeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiDialResporgchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
