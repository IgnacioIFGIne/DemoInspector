import { Routes } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { MainComponent } from './main/main.component';
import { FooterComponent } from './footer/footer.component';
import { MapComponent } from './map/map.component';
import { ListadoComponent } from './listado/listado.component';
import { DetallesIncidenciaComponent } from './detalles-incidencia/detalles-incidencia.component';
import { EditIncidenciaComponent } from './edit-incidencia/edit-incidencia.component';


export const routes: Routes = [
    {path: '', component: MainComponent}, 
    {path: 'header', component: HeaderComponent},
    {path: 'footer', component: FooterComponent},
    {path: 'map', component: MapComponent},
    {path: 'listado', component: ListadoComponent},
    {path: 'detalles-incidencia/:id', component: DetallesIncidenciaComponent},
    {path: 'edit-incidencia/:id', component: EditIncidenciaComponent}
];
