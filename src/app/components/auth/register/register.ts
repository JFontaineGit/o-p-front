import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/auth/auth.service';
import { UserRegister } from '../../../services/interfaces/auth.interfaces';
import { UserRead } from '../../../services/interfaces/user.interfaces';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  showPassword = false;
  showConfirmPassword = false;
  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthClass = '';
  isSubmitting = false;
  feedbackMessage: string | null = null;
  feedbackType: 'success' | 'error' | 'warning' | 'info' | null = null;

  readonly registerForm: FormGroup = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], 
      born_date: ['', [Validators.required]],
      state: [''], // Opcional
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [Register.passwordMatchValidator] }
  );

  static passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/home']);
    }

    this.registerForm.get('password')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.checkPasswordStrength();
    });
  }

  checkPasswordStrength() {
    const password = this.registerForm.get('password')?.value;

    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      this.passwordStrengthClass = '';
      return;
    }

    let strength = 0;

    if (password.length >= 6) strength += 20;
    if (password.length >= 8) strength += 10;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;

    this.passwordStrength = strength;

    if (strength < 40) {
      this.passwordStrengthText = 'Débil';
      this.passwordStrengthClass = 'weak';
    } else if (strength < 70) {
      this.passwordStrengthText = 'Media';
      this.passwordStrengthClass = 'medium';
    } else {
      this.passwordStrengthText = 'Fuerte';
      this.passwordStrengthClass = 'strong';
    }
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.feedbackMessage = 'Por favor completá correctamente todos los campos.';
      this.feedbackType = 'error';
      return;
    }

    this.isSubmitting = true;
    this.feedbackMessage = null;

    const { email, first_name, last_name, telephone, born_date, state, password } = this.registerForm.value;

    const payload: UserRegister = {
      email,
      first_name,
      last_name,
      telephone,
      born_date, 
      state: state || undefined,
      password,
    };

    this.authService
      .register(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: UserRead) => {
          this.isSubmitting = false;
          this.feedbackMessage = 'Te registraste con éxito. Iniciá sesión.';
          this.feedbackType = 'success';
          setTimeout(() => this.router.navigateByUrl('/login'), 2000);
        },
        error: (err) => {
          this.isSubmitting = false;
          const msg = err?.message || 'Ocurrió un error inesperado.';
          this.feedbackMessage = `Algo salió mal: ${msg}`;
          this.feedbackType = 'error';
        },
      });
  }

  closeFeedback(): void {
    this.feedbackMessage = null;
    this.feedbackType = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}