import { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { Cookies, Notify } from 'quasar';
import { api, apiCentra } from 'src/boot/axios';
import {
  AuthHeaderRequest,
  AuthLogin,
  AuthResponseCSRF,
  AuthUser,
} from './types';

const PREFIX = '/api/auth';

// const REGISTER_URL = `${PREFIX}/register`;
// const VERIFICATION_URL = `${PREFIX}/verify`;
const LOGIN_URL = `${PREFIX}/login`;
const FETCH_USER_URL = `${PREFIX}/user`;
// const PASSWORD_CHANGE_URL = `${PREFIX}/password/change`;
// const PASSWORD_FORGOT_URL = `${PREFIX}/password/forgot`;
// const PASSWORD_RESET_URL = `${PREFIX}/password/reset`;
const CSRF_TOKEN_URL = process.env.DEV
  ? `/csrf_token/faker?${process.env.FAKER_CSRF_TOKEN_AUTH ? 'auth='+process.env.FAKER_CSRF_TOKEN_AUTH : ''}`
  : '/csrf_token/account';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
  }),
  getters: {
    getUser: (state) => {
      return state.user;
    },

    isLoggedIn(state) {
      return Boolean(state.user);
    },

    // check: (state) => {
    //   // roles: role of abilities. superadmin: role of all access.
    //   return (roles: string | string[], superadmin = '*'): boolean => {
    //     if (typeof roles === 'string') roles = [roles];
    //     if (!roles.length) return true
    //     const { user } = state;
    //     if (user) {
    //       // const { ability } = user;

    //       // if (superadmin && (ability as string[]).find((x) => x === superadmin)) return true;

    //       // return roles.some((x) => (ability as string[]).includes(x));
    //     }
    //     return false;
    //   };
    // },
  },
  actions: {
    setUser(user: AuthUser | null) {
      if (!user) this.user = null;
      else {
        this.user = user;
      }
    },

    async fetch() {
      try {
        const { data } = await apiCentra.get<AuthResponseCSRF>(CSRF_TOKEN_URL);

        if (data.token)
          api.defaults.headers.common.Authorization = `Bearer ${data.token}`;

        if (!api.defaults.headers.common.Authorization) {
          return new Promise((resolve, reject) => {
            reject({ response: { statusText: 'Unauthorized' } });
          });
        }

        try {
          const response = await api.get(FETCH_USER_URL);
          this.setUser(response.data.data);
          return new Promise((resolve) => {
            resolve(undefined);
          });
        } catch (error) {
          if (process.env.DEV)
            console.error('FETCH', (error as AxiosError).response || error);
          return new Promise((resolve, reject) => {
            reject(error as AxiosError);
          });
        }
      } catch (error) {
        console.warn('AUTH', error)
      }
    },

    login(data: AuthLogin) {
      const promise = new Promise<void>((resolve, reject) => {
        api
          .post(LOGIN_URL, data)
          .then((response) => {
            const setup = {
              token: response.data.access_token,
              remember: Boolean(data?.remember),
            };
            this.setHeader(setup);
            resolve();
          })
          .catch((e) => {
            const error = e as AxiosError<{
              message?: string;
              username?: string[];
              password?: string[];
            }>;
            let caption = 'Network Error';
            if (error.response) {
              console.error('[APP] LOGIN ERROR', error.response);
              caption =
                error.response.data.username?.[0] ||
                error.response.data.password?.[0] ||
                error.response.data.message ||
                error.message;
            }

            Notify.create({
              type: 'negative',
              message: 'LOGIN FAILED!',
              caption,
            });
            reject(error);
          });
      });
      return promise;
    },

    setHeader: (data: AuthHeaderRequest) => {
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      if (data.remember) {
        Cookies.set('authorization_token', data.token, {
          expires: 365,
        });
      } else {
        Cookies.set('authorization_token', data.token);
      }
    },

    logout() {
      return new Promise((resolve) => {
        delete api.defaults.headers.common.Authorization;
        Cookies.remove('authorization_token');
        this.setUser(null);
        resolve(undefined);
      });
    },
  },
});
