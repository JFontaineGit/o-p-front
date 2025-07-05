import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserMe } from '../../../services/interfaces/user.interfaces';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-form.html',
  styleUrls: ['./profile-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileForm implements OnInit, OnChanges {
  @Input({ required: true }) user!: UserMe | null;
  @Input() isLoading = false;

  @Output() save = new EventEmitter<UserMe>();
  @Output() cancel = new EventEmitter<void>();
  @Output() formChange = new EventEmitter<{valid: boolean, dirty: boolean}>();

  profileForm!: FormGroup;
  isFormDirty = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && !changes['user'].firstChange && this.user) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      first_name: [this.user?.first_name || '', [Validators.required, Validators.minLength(2)]],
      last_name: [this.user?.last_name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      telephone: [this.user?.telephone || '', [Validators.required]],
      born_date: [this.user?.born_date || ''],
      state: [this.user?.state || '']
    });

    this.profileForm.valueChanges.subscribe(() => {
      this.isFormDirty = this.profileForm.dirty;
      this.formChange.emit({
        valid: this.profileForm.valid,
        dirty: this.isFormDirty
      });
    });
  }

  onSave(): void {
    if (this.profileForm.valid) {
      const updatedUser: UserMe = {
        ...this.user,
        ...this.profileForm.value,
        id: this.user?.id || 0,
        created_at: this.user?.created_at || new Date().toISOString(),
        is_staff: this.user?.is_staff || false
      };
      this.save.emit(updatedUser);
    }
  }

  onCancel(): void {
    this.profileForm.reset();
    this.initializeForm();
    this.cancel.emit();
  }

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
    }
    return null;
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}