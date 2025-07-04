import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { ContactCard } from "../contact-card"
import { ContactCardData } from "../../../interfaces/contact-info.interface"


@Component({
  selector: "app-contact-methods",
  standalone: true,
  imports: [CommonModule, ContactCard],
  templateUrl: "./contact-methods.html",
  styleUrls: ["./contact-methods.scss"],
})
export class ContactMethods {
  contactMethods: ContactCardData[] = [
    {
      id: 1,
      icon: "phone",
      title: "Llámanos",
      description: "Habla directamente con nuestros expertos",
      infoItems: [{ label: "24 horas, 7 días", value: "+34 900 123 456" }],
      buttonLabel: "Llamar ahora",
      methodType: "phone",
      variant: "phone",
    },
    {
      id: 2,
      icon: "fa-brands fa-whatsapp",
      title: "WhatsApp",
      description: "Chatea con nosotros al instante",
      infoItems: [{ label: "Respuesta inmediata", value: "+34 600 123 456" }],
      buttonLabel: "Abrir WhatsApp",
      methodType: "whatsapp",
      variant: "whatsapp",
    },
    {
      id: 3,
      icon: "email",
      title: "Email",
      description: "Envíanos tu consulta detallada",
      infoItems: [{ label: "Respuesta en 2 horas", value: "info@airipet57.com" }],
      buttonLabel: "Enviar email",
      methodType: "email",
      variant: "email",
    },
    {
      id: 4,
      icon: "chat",
      title: "Chat en vivo",
      description: "Asistencia inmediata online",
      infoItems: [
        { label: "Chat disponible", value: "Chat disponible" },
        { label: "En línea", value: "", isStatus: true, statusType: "online" },
      ],
      buttonLabel: "Iniciar chat",
      methodType: "chat",
      variant: "chat",
    },
  ];

  onContactAction(method: string): void {
    console.log(`Método de contacto seleccionado: ${method}`);

    switch (method) {
      case "phone":
        window.open("tel:+34900123456");
        break;
      case "whatsapp":
        window.open("https://wa.me/34600123456");
        break;
      case "email":
        window.open("mailto:info@airipet57.com");
        break;
      case "chat":
        console.log("Abriendo chat...");
        break;
    }
  }

  trackByMethod(index: number, method: ContactCardData): string {
    return method.methodType;
  }
}