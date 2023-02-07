import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SqlUsersComponent } from './sql-users.component';

describe('SqlUsersComponent', () => {
  let component: SqlUsersComponent;
  let fixture: ComponentFixture<SqlUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SqlUsersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SqlUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
