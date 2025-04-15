import { NgFor, NgIf, CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import { Incidencia } from "../model/incidencia"
import { InspectorService } from "../services/inspector.service"
import { ActivatedRoute, Router } from "@angular/router"
import { EditIncidenciaComponent } from "../edit-incidencia/edit-incidencia.component"
import { MatDialog } from "@angular/material/dialog"
import { MapComponent } from "../map/map.component"
import Swal from "sweetalert2" // Import SweetAlert2
import { ImportarIncidenciaComponent } from "../importar-incidencia/importar-incidencia.component"
import { Location } from "@angular/common"

@Component({
  selector: "app-detalles-incidencia",
  standalone: true, // Añadido standalone: true
  imports: [NgFor, NgIf, MapComponent, CommonModule], // Añadido CommonModule
  templateUrl: "./detalles-incidencia.component.html",
  styleUrl: "./detalles-incidencia.component.css",
})
export class DetallesIncidenciaComponent {
  id_incidencia = -1
  incidencia: Incidencia = {} as Incidencia
  fotoError = false

  constructor(
    private servicioInspector: InspectorService,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private location: Location,
  ) {}

  //obtiene la incidencia de la base de datos a apartir de una id
  ngOnInit(): void {
    this.id_incidencia = Number(this.activatedRoute.snapshot.paramMap.get("id"))
    this.cargarIncidencia()
  }

  // Método para cargar la incidencia
  cargarIncidencia(): void {
    this.servicioInspector.getIncidencia_id(this.id_incidencia).subscribe((incident) => {
      this.incidencia = incident
      this.fotoError = false // Resetear el error de foto al cargar una nueva incidencia
    })
  }

  // Método para obtener la URL de la foto con timestamp para evitar caché
  getFotoUrl(): string {
    return this.servicioInspector.obtenerUrlFoto(this.id_incidencia)
  }

  // Método para volver atrás
  goBack(): void {
    this.location.back()
  }

  // Método para determinar la clase CSS según el estado
  getEstadoClass(estado: string | undefined): string {
    // Verificar si estado es undefined o null
    if (!estado) {
      return "status-resolved" // Clase por defecto si no hay estado
    }

    // Convertir a minúsculas y eliminar espacios para comparación
    const estadoNormalizado = estado.toLowerCase().replace(/\s+/g, "-")

    switch (estadoNormalizado) {
      case "iniciado":
        return "estado-iniciado"
      case "en-progreso":
        return "estado-en-progreso"
      case "pausado":
        return "estado-pausado"
      case "parado":
        return "estado-parado"
      default:
        // Si no coincide con ninguno de los estados específicos, devolver una clase genérica
        return "status-resolved" // Clase por defecto
    }
  }

  // Método para extraer solo el texto de observaciones del JSON
  getObservacionesTexto(): string {
    if (!this.incidencia.observaciones) {
      return ""
    }

    try {
      const datosJSON = JSON.parse(this.incidencia.observaciones)
      return datosJSON.observacionesTexto || ""
    } catch (error) {
      // Si no es un JSON válido, devolver el texto original
      return this.incidencia.observaciones
    }
  }

  editarIncidencia(incidencia: Incidencia) {
    const dialogRef = this.dialog.open(EditIncidenciaComponent, {
      width: "90%", // Aumentar el ancho para dar más espacio al mapa
      maxWidth: "1200px", // Establecer un ancho máximo
      height: "90%", // Aumentar la altura para dar más espacio al mapa
      data: { incidencia: incidencia },
      disableClose: true,
      panelClass: "custom-dialog-container", // Clase personalizada para el diálogo
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Recargar la incidencia para mostrar los cambios actualizados
        this.cargarIncidencia()
      }
    })
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
        this.cargarIncidencia()

        // Mostrar un mensaje de actualización exitosa
        Swal.fire({
          title: "Datos actualizados",
          text: "Los datos de la incidencia han sido actualizados",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        })
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
      })
      return
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
