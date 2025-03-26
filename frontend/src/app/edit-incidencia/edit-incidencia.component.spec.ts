import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIncidenciaComponent } from './edit-incidencia.component';

describe('EditIncidenciaComponent', () => {
  let component: EditIncidenciaComponent;
  let fixture: ComponentFixture<EditIncidenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditIncidenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditIncidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
