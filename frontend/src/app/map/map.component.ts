import { Component, OnInit, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';  // Para verificar si estamos en el navegador, sino no carga y al usar window da error 
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  map: any;
  userLat: number = 0;
  userLon: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeMap();
      this.getUserLocation();
    }
  }

  // Inicializar el mapa (solo se ejecutará en el navegador)
  async initializeMap(): Promise<void> {
    // Cargar Leaflet dinámicamente solo en el cliente, de lo contrario da error 
    const L = await import('leaflet'); 

    this.map = L.map('map').setView([40.4531, -3.6176], 13); // Coordenadas iniciales (la oficina)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

  // Actualizar el marcador con la ubicación del usuario
  updateUserMarker(): void {
    const L = (window as any).L; // Asegurarse de que L esté disponible después de cargarlo dinámicamente
    const userMarker = L.marker([this.userLat, this.userLon]).addTo(this.map);
    userMarker.bindPopup('<b>¡Estás aquí!</b>').openPopup();
    this.map.setView([this.userLat, this.userLon], 13); // Centrar el mapa en la ubicación del usuario
  }
}
