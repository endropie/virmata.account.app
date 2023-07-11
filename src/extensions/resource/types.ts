import {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  Method as AxiosMethod,
} from 'axios';
import { DialogChainObject, QDialogOptions, QTableProps } from 'quasar';
import { RouteLocationNormalizedLoaded } from 'vue-router';

export type RecordQuery = {
  [key: string]: string | string[] | unknown | RecordQuery;
};

type TableCellInterface = string | number | null | undefined;

export type TableFilter = Record<
  string,
  string | number | null | string[] | number[] | boolean | unknown
>;

export type ResourceRecordModeInterface =
  | 'view'
  | 'edit'
  | 'create'
  | 'index'
  | 'map';

export type LinkOptionsInterface = {
  index: string;
  view?: string;
  create?: string;
  edit?: string;
};

type CallableLinkMapInterface = {
  (route: RouteLocationNormalizedLoaded): string;
};

export type TableResponseInterface<R> = {
  data: R[];
  message?: string;
  links?: {
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
  meta?: {
    current_page: number;
    from: number;
    last_page: number;
    links: { active: boolean; label: string; url: string | null }[];
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
};

export type RecordResponseInterface<R> = {
  data: R;
  message?: string;
  meta?: {
    [key: string]: unknown;
  };
};

export type ErrorResponseInterface = AxiosError<{
  message?: string;
}>;

export interface LinkInstance {
  (basePath: string): {
    view: (id: number | string) => string;
    edit: (id: number | string) => string;
    create: () => string;
    index: () => string;
    map(callbak: CallableLinkMapInterface): string;
  };
}

export interface TablePaginationInterface {
  sortBy: string | null;
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
}

export interface TableRequestPropertyInterface {
  pagination: TablePaginationInterface;
  filter?: TableFilter;
}

export type TableColumnInterface<R> = QTableProps['columns'] & {
  format?: { (val: TableCellInterface | R, row: R): TableCellInterface };
  field?: string | { (row: R): TableCellInterface };
  style?: string | { (row: R): string };
  classes?: string | { (row: R): string };
};

export interface SelectPropertyInterface {
  props: {
    apiFilter?: boolean;
    apiUrl?: string;
    apiParams?: RecordQuery;
    apiKeys?: string[];
  };
}

export interface ApiRawInterface {
  method?: AxiosMethod;
  params?: RecordQuery;
  url?: string;
}

export interface ActionRawInterface<R> {
  confirm?: { (): QDialogOptions } | QDialogOptions;
  resolve?: boolean | { (response: RecordResponseInterface<R>): void };
  reject?: boolean | { (error: ErrorResponseInterface): void };
}

export interface ApiRequestInterface {
  url: string;
  method: AxiosMethod;
  params?: RecordQuery;
}

export interface ApiNormalizedRawInterface {
  resource: string;
  load?: ApiRawInterface;
  submit?: ApiRawInterface;
  delete?: ApiRawInterface;
}

export interface ResourcePropertyInterface {
  /**
   * the root is base route [parent] of resource
   * */
  root: string;
  api: {
    resource: string;
  };
  link?: string;
}

export interface TablePropertyInterface<R> extends ResourcePropertyInterface {
  api: ResourcePropertyInterface['api'] & {
    load?: {
      [key in keyof ApiRawInterface]?: ApiRawInterface[key];
    };
    delete?: ApiRawInterface & ActionRawInterface<R>;
  };
  columns: TableColumnInterface<R>[];
  pagination?: {
    [K in keyof TablePaginationInterface] ?: TablePaginationInterface[K]
  };
  filter?: TableFilter;
  mapLoadParams?: { (prop: RecordQuery): RecordQuery };
}
export interface TableRequestInterface {
  (
    property: TableRequestPropertyInterface,
    doneFn?: null | CallableFunction
  ): void;
}

export interface TableFetchInterface<R> {
  (property?: TableRequestPropertyInterface | null): Promise<
    AxiosResponse<TableResponseInterface<R>>
  >;
}

export interface RecordPropertyInterface<R, RR = R>
  extends ResourcePropertyInterface {
  api: ResourcePropertyInterface['api'] & {
    load?: ApiRawInterface | null;
    submit?: ApiRawInterface & ActionRawInterface<R>;
    delete?: ApiRawInterface & ActionRawInterface<R>;
  };
  origin?: RR | null;
  default?: { (): RR };
}

export interface RecordFetchInterface<R> {
  (request: AxiosRequestConfig): Promise<RecordResponseInterface<R> | null>;
}

export interface RecordRefreshInterface {
  (doneFn: CallableFunction): void;
}

export interface RecordResolveInterface<R> {
  (
    message: string,
    raw: ActionRawInterface<R> | undefined,
    response: RecordResponseInterface<R>
  ): void;
}

export interface RecordRejectInterface<R> {
  (
    message: string,
    raw: ActionRawInterface<R> | undefined,
    error: ErrorResponseInterface
  ): void;
}

export interface RecordConfirmInterface {
  (options?: QDialogOptions): DialogChainObject;
}

export interface ResponseQuery {
  period: string;
  process_type: string;
  total_quantity: string;
  total_weight: string;
  total_weight_latest: string;
  total_weight_now: string;
}

export interface FormSubmit {
  submit: () => void;
}
