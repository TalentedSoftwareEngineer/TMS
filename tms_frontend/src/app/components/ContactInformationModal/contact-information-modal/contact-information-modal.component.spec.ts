import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactInformationModalComponent } from './contact-information-modal.component';

describe('ContactInformationModalComponent', () => {
  let component: ContactInformationModalComponent;
  let fixture: ComponentFixture<ContactInformationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactInformationModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactInformationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
