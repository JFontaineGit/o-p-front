import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPanel } from './user-panel';

describe('UserPanel', () => {
  let component: UserPanel;
  let fixture: ComponentFixture<UserPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPanel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPanel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
