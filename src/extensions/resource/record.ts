// TODO: add description
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { QDialogOptions, useQuasar } from 'quasar';
import { AxiosRequestConfig } from 'axios';
import { api as $api } from 'src/boot/axios';
import utils from './utils';
import {
  ErrorResponseInterface,
  RecordPropertyInterface,
  RecordResponseInterface,
  RecordResolveInterface,
  RecordRejectInterface,
  RecordConfirmInterface,
} from './types';
import { setDebug } from './system';

export default function useRecord<R, RR = R>(property: {
  (): RecordPropertyInterface<R, RR>;
}) {
  const $q = useQuasar();
  const $router = useRouter();
  const $route = useRoute();
  const link = utils.useLink(property().root);

  const loading = ref(false);
  const record = ref<RR | null>();
  const originalRecord = ref<RR | null>();
  const additional = ref<Record<string, unknown>>({});
  const form = ref();
  const validate = utils.useValidate(record);

  const errorsData = ref<Record<string, string[]>>({});
  // const errors = utils.useError();

  const errors = ref({
    // data: {},
    all: () => {
      return errorsData.value;
    },
    get: (property: string) => {
      return errorsData.value[property] as string[] | undefined;
    },
    set: (property: string | Record<string, string[]>, values?: string[]) => {
      if (typeof property === 'string') {
        errorsData.value[property] = values || [];
      } else {
        errorsData.value = property;
      }
    },
    reset: () => {
      errorsData.value = {};
    },
    message: (property: string, name: string | undefined = undefined) => {
      return errorsData.value[property] && errorsData.value[property]
        ? name
          ? errorsData.value[property][0].replace(property, name)
          : errorsData.value[property][0]
        : undefined;
    },
    has: (property: string) => {
      return Boolean(errorsData.value[property] && errorsData.value[property]);
    },
  });

  const api = {
    load: () => {
      const method = (property().api.load || {})?.method || 'GET';
      const url = `${property().api.resource}/${String($route.params.id)}`;

      return { method, url, ...(property().api.load || {}) };
    },
    submit: () => {
      const mode = String($route.meta.mode).toLocaleLowerCase();
      let url = property().api.resource;
      let method = 'POST';

      switch (mode) {
        case 'create':
          method = 'POST';
          break;
        case 'edit':
          method = 'PUT';
          url = `${url}/${String($route.params.id)}`;
          break;
        default:
          method = 'POST';
          url = `${url}/${String($route.params.id)}`;
          break;
      }

      return { method, url, ...(property().api.submit || {}) };
    },
    delete: () => {
      const url = `${property().api.resource}/${String($route.params.id)}`;
      const method = 'delete';
      return { method, url, ...(property().api.delete || {}) };
    },
  };

  const onRecord = (doneFn?: CallableFunction) => {
    if (property().api.load === null || $route.meta.mode === 'create') {
      const getRecord = property().default;
      const newRecord = typeof getRecord === 'function' ? getRecord() : {};
      record.value = newRecord as RR;

      if (doneFn) doneFn();
      if (!property().default) {
        console.error(
          '[APP] Resource [create] mode, default data is required!'
        );
      }
    } else {
      loading.value = true;

      // fetch data from "server"
      const { url, method, params } = api.load();
      const request = { url, method, params };

      $api
        .request<RecordResponseInterface<RR>>(request)
        .then((response) => {
          setDebug(response, String(response.config.url), 'DATA GET RECORD');
          record.value = response.data.data;
          additional.value = response.data;
          originalRecord.value = Object.assign({}, response.data.data);
        })
        .catch((error) => {
          const e = error as ErrorResponseInterface;
          setDebug(
            e.response || e,
            String(e.response?.config.url),
            'DATA GET RECORD'
          );
          const caption = e.response
            ? e.response.data.message || e.message
            : 'Network Error';

          $q.notify({ message: 'RESOURCE FAILED', caption, type: 'negative' });
          console.error('[APP] RECORD LOAD', e.response || error);
        })
        .finally(() => {
          if (doneFn) doneFn();
          loading.value = false;
        });
    }
  };

  const onRefresh = (doneFn?: CallableFunction) => {
    onRecord(doneFn);
  };

  const onLoad = (doneFn?: CallableFunction) => {
    onRecord(doneFn);
  };

  const onReload = (doneFn?: CallableFunction) => {
    onRecord(doneFn);
  };

  const setConfirm: RecordConfirmInterface = (options) => {
    return $q.dialog({
      title: 'Confirmation',
      cancel: { color: 'faded', flat: true },
      ok: { bgColor: 'primary' },
      focus: 'cancel',
      ...options,
    });
  };

  const setResolve: RecordResolveInterface<R> = (message, raw, response) => {
    if (raw?.resolve !== false) {
      const call = property().api.submit?.resolve;
      if (typeof call === 'function') call(response);
      else {
        const caption = response.message || undefined;
        $q.notify({
          message,
          type: 'positive',
          classes: 'print-hide',
          timeout: 750,
          caption,
        });
      }
    }
  };

  const setReject: RecordRejectInterface<R> = (message, raw, error) => {
    if (raw?.reject !== false) {
      const call = property().api.submit?.reject;
      if (typeof call === 'function') {
        call(error);
      } else {
        const caption = error.response?.data.message || error.message;
        $q.notify({
          message,
          type: 'negative',
          classes: 'print-hide',
          timeout: 750,
          caption,
        });
      }
    }
  };

  const onSubmit = (doneFn?: CallableFunction) => {
    let options: QDialogOptions = { message: 'sure to submit?' };
    const confirmation = property().api?.submit?.confirm;
    if (confirmation) {
      options =
        typeof confirmation === 'function' ? confirmation() : confirmation;
    }

    setConfirm(options).onOk(() => {
      loading.value = true;
      const { url, method, params } = api.submit();
      $api
        .request<RecordResponseInterface<R>>({
          url,
          method,
          params,
          data: record.value,
        } as AxiosRequestConfig)
        .then((response) => {
          setDebug(response, String(response.config.url), 'APP DEBUG RESPONSE');
          setResolve('SUBMIT SUCCESS', property().api.submit, response.data);
          if (doneFn) doneFn(response.data.data);
        })
        .catch((error: ErrorResponseInterface) => {
          console.error(error.response || error, 'error');
          if (error.response && error.response.status === 422) {
            validate.errors.set(
              error.response.data as Record<string, string[]>
            );
            const responseData = error.response.data as Record<
              string,
              string[] | string
            >;

            Object.keys(responseData).forEach((x) => {
              if (typeof responseData[x] === 'string') {
                errors.value.set(x, [responseData[x] as string]);
              } else {
                errors.value.set(x, responseData[x] as string[]);
              }
            });
          }
          setReject('SUBMIT FAILED', property().api.submit, error);
          console.error('[APP] RECORD SUBMIT', error.response || error);
        })
        .finally(() => {
          loading.value = false;
        });
    });
  };

  const onDelete = (doneFn?: CallableFunction) => {
    if (Boolean(property().api.delete) === false) return undefined;

    let options: QDialogOptions = { message: 'sure to delete?' };
    const confirmation = property().api.delete?.confirm;

    if (confirmation) {
      options =
        typeof confirmation === 'function' ? confirmation() : confirmation;
    }
    setConfirm(options).onOk(() => {
      loading.value = true;
      const { url, method, params } = api.delete();
      $api
        .request({ url, method, params } as AxiosRequestConfig)
        .then((response) => {
          setResolve('DELETE SUCCESS', property().api.delete, response);
          if (doneFn) doneFn();
        })
        .catch((error: ErrorResponseInterface) => {
          console.error(error.response || error);
          setReject('DELETE FAILED', property().api.delete, error);
        })
        .finally(() => {
          loading.value = true;
        });
    });
  };

  const onCancel = (doneFn?: CallableFunction) => {
    return $q
      .dialog({
        title: 'Confirmation',
        message: 'sure to close this form?',
        cancel: { color: 'faded', flat: true },
        ok: { bgColor: 'grey-10' },
        focus: 'cancel',
      })
      .onOk(() => {
        if (doneFn) doneFn();
        $router.back();
      });
  };

  return {
    errors,
    validate,
    link,
    record,
    originalRecord,
    additional,
    form,
    loading,
    onDelete,
    onRefresh,
    onLoad,
    onReload,
    onSubmit,
    onCancel,
  };
}
