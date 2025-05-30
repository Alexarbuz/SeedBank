import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenusComponent } from './genus.component';

describe('GenusComponent', () => {
  let component: GenusComponent;
  let fixture: ComponentFixture<GenusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
