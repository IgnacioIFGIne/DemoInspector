import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Incidencia } from '../model/incidencia';
import { InspectorService } from '../services/inspector.service';
import { FormsModule, NgModel } from '@angular/forms';



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
      res => (res =="ok")?this.inciOk():alert("error al registrar la incidencia"))
  }

  inciOk():void{
    alert("incidencia registrada con exito");
  }

  close(): void {
    this.dialogRef.close();
  }


}
