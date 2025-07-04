import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingCard } from './booking-card';

describe('BookingCard', () => {
  let component: BookingCard;
  let fixture: ComponentFixture<BookingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
