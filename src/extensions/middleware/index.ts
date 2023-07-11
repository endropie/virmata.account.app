import { Loading, Notify, QSpinnerGrid } from 'quasar';
import { useAuthStore } from './store';
import { MiddlewareOptions, MiddlewareRaw } from './types';
import { AxiosError } from 'axios';

export const setMiddlewares = async ({ to, from, next }: MiddlewareOptions) => {
  if (to.meta.guest) {
    next();
    return;
  }
  const store = useAuthStore();

  const raw = to.matched.find((x) => x.meta.auth);
  if (raw) {
    if (!store.isLoggedIn) {
      Loading.show({
        message: 'Authorization...',
        spinner: QSpinnerGrid,
        customClass: 'bg-white',
        messageColor: 'primary',
        spinnerColor: 'primary',
        backgroundColor: 'grey-3',
      });
      try {
        await store.fetch();
        if (!store.isLoggedIn) {
          next({ path: '/expired', query: { directed: to.fullPath } });
          return;
        }
      } catch (err) {
        const error = err as AxiosError;
        const caption = error.message || 'Authorization is required!';
        Notify.create({
          message: 'AUTHORIZATION FAILED',
          caption,
          type: 'negative',
        });
        if (
          error.response?.statusText === 'Unauthorized' ||
          error.response?.status === 401
        ) {
          next({ path: '/login', query: { directed: to.fullPath } });
        }
        return;
      } finally {
        setTimeout(() => Loading.hide(), 1000);
      }
    }
  }

  if (!to.meta.middlewares) {
    next();
    return;
  }

  const middlewares = to.meta.middlewares as MiddlewareRaw[];

  const promises = middlewares.map((middleware) =>
    middleware.call({ to, from, next })
  ) as [];

  const redirect = (await Promise.all(promises)).find(
    (location) => location
  ) as unknown;

  if (redirect) {
    next(redirect);
    return;
  }

  next();
};

export const ability = (/** roles: string | string[] **/) => {
  const raw: MiddlewareRaw = {
    call: (
      {
        /** store, from **/
      }
    ) => {
      // if (!store.getters['auth/check'](roles)) {
      //   return {
      //     path: '/error',
      //     query: {
      //       code: '403',
      //       message: 'Access forbidden!',
      //       directed: from.fullPath,
      //     },
      //   };
      // }
      return undefined;
    },
  };

  return raw;
};
