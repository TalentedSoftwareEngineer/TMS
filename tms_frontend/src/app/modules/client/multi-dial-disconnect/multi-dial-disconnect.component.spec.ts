import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiDialDisconnectComponent } from './multi-dial-disconnect.component';

describe('MultiDialDisconnectComponent', () => {
  let component: MultiDialDisconnectComponent;
  let fixture: ComponentFixture<MultiDialDisconnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiDialDisconnectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiDialDisconnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
