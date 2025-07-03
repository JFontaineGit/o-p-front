import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicesSection } from './services-section';

describe('ServicesSection', () => {
  let component: ServicesSection;
  let fixture: ComponentFixture<ServicesSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicesSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicesSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
