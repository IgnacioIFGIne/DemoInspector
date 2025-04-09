import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Incidencia } from '../model/incidencia';
import { InspectorService } from '../services/inspector.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EditIncidenciaComponent } from '../edit-incidencia/edit-incidencia.component';
import { MatDialog } from '@angular/material/dialog';
import { MapComponent } from '../map/map.component';
import Swal from "sweetalert2" // Import SweetAlert2
import { ImportarIncidenciaComponent } from "../importar-incidencia/importar-incidencia.component"

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
  
  importarIncidencia() {
    const dialogRef = this.dialog.open(ImportarIncidenciaComponent, {
      width: "500px",
      disableClose: false,
      data: { modo: "individual" }, // Indicar que queremos importar una incidencia individual
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // Si la importación fue exitosa, recargar los datos de la incidencia
        this.servicioInspector
          .getIncidencia_id(this.id_incidencia)
          .subscribe((incident) => (this.incidencia = incident))
      }
    })
  }


  exportarIncidencia(incidencia: Incidencia) {
    // Verificar que la incidencia tiene un ID válido
    if (!incidencia || incidencia.id <= 0) {
      Swal.fire({
        title: "Error",
        text: "No se puede exportar la incidencia: ID no válido",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#8c1a20",
      });
      return;
    }
  
    // Mostrar un mensaje de carga con SweetAlert2
    Swal.fire({
      title: "Exportando...",
      text: "Preparando la incidencia para exportar en formato CSV",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })
  
    // Llamar al servicio para exportar la incidencia, pasando el ID
    this.servicioInspector.exportarIncidencia(incidencia.id).subscribe(
      (data: Blob) => {
        // Crear una URL para el blob recibido con codificación UTF-8
        const blob = new Blob([data], { type: "text/csv;charset=utf-8" })

        // Añadir BOM (Byte Order Mark) para asegurar que Excel reconozca UTF-8
        const BOM = new Uint8Array([0xef, 0xbb, 0xbf])
        const blobWithBOM = new Blob([BOM, data], { type: "text/csv;charset=utf-8" })

        const url = window.URL.createObjectURL(blobWithBOM)

        // Crear un elemento <a> para descargar el archivo
        const a = document.createElement("a")
        a.href = url
        a.download = `incidencia_${incidencia.id}.csv` // Cambiar la extensión a .csv

        // Añadir al DOM, hacer clic y eliminar
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Mostrar mensaje de éxito
        Swal.fire({
          title: "¡Exportación completada!",
          text: `La incidencia ${incidencia.id} ha sido exportada en formato CSV correctamente`,
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#1a4b8c",
        })
      },
      (error) => {
        // Mostrar mensaje de error
        Swal.fire({
          title: "Error",
          text: "No se pudo exportar la incidencia en formato CSV",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#8c1a20",
        })
        console.error("Error al exportar la incidencia:", error)
      },
    )
  }
}
 
