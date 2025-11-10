import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
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
  ],
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
    subtitle: 'Kindly fill in your details below to create an account',
    usernameLabel: 'Username',
    usernamePlaceholder: 'Enter your full username',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    submitLabel: 'Sign in',
    forgotPasswordText: 'forgot password?',
  };

  private changePasswordConfig: UnifiedAuthConfig = {
    title: 'Change Password 🔑',
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

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.updateFormByMode();
  }

  private updateFormByMode(): void {
    this.config =
      this.mode === 'signin' ? this.signinConfig : this.changePasswordConfig;

    if (this.mode === 'signin') {
      this.authForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
      });
    } else {
      this.authForm = this.fb.group(
        {
          email: ['', [Validators.required, Validators.email]],
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
    if (this.authForm.valid) {
      this.submitForm.emit({
        mode: this.mode,
        data: this.authForm.value,
      });
    }
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
