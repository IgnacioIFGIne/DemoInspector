import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Incidencia } from '../model/incidencia';
import { InspectorService } from '../services/inspector.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro-incidencia',
  standalone: true,
  imports: [FormsModule, CommonModule], // Se importa CommonModule para directivas básicas como ngIf y ngFor
  templateUrl: './registro-incidencia.component.html',
  styleUrls: ['./registro-incidencia.component.css']
})
export class RegistroIncidenciaComponent {

  incidencia: Incidencia = new Incidencia(); // Instancia de incidencia sin pasar por el constructor
  selectedFile: File | null = null; // Variable para almacenar la foto seleccionada

  constructor(
    public dialogRef: MatDialogRef<RegistroIncidenciaComponent>, 
    private inspectorService: InspectorService
  ) {}

  ngOnInit(): void {
    console.log("ngOnInit ejecutado"); // Verifica que se ejecuta
    this.obtenerUbicacion();
  }

  obtenerUbicacion() {
    if (!navigator.geolocation) {
      console.error("Geolocalización no está soportada en este navegador.");
      return;
    } else {
      console.log("Geolocalización disponible en este navegador.");
    }

    console.log("Intentando obtener ubicación...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.incidencia.ubicacion = `${position.coords.latitude}, ${position.coords.longitude}`;
        console.log("Ubicación obtenida:", this.incidencia.ubicacion);
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("El usuario denegó el permiso de geolocalización.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.error("Información de ubicación no disponible.");
            break;
          case error.TIMEOUT:
            console.error("La solicitud de geolocalización expiró.");
            break;
          default:
            console.error("Error desconocido al obtener ubicación.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Configuración avanzada
    );
  }

  registrarIncidencia(): void {
    console.log('Datos de la incidencia:', this.incidencia);
  
    const formData = new FormData();
  
    formData.append('elemento', this.incidencia.elemento);
    formData.append('instalacion', this.incidencia.instalacion);
    formData.append('ubicacion', this.incidencia.ubicacion);
    formData.append('tipo', this.incidencia.tipo);
    formData.append('estado', this.incidencia.estado);
    formData.append('fecha', this.incidencia.fecha);
    formData.append('observaciones', this.incidencia.observaciones || "");
  
    if (this.selectedFile) {
      formData.append('foto', this.selectedFile);
    }
  
    this.inspectorService.registrarIncidenciaConFoto(formData).subscribe(
      (res: any) => {
        if (res.status === "ok") {
          this.incidencia.id = res.id;
          this.inciOk();
        } else {
          alert("Error al registrar la incidencia");
        }
      },
      error => {
        console.error("Error al registrar incidencia", error);
        alert("Ocurrió un error");
      }
    );
  }
  

  uploadImage(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      const incidenciaId = this.incidencia.id; 

      
      const fileName = `${incidenciaId}.jpg`;
      formData.append('foto', this.selectedFile, fileName); 

      // Enviar la foto al backend
      this.inspectorService.subirFoto(formData).subscribe(
        res => console.log('Foto subida correctamente', res),
        error => console.error('Error al subir foto', error)
      );
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0]; // Obtiene el primer archivo seleccionado
    if (file) {
      this.selectedFile = file;  // Almacena el archivo en la variable selectedFile
    }
  }

  inciOk(): void {
    alert("Incidencia registrada con éxito");
    // Puedes recargar la vista o realizar otras acciones si es necesario
    this.dialogRef.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
