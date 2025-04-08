import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Incidencia } from '../model/incidencia';
import { InspectorService } from '../services/inspector.service';
import { FormsModule, NgModel } from '@angular/forms';
import Swal from "sweetalert2" // Import SweetAlert2


@Component({
  selector: 'app-registro-incidencia',
  standalone: true,
  imports: [FormsModule], //impor tcommonModule for basic angular direcives, as ngIf ngFor...
  templateUrl: './registro-incidencia.component.html',
  styleUrl: './registro-incidencia.component.css'
})
export class RegistroIncidenciaComponent {

  incidencia: Incidencia = new Incidencia //instancia sin pasar por el constructor


  constructor(public dialogRef: MatDialogRef<RegistroIncidenciaComponent>, private inspectorService: InspectorService) {}

  registrarIncidencia(): void {

    console.log('Datos de la incidencia:', this.incidencia.elemento);

    this.inspectorService.registrarIncidencia(this.incidencia).subscribe(
      res => (res =="ok")?this.inciOk():this.showErrorAlert())
  }

  inciOk():void{
    Swal.fire({
      title: "¡Éxito!",
      text: "Incidencia actualizada correctamente",
      icon: "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#1a4b8c",
    }).then(() => {
      this.dialogRef.close(true)
    })
  }

  showErrorAlert(): void {
    Swal.fire({
      title: "Error",
      text: "Error al actualizar la incidencia",
      icon: "error",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#8c1a20",
    })
  }

  close(): void {
    this.dialogRef.close();
  }


}