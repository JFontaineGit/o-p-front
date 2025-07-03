import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-hero",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./hero.html",
  styleUrls: ["./hero.scss"],
})
export class Hero {
  // Datos del componente - toda la lógica aquí
  heroData = {
    backgroundImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    altText: "Playa tropical",
    title: "Vivi la experiencia de",
    subtitle: "tu vida con",
    highlightText: "nuestros paquetes turísticos.",
  }

  constructor() {}
}
