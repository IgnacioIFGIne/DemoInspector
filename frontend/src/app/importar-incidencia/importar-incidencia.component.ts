import { Component, Inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { InspectorService } from "../services/inspector.service"
import Swal from "sweetalert2"

// Interfaz para los datos que se pasan al componente
export interface ImportarIncidenciaData {
  modo: "individual" | "todas" // 'individual' para una incidencia, 'todas' para todas las incidencias
}

@Component({
  selector: "app-importar-incidencia",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./importar-incidencia.component.html",
  styleUrl: "./importar-incidencia.component.css",
})
export class ImportarIncidenciaComponent {
  isDragging = false
  selectedFile: File | null = null
  errorMessage = ""
  modo: "individual" | "todas" = "individual"; // Por defecto, importar una incidencia individual

  constructor(
    public dialogRef: MatDialogRef<ImportarIncidenciaComponent>,
    private inspectorService: InspectorService,
    @Inject(MAT_DIALOG_DATA) public data: ImportarIncidenciaData
  ) {
    // Si se proporcionan datos, establecer el modo
    if (data && data.modo) {
      this.modo = data.modo;
    }
  }

  // Método para manejar el evento dragover
  onDragOver(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = true
  }

  // Método para manejar el evento dragleave
  onDragLeave(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false
  }

  // Método para manejar el evento drop
  onDrop(event: DragEvent): void {
    event.preventDefault()
    event.stopPropagation()
    this.isDragging = false

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0]
      this.validateAndSetFile(file)
    }
  }

  // Método para manejar la selección de archivo mediante el input
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      this.validateAndSetFile(file)
    }
  }

  // Método para validar y establecer el archivo seleccionado
  validateAndSetFile(file: File): void {
    this.errorMessage = ""

    // Validar que sea un archivo CSV
    if (!file.name.toLowerCase().endsWith(".csv")) {
      this.errorMessage = "Por favor, selecciona un archivo CSV válido."
      return
    }

    // Validar tamaño del archivo (por ejemplo, máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB en bytes
    if (file.size > maxSize) {
      this.errorMessage = "El archivo es demasiado grande. El tamaño máximo es 5MB."
      return
    }

    this.selectedFile = file
  }

  // Método para eliminar el archivo seleccionado
  removeFile(): void {
    this.selectedFile = null
    this.errorMessage = ""
  }

  // Método para cerrar el diálogo
  close(): void {
    this.dialogRef.close(false)
  }

  // Método para importar el archivo
  importarArchivo(): void {
    if (!this.selectedFile) {
      this.errorMessage = "Por favor, selecciona un archivo CSV."
      return
    }

    // Texto para el mensaje de carga según el modo
    const textoModo = this.modo === "individual" ? "la incidencia" : "todas las incidencias"

    // Mostrar mensaje de carga
    Swal.fire({
      title: "Importando...",
      text: `Procesando ${textoModo} desde el archivo CSV`,
      icon: "info",
      showConfirmButton: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    // Leer el archivo como ArrayBuffer para preservar la codificación original
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        // Crear un nuevo Blob con el contenido original, sin intentar convertirlo a UTF-8
        const arrayBuffer = e.target?.result as ArrayBuffer
        const blob = new Blob([arrayBuffer], { type: "text/csv" })

        // Crear un nuevo File a partir del Blob
        const newFile = new File([blob], this.selectedFile!.name, {
          type: "text/csv",
          lastModified: this.selectedFile!.lastModified,
        })

        // Enviar el archivo sin modificar su codificación
        this.enviarArchivo(newFile)
      } catch (error) {
        console.error("Error al procesar el archivo:", error)
        this.handleImportError({ error: { error: "Error al procesar el archivo. Verifica su formato." } })
      }
    }

    reader.onerror = (error) => {
      console.error("Error al leer el archivo:", error)
      this.handleImportError({ error: { error: "Error al leer el archivo." } })
    }

    // Leer el archivo como ArrayBuffer para preservar la codificación original
    reader.readAsArrayBuffer(this.selectedFile)
  }

  // Método para enviar el archivo al servidor
  private enviarArchivo(file: File): void {
    if (this.modo === "individual") {
      this.inspectorService.importarIncidencia(file).subscribe(
        (response) => this.handleImportSuccess(response),
        (error) => this.handleImportError(error),
      )
    } else {
      this.inspectorService.importarTodasIncidencias(file).subscribe(
        (response) => this.handleImportSuccess(response),
        (error) => this.handleImportError(error),
      )
    }
  }

  // Método para manejar respuesta exitosa
  private handleImportSuccess(response: any): void {
    console.log("Respuesta del servidor:", response)

    // Determinar si se actualizaron incidencias basado en el mensaje
    let numActualizadas = 0
    let mensaje = ""

    if (this.modo === "individual") {
      // Para importar_incidencia, siempre consideramos que se actualizó 1 incidencia si la respuesta es exitosa
      numActualizadas = 1
      mensaje = response.mensaje || "La incidencia ha sido actualizada correctamente"
    } else {
      // Para importar_incidencias, extraer el número del mensaje
      mensaje = response.mensaje || "Las incidencias han sido actualizadas correctamente"

      // Intentar extraer el número de incidencias actualizadas del mensaje
      const match = mensaje.match(/Se han actualizado (\d+) incidencias/)
      if (match && match[1]) {
        numActualizadas = Number.parseInt(match[1], 10)
      }
    }

    // Mostrar mensaje de éxito o advertencia según corresponda
    Swal.fire({
      title: numActualizadas > 0 ? "¡Importación completada!" : "Importación completada sin cambios",
      text: mensaje,
      icon: "success", // Siempre mostrar éxito si la respuesta del servidor es exitosa
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#1a4b8c",
    }).then(() => {
      // Cerrar el diálogo y devolver true para indicar que el proceso se completó
      this.dialogRef.close(true)
    })
  }

  // Método para manejar errores
  private handleImportError(error: any): void {
    // Mostrar mensaje de error
    let errorMsg =
      this.modo === "individual" ? "No se pudo importar la incidencia." : "No se pudieron importar las incidencias."

    // Si hay un mensaje de error específico del servidor, mostrarlo
    if (error.error && error.error.error) {
      errorMsg = error.error.error
    } else if (error.status === 400) {
      errorMsg = "El formato del archivo CSV no es correcto o contiene datos inválidos."
    } else if (error.status === 404) {
      errorMsg = "No se encontraron algunas incidencias con los IDs proporcionados."
    } else if (error.status === 500) {
      errorMsg = "Error en el servidor al procesar el archivo. Por favor, contacte al administrador."
    }

    console.error("Error detallado:", error)

    Swal.fire({
      title: "Error",
      text: errorMsg,
      icon: "error",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#8c1a20",
    })
  }
}
