import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileForm } from './profile-form';

describe('ProfileForm', () => {
  let component: ProfileForm;
  let fixture: ComponentFixture<ProfileForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
