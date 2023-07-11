import {
  RouteLocationNormalized,
  // LocationAsPath,
  RouteLocationRaw,
  NavigationGuardNext,
} from 'vue-router';
// import { Store } from 'src/types/store';
// import { StateInterface } from 'src/types/store/state';

// Middleware options property
export interface MiddlewareOptions {
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
}

// Middleware location
export type MiddlewareLocation = RouteLocationRaw | undefined;

// Middleware type
export interface MiddlewareRaw {
  auth?: boolean;
  call: {
    (options: MiddlewareOptions): MiddlewareLocation | undefined;
  };
}

export type AuthHeaderRequest = { token: string; remember?: boolean };

export interface AuthLogin {
  username: string | null;
  password: string | null;
  remember?: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export type AuthResponseCSRF = {
  token: string;
};
