import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteCard } from './favorite-card';

describe('FavoriteCard', () => {
  let component: FavoriteCard;
  let fixture: ComponentFixture<FavoriteCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
