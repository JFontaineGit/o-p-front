import { Component, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <span class="material-symbols-outlined header-icon">{{ data.icon || 'warning' }}</span>
        <h2 class="dialog-title">{{ data.title }}</h2>
      </div>
      <mat-dialog-content class="dialog-content">
        <p>{{ data.message }}</p>
        @if (data.additionalInfo) {
          <p class="additional-info">{{ data.additionalInfo }}</p>
        }
      </mat-dialog-content>
      <mat-dialog-actions class="dialog-actions">
        <button mat-button class="btn btn--secondary" (click)="dialogRef.close(false)" #cancelButton>
          <span class="material-symbols-outlined">cancel</span>
          <span>{{ data.cancelText || 'Cancelar' }}</span>
        </button>
        <button mat-button class="btn btn--primary" (click)="dialogRef.close(true)" #confirmButton>
          <span class="material-symbols-outlined">{{ data.confirmIcon || 'check_circle' }}</span>
          <span>{{ data.confirmText || 'Aceptar' }}</span>
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styleUrls: ['./confirm-dialog.scss']
})
export class ConfirmDialog implements AfterViewInit {
  @ViewChild('cancelButton') cancelButton!: ElementRef<HTMLButtonElement>;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      icon?: string;
      confirmText?: string;
      confirmIcon?: string;
      cancelText?: string;
      additionalInfo?: string;
    }
  ) {}

  ngAfterViewInit(): void {
    // Focus the cancel button for accessibility
    this.cancelButton.nativeElement.focus();
  }
}