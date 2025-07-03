import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpCard } from './help-card';

describe('HelpCard', () => {
  let component: HelpCard;
  let fixture: ComponentFixture<HelpCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
