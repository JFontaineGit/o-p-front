import { Component } from '@angular/core';
import { Hero } from '../../shared/hero/hero';
import { ContactMethods } from '../../shared/contact-card/contact-methods/contact-methods';

@Component({
  selector: 'app-contact',
  imports: [Hero, ContactMethods],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  heroDataContact = {
    backgroundImage:
      "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    altText: "",
    title: "Estamos aquí para hacer realidad tu viaje",
    subtitle: "nuestro equipo de expertos está disponible 24/7",
    highlightText: "para ayudarte a planificar la aventura perfecta.",
  };
}
