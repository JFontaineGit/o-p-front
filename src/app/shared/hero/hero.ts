import { Component, Input } from "@angular/core"
import { CommonModule } from "@angular/common"
import type { HeroData } from "../../interfaces/hero.interface"

@Component({
  selector: "app-hero",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./hero.html",
  styleUrls: ["./hero.scss"],
})
export class Hero {
  @Input({ required: true }) heroData!: HeroData
}