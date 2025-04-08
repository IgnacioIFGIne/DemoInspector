import { Component, OnInit, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';  // Para verificar si estamos en el navegador, sino no carga y al usar window da error 
import { PLATFORM_ID } from '@angular/core';
import { InspectorService } from '../services/inspector.service';
import { Incidencia } from '../model/incidencia';
import { isValidCoordinates } from '../validators/validatorLocation';

import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map: any;
  userLat: number = 0;
  userLon: number = 0;
  incidencias: Incidencia[] = [];
  L: any;  // Guardamos la referencia de L para usarla más tarde.

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private servicioInspector: InspectorService) {}

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.initializeMap(); 
      this.getUserLocation();
      this.getIncidenciasLocation();
    }
  }

  // Inicializar el mapa (solo se ejecutará en el navegador)
  async initializeMap(): Promise<void> {
    this.L = await import('leaflet');
  
    this.map = this.L.map('map').setView([40.4531, -3.6176], 13);
  
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  }
 

  // Obtener la ubicación del usuario
  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLat = position.coords.latitude;
          this.userLon = position.coords.longitude;
          this.updateUserMarker();
        },
        (error) => {
          console.error('Error al obtener la ubicación del usuario', error);
        }
      );
    } else {
      console.error('La geolocalización no está disponible en este navegador.');
    }
  }

  // Obtener las incidencias desde el servicio
  getIncidenciasLocation(): void {
    this.servicioInspector.getIncidencias().subscribe(incident => {
      this.incidencias = incident;

      this.incidencias.forEach(incidencia => {
        if (isValidCoordinates(incidencia.ubicacion)) {
          console.log('Ubicación de la incidencia desde getIncidenciasLocation:', incidencia.ubicacion);
          this.addIncidentMarker(incidencia);  // Añadir cada marcador al mapa

        }
      });
    });
  }

  // Añadir el marcador de la incidencia
  addIncidentMarker(incidencia: Incidencia): void {
    // Asegurarse de que L esté disponible antes de usarlo
    if (this.L) {
      const [lat, lon] = incidencia.ubicacion.split(',').map(coord => parseFloat(coord.trim()));

      // Crear marcador y añadirlo al mapa
      const marker = this.L.marker([lat, lon]).addTo(this.map);

      // Asignar información al marcador
      marker.bindPopup(`<b>${incidencia.instalacion}</b><br>${lat}, ${lon}`).openPopup();
    } else {
      console.error('Leaflet (L) no está cargado correctamente (addIncidencia).');
    }
  }

  // Actualizar el marcador con la ubicación del usuario
  updateUserMarker(): void {
    if (this.L) {
      const userMarker = this.L.marker([this.userLat, this.userLon]).addTo(this.map);
      userMarker.bindPopup('<b>¡Estás aquí!</b>').openPopup();
      this.map.setView([this.userLat, this.userLon], 13);  // Centrar el mapa en la ubicación del usuario

      // pruebas  
      const lat = 40.46180;
      const lon = -3.618250;
      const marker = this.L.marker([lat, lon]).addTo(this.map);
      marker.bindPopup('<b>PRUEBA</b>').openPopup();
    } else {
      console.error('Leaflet (L) no está cargado correctamente.');
    }
  }
}
