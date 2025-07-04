import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bookings } from './bookings';

describe('Bookings', () => {
  let component: Bookings;
  let fixture: ComponentFixture<Bookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
