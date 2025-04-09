import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import { Incidencia } from '../model/incidencia';

@Injectable({providedIn: 'root'})
export class InspectorService {


    //ruta rest
    ruta_rest_services = '/backend/';

    constructor(private http: HttpClient) {}
    
    //obtiene las incidencias en formato observable del back
    getIncidencias(): Observable<Incidencia[]> {
        return this.http.get<Incidencia[]>(this.ruta_rest_services + 'rest/obtener_incidencias');
    }


    //obtener incidencia por id
    getIncidencia_id(id: number): Observable<Incidencia> {
        return this.http.get<Incidencia>(this.ruta_rest_services + 'rest/obtener_incidencia_id?id=' + id);
    }
    

    //comunica con el backend para registrar una incidencia
    // registrarIncidencia(incidencia: Incidencia): Observable<String> {
    //     return this.http.post<string>(this.ruta_rest_services + 'rest/registrar_incidencia', incidencia);
    // }

    registrarIncidenciaConFoto(formData: FormData) {
        return this.http.post(this.ruta_rest_services + `rest/registrar_incidencia`, formData);
      }
      


    actualizarIncidencia(incidencia: Incidencia): Observable<String> {
        return this.http.post<string>(this.ruta_rest_services + 'rest/actualizar_incidencia', incidencia);
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

    // Método para importar una incidencia desde un archivo CSV
    importarIncidencia(file: File): Observable<any> {
      const formData = new FormData()
  
      // Importante: el nombre del campo debe coincidir con lo que espera el backend
      formData.append("file", file, file.name)
  
      // Añadir un header para indicar que no se debe intentar decodificar como UTF-8
      const headers = new HttpHeaders({
        "X-Skip-UTF8-Validation": "true",
      })
  
      console.log("Enviando archivo:", file.name, "tamaño:", file.size, "tipo:", file.type)
  
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

  // Método para importar todas las incidencias desde un archivo CSV
  importarTodasIncidencias(file: File): Observable<any> {
    const formData = new FormData()

    // Importante: el nombre del campo debe coincidir con lo que espera el backend
    formData.append("file", file, file.name)

    // Añadir un header para indicar que no se debe intentar decodificar como UTF-8
    const headers = new HttpHeaders({
      "X-Skip-UTF8-Validation": "true",
    })

    console.log("Enviando archivo:", file.name, "tamaño:", file.size, "tipo:", file.type)

    return this.http.post(this.ruta_rest_services + "rest/importar_incidencias", formData, { headers })
  }


    //fotos
    subirFoto(formData: FormData): Observable<string> {
      return this.http.post<string>(this.ruta_rest_services + 'rest/subir_foto', formData);
    }
    


}
