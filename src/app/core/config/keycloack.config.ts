import { backUrl } from '../models/URL/back';

export interface KeycloakConfiguration {
  url: string;
  realm: string;
  clientId: string;
}

export const keycloakConfig: KeycloakConfiguration = {
  url: 'http://localhost:9000',
  realm: 'hotel',
  clientId: 'hotel-frontend',
};

export const keycloakInitOptions = {
  onLoad: 'check-sso' as const,
  checkLoginIframe: false,
  pkceMethod: 'S256' as const,
};
