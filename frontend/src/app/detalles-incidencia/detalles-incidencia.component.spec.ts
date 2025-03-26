import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesIncidenciaComponent } from './detalles-incidencia.component';

describe('DetallesIncidenciaComponent', () => {
  let component: DetallesIncidenciaComponent;
  let fixture: ComponentFixture<DetallesIncidenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesIncidenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesIncidenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
