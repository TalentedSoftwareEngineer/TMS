import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateAdminDataComponent } from './template-admin-data.component';

describe('TemplateAdminDataComponent', () => {
  let component: TemplateAdminDataComponent;
  let fixture: ComponentFixture<TemplateAdminDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateAdminDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateAdminDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
