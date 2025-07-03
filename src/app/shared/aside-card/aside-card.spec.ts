import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideCard } from './aside-card';

describe('AsideCard', () => {
  let component: AsideCard;
  let fixture: ComponentFixture<AsideCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsideCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
