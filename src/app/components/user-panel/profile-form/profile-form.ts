import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../interfaces/user-panel.interfaces';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-form.html',
  styleUrls: ['./profile-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileForm implements OnInit, OnChanges {
  
  @Input({ required: true }) user!: User;
  @Input() isLoading = false;
  
  @Output() save = new EventEmitter<User>();
  @Output() cancel = new EventEmitter<void>();
  @Output() formChange = new EventEmitter<{valid: boolean, dirty: boolean}>();

  profileForm!: FormGroup;
  isFormDirty = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && !changes['user'].firstChange) {
      this.initializeForm();
    }
  }

  /**
   * Inicializa el formulario reactivo
   */
  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: [this.user?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [this.user?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      phone: [this.user?.phone || '', [Validators.required]],
      birthDate: [this.user?.birthDate || ''],
      nationality: [this.user?.nationality || 'ES'],
      address: [this.user?.address || ''],
      city: [this.user?.city || ''],
      postalCode: [this.user?.postalCode || '', [Validators.pattern(/^\d{5}$/)]],
      preferences: this.fb.group({
        travelStyle: [this.user?.preferences?.travelStyle || 'comfort'],
        accommodation: [this.user?.preferences?.accommodation || 'hotel']
      })
    });

    // Detectar cambios en el formulario
    this.profileForm.valueChanges.subscribe(() => {
      this.isFormDirty = this.profileForm.dirty;
      this.formChange.emit({
        valid: this.profileForm.valid,
        dirty: this.isFormDirty
      });
    });
  }

  /**
   * Guarda los cambios del formulario
   */
  onSave(): void {
    if (this.profileForm.valid) {
      const updatedUser: User = {
        ...this.user,
        ...this.profileForm.value
      };
      this.save.emit(updatedUser);
    }
  }

  /**
   * Cancela los cambios
   */
  onCancel(): void {
    this.profileForm.reset();
    this.initializeForm();
    this.cancel.emit();
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getFieldError(fieldName: string): string | null {
    const field = this.profileForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido';
      }
      if (field.errors?.['email']) {
        return 'Ingresa un email válido';
      }
      if (field.errors?.['minlength']) {
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      }
      if (field.errors?.['pattern']) {
        return 'Formato inválido';
      }
    }
    return null;
  }

  /**
   * Verifica si un campo tiene error
   */
  hasFieldError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}