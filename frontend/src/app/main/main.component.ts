import { Component, ViewChild } from "@angular/core"
import { MapComponent } from "../map/map.component"
import { ListadoComponent } from "../listado/listado.component"
import { MatDialog } from "@angular/material/dialog"
import { ImportarIncidenciaComponent } from "../importar-incidencia/importar-incidencia.component"
import { InspectorService } from "../services/inspector.service"
import Swal from "sweetalert2"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-main",
  standalone: true,
  imports: [MapComponent, ListadoComponent, CommonModule],
  templateUrl: "./main.component.html",
  styleUrl: "./main.component.css",
})
export class MainComponent {
  @ViewChild("listadoComponent") listadoComponent!: ListadoComponent

  // Propiedad para controlar el formato de visualización
  esMosaico = false

  constructor(
    private dialog: MatDialog,
    private inspectorService: InspectorService,
  ) {}

  // Modificar el método importarIncidencias para actualizar la lista después de importar
  importarIncidencias(): void {
    const dialogRef = this.dialog.open(ImportarIncidenciaComponent, {
      width: "500px",
      disableClose: false,
      data: { modo: "todas" }, // Indicar que queremos importar todas las incidencias
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        // Si la importación fue exitosa, mostrar un mensaje breve y recargar los datos
        Swal.fire({
          title: "¡Importación completada!",
          text: "Actualizando datos...",
          icon: "success",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: () => {
            Swal.showLoading()
            // En lugar de recargar toda la página, solo actualizamos los datos
            if (this.listadoComponent) {
              this.listadoComponent.actualizarIncidencias()
            }
          },
        })
      }
    })
  }

  exportarIncidencias(): void {
    // Mostrar un mensaje de carga con SweetAlert2
    Swal.fire({
      title: "Exportando...",
      text: "Preparando todas las incidencias para exportar en formato CSV",
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    // Llamar al servicio para exportar todas las incidencias
    this.inspectorService.exportarTodasIncidencias().subscribe(
      (data: Blob) => {
        // Añadir BOM (Byte Order Mark) para asegurar que Excel reconozca UTF-8
        const BOM = new Uint8Array([0xef, 0xbb, 0xbf])
        const blobWithBOM = new Blob([BOM, data], { type: "text/csv;charset=utf-8" })

        // Crear una URL para el blob recibido
        const url = window.URL.createObjectURL(blobWithBOM)

        // Crear un elemento <a> para descargar el archivo
        const a = document.createElement("a")
        a.href = url
        a.download = "incidencias.csv" // Nombre del archivo a descargar

        // Añadir al DOM, hacer clic y eliminar
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Mostrar mensaje de éxito
        Swal.fire({
          title: "¡Exportación completada!",
          text: "Todas las incidencias han sido exportadas en formato CSV correctamente",
          icon: "success",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#1a4b8c",
        })
      },
      (error) => {
        // Mostrar mensaje de error
        Swal.fire({
          title: "Error",
          text: "No se pudieron exportar las incidencias en formato CSV",
          icon: "error",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#8c1a20",
        })
        console.error("Error al exportar las incidencias:", error)
      },
    )
  }

  // Método para alternar el formato de visualización
  alternarFormato(mosaico: boolean): void {
    this.esMosaico = mosaico

    // Actualizar el formato en el componente de listado
    if (this.listadoComponent) {
      this.listadoComponent.alternarFormato(mosaico)
    }
  }
}
