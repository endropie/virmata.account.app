import { Ref } from 'vue';
import { useRoute } from 'vue-router';
import { validate as validation } from 'vee-validate';
import { LinkInstance } from './types';

const useLink: LinkInstance = (indexPath) => {
  return {
    view: (id: number | string) => `${indexPath}/${id}`,
    edit: (id: number | string) => `${indexPath}/${id}/edit`,
    create: () => `${indexPath}/create`,
    index: () => indexPath,
    map: (fn) => {
      return fn(useRoute());
    },
  };
};

const useError = () => {
  let data: Record<string, string[]> = {};
  const valueError: Record<string, unknown | undefined> = {};
  return {
    all: () => {
      return data;
    },
    get: (property: string) => {
      return data[property];
    },
    set: (property: string | Record<string, string[]>, values?: string[]) => {
      if (typeof property === 'string') {
        data[property] = values || [];
      } else {
        data = property;
      }
    },
    reset: () => {
      data = {};
    },
    first: (property: string, name: string | undefined = undefined) => {
      return data[property] && data[property]
        ? name
          ? data[property][0].replace(property, name)
          : data[property][0]
        : undefined;
    },
    has: (property: string) => {
      return Boolean(data[property] && data[property]);
    },
    valueError,
    validate: function (
      property: string,
      name: string | undefined = undefined
    ) {
      return (val: unknown) => {
        const msg = this.first(property, name);
        if (
          msg &&
          !!this.valueError[property] &&
          val === this.valueError[property]
        ) {
          return undefined;
        }
        return new Promise((resolve) => {
          if (msg) this.valueError[property] = val;
          resolve(msg);
        });
      };
    },
  };
};
class Validate {
  protected touch = true;
  protected valid: undefined | boolean;
  protected recordField: Record<string, string[]> = {};
  protected recordTouch: Record<string, boolean> = {};

  public model;
  public errors;

  constructor(v: Ref<Record<string, unknown>>) {
    this.model = v;
    this.errors = useError();
  }

  protected getValue = (
    props: string[],
    obj?: Record<string, unknown>
  ): unknown => {
    if (typeof obj === 'undefined') obj = this.model.value;
    const prop = props.shift() as string;
    if (!obj[prop]) return undefined;
    if (!props.length) {
      return obj[prop] || undefined;
    }
    return this.getValue(props, obj[prop] as Record<string, unknown>);
  };

  protected touched = (property?: string) => {
    if (typeof property === 'undefined') {
      this.touch = true;
    } else {
      this.recordTouch[property] = true;
    }
  };

  protected isTouched = (property?: string) => {
    return typeof property === 'undefined'
      ? this.touch
      : this.touch || this.recordTouch[property];
  };

  protected getMessage = (property: string) => {
    if (!this.recordField[property] || !this.recordField[property].length)
      return undefined;
    return this.recordField[property][0];
  };

  protected reset = () => {
    this.valid = undefined;
    this.touch = false;
    this.errors.reset();
  };

  public field = (property: string, rules: string, name?: string) => {
    return () => {
      return new Promise<string | undefined>((resolve) => {
        if (this.errors.has(property)) {
          this.recordField[property] = this.errors.get(property);
          let msg = this.getMessage(property);
          if (msg && name) {
            const caseProperty = String(property)
              .replace('_', ' ')
              .replace('-', ' ');
            msg = String(msg).replace(property, name);
            msg = String(msg).replace(caseProperty, name);
          }
          resolve(this.isTouched(property) ? msg : undefined);
        } else {
          const val = this.getValue(property.split('.'));
          void validation(val, rules, { name: name || property }).then(
            (valid) => {
              this.recordField[property] = valid.errors;
              const msg = this.getMessage(property);
              resolve(this.isTouched(property) ? msg : undefined);
            }
          );
        }
      });
    };
  };
}

const useValidate = (v: Ref<unknown>) => {
  return new Validate(v as Ref<Record<string, unknown>>);
};

export default {
  useLink,
  useError,
  useValidate,
  define: {
    pagination: {
      sortBy: null,
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0,
    },
  },
};
