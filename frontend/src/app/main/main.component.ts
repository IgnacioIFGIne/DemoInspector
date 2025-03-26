import { Component } from '@angular/core';
import { MapComponent } from '../map/map.component';
import { ListadoComponent } from '../listado/listado.component';

@Component({
  selector: 'app-main',
  imports: [MapComponent, ListadoComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
