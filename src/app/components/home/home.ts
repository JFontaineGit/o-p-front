import { Component } from '@angular/core';
import { Hero} from '../../shared/hero/hero';
import { Search } from '../../shared/search/search';
import { ProductList } from '../../shared/product-card/product-list/product-list';
import { ServicesSection } from '../../shared/aside-card/services-section/services-section';
import { TestimonialsSection } from '../../shared/testimonial-section/testimonial-section';
import { CardData } from '../../interfaces/card.interface';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, Search, ProductList, ServicesSection, TestimonialsSection],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  heroDataHome = {
    backgroundImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    altText: "Playa tropical",
    title: "Vivi la experiencia de",
    subtitle: "tu vida con",
    highlightText: "nuestros paquetes turísticos.",
  };
  homeServices: CardData[] = [
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
  
}
