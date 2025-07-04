import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Packets } from './packets';

describe('Packets', () => {
  let component: Packets;
  let fixture: ComponentFixture<Packets>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Packets]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Packets);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
