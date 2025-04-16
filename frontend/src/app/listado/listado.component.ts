import { Component } from "@angular/core"
import { Incidencia } from "../model/incidencia"
import { InspectorService } from "../services/inspector.service"
import { Router } from "@angular/router"
import { CommonModule, NgFor, NgIf } from "@angular/common"

@Component({
  selector: "app-listado",
  standalone: true,
  imports: [CommonModule, NgFor, NgIf],
  templateUrl: "./listado.component.html",
  styleUrls: ["./listado.component.css"],
})
export class ListadoComponent {
  incidencias: Incidencia[] = []
  esMosaico = false // Propiedad para alternar entre los formatos

  constructor(
    private servicioInspector: InspectorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.servicioInspector.getIncidencias().subscribe((incident) => (this.incidencias = incident))
  }

  verDetalles(incidencia: Incidencia): void {
    this.router.navigate(["/detalles-incidencia", incidencia.id])
  }

  alternarFormato(mosaico: boolean): void {
    this.esMosaico = mosaico // Establecer directamente el formato deseado
  }

  // Método para actualizar la lista de incidencias
  actualizarIncidencias(): void {
    this.servicioInspector.getIncidencias().subscribe((incident) => {
      this.incidencias = incident
    })
  }

  // Método para determinar la clase CSS según el estado
  getEstadoClass(estado: string): string {
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
        return "en-progreso" // Clase por defecto
    }
  }

  // Método para extraer solo el texto de observaciones del JSON
  getObservacionesTexto(observaciones: string): string {
    if (!observaciones) {
      return "Sin observaciones"
    }

    try {
      const datosJSON = JSON.parse(observaciones)
      return datosJSON.observacionesTexto || "Sin observaciones"
    } catch (error) {
      // Si no es un JSON válido, devolver el texto original
      return observaciones
    }
  }

  // Añadir el método handleImageError para manejar errores de carga de imágenes
  handleImageError(event: any): void {
    // Cuando la imagen no se puede cargar, reemplazarla con la imagen por defecto
    event.target.src = "../../assets/images/Logo_Ineco.png"

    // Opcional: añadir clase para aplicar estilos específicos a imágenes de respaldo
    event.target.classList.add("fallback-image")
  }
}
