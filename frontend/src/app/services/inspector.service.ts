import { Injectable } from "@angular/core"
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { Observable } from "rxjs"
import { map, tap } from "rxjs/operators"
import { Incidencia } from "../model/incidencia"

@Injectable({ providedIn: "root" })
export class InspectorService {
  //ruta rest
  ruta_rest_services = "/backend/"
  private fotoCache = new Map<number, string>()

  constructor(private http: HttpClient) {}

  //obtiene las incidencias en formato observable del back
  getIncidencias(): Observable<Incidencia[]> {
    return this.http.get<Incidencia[]>(this.ruta_rest_services + "rest/obtener_incidencias")
  }

  //obtener incidencia por id
  getIncidencia_id(id: number): Observable<Incidencia> {
    return this.http.get<Incidencia>(this.ruta_rest_services + "rest/obtener_incidencia_id?id=" + id).pipe(
      tap((incidencia) => {
        // Invalidar la caché de foto para esta incidencia
        this.invalidarCacheFoto(id)
      }),
    )
  }

  //comunica con el backend para registrar una incidencia
  // registrarIncidencia(incidencia: Incidencia): Observable<String> {
  //     return this.http.post<string>(this.ruta_rest_services + 'rest/registrar_incidencia', incidencia);
  // }

  registrarIncidenciaConFoto(formData: FormData) {
    return this.http.post(this.ruta_rest_services + `rest/registrar_incidencia`, formData).pipe(
      tap((response) => {
        // Si la respuesta contiene un ID, invalidar la caché para esa incidencia
        if (response && (response as any).id) {
          this.invalidarCacheFoto((response as any).id)
        }
      }),
    )
  }

  actualizarIncidencia(incidencia: Incidencia): Observable<string> {
    return this.http.post<string>(this.ruta_rest_services + "rest/actualizar_incidencia", incidencia).pipe(
      tap(() => {
        // Invalidar la caché de foto para esta incidencia
        this.invalidarCacheFoto(incidencia.id)
      }),
    )
  }

  // Método para exportar una incidencia
  exportarIncidencia(id: number): Observable<Blob> {
    // Configurar headers para especificar UTF-8
    const headers = new HttpHeaders({
      "Accept-Charset": "UTF-8",
    })

    return this.http.get(this.ruta_rest_services + "rest/exportar_incidencia?id=" + id, {
      headers: headers,
      responseType: "blob", // Importante: especificar que esperamos un blob como respuesta
    })
  }

  // Modificar el método importarIncidencia para asegurar que se envíe correctamente el archivo
  importarIncidencia(file: File): Observable<any> {
    const formData = new FormData()

    // Importante: el nombre del campo debe coincidir con lo que espera el backend
    formData.append("file", file, file.name)

    // Añadir un header para indicar que no se debe intentar decodificar como UTF-8
    const headers = new HttpHeaders({
      "X-Skip-UTF8-Validation": "true",
      // Añadir un header para forzar que no se use caché
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    })

    console.log("Enviando archivo:", file.name, "tamaño:", file.size, "tipo:", file.type)

    // Eliminar el timestamp para evitar problemas con la API
    return this.http.post(this.ruta_rest_services + "rest/importar_incidencia", formData, { headers })
  }

  // Método para exportar todas las incidencias
  exportarTodasIncidencias(): Observable<Blob> {
    // Configurar headers para especificar UTF-8
    const headers = new HttpHeaders({
      "Accept-Charset": "UTF-8",
    })

    return this.http.get(this.ruta_rest_services + "rest/exportar_incidencias", {
      headers: headers,
      responseType: "blob", // Importante: especificar que esperamos un blob como respuesta
    })
  }

  // Modificar también el método importarTodasIncidencias de manera similar
  importarTodasIncidencias(file: File): Observable<any> {
    const formData = new FormData()

    // Importante: el nombre del campo debe coincidir con lo que espera el backend
    formData.append("file", file, file.name)

    // Añadir un header para indicar que no se debe intentar decodificar como UTF-8
    const headers = new HttpHeaders({
      "X-Skip-UTF8-Validation": "true",
      // Añadir un header para forzar que no se use caché
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    })

    console.log("Enviando archivo:", file.name, "tamaño:", file.size, "tipo:", file.type)

    // Eliminar el timestamp para evitar problemas con la API
    return this.http.post(this.ruta_rest_services + "rest/importar_incidencias", formData, { headers })
  }

  //fotos
  subirFoto(formData: FormData): Observable<string> {
    return this.http.post<string>(this.ruta_rest_services + "rest/subir_foto", formData).pipe(
      tap((response) => {
        // Si la respuesta es exitosa, invalidar la caché para esta incidencia
        if (response === "ok") {
          const id = Number(formData.get("id"))
          if (!isNaN(id)) {
            this.invalidarCacheFoto(id)
          }
        }
      }),
    )
  }

  // Método para obtener la URL de la foto con un timestamp para evitar caché
  obtenerUrlFoto(id: number): string {
    if (!this.fotoCache.has(id)) {
      const timestamp = new Date().getTime()
      this.fotoCache.set(id, `backend/static/imagesIncidencias/${id}.jpg?t=${timestamp}`)
    }
    return this.fotoCache.get(id) || ""
  }

  // Método para invalidar la caché de una foto
  invalidarCacheFoto(id: number): void {
    const timestamp = new Date().getTime()
    this.fotoCache.set(id, `backend/static/imagesIncidencias/${id}.jpg?t=${timestamp}`)
  }

  // Método mejorado para obtener el siguiente número de incidencia para una disciplina
  obtenerSiguienteNumeroIncidencia(disciplina: string): Observable<string> {
    // Mapeo de disciplinas a sus códigos correspondientes
    const codigosDisciplina: { [key: string]: string } = {
      Eléctrico: "ELE",
      Telecomunicaciones: "TCO",
      "Abastecimiento de agua": "ABE",
      "Saneamiento/pluviales": "SAN",
      Alcantarillado: "ALC",
      Señalización: "SEN",
    }

    const prefijo = codigosDisciplina[disciplina] || ""

    return this.getIncidencias().pipe(
      map((incidencias) => {
        // Filtrar incidencias por el prefijo del código
        const incidenciasFiltradas = incidencias.filter(
          (inc) => inc.instalacion && inc.instalacion.startsWith(prefijo + "-"),
        )

        // Si no hay incidencias, devolver "01"
        if (incidenciasFiltradas.length === 0) {
          return prefijo + "-01"
        }

        // Extraer los números de las incidencias existentes
        const numeros = incidenciasFiltradas.map((inc) => {
          const partes = inc.instalacion.split("-")
          if (partes.length === 2) {
            return Number.parseInt(partes[1], 10)
          }
          return 0
        })

        // Encontrar el número más alto
        const numeroMaximo = Math.max(...numeros)

        // El siguiente número será el máximo + 1
        const siguienteNumero = numeroMaximo + 1

        // Formatear el número con ceros a la izquierda
        const numeroFormateado = siguienteNumero.toString().padStart(2, "0")

        return prefijo + "-" + numeroFormateado
      }),
    )
  }
}
