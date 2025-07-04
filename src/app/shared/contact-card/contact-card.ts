import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ContactInfo } from "../../interfaces/contact-info.interface";

@Component({
  selector: "app-contact-card",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./contact-card.html",
  styleUrls: ["./contact-card.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactCard {
  @Input() icon = "";
  @Input() title = "";
  @Input() description = "";
  @Input() infoItems: ContactInfo[] = [];
  @Input() buttonLabel = "";
  @Input() methodType = "";
  @Input() disabled = false;
  @Input() variant: "default" | "whatsapp" | "email" | "chat" | "phone" = "default";

  @Output() action = new EventEmitter<string>();

  @HostBinding("class") get hostClasses(): string {
    return `contact-card-host contact-card-host--${this.variant}`;
  }

  @HostBinding("attr.data-method") get dataMethod(): string {
    return this.methodType || this.variant;
  }

  constructor() {}

  onButtonClick(): void {
    if (!this.disabled) {
      this.action.emit(this.methodType || this.variant);
    }
  }

  // Getters para lógica derivada
  get hasInfoItems(): boolean {
    return this.infoItems && this.infoItems.length > 0;
  }

  get buttonAriaLabel(): string {
    return `${this.buttonLabel} - ${this.title}`;
  }

  get cardAriaLabel(): string {
    return `Método de contacto: ${this.title}. ${this.description}`;
  }

  getStatusClass(statusType?: string): string {
    return `status-${statusType || "online"}`;
  }

  // Método trackBy para optimizar *ngFor
  trackByLabel(index: number, item: ContactInfo): string {
    return item.label;
  }
}