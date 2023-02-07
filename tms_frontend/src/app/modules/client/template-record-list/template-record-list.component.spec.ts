import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateRecordListComponent } from './template-record-list.component';

describe('TemplateRecordListComponent', () => {
  let component: TemplateRecordListComponent;
  let fixture: ComponentFixture<TemplateRecordListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplateRecordListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateRecordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
