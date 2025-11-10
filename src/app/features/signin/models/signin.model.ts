export interface SigninCredentials {
  username: string;
  password: string;
}

export interface SigninFormConfig {
  title: string;
  subtitle: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submitLabel: string;
  forgotPasswordText: string;
  forgotPasswordLink: string;
}

export interface SigninVisualConfig {
  imageSrc: string;
  imageAlt: string;
}
