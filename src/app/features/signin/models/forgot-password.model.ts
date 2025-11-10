export interface ForgotPasswordCredentials {
  email: string;
}

export interface ForgotPasswordFormConfig {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitLabel: string;
  backToSigninText: string;
  backToSigninLink: string;
}

export interface ForgotPasswordVisualConfig {
  imageSrc: string;
  imageAlt: string;
}
