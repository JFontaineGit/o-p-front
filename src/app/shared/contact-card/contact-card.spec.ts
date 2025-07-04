import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactCard } from './contact-card';

describe('ContactCard', () => {
  let component: ContactCard;
  let fixture: ComponentFixture<ContactCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
