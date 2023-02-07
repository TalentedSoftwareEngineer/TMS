import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralNumberQueryComponent } from './referral-number-query.component';

describe('ReferralNumberQueryComponent', () => {
  let component: ReferralNumberQueryComponent;
  let fixture: ComponentFixture<ReferralNumberQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferralNumberQueryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralNumberQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
