import { ref } from 'vue';
import { QSelect } from 'quasar';
import { api as $api } from 'src/boot/axios';
import { SelectPropertyInterface } from './types';
import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { setDebug } from './system';

export default function useSelect<R>(property: {
  (): SelectPropertyInterface;
}) {
  const select = ref<QSelect>();
  const opts = ref<R[]>([]);
  const options = ref<R[]>([]);

  const onFetch = (input = '') => {
    const { props } = property();
    return new Promise<void>((resolve, reject) => {
      const request: AxiosRequestConfig = {
        url: String(props.apiUrl),
        method: 'GET',
        params: {
          ...(props.apiFilter ? {} : { 'with-limitation': true, limit: '*' }),
          ...(props.apiParams || {}),
          search: input,
          search_keys: props.apiKeys || [],
        },
      };

      $api
        .request<AxiosResponse<R[]>>(request)
        .then((response) => {
          setDebug(response, 'select', 'API SELECT [APP]');
          const newOpts = ref<R[]>(response.data.data || []);
          opts.value.splice(0, opts.value.length, ...newOpts.value);
          options.value.splice(0, options.value.length, ...newOpts.value);
          if (process.env.DEV) {
          }
          resolve();
        })
        .catch((e: AxiosError) => {
          console.error('[APP] SELECT LOAD', e.response || e);
          reject();
        });
    });
  };

  const filterAllFn = (input: string, update: CallableFunction) => {
    const needle = input.toLowerCase();
    update(() => {
      opts.value = options.value.filter((x) => {
        if (typeof x === 'string') return x.toLowerCase().indexOf(needle) > -1;
        if (typeof x === 'object') {
          for (const ix in x) {
            if (['string', 'object'].some((y) => y === typeof x)) continue;
            if (String(x[ix]).toLowerCase().indexOf(needle) > -1) return true;
          }
          return;
        }
      });
    });
  };

  const onFilter = (input: string, doneFn: CallableFunction) => {
    const { props } = property();

    if (props.apiUrl) {
      onFetch(input).finally(() => void doneFn());
    } else {
      filterAllFn(input, doneFn);
    }
  };

  return {
    onFetch,
    onFilter,
    opts,
    options,
    select,
  };
}
