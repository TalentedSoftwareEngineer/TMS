import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScriptExeRecordsComponent } from './script-exe-records.component';

describe('ScriptExeRecordsComponent', () => {
  let component: ScriptExeRecordsComponent;
  let fixture: ComponentFixture<ScriptExeRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScriptExeRecordsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScriptExeRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
