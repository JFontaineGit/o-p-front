import { Component } from '@angular/core';
import { Hero } from '../../shared/hero/hero';
import { ProductList } from '../../shared/product-card/product-list/product-list';
import { ServicesSection } from '../../shared/aside-card/services-section/services-section';
import { CardData } from '../../interfaces/card.interface';

@Component({
  selector: 'app-packets',
  imports: [Hero, ProductList, ServicesSection],
  templateUrl: './packets.html',
  styleUrl: './packets.scss',
})
export class Packets {
  heroDataPackets = {
    backgroundImage:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    altText: '',
    title: 'Paquetes completos para vivir el viaje',
    subtitle: '',
    highlightText: 'perfecto.',
  };
  categories: CardData[] = [
    {
      id: 1,
      icon: 'fas fa-mountain',
      title: 'Aventura',
      description: 'Emociones extremas',
    },
    {
      id: 2,

      icon: 'fas fa-landmark',
      title: 'Cultural',
      description: 'Historia y tradiciones',
    },
    {
      id: 3,
      icon: 'fas fa-spa',
      title: 'Relax',
      description: 'Descanso total',
    },
    {
      id: 4,
      icon: 'fas fa-users',
      title: 'Familiar',
      description: 'Diversión para todos',
    },
    {
      id: 5,
      icon: 'fas fa-heart',
      title: 'Romántico',
      description: 'Momentos especiales',
    },
    {
      id: 6,
      icon: 'fas fa-crown',
      title: 'Lujo',
      description: 'Experiencias premium',
    },
  ];
}
