import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { HelpCard } from "./help-card/help-card"

interface TestimonialData {
  quote: string
  name: string
  location: string
  avatarUrl: string
}

@Component({
  selector: "app-testimonials-section",
  standalone: true,
  imports: [CommonModule, HelpCard],
  templateUrl: "./testimonial-section.html",
  styleUrls: ["./testimonial-section.scss"],
})
export class TestimonialsSection {
  testimonials: TestimonialData[] = [
    {
      quote: "Una experiencia increíble. El alojamiento superó todas mis expectativas y el servicio fue excepcional.",
      name: "María González",
      location: "Madrid, España",
      avatarUrl: "/placeholder.svg?height=50&width=50",
    },
    {
      quote: "Perfecto para familias. Los niños se divirtieron mucho y nosotros pudimos relajarnos completamente.",
      name: "Carlos Ruiz",
      location: "Barcelona, España",
      avatarUrl: "/placeholder.svg?height=50&width=50",
    },
    {
      quote: "La mejor plataforma para encontrar alojamientos únicos. Definitivamente volveré a usarla.",
      name: "Ana Martín",
      location: "Valencia, España",
      avatarUrl: "/placeholder.svg?height=50&width=50",
    },
  ]

  constructor() {}

  trackByTestimonial(index: number, testimonial: TestimonialData): string {
    return testimonial.name + testimonial.location
  }
}
