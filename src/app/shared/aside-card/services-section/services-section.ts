import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { AsideCard } from "../aside-card"

interface ServiceData {
  id: number; // Añadimos un id para usar en trackBy
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule, AsideCard],
  templateUrl: './services-section.html',
  styleUrls: ['./services-section.scss'],
})
export class ServicesSection {
  services: ServiceData[] = [
    {
      id: 1,
      icon: 'fas fa-shield-alt',
      title: 'Reserva Segura',
      description: 'Todas nuestras reservas están protegidas con garantía de reembolso completo.',
    },
    {
      id: 2,
      icon: 'fas fa-headset',
      title: 'Soporte 24/7',
      description: 'Nuestro equipo está disponible las 24 horas para ayudarte en tu viaje.',
    },
    {
      id: 3,
      icon: 'fas fa-map-marked-alt',
      title: 'Guías Locales',
      description: 'Conectamos con guías locales expertos para experiencias auténticas.',
    },
  ];

  trackByService(index: number, service: ServiceData): number {
    return service.id; 
  }
}