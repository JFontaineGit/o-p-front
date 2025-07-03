import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-help-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./help-card.html",
  styleUrls: ["./help-card.scss"],
})
export class HelpCard {
  @Input() quote = ""
  @Input() name = ""
  @Input() location = ""
  @Input() avatarUrl = "/placeholder.svg?height=50&width=50"

  constructor() {}
}
