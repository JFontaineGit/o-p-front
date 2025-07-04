import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactMethods } from './contact-methods';

describe('ContactMethods', () => {
  let component: ContactMethods;
  let fixture: ComponentFixture<ContactMethods>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactMethods]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactMethods);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
