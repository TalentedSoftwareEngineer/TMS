import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SomosUserComponent } from './somos-user.component';

describe('SomosUserComponent', () => {
  let component: SomosUserComponent;
  let fixture: ComponentFixture<SomosUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SomosUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SomosUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
