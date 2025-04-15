import { CommonModule } from "@angular/common"
import { Component, type OnInit, type AfterViewInit, inject, NgZone, ViewChild, type ElementRef } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { MatDialogRef } from "@angular/material/dialog"
import { Incidencia } from "../model/incidencia"
import { InspectorService } from "../services/inspector.service"
import Swal from "sweetalert2"

@Component({
  selector: "app-registro-incidencia",
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: "./registro-incidencia.component.html",
  styleUrls: ["./registro-incidencia.component.css"],
})
export class RegistroIncidenciaComponent implements OnInit, AfterViewInit {
  @ViewChild("fileInput") fileInput!: ElementRef
  @ViewChild("videoElement") videoElement!: ElementRef<HTMLVideoElement>
  @ViewChild("canvasElement") canvasElement!: ElementRef<HTMLCanvasElement>

  incidencia: Incidencia = new Incidencia()
  selectedFile: File | null = null
  tipoPersonalizado = "" // Para almacenar el tipo personalizado cuando se selecciona "Otro"

  // Nuevos campos
  nivelCriticidad = ""
  entidadResponsable = ""
  entidadPersonalizada = ""

  disciplinas = [
    "Eléctrico",
    "Telecomunicaciones",
    "Abastecimiento de agua",
    "Saneamiento/pluviales",
    "Alcantarillado",
    "Señalización",
  ]
  estados = ["Iniciado", "En progreso", "Pausado", "Parado", "Finalizado"]
  private ngZone = inject(NgZone)

  // Variables para la cámara
  isMobile = false
  showCamera = false
  mediaStream: MediaStream | null = null
  capturedImage: string | null = null

  // Variable para el mapa
  private map: any = null
  private L: any = null

  // Campos específicos según la disciplina seleccionada
  camposEspecificos: any = {
    Eléctrico: {
      campos: [
        {
          nombre: "Tipo",
          tipo: "select",
          opciones: [
            "Poste de media tensión",
            "Poste de baja tensión",
            "Centro de transformación",
            "Caja de registro",
            "Línea aérea",
            "Línea subterránea",
            "Otro",
          ],
          valor: "",
        },
        {
          nombre: "Tipo de afección",
          tipo: "select",
          opciones: [
            "Directa (impacto inmediato)",
            "Potencial (posible afección futura)",
            "No afectado (para dejar constancia)",
          ],
          valor: "",
        },
        {
          nombre: "Estado funcional",
          tipo: "select",
          opciones: ["Operativo", "Fuera de servicio", "Desconocido"],
          valor: "",
        },
      ],
    },
    Telecomunicaciones: {
      campos: [
        {
          nombre: "Tipo",
          tipo: "select",
          opciones: [
            "Poste telefónico",
            "Arqueta de telecomunicaciones",
            "Caja de empalme",
            "Cableado aéreo",
            "Canalización subterránea",
            "Registro de fibra óptica",
            "Otro",
          ],
          valor: "",
        },
        {
          nombre: "Tipo de afección",
          tipo: "select",
          opciones: [
            "Directa (impacto inmediato)",
            "Potencial (posible afección futura)",
            "No afectado (para dejar constancia)",
          ],
          valor: "",
        },
        {
          nombre: "Estado funcional",
          tipo: "select",
          opciones: ["Operativo", "Fuera de servicio", "Desconocido"],
          valor: "",
        },
      ],
    },
    "Abastecimiento de agua": {
      campos: [
        {
          nombre: "Tipo",
          tipo: "select",
          opciones: [
            "Tubería de agua potable",
            "Hidrante",
            "Válvula",
            "Arqueta",
            "Bomba de presión",
            "Conexión domiciliaria",
            "Otro",
          ],
          valor: "",
        },
        {
          nombre: "Tipo de afección",
          tipo: "select",
          opciones: [
            "Directa (impacto inmediato)",
            "Potencial (posible afección futura)",
            "No afectado (para dejar constancia)",
          ],
          valor: "",
        },
        {
          nombre: "Estado funcional",
          tipo: "select",
          opciones: ["Operativo", "Fuera de servicio", "Desconocido"],
          valor: "",
        },
      ],
    },
    "Saneamiento/pluviales": {
      campos: [
        {
          nombre: "Tipo",
          tipo: "select",
          opciones: [
            "Colector",
            "Pozo de registro",
            "Arqueta de paso",
            "Rejilla pluvial",
            "Tubería de fecales",
            "Tubería de pluviales",
            "Otro",
          ],
          valor: "",
        },
        {
          nombre: "Tipo de afección",
          tipo: "select",
          opciones: [
            "Directa (impacto inmediato)",
            "Potencial (posible afección futura)",
            "No afectado (para dejar constancia)",
          ],
          valor: "",
        },
        {
          nombre: "Estado funcional",
          tipo: "select",
          opciones: ["Operativo", "Fuera de servicio", "Desconocido"],
          valor: "",
        },
      ],
    },
    Alcantarillado: {
      campos: [
        {
          nombre: "Tipo",
          tipo: "select",
          opciones: [
            "Colector",
            "Pozo de registro",
            "Arqueta de paso",
            "Rejilla pluvial",
            "Tubería de fecales",
            "Tubería de pluviales",
            "Otro",
          ],
          valor: "",
        },
        {
          nombre: "Tipo de afección",
          tipo: "select",
          opciones: [
            "Directa (impacto inmediato)",
            "Potencial (posible afección futura)",
            "No afectado (para dejar constancia)",
          ],
          valor: "",
        },
        {
          nombre: "Estado funcional",
          tipo: "select",
          opciones: ["Operativo", "Fuera de servicio", "Desconocido"],
          valor: "",
        },
      ],
    },
    Señalización: {
      campos: [
        {
          nombre: "Tipo",
          tipo: "select",
          opciones: [
            "Señal vertical",
            "Señal de obra",
            "Poste de señalización",
            "Baliza",
            "Panel informativo",
            "Semáforo",
            "Otro",
          ],
          valor: "",
        },
        {
          nombre: "Tipo de afección",
          tipo: "select",
          opciones: [
            "Directa (impacto inmediato)",
            "Potencial (posible afección futura)",
            "No afectado (para dejar constancia)",
          ],
          valor: "",
        },
        {
          nombre: "Estado funcional",
          tipo: "select",
          opciones: ["Operativo", "Fuera de servicio", "Desconocido"],
          valor: "",
        },
      ],
    },
  }

  camposDisciplinaActual: any[] = []

  constructor(
    public dialogRef: MatDialogRef<RegistroIncidenciaComponent>,
    private inspectorService: InspectorService,
  ) {
    // Detectar si es un dispositivo móvil
    this.detectarDispositivoMovil()

    // Cargar Leaflet de manera global si está disponible
    if (typeof window !== "undefined") {
      // @ts-ignore
      this.L = window.L
    }
  }

  async ngOnInit(): Promise<void> {
    this.obtenerUbicacion()
    // Establecer fecha actual
    const ahora = new Date()
    this.incidencia.fecha = this.formatearFecha(ahora)

    // Forzar la detección de dispositivo móvil para pruebas
    // Comentar esta línea en producción si no se desea forzar
    // this.isMobile = true
    // console.log("Forzando modo móvil para pruebas:", this.isMobile)
  }

  ngAfterViewInit(): void {
    // Usar el evento afterOpened del diálogo para asegurar que el mapa se actualice
    if (this.dialogRef) {
      this.dialogRef.afterOpened().subscribe(() => {
        // Inicializar el mapa directamente en el modal
        setTimeout(() => {
          this.initializeMap()
        }, 500) // Aumentar el tiempo de espera para asegurar que el DOM esté listo
      })
    } else {
      // Si no estamos en un diálogo, inicializar el mapa directamente
      setTimeout(() => {
        this.initializeMap()
      }, 500) // Aumentar el tiempo de espera para asegurar que el DOM esté listo
    }
  }

  // Método para detectar si es un dispositivo móvil
  detectarDispositivoMovil(): void {
    // Verificar si estamos en un navegador
    if (typeof window !== "undefined" && window.navigator) {
      const userAgent = navigator.userAgent || navigator.vendor

      // Expresión regular para detectar dispositivos móviles
      const regexMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

      this.isMobile = regexMobile.test(userAgent)
      console.log("Es dispositivo móvil:", this.isMobile)
    }
  }

  // Método para activar la cámara
  activarCamara(): void {
    this.showCamera = true

    // Esperar a que el DOM se actualice para acceder a los elementos de video
    setTimeout(() => {
      this.iniciarCamara()
    }, 100)
  }

  // Método para iniciar la cámara
  async iniciarCamara(): Promise<void> {
    try {
      // Verificar si el navegador soporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Tu navegador no soporta el acceso a la cámara")
      }

      // Configuración para usar la cámara trasera en móviles
      const constraints = {
        video: {
          facingMode: "environment", // 'environment' para cámara trasera, 'user' para frontal
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      // Obtener acceso a la cámara
      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints)

      // Asignar el stream al elemento de video
      if (this.videoElement && this.videoElement.nativeElement) {
        this.videoElement.nativeElement.srcObject = this.mediaStream
      } else {
        console.error("Elemento de video no encontrado")
        this.cerrarCamara()
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudo acceder a la cámara. Por favor, verifica los permisos.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#8c1a20",
      })
      this.cerrarCamara()
    }
  }

  // Método para capturar la foto
  capturarFoto(): void {
    if (!this.videoElement || !this.canvasElement) {
      console.error("Elementos de video o canvas no encontrados")
      return
    }

    const video = this.videoElement.nativeElement
    const canvas = this.canvasElement.nativeElement

    // Configurar el canvas con las dimensiones del video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Dibujar el frame actual del video en el canvas
    const context = canvas.getContext("2d")
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convertir el canvas a una URL de datos (base64)
      this.capturedImage = canvas.toDataURL("image/jpeg")

      // Convertir la URL de datos a un archivo
      this.convertirBase64AFile(this.capturedImage)

      // Cerrar la cámara
      this.cerrarCamara()
    }
  }

  // Método para convertir base64 a File
  convertirBase64AFile(base64Image: string): void {
    // Eliminar el prefijo de la URL de datos
    const base64Data = base64Image.split(",")[1]
    const byteCharacters = atob(base64Data)

    const byteArrays = []

    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i))
    }

    const byteArray = new Uint8Array(byteArrays)
    const blob = new Blob([byteArray], { type: "image/jpeg" })

    // Crear un nombre de archivo con la fecha actual
    const now = new Date()
    const fileName = `foto_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, "0")}${now.getDate().toString().padStart(2, "0")}_${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}${now.getSeconds().toString().padStart(2, "0")}.jpg`

    // Crear un objeto File a partir del Blob
    this.selectedFile = new File([blob], fileName, { type: "image/jpeg" })

    console.log("Foto capturada y convertida a File:", this.selectedFile)
  }

  // Método para cerrar la cámara
  cerrarCamara(): void {
    // Detener todos los tracks del stream
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }

    // Ocultar el modal de la cámara
    this.showCamera = false
  }

  // Método para eliminar la foto capturada
  eliminarFotoCapturada(): void {
    this.capturedImage = null
    this.selectedFile = null
  }

  // Método para inicializar el mapa directamente en el componente
  initializeMap(): void {
    try {
      // Verificar si Leaflet está disponible globalmente
      if (!this.L) {
        console.error("Leaflet no está disponible")
        return
      }

      const mapElement = document.getElementById("map")
      if (!mapElement) {
        console.error("Elemento del mapa no encontrado")
        return
      }

      // Verificar si el contenedor ya tiene un mapa inicializado
      if (mapElement.classList.contains("leaflet-container")) {
        console.log("El contenedor ya tiene un mapa inicializado")
        if (this.map) {
          // Forzar actualización del tamaño
          setTimeout(() => {
            this.map.invalidateSize(true)
          }, 100)
        }
        return
      }

      // Crear un nuevo mapa con opciones específicas
      this.map = this.L.map("map", {
        center: [40.4168, -3.7038],
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
        fadeAnimation: true,
        zoomAnimation: true,
      })

      // Añadir la capa de tiles con opciones específicas
      this.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "",
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
        detectRetina: true,
      }).addTo(this.map)

      // Forzar actualización del tamaño múltiples veces para asegurar que se renderice
      setTimeout(() => {
        this.map.invalidateSize(true)

        // Si tenemos coordenadas, añadir un marcador
        if (this.incidencia.ubicacion) {
          try {
            const [lat, lon] = this.incidencia.ubicacion.split(",").map((coord) => Number.parseFloat(coord.trim()))
            if (!isNaN(lat) && !isNaN(lon)) {
              // Usar el icono por defecto de Leaflet sin personalización
              this.L.marker([lat, lon]).addTo(this.map).bindPopup("Tu ubicación").openPopup()
              this.map.setView([lat, lon], 15)
            }
          } catch (error) {
            console.error("Error al añadir marcador:", error)
          }
        }
      }, 300)

      // Actualizar el tamaño nuevamente después de un tiempo
      setTimeout(() => {
        this.map.invalidateSize(true)
      }, 1000)
    } catch (error) {
      console.error("Error al inicializar el mapa:", error)
    }
  }

  formatearFecha(fecha: Date): string {
    const dia = fecha.getDate().toString().padStart(2, "0")
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0")
    const anio = fecha.getFullYear()
    const horas = fecha.getHours().toString().padStart(2, "0")
    const minutos = fecha.getMinutes().toString().padStart(2, "0")

    return `${dia}/${mes}/${anio}, ${horas}:${minutos}`
  }

  obtenerUbicacion() {
    if (!navigator.geolocation) {
      console.error("Geolocalización no está soportada en este navegador.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.incidencia.ubicacion = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error)
        // Establecer una ubicación por defecto (Madrid)
        this.incidencia.ubicacion = "40.416600, -3.700300"
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  onDisciplinaChange(): void {
    if (this.incidencia.tipo && this.camposEspecificos[this.incidencia.tipo]) {
      this.camposDisciplinaActual = this.camposEspecificos[this.incidencia.tipo].campos
      // Limpiar el tipo personalizado al cambiar de disciplina
      this.tipoPersonalizado = ""

      // Generar código basado en la disciplina seleccionada usando el método mejorado
      this.inspectorService.obtenerSiguienteNumeroIncidencia(this.incidencia.tipo).subscribe(
        (codigo) => {
          this.incidencia.instalacion = codigo
        },
        (error) => {
          console.error("Error al obtener el siguiente número de incidencia:", error)
          // En caso de error, asignar un código genérico
          this.incidencia.instalacion = "ERROR-XX"
        },
      )
    } else {
      this.camposDisciplinaActual = []
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0]
    if (file) {
      this.selectedFile = file
      // Limpiar la imagen capturada si existe
      this.capturedImage = null
    }
  }

  // Modificar el método registrarIncidencia para usar el valor de Tipo como elemento
  registrarIncidencia(): void {
    // Recopilar datos específicos de la disciplina
    const datosEspecificos: Record<string, string> = {}
    if (this.camposDisciplinaActual.length > 0) {
      this.camposDisciplinaActual.forEach((campo) => {
        datosEspecificos[campo.nombre] = campo.valor

        // Si el campo es "Tipo", asignar su valor al campo elemento de la incidencia
        if (campo.nombre === "Tipo") {
          // Si el tipo es "Otro", usar el tipo personalizado como elemento
          if (campo.valor === "Otro" && this.tipoPersonalizado) {
            this.incidencia.elemento = this.tipoPersonalizado
            datosEspecificos["TipoPersonalizado"] = this.tipoPersonalizado
            // También podemos guardar el tipo real como el personalizado para mostrar en la interfaz
            datosEspecificos["TipoMostrar"] = this.tipoPersonalizado
          } else {
            // Si no es "Otro", usar el valor seleccionado
            this.incidencia.elemento = campo.valor
          }
        }
      })
    }

    // Añadir los nuevos campos
    datosEspecificos["NivelCriticidad"] = this.nivelCriticidad
    datosEspecificos["EntidadResponsable"] = this.entidadResponsable

    // Si la entidad es "Otro", guardar también la entidad personalizada
    if (this.entidadResponsable === "Otro" && this.entidadPersonalizada) {
      datosEspecificos["EntidadPersonalizada"] = this.entidadPersonalizada
    }

    // Añadir campo para observaciones de texto
    datosEspecificos["observacionesTexto"] = this.incidencia.observaciones || ""

    // Convertir a JSON y guardar en observaciones
    this.incidencia.observaciones = JSON.stringify(datosEspecificos)

    const formData = new FormData()
    formData.append("elemento", this.incidencia.elemento)
    formData.append("instalacion", this.incidencia.instalacion)
    formData.append("ubicacion", this.incidencia.ubicacion)
    formData.append("tipo", this.incidencia.tipo)
    formData.append("estado", this.incidencia.estado)
    formData.append("fecha", this.incidencia.fecha)
    formData.append("observaciones", this.incidencia.observaciones)

    if (this.selectedFile) {
      formData.append("foto", this.selectedFile)
    }

    this.inspectorService.registrarIncidenciaConFoto(formData).subscribe(
      (res: any) => {
        if (res.status === "ok") {
          this.incidencia.id = res.id
          this.inciOk()
        } else {
          this.showErrorAlert()
        }
      },
      (error) => {
        console.error("Error al registrar incidencia", error)
        if (error.status === 400 && error.error && error.error.error) {
          Swal.fire({
            title: "Error",
            text: error.error.error,
            icon: "error",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#8c1a20",
          })
        } else {
          this.showErrorAlert()
        }
      },
    )
  }

  inciOk(): void {
    Swal.fire({
      title: "¡Éxito!",
      text: "Incidencia registrada correctamente",
      icon: "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#1a4b8c",
      allowOutsideClick: false,
    }).then(() => {
      this.dialogRef.close(true)
      setTimeout(() => {
        window.location.reload()
      }, 300)
    })
  }

  showErrorAlert(): void {
    Swal.fire({
      title: "Error",
      text: "Error al registrar la incidencia",
      icon: "error",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#8c1a20",
    })
  }

  close(): void {
    // Asegurarse de cerrar la cámara si está abierta
    if (this.showCamera) {
      this.cerrarCamara()
    }

    // Limpiar el mapa si existe
    if (this.map) {
      this.map.remove()
      this.map = null
    }

    this.dialogRef.close()
  }
}
