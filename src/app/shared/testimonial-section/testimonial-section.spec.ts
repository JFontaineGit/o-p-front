import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialSection } from './testimonial-section';

describe('TestimonialSection', () => {
  let component: TestimonialSection;
  let fixture: ComponentFixture<TestimonialSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestimonialSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
