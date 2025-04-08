import { Component } from '@angular/core';
import { Incidencia } from '../model/incidencia';
import { InspectorService } from '../services/inspector.service';
import { Router } from '@angular/router';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-listado',
  standalone: true,
  imports: [CommonModule,NgFor, NgIf],
  templateUrl: './listado.component.html',
  styleUrls: ['./listado.component.css']
})
export class ListadoComponent {
  incidencias: Incidencia[] = [];
  esMosaico: boolean = false; // Propiedad para alternar entre los formatos

  constructor(private servicioInspector: InspectorService, private router: Router) {}

  ngOnInit(): void {
    this.servicioInspector.getIncidencias().subscribe(incident => this.incidencias = incident);
  }

  verDetalles(incidencia: Incidencia): void {
    this.router.navigate(['/detalles-incidencia', incidencia.id]);
  }

  alternarFormato(): void {
    this.esMosaico = !this.esMosaico; // Alternar entre los formatos
  }
  
}



// import { Component } from '@angular/core';
// import { Incidencia } from '../model/incidencia';
// import { InspectorService } from '../services/inspector.service';
// import { Router } from '@angular/router';
// import { NgFor, NgIf } from '@angular/common';

// @Component({
//   selector: 'app-listado',
//   standalone: true,
//   imports: [NgFor, NgIf],
//   templateUrl: './listado.component.html',
//   styleUrl: './listado.component.css'
// })
// export class ListadoComponent {

//   //had this before, but it doesn't work because the list is empty and this is a object and not an array
//   // incidencias: Incidencia[] = {} as Incidencia[];

//   incidencias: Incidencia[]=  [];

//   //
//   constructor(private servicioInspector: InspectorService, private router: Router) {}
//   ngOnInit(): void {
//     this.servicioInspector.getIncidencias().subscribe(incident => this.incidencias = incident);
//   }

//   verDetalles(incidencia: Incidencia): void {
//     this.router.navigate(['/detalles-incidencia', incidencia.id]);
//   }

// }
