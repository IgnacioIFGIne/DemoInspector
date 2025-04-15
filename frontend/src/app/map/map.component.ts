import { Component, OnInit, AfterViewInit, Inject } from "@angular/core"
import { isPlatformBrowser } from "@angular/common"
import { PLATFORM_ID } from "@angular/core"
import { InspectorService } from "../services/inspector.service"
import { Incidencia } from "../model/incidencia"
import { isValidCoordinates } from "../validators/validatorLocation"

@Component({
  selector: "app-map",
  templateUrl: "./map.component.html",
  styleUrls: ["./map.component.css"],
})
export class MapComponent implements OnInit, AfterViewInit {
  map: any
  userLat = 40.4168 // Madrid por defecto
  userLon = -3.7038
  incidencias: Incidencia[] = []
  L: any
  mapInitialized = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private servicioInspector: InspectorService
  ) {}

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      // Cargar Leaflet de manera asíncrona
      try {
        this.L = await import("leaflet")
        console.log("Leaflet cargado correctamente")
      } catch (error) {
        console.error("Error al cargar Leaflet:", error)
      }
    }
  }

  ngAfterViewInit(): void {
    // Inicializar el mapa después de que la vista esté lista
    if (isPlatformBrowser(this.platformId)) {
      // Dar tiempo para que el DOM se renderice completamente
      setTimeout(() => {
        this.initializeMap()
      }, 300)
    }
  }

  // Inicializar el mapa
  async initializeMap(): Promise<void> {
    try {
      console.log("Inicializando mapa...")

      // Verificar que Leaflet está cargado
      if (!this.L) {
        console.error("Leaflet no está cargado")
        return
      }

      // Verificar que el elemento del mapa existe
      const mapElement = document.getElementById("map")
      if (!mapElement) {
        console.error("Elemento del mapa no encontrado")
        return
      }

      console.log("Elemento del mapa encontrado:", mapElement)

      // Si el mapa ya está inicializado, no hacer nada
      if (this.mapInitialized) {
        console.log("El mapa ya está inicializado")
        return
      }

      // Inicializar el mapa con una ubicación por defecto (Madrid)
      this.map = this.L.map("map").setView([this.userLat, this.userLon], 13)

      // Añadir la capa de tiles de OpenStreetMap
      this.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "",
        maxZoom: 19,
      }).addTo(this.map)

      // Marcar que el mapa ya está inicializado
      this.mapInitialized = true
      console.log("Mapa inicializado correctamente")

      // Forzar una actualización del tamaño del mapa
      setTimeout(() => {
        if (this.map) {
          console.log("Actualizando tamaño del mapa")
          this.map.invalidateSize()
        }
      }, 500)

      // Obtener la ubicación del usuario
      this.getUserLocation()

      // Obtener las incidencias
      this.getIncidenciasLocation()
    } catch (error) {
      console.error("Error al inicializar el mapa:", error)
    }
  }

  // Obtener la ubicación del usuario
  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLat = position.coords.latitude
          this.userLon = position.coords.longitude

          if (this.map) {
            // Actualizar la vista del mapa con la ubicación del usuario
            this.map.setView([this.userLat, this.userLon], 13)

            // Añadir un marcador en la ubicación del usuario
            this.L.marker([this.userLat, this.userLon]).addTo(this.map).bindPopup("<b>¡Estás aquí!</b>").openPopup()
          }
        },
        (error) => {
          console.error("Error al obtener la ubicación del usuario:", error)
        },
      )
    } else {
      console.error("La geolocalización no está disponible en este navegador.")
    }
  }

  // Obtener las incidencias desde el servicio
  getIncidenciasLocation(): void {
    this.servicioInspector.getIncidencias().subscribe(
      (incident) => {
        this.incidencias = incident

        this.incidencias.forEach((incidencia) => {
          if (isValidCoordinates(incidencia.ubicacion)) {
            this.addIncidentMarker(incidencia)
          }
        })
      },
      (error) => {
        console.error("Error al obtener incidencias:", error)
      },
    )
  }

  // Añadir el marcador de la incidencia
  addIncidentMarker(incidencia: Incidencia): void {
    if (!this.L || !this.map) return

    try {
      const [lat, lon] = incidencia.ubicacion.split(",").map((coord) => Number.parseFloat(coord.trim()))

      // Crear marcador y añadirlo al mapa
      const marker = this.L.marker([lat, lon]).addTo(this.map)

      // Asignar información al marcador
      marker.bindPopup(`<b>${incidencia.instalacion}</b><br>${incidencia.elemento}<br>${lat}, ${lon}`)
    } catch (error) {
      console.error("Error al añadir marcador de incidencia:", error)
    }
  }
}
