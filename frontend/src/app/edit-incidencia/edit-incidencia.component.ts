import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Incidencia } from '../model/incidencia';
import { InspectorService } from '../services/inspector.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-incidencia',
  standalone: true, 
  imports: [FormsModule],
  templateUrl: './edit-incidencia.component.html',
  styleUrl: './edit-incidencia.component.css'
})
export class EditIncidenciaComponent {
  
  incidencia: Incidencia;

  constructor(
    public dialogRef: MatDialogRef<EditIncidenciaComponent>,
    private inspectorService: InspectorService,
    @Inject(MAT_DIALOG_DATA) public data: { incidencia: Incidencia } // Recibimos la incidencia
  ) {
    this.incidencia = data.incidencia; // Asignamos la incidencia recibida al "popup"
  }

  confirmarEdicion() {
    this.inspectorService.actualizarIncidencia(this.incidencia).subscribe(res => (res == "ok")?this.actualizarOk():alert("error al actualizar la incidencia"));
    
  }

  actualizarOk():void{
    alert("incidencia actualizada con exito");
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
