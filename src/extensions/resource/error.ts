// TODO: add description
import { ref } from 'vue';
// import { useQuasar } from 'quasar';
import { ErrorResponseInterface } from './types';
import { setDebug } from './system';

export default function useErrors() {
  // const $q = useQuasar();

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

  const getError = (error: ErrorResponseInterface) => {
    const e = error;
    setDebug(
      e.response || e,
      String(e.response?.config.url),
      'DATA GET RECORD'
    );
    if (error.response && error.response.status === 422) {
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
  };

  return {
    errors,
    getError,
  };
}
