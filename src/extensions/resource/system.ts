import { AxiosResponse } from 'axios';
import { Cookies, LocalStorage, Dialog } from 'quasar';
import { api } from 'src/boot/axios';
// import { AuthLoginInterface } from 'src/types/auth';
import { ErrorResponseInterface } from './types';
// import { SettingRecordInterface } from 'src/types/services/setting';
import { reactive, toRefs, computed, ref } from 'vue';

interface SystemInterface {
  configurate: {
    process: Record<
      string,
      {
        provider?: string | null;
      }
    >;
  } | null;
}

// CONFIG COMPOSABLE
const state = reactive<SystemInterface>({
  configurate: null,
});

const loadConfig = () => {
  return new Promise<boolean>((resolve, reject) => {
    void api
      .get<{ data: SystemInterface['configurate'] }>('/api/configuration')
      .then((response) => {
        state.configurate = response.data.data;
        resolve(true);
      })
      .catch(() => {
        reject(false);
      });
  });
};

const config = computed(() => {
  if (!state.configurate) return null;
  return {
    processTypes: Object.keys(state.configurate.process).map((x) => {
      return {
        name: x,
        produce: Boolean(state.configurate?.process[x].provider),
      };
    }),
  };
});

// DEBUG SYSTEM COMPOSABLE
const debug = ref(false);
const accurate_login = ref(false);

const onDebug = () => {
  LocalStorage.set('debug-set', true);
  debug.value = true;
};

const onUndebug = () => {
  LocalStorage.remove('debug-set');
  debug.value = false;
};

const setDebug = (
  data: unknown,
  url: string,
  caption?: string,
  another?: unknown,
  another_val?: unknown
) => {
  if (LocalStorage.has('debug-set')) return;
  console.info(data, caption, another, another_val);
};

// REMEMBER LOGIN COMPOSABLE
const remember_login = ref(false);
const loading_setting = ref(false);
const hasTokenAccurate = ref<boolean>(false);

const toogleRemember = () => {
  if (LocalStorage.has('remember-login')) {
    LocalStorage.remove('remember-login');
    LocalStorage.remove('remember-user');
    return (remember_login.value = false);
  }
  LocalStorage.set('remember-login', true);
  remember_login.value = true;
};

const getSetting = () => {
  return new Promise<AxiosResponse | ErrorResponseInterface>(
    (resolve, reject) => {
      loading_setting.value = true;
      void api
        .get('/api/setting')
        .then((data: AxiosResponse) => {
          resolve(data);
        })
        .catch((e: ErrorResponseInterface) => {
          reject(e);
        })
        .finally(() => (loading_setting.value = false));
    }
  );
};

// const postSetting = (value: SettingRecordInterface) => {
//   loading_setting.value = true;
//   return new Promise<AxiosResponse | ErrorResponseInterface>(
//     (resolve, reject) => {
//       void api
//         .post('/api/setting', value)
//         .then((data: AxiosResponse) => {
//           resolve(data);
//         })
//         .catch((e: ErrorResponseInterface) => {
//           reject(e);
//         })
//         .finally(() => (loading_setting.value = false));
//     }
//   );
// };

// ACCURATE SYSTEM LOGIN

// const setAccurate = (data: AuthLoginInterface) => {
//   if (!LocalStorage.has('remember-login')) return;
//   LocalStorage.set('remember-user', data);
// }

// const getAccurate = () => {
//   if (Cookies.has('X-Accurate')) return Cookies.has('X-Accurate');
//   return null;
// }

const autorun = () => {
  hasTokenAccurate.value = Boolean(Cookies.has('X-Accurate'));
  void getSetting();
  if (LocalStorage.has('debug-set')) debug.value = true;
  if (Cookies.has('X-Accurate')) {
    accurate_login.value = true;
  }
};

const deleteTokenAccurate = () => {
  Dialog.create({
    title: 'Confirm',
    message: 'Would you like to logout the accurate account?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (Cookies.has('X-Accurate')) {
      Cookies.remove('X-Accurate');
      accurate_login.value = false;
    }
  });
};

// autorun();

const useSystem = () => {
  return {
    accurate_login,
    config,
    debug,
    remember_login,
    loading_setting,
    hasTokenAccurate,
    autorun,
    getSetting,
    // postSetting,
    ...toRefs(state),
    deleteTokenAccurate,
    setDebug,
    loadConfig,
    onDebug,
    onUndebug,
    toogleRemember,
  };
};

export {
  // state,
  setDebug,
  useSystem,
  loadConfig,
};
