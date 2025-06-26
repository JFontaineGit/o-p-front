import { Component, inject, signal, computed, effect } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { LoggerService } from '../../../services/core/logger.service';
import { StorageService } from '../../../services/core/storage.service';
import { Auth, TokenUserResponse } from '../../../services/interfaces/auth.interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly storageService = inject(StorageService);
  private readonly logger = inject(LoggerService);

  readonly showPassword = signal(false);
  readonly isSubmitting = signal(false);
  readonly feedback = signal<{
    message: string;
    type: 'success' | 'error' | null;
  }>({ message: '', type: null });

  readonly loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [false],
  });

  readonly returnUrl = computed(() => this.route.snapshot.queryParams['returnUrl'] || '/user_panel');

  constructor() {
    effect(() => {
      const savedEmail = this.storageService.getItem('rememberEmail');
      if (savedEmail) {
        this.loginForm.patchValue({ email: savedEmail, remember: true });
      }
    });
  }

  togglePassword(): void {
    this.showPassword.update(show => !show);
  }

  closeFeedback(): void {
    this.feedback.set({ message: '', type: null });
  }

  onLogin(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      this.feedback.set({
        message: 'Por favor completá correctamente el email y la contraseña.',
        type: 'error',
      });
      return;
    }

    this.isSubmitting.set(true);
    this.feedback.set({ message: '', type: null });

    const { email, password, remember } = this.loginForm.value;
    const sanitizedEmail = email.trim();
    const credentials: Auth = { email: sanitizedEmail, password };

    if (remember) {
      this.storageService.setItem('rememberEmail', sanitizedEmail);
    } else {
      this.storageService.removeItem('rememberEmail');
    }

    this.authService.login(credentials).subscribe({
      next: (response: TokenUserResponse) => {
        this.isSubmitting.set(false);
        this.feedback.set({
          message: '¡Inicio de sesión exitoso! Redirigiendo...',
          type: 'success',
        });
        setTimeout(() => this.router.navigateByUrl(this.returnUrl()), 2000);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        const msg = err?.message || 'Credenciales inválidas o error inesperado.';
        this.feedback.set({
          message: `Error al iniciar sesión: ${msg}`,
          type: 'error',
        });
        this.logger.error('Error en el inicio de sesión', err);
      },
    });
  }
}