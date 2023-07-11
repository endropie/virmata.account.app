import { setCssVar } from 'quasar';

const brands = [
  {
    name: 'default',
    primary: '#009688',
    secondary: '#0f5b54',
    accent: '#96d7d1',
    positive: '#21BA45',
    negative: '#C10015',
    warning: '#F2C037',
  },
];

export const setTheme = (brand: (typeof brands)[0]) => {
  setCssVar('primary', brand.primary);
  setCssVar('secondary', brand.secondary);
  setCssVar('accent', brand.accent);
};

setTheme(brands[0]);
