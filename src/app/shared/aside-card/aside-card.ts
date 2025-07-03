import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"

@Component({
  selector: "app-aside-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./aside-card.html",
  styleUrls: ["./aside-card.scss"],
})
export class AsideCard{
  @Input() icon = "fas fa-star"
  @Input() title = ""
  @Input() description = ""

  constructor() {}
}
