import { ref, reactive, toRefs } from 'vue';
import { QDialogOptions, useQuasar } from 'quasar';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { api as $api } from 'src/boot/axios';
import utils from './utils';
import {
  ErrorResponseInterface,
  TablePropertyInterface,
  TablePaginationInterface,
  TableResponseInterface,
  TableRequestInterface,
  TableFetchInterface,
  RecordResponseInterface,
  RecordQuery,
} from './types';
import { setDebug } from './system';

export default function useTable<R>(property: {
  (): TablePropertyInterface<R>;
}) {
  const $q = useQuasar();
  const link = utils.useLink(property().root);

  const rows = ref<R[]>([]);
  const additional = ref<Record<string, unknown>>();
  const loading = ref(false);
  const columns = ref(property().columns);
  const state = reactive({
    filter: property().filter,
  });

  console.warn(
    'OKOK',{
    ...utils.define.pagination,
    ...(property().pagination || {}),
  })
  const pagination = ref<TablePaginationInterface>({
    ...utils.define.pagination,
    ...(property().pagination || {}),
  });

  const api = {
    load: () => {
      const url = property().api.resource;
      const method = property().api.load?.method || 'GET';
      const params = property().api.load?.params || {};
      return { url, method, params };
    },
    delete: (id: string | number) => {
      const url = `${property().api.resource}/${String(id)}`;
      const method = 'delete';
      const params = property().api.delete?.params;
      return { method, url, params };
    },
  };

  const onFetch: TableFetchInterface<R> = (vp = null) => {
    const { url, method, params } = api.load();
    console.warn('VP', vp)
    const { page, rowsPerPage, sortBy, descending } =
      vp?.pagination || pagination.value;
    const filter = { ...(state.filter || {}), ...(vp?.filter || {}) };
    const mapLoadParams = property().mapLoadParams || null;
    let newparams: RecordQuery = {
      ...params,
      limit: rowsPerPage,
      page,
      sort: sortBy,
      descending: descending ? true : null,
      ...filter,
    };
    if (typeof mapLoadParams === 'function') {
      newparams = mapLoadParams(newparams);
    }

    const request = {
      url,
      method,
      params: newparams,
    };
    return $api.request<TableResponseInterface<R>>(request);
  };

  const onRequest: TableRequestInterface = (vp, doneFn = null) => {
    const { page, rowsPerPage, sortBy, descending } = vp.pagination;

    loading.value = true;
    pagination.value.sortBy = sortBy;
    pagination.value.descending = descending;

    onFetch(vp)
      .then((response) => {
        // set rows of data table
        setDebug(response, String(response.data.meta?.path), 'DATA GET TABLE');
        const newRows = ref<R[]>(response.data.data);
        const newAdd = ref<Record<string, unknown>>(response.data);
        rows.value.splice(0, rows.value.length, ...newRows.value);
        additional.value = newAdd.value;

        // Update local pagination object
        pagination.value.page = page;
        pagination.value.rowsPerPage = rowsPerPage;
        pagination.value.rowsNumber = response.data.meta?.total || 0;

        if (doneFn) doneFn(vp, response);
      })
      .catch((error) => {
        const e = error as ErrorResponseInterface;
        setDebug(
          e.response || e,
          String(e.response?.config.url),
          'DATA ERROR GET TABLE'
        );
        // console.error('[APP] TABLE LOAD', e.response || e);
        const caption = e.response
          ? e.response?.data.message || e.message
          : 'Network Errer';

        if (doneFn) doneFn(false, error);
        $q.notify({ message: 'RESOURCE FAILED', caption, type: 'negative' });
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const onRefresh = (doneFn?: CallableFunction) => {
    onRequest({ pagination: pagination.value }, doneFn);
  };

  const onLoad = (doneFn?: CallableFunction) => {
    onRequest({ pagination: pagination.value }, doneFn || null);
  };

  const setConfirm = (options: QDialogOptions) => {
    return $q.dialog({
      title: 'Confirmation',
      cancel: { color: 'faded', flat: true },
      ok: { bgColor: 'primary' },
      focus: 'cancel',
      ...options,
    });
  };

  const setResolve = (
    message: string,
    response: AxiosResponse<RecordResponseInterface<R>>
  ) => {
    if (property().api.delete?.resolve !== false) {
      const call = property().api.delete?.resolve;
      if (typeof call === 'function') call(response.data);
      else {
        onRefresh();
        const caption = response.data.message || undefined;
        $q.notify({
          message,
          type: 'positive',
          caption,
        });
      }
    }
  };

  const setReject = (message: string, error: ErrorResponseInterface) => {
    if (property().api.delete?.reject !== false) {
      const call = property().api.delete?.reject;
      if (typeof call === 'function') call(error);
      else {
        const caption = error.response?.data.message || error.message;
        $q.notify({
          message,
          type: 'negative',
          caption,
        });
      }
    }
  };

  const onDelete = (id: number | string) => {
    let options: QDialogOptions = { message: 'sure to delete?' };
    const confirmation = property().api.delete?.confirm;

    if (confirmation) {
      options =
        typeof confirmation === 'function' ? confirmation() : confirmation;
    }

    return new Promise((resolve, reject) => {
      setConfirm(options).onOk(() => {
        loading.value = true;
        const { url, method, params } = api.delete(id);
        $api
          .request<RecordResponseInterface<never>>({
            url,
            method,
            params,
          } as AxiosRequestConfig)
          .then((response) => {
            resolve(response.data);
            setResolve('DELETE SUCCESS', response);
          })
          .catch((error: ErrorResponseInterface) => {
            reject(error);
            setReject('DELETE FAILED', error);
          })
          .finally(() => {
            loading.value = true;
          });
      });
    });
  };

  return {
    additional,
    link,
    rows,
    columns,
    pagination,
    ...toRefs(state),
    loading,
    onRequest,
    onRefresh,
    onLoad,
    onDelete,
    // onFilter
  };
}
