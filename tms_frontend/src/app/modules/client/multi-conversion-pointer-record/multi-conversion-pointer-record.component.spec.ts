import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiConversionPointerRecordComponent } from './multi-conversion-pointer-record.component';

describe('MultiConversionPointerRecordComponent', () => {
  let component: MultiConversionPointerRecordComponent;
  let fixture: ComponentFixture<MultiConversionPointerRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiConversionPointerRecordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiConversionPointerRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
