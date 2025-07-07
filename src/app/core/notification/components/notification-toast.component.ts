import {
  Component,
  Inject,
  type OnInit,
  type OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  PLATFORM_ID,
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { MatButtonModule } from "@angular/material/button"
import { MatIconModule } from "@angular/material/icon"
import { MatProgressBarModule } from "@angular/material/progress-bar"
import { MAT_SNACK_BAR_DATA, MatSnackBarRef, MatSnackBarModule } from "@angular/material/snack-bar"
import { isPlatformBrowser } from "@angular/common" // Importado para detectar el entorno
import type { NotificationData } from "../interfaces/notification.interface"

@Component({
  selector: "app-notification-toast",
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatSnackBarModule],
  template: `
    <div class="notification-toast" [attr.data-type]="data.type">
      <!-- Progress bar -->
      <div 
        class="notification-progress" 
        *ngIf="data.showProgress && data.duration > 0">
        <mat-progress-bar 
          mode="determinate" 
          [value]="progressValue()"
          [color]="progressColor()">
        </mat-progress-bar>
      </div>

      <!-- Content -->
      <div class="notification-content">
        <!-- Icon -->
        <div class="notification-icon" *ngIf="data.icon">
          <mat-icon [attr.aria-label]="iconAriaLabel()">{{ data.icon }}</mat-icon>
        </div>

        <!-- Message -->
        <div class="notification-message">
          <ng-container *ngIf="isString(data.message); else templateMessage">
            <span [innerHTML]="data.message"></span>
          </ng-container>
          <ng-template #templateMessage>
            <ng-container *ngTemplateOutlet="$any(data.message)"></ng-container>
          </ng-template>
        </div>

        <!-- Actions -->
        <div class="notification-actions">
          <!-- Custom action -->
          <button 
            *ngIf="data.action"
            mat-button
            class="notification-action-btn"
            (click)="handleAction()"
            [attr.aria-label]="data.action.label">
            {{ data.action.label }}
          </button>

          <!-- Dismiss button -->
          <button 
            *ngIf="data.dismissible"
            mat-icon-button
            class="notification-dismiss-btn"
            (click)="dismiss()"
            aria-label="Cerrar notificación">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: "./notification-toast.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  private readonly snackBarRef = inject(MatSnackBarRef<NotificationToastComponent>)
  private readonly platformId = inject(PLATFORM_ID) // Inyectado para detectar el entorno

  protected readonly progressValue = signal(100)
  private progressInterval?: number
  private startTime = 0

  protected readonly progressColor = computed(() => {
    switch (this.data.type) {
      case "success":
        return "primary"
      case "error":
        return "warn"
      case "warning":
        return "accent"
      case "info":
        return "primary"
      default:
        return "primary"
    }
  })

  protected readonly iconAriaLabel = computed(() => {
    switch (this.data.type) {
      case "success":
        return "Éxito"
      case "error":
        return "Error"
      case "warning":
        return "Advertencia"
      case "info":
        return "Información"
      default:
        return "Notificación"
    }
  })

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: NotificationData
  ) {}

  ngOnInit(): void {
    if (this.data.showProgress && this.data.duration > 0) {
      this.startProgressAnimation()
    }
  }

  ngOnDestroy(): void {
    this.clearProgressInterval()
  }

  protected isString(value: any): value is string {
    return typeof value === "string"
  }

  protected handleAction(): void {
    if (this.data.action) {
      this.data.action.action()
      this.dismiss()
    }
  }

  protected dismiss(): void {
    this.snackBarRef.dismiss()
  }

  private startProgressAnimation(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return; // No hacer nada en el servidor
    }

    this.startTime = Date.now()
    this.progressInterval = window.setInterval(() => {
      const elapsed = Date.now() - this.startTime
      const progress = Math.max(0, 100 - (elapsed / this.data.duration) * 100)

      this.progressValue.set(progress)

      if (progress <= 0) {
        this.clearProgressInterval()
      }
    }, 50)
  }

  private clearProgressInterval(): void {
    if (this.progressInterval && isPlatformBrowser(this.platformId)) {
      clearInterval(this.progressInterval)
      this.progressInterval = undefined
    }
  }
}