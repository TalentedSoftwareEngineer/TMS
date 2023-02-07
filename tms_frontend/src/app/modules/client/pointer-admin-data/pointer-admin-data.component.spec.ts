import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointerAdminDataComponent } from './pointer-admin-data.component';

describe('PointerAdminDataComponent', () => {
  let component: PointerAdminDataComponent;
  let fixture: ComponentFixture<PointerAdminDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PointerAdminDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PointerAdminDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
