import { CommonModule } from "@angular/common"
import { Component } from "@angular/core"
import { MatDialog, MatDialogModule } from "@angular/material/dialog"
import { RegistroIncidenciaComponent } from "../registro-incidencia/registro-incidencia.component"

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, MatDialogModule], //add MatDialogModule and the common as ngIf etc
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.css",
})
export class FooterComponent {
  constructor(public dialog: MatDialog) {}

  addIncidence() {
    this.dialog.open(RegistroIncidenciaComponent, {
      width: "90%", // Aumentar el ancho para dar más espacio al mapa
      maxWidth: "1200px", // Establecer un ancho máximo
      height: "90%", // Aumentar la altura para dar más espacio al mapa
      disableClose: false,
      panelClass: "custom-dialog-container", // Clase personalizada para el diálogo
    })
  }
}
