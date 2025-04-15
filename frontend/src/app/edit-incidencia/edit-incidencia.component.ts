import {
  Component,
  Inject,
  type OnInit,
  type AfterViewInit,
  inject,
  NgZone,
  ViewChild,
  type ElementRef,
} from "@angular/core"
import { FormsModule } from "@angular/forms"
import { CommonModule } from "@angular/common"
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog"
import { Incidencia } from "../model/incidencia"
import { InspectorService } from "../services/inspector.service"
import Swal from "sweetalert2"
import { MapComponent } from "../map/map.component"

@Component({
  selector: "app-edit-incidencia",
  standalone: true,
  imports: [FormsModule, CommonModule, MapComponent],
  templateUrl: "./edit-incidencia.component.html",
  styleUrl: "./edit-incidencia.component.css",
})
export class EditIncidenciaComponent implements OnInit, AfterViewInit {
  @ViewChild("fileInput") fileInput!: ElementRef
  @ViewChild("videoElement") videoElement!: ElementRef<HTMLVideoElement>
  @ViewChild("canvasElement") canvasElement!: ElementRef<HTMLCanvasElement>

  incidencia: Incidencia
  selectedFile: File | null = null
  fotoExistente = false
  fotoError = false
  observacionesTexto = ""
  tipoPersonalizado = "" // Para almacenar el tipo personalizado cuando se selecciona "Otro"

  // Nuevos campos
  nivelCriticidad = ""
  entidadResponsable = ""
  entidadPersonalizada = ""

  map: any
  L: any
  mapInitialized = false
  private ngZone = inject(NgZone)

  // Variables para la cámara
  isMobile = false
  showCamera = false
  mediaStream: MediaStream | null = null
  capturedImage: string | null = null

  estados = ["Iniciado", "En progreso", "Pausado", "Parado", "Finalizado"]
  camposDisciplinaActual: any[] = []

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
  };

  constructor(
    public dialogRef: MatDialogRef<EditIncidenciaComponent>,
    private inspectorService: InspectorService,
    @Inject(MAT_DIALOG_DATA) public data: { incidencia: Incidencia }
  ) {
    this.incidencia = { ...data.incidencia }; // Crear una copia para no modificar la original directamente
    console.log("Incidencia recibida:", this.incidencia);
    
    // Detectar si es un dispositivo móvil
    this.detectarDispositivoMovil();
  }

  async ngOnInit(): Promise<void> {
    // Verificar si existe una foto para esta incidencia
    this.fotoExistente = this.incidencia.id > 0

    // Cargar los campos específicos de la disciplina
    this.cargarCamposEspecificos()

    // Extraer el texto de observaciones del JSON si existe
    this.extraerObservaciones()

    // Cargar Leaflet de manera global para evitar problemas
    if (typeof window !== "undefined") {
      // @ts-ignore
      this.L = window.L
      if (!this.L) {
        console.error("Leaflet no está disponible globalmente. Verifica que se cargó correctamente en index.html")
      } else {
        console.log("Leaflet ya está disponible globalmente")
      }
    }
  }

  ngAfterViewInit(): void {
    // Dar más tiempo para que el DOM se renderice completamente
    setTimeout(() => {
      this.initializeMap()
    }, 1000)
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

    try {
      const video = this.videoElement.nativeElement
      const canvas = this.canvasElement.nativeElement

      // Verificar que el video esté reproduciendo
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        console.error("El video no está listo para capturar")
        return
      }

      // Configurar el canvas con las dimensiones del video
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480

      console.log("Dimensiones del canvas:", canvas.width, "x", canvas.height)

      // Dibujar el frame actual del video en el canvas
      const context = canvas.getContext("2d")
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convertir el canvas a una URL de datos (base64)
        this.capturedImage = canvas.toDataURL("image/jpeg", 0.9) // Calidad 0.9 para mejor compresión

        console.log("Imagen capturada, longitud base64:", this.capturedImage.length)

        // Convertir la URL de datos a un archivo
        this.convertirBase64AFile(this.capturedImage)

        // Cerrar la cámara
        this.cerrarCamara()
      } else {
        console.error("No se pudo obtener el contexto 2D del canvas")
      }
    } catch (error) {
      console.error("Error al capturar la foto:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudo capturar la foto. Por favor, inténtalo de nuevo.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#8c1a20",
      })
      this.cerrarCamara()
    }
  }

  // Método para convertir base64 a File
  convertirBase64AFile(base64Image: string): void {
    try {
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

      console.log("Foto capturada y convertida a File:", this.selectedFile.name, "tamaño:", this.selectedFile.size)
    } catch (error) {
      console.error("Error al convertir la imagen base64 a archivo:", error)
      Swal.fire({
        title: "Error",
        text: "No se pudo procesar la imagen capturada.",
        icon: "error",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#8c1a20",
      })
    }
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

  initializeMap(): void {
    this.ngZone.runOutsideAngular(() => {
      try {
        console.log("Inicializando mapa en edit-incidencia...")

        if (!this.L) {
          console.error("Leaflet no está disponible")
          return
        }

        // Verificar que el elemento del mapa existe
        const mapElement = document.getElementById("map")
        if (!mapElement) {
          console.error("Elemento del mapa no encontrado en edit-incidencia")
          return
        }

        console.log("Elemento del mapa encontrado:", mapElement)
        console.log("Dimensiones del mapa:", mapElement.offsetWidth, "x", mapElement.offsetHeight)

        // Si el mapa ya está inicializado, destruirlo primero
        if (this.map) {
          console.log("Destruyendo mapa existente")
          this.map.remove()
        }

        // Inicializar el mapa con una ubicación por defecto (Madrid)
        this.map = this.L.map("map", {
          center: [40.4168, -3.7038],
          zoom: 13,
          zoomControl: true,
        })

        // Añadir la capa de tiles de OpenStreetMap
        this.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "",
          maxZoom: 19,
        }).addTo(this.map)

        console.log("Mapa inicializado correctamente")
        this.mapInitialized = true

        // Forzar una actualización del tamaño del mapa
        setTimeout(() => {
          if (this.map) {
            console.log("Actualizando tamaño del mapa")
            this.map.invalidateSize(true)
          }
        }, 500)

        // Si tenemos coordenadas, añadir un marcador
        if (this.incidencia.ubicacion) {
          try {
            const [lat, lon] = this.incidencia.ubicacion.split(",").map((coord) => Number.parseFloat(coord.trim()))
            if (!isNaN(lat) && !isNaN(lon)) {
              this.L.marker([lat, lon]).addTo(this.map).bindPopup("Ubicación de la incidencia").openPopup()
              // Centrar el mapa en la ubicación
              this.map.setView([lat, lon], 15)
            }
          } catch (error) {
            console.error("Error al añadir marcador:", error)
          }
        }
      } catch (error) {
        console.error("Error al inicializar el mapa:", error)
      }
    })
  }

  cargarCamposEspecificos(): void {
    console.log("Cargando campos específicos para disciplina:", this.incidencia.tipo)

    // Normalizar el tipo para evitar problemas con mayúsculas/minúsculas o espacios
    const tipoNormalizado = this.normalizarTipo(this.incidencia.tipo)

    // Buscar la disciplina en el objeto camposEspecificos
    let disciplinaEncontrada = false
    let camposEncontrados = null

    // Recorrer las claves del objeto camposEspecificos
    Object.keys(this.camposEspecificos).forEach((key) => {
      const keyNormalizada = this.normalizarTipo(key)
      if (keyNormalizada === tipoNormalizado) {
        disciplinaEncontrada = true
        camposEncontrados = this.camposEspecificos[key].campos
      }
    })

    if (disciplinaEncontrada && camposEncontrados) {
      console.log("Disciplina encontrada, campos:", camposEncontrados)
      // Clonar los campos para no modificar la plantilla original
      this.camposDisciplinaActual = JSON.parse(JSON.stringify(camposEncontrados))

      // Si hay datos específicos en las observaciones, cargarlos
      try {
        if (this.incidencia.observaciones) {
          const datosEspecificos = JSON.parse(this.incidencia.observaciones)
          console.log("Datos específicos encontrados:", datosEspecificos)

          // Asignar los valores a los campos correspondientes
          this.camposDisciplinaActual.forEach((campo) => {
            if (datosEspecificos[campo.nombre] !== undefined) {
              campo.valor = datosEspecificos[campo.nombre]

              // Si el tipo es "Otro", cargar el tipo personalizado
              if (campo.nombre === "Tipo" && campo.valor === "Otro" && datosEspecificos["TipoPersonalizado"]) {
                this.tipoPersonalizado = datosEspecificos["TipoPersonalizado"]
              }
            }
          })

          // Cargar los nuevos campos
          if (datosEspecificos["NivelCriticidad"]) {
            this.nivelCriticidad = datosEspecificos["NivelCriticidad"]
          }

          if (datosEspecificos["EntidadResponsable"]) {
            this.entidadResponsable = datosEspecificos["EntidadResponsable"]

            // Si la entidad es "Otro", cargar la entidad personalizada
            if (this.entidadResponsable === "Otro" && datosEspecificos["EntidadPersonalizada"]) {
              this.entidadPersonalizada = datosEspecificos["EntidadPersonalizada"]
            }
          }
        }
      } catch (error) {
        console.error("Error al parsear los datos específicos:", error)
      }
    } else {
      console.log("No se encontraron campos para la disciplina:", this.incidencia.tipo)
      this.camposDisciplinaActual = []
    }
  }

  // Método para normalizar el tipo (eliminar acentos, convertir a minúsculas, etc.)
  normalizarTipo(tipo: string): string {
    if (!tipo) return ""

    // Convertir a minúsculas y eliminar espacios al inicio y final
    return tipo.toLowerCase().trim()
  }

  extraerObservaciones(): void {
    try {
      if (this.incidencia.observaciones) {
        // Intentar parsear como JSON
        const datosEspecificos = JSON.parse(this.incidencia.observaciones)
        // Si llegamos aquí, es un objeto JSON válido
        // Podemos extraer un campo específico si existe, o dejarlo vacío
        this.observacionesTexto = datosEspecificos["observacionesTexto"] || ""
      } else {
        this.observacionesTexto = ""
      }
    } catch (error) {
      // Si no es un JSON válido, usar el texto completo como observaciones
      this.observacionesTexto = this.incidencia.observaciones || ""
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

  // Modificar el método confirmarEdicion para usar el valor de Tipo como elemento
  confirmarEdicion(): void {
    // Recopilar datos específicos de la disciplina
    const datosEspecificos: Record<string, string> = {}

    // Añadir los valores de los campos específicos
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

    // Añadir el texto de observaciones
    datosEspecificos["observacionesTexto"] = this.observacionesTexto

    // Convertir a JSON y guardar en observaciones
    this.incidencia.observaciones = JSON.stringify(datosEspecificos)

    // Primero actualizar la incidencia y luego, si hay éxito, subir la foto
    this.actualizarIncidencia()
  }

  actualizarIncidencia(): void {
    this.inspectorService.actualizarIncidencia(this.incidencia).subscribe(
      (res) => {
        if (res == "ok") {
          // Si hay una nueva foto, subirla después de actualizar la incidencia
          if (this.selectedFile) {
            this.subirFoto()
          } else {
            this.actualizarOk()
          }
        } else {
          this.showErrorAlert()
        }
      },
      (error) => {
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

  // Nuevo método para subir la foto después de actualizar la incidencia
  subirFoto(): void {
    const formData = new FormData()
    formData.append("id", this.incidencia.id.toString())
    formData.append("foto", this.selectedFile!)

    console.log("Subiendo foto:", this.selectedFile!.name, "tamaño:", this.selectedFile!.size)

    this.inspectorService.subirFoto(formData).subscribe(
      (res) => {
        console.log("Foto subida correctamente:", res)
        this.actualizarOk()
      },
      (error) => {
        console.error("Error al subir la foto:", error)
        // Mostrar advertencia pero considerar que la actualización fue exitosa
        Swal.fire({
          title: "Advertencia",
          text: "La incidencia se actualizó correctamente, pero no se pudo subir la foto.",
          icon: "warning",
          confirmButtonText: "Aceptar",
          confirmButtonColor: "#1a4b8c",
        }).then(() => {
          this.dialogRef.close(true)
        })
      },
    )
  }

  actualizarOk(): void {
    Swal.fire({
      title: "¡Éxito!",
      text: "Incidencia actualizada correctamente",
      icon: "success",
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#1a4b8c",
      allowOutsideClick: false,
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
    // Asegurarse de cerrar la cámara si está abierta
    if (this.showCamera) {
      this.cerrarCamara()
    }

    if (this.map) {
      this.map.remove()
    }
    this.dialogRef.close()
  }
}
