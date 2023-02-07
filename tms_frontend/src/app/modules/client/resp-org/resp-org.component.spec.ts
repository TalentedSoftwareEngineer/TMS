import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RespOrgComponent } from './resp-org.component';

describe('RespOrgComponent', () => {
  let component: RespOrgComponent;
  let fixture: ComponentFixture<RespOrgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RespOrgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RespOrgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
