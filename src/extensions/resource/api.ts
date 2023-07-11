import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api as $api } from 'src/boot/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ErrorResponseInterface } from './types';
type AxiosCustom = AxiosRequestConfig & {
  body?: string;
};
interface MetaInterface {
  total: number;
}
export type ResponseMeta = {
  meta: MetaInterface;
} & AxiosResponse;

export default function useApi<R = unknown>(url: string, config: AxiosCustom) {
  const $q = useQuasar();

  const rows = ref<R>();
  const response = ref<R>();
  const total = ref(0);
  const loading = ref(false);

  const onFetch = () => {
    return new Promise<AxiosResponse>((resolve) => {
      loading.value = true;
      void $api
        .request<R>({
          ...config,
          url,
        })
        .then((res) => {
          console.error('[APP] TABLE LOAD', url, res);
          response.value = res.data;
          total.value = Number(
            (response.value as unknown as ResponseMeta)?.meta?.total
          );
          resolve(res);
        })
        .catch((error) => {
          const e = error as ErrorResponseInterface;
          console.error('[APP] TABLE LOAD', url, e.response || e);
          const caption = e.response
            ? e.response?.data.message || e.message
            : 'Network Error';

          $q.notify({ message: 'API FAILED', caption, type: 'negative' });
        })
        .finally(() => {
          loading.value = false;
        });
    });
  };

  const getTotal = () => {
    return total.value;
  };

  const onLoad = () => {
    void onFetch();
  };

  return {
    rows,
    response,
    loading,
    getTotal,
    onFetch,
    onLoad,
  };
}
