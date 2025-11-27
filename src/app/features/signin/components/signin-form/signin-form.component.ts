import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ChangeDetectorRef,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { LoginService } from '../../../../core/services/login.service';
import { AuthService } from '../../../../core/services/auth.service';
import { EmpleadoDTO } from '../../../../core/models/EmpleadoDTO';
import { Router } from '@angular/router';

export type AuthMode = 'signin' | 'change-password';

export interface UnifiedAuthConfig {
  title: string;
  subtitle: string;
  usernameLabel?: string;
  usernamePlaceholder?: string;
  passwordLabel?: string;
  passwordPlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  newPasswordLabel?: string;
  newPasswordPlaceholder?: string;
  confirmPasswordLabel?: string;
  confirmPasswordPlaceholder?: string;
  submitLabel: string;
  forgotPasswordText?: string;
  backToSigninText?: string;
}

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  };
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const valid = emailRegex.test(control.value);
    return valid ? null : { invalidEmail: true };
  };
}

@Component({
  standalone: true,
  selector: 'app-signin-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    NgOptimizedImage,
    ToastModule,
  ],
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signin-form.component.html',
})
export class SigninFormComponent implements OnInit {
  @Input() mode: AuthMode = 'signin';
  @Input() logoSrc = '/images/ponti-marriot-white.png';
  @Input() logoAlt = 'PontiMarriot Logo';
  @Output() submitForm = new EventEmitter<any>();
  @Output() modeChange = new EventEmitter<AuthMode>();

  authForm!: FormGroup;
  config!: UnifiedAuthConfig;

  private signinConfig: UnifiedAuthConfig = {
    title: 'Welcome to PontiMarriot 👋',
    subtitle: 'Kindly fill in your details below to sign in',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter your email address',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    submitLabel: 'Sign in',
    forgotPasswordText: 'forgot password?',
  };

  private changePasswordConfig: UnifiedAuthConfig = {
    title: 'Change Password 🔐',
    subtitle: 'Enter your email and new password',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your email',
    newPasswordLabel: 'New Password',
    newPasswordPlaceholder: 'Enter your new password',
    confirmPasswordLabel: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your new password',
    submitLabel: 'Change Password',
    backToSigninText: 'Remember your password? ',
  };

  usuario!: EmpleadoDTO;

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateFormByMode();
  }

  private updateFormByMode(): void {
    this.config =
      this.mode === 'signin' ? this.signinConfig : this.changePasswordConfig;

    if (this.mode === 'signin') {
      this.authForm = this.fb.group({
        username: [
          '',
          [Validators.required, Validators.minLength(1), emailValidator()],
        ],
        password: ['', [Validators.required, Validators.minLength(1)]],
      });
    } else {
      this.authForm = this.fb.group(
        {
          email: [
            '',
            [Validators.required, Validators.email, emailValidator()],
          ],
          newPassword: ['', [Validators.required, Validators.minLength(6)]],
          confirmPassword: ['', [Validators.required]],
        },
        { validators: passwordMatchValidator() }
      );
    }
  }

  toggleMode(): void {
    this.mode = this.mode === 'signin' ? 'change-password' : 'signin';
    this.updateFormByMode();
    this.modeChange.emit(this.mode);
  }

  onSubmit(): void {
    // Validar el formulario antes de enviar
    if (this.authForm.invalid) {
      this.markFormGroupTouched(this.authForm);
      this.showValidationErrors();
      return;
    }

    const correo = this.authForm.get('username')?.value;
    const contrasena = this.authForm.get('password')?.value;

    this.loginService.login(correo, contrasena).subscribe({
      next: (usuario) => {
        this.usuario = usuario;
        this.authService.setUsuario(usuario);

        // Toast de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: `Welcome back, ${usuario.empleado?.nombre || 'User'}!`,
          life: 3000,
        });

        // Forzar detección de cambios
        this.cdr.detectChanges();

        // Navegar después de un pequeño delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (err) => {
        const errorMessage = this.getErrorMessage(err);

        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: errorMessage,
          life: 4000,
        });

        // Forzar detección de cambios
        this.cdr.detectChanges();
      },
    });
  }

  private getErrorMessage(err: any): string {
    if (err.status === 401 || err.status === 403) {
      return 'Invalid email or password. Please try again.';
    }

    if (this.authForm.get('username')?.hasError('invalidEmail')) {
      return 'Please enter a valid email address.';
    }

    if (err.status === 0) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    if (err.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return (
      err.error?.message ||
      err.message ||
      'An unexpected error occurred. Please try again.'
    );
  }

  private showValidationErrors(): void {
    const usernameControl = this.authForm.get('username');
    const passwordControl = this.authForm.get('password');

    if (usernameControl?.invalid) {
      if (usernameControl.hasError('required')) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'Email is required',
          life: 3000,
        });
      } else if (
        usernameControl.hasError('invalidEmail') ||
        usernameControl.hasError('email')
      ) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Validation Error',
          detail: 'Please enter a valid email address',
          life: 3000,
        });
      }
    } else if (
      passwordControl?.invalid &&
      passwordControl.hasError('required')
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Password is required',
        life: 3000,
      });
    }

    // Forzar detección de cambios
    this.cdr.detectChanges();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get isFormInvalid(): boolean {
    return this.authForm.invalid;
  }

  get passwordMismatch(): boolean {
    return (
      this.mode === 'change-password' &&
      this.authForm.hasError('passwordMismatch') &&
      (this.authForm.get('confirmPassword')?.touched ?? false)
    );
  }
}
