import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RegistroIncidenciaComponent } from '../registro-incidencia/registro-incidencia.component';


@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatDialogModule], //add MatDialogModule and the common as ngIf etc
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {

  constructor(public dialog: MatDialog) {}

  addIncidence() {
    this.dialog.open(RegistroIncidenciaComponent, {
      width: '400px',
      disableClose: false
    });
  }

}
