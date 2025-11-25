import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class KeycloakService {
  private keycloak: Keycloak | undefined;

  async init(options: any): Promise<boolean> {
    this.keycloak = new Keycloak(options.config);
    const authenticated = await this.keycloak.init(options.initOptions);

    if (authenticated && this.keycloak.token) {
      localStorage.setItem('accessToken', this.keycloak.token);
      if (this.keycloak.refreshToken) {
        localStorage.setItem('refreshToken', this.keycloak.refreshToken);
      }
    }

    this.keycloak.onTokenExpired = () => {
      this.updateToken();
    };

    return authenticated;
  }

  login(): Promise<void> {
    return this.keycloak!.login({
      redirectUri: window.location.origin + '/dashboard',
    });
  }

  logout(): Promise<void> {
    localStorage.clear();
    return this.keycloak!.logout({ redirectUri: window.location.origin });
  }

  isAuthenticated(): boolean {
    return this.keycloak?.authenticated ?? false;
  }

  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  async updateToken(minValidity: number = 30): Promise<boolean> {
    try {
      const refreshed = await this.keycloak!.updateToken(minValidity);
      if (refreshed && this.keycloak!.token) {
        localStorage.setItem('accessToken', this.keycloak!.token);
      }
      return refreshed;
    } catch {
      this.logout();
      return false;
    }
  }

  getUserProfile(): any {
    return this.keycloak?.tokenParsed;
  }

  getUserName(): string {
    return (
      this.getUserProfile()?.preferred_username ||
      this.getUserProfile()?.name ||
      'Usuario'
    );
  }

  getUserEmail(): string {
    return this.getUserProfile()?.email || '';
  }

  hasRole(role: string): boolean {
    return this.getUserProfile()?.realm_access?.roles?.includes(role) ?? false;
  }
}
