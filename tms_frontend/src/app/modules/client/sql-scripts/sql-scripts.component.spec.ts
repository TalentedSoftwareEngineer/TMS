import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlScriptsComponent } from './sql-scripts.component';

describe('SqlScriptsComponent', () => {
  let component: SqlScriptsComponent;
  let fixture: ComponentFixture<SqlScriptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SqlScriptsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SqlScriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
