import { Component } from '@angular/core';
import { Incidencia } from '../model/incidencia';
import { InspectorService } from '../services/inspector.service';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './listado.component.html',
  styleUrl: './listado.component.css'
})
export class ListadoComponent {

  //had this before, but it doesn't work because the list is empty and this is a object and not an array
  // incidencias: Incidencia[] = {} as Incidencia[];

  incidencias: Incidencia[]=  [];

  //
  constructor(private servicioInspector: InspectorService, private router: Router) {}
  ngOnInit(): void {
    this.servicioInspector.getIncidencias().subscribe(incident => this.incidencias = incident);
  }

  verDetalles(incidencia: Incidencia): void {
    this.router.navigate(['/detalles-incidencia', incidencia.id]);
  }

}
