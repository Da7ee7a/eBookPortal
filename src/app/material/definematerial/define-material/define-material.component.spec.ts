import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DefineMaterialComponent } from './define-material.component';

describe('DefineMaterialComponent', () => {
  let component: DefineMaterialComponent;
  let fixture: ComponentFixture<DefineMaterialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DefineMaterialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DefineMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
