import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Incidencia } from '../model/incidencia';
import { InspectorService } from '../services/inspector.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EditIncidenciaComponent } from '../edit-incidencia/edit-incidencia.component';
import { MatDialog } from '@angular/material/dialog';
import { MapComponent } from '../map/map.component';

@Component({
  selector: 'app-detalles-incidencia',
  imports: [NgFor, NgIf, MapComponent],
  templateUrl: './detalles-incidencia.component.html',
  styleUrl: './detalles-incidencia.component.css'
})
export class DetallesIncidenciaComponent {

  id_incidencia: number = -1
  incidencia: Incidencia = {} as Incidencia
  fotoError: boolean = false;

  constructor(private servicioInspector: InspectorService, private activatedRoute: ActivatedRoute, private dialog: MatDialog,   private router: Router) {}

  //obtiene la incidencia de la base de datos a apartir de una id
  ngOnInit(): void {
    this.id_incidencia = Number(this.activatedRoute.snapshot.paramMap.get('id'));
    this.servicioInspector.getIncidencia_id(this.id_incidencia).subscribe(incident => this.incidencia = incident);
  }
  editarIncidencia(incidencia: Incidencia) {
    const dialogRef = this.dialog.open(EditIncidenciaComponent, {
      width: '400px',
      data: { incidencia: incidencia },
      disableClose: true
    });
    

  
    dialogRef.afterClosed().subscribe(result => { 
      if (result) { //result si se ha confirmado la edicion
        this.router.navigate(['/listado']); 
      }
    });

  }

  exportarIncidencia(incidencia: Incidencia) {
    alert:("TODO: exportar incidencia");
    


  }

}
 
