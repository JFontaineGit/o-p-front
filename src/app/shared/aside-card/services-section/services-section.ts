import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import { AsideCard } from "../aside-card"
import { CardData } from "../../../interfaces/card.interface"

@Component({
  selector: 'app-services-section',
  standalone: true,
  imports: [CommonModule, AsideCard],
  templateUrl: './services-section.html',
  styleUrls: ['./services-section.scss'],
})
export class ServicesSection {
  @Input({ required: true }) services!: CardData[]

  trackByService(index: number, service: CardData): number {
    return service.id
  }
}