import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAdminDataComponent } from './customer-admin-data.component';

describe('CustomerAdminDataComponent', () => {
  let component: CustomerAdminDataComponent;
  let fixture: ComponentFixture<CustomerAdminDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerAdminDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerAdminDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
