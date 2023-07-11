import { InterfaceRaw, RecordRaw } from './index';

type TenantUserLevel = 'administrator' | 'operator' | 'visitor'

export interface TenantAttribute {
  id: string;
  comptype_id: string;
  name: string;
  address: string;
  avatar: {
    mode: string;
    value: string;
    color: string;
    textColor: string;
  };
}

export type TenantRecord = RecordRaw<TenantAttribute>;

export type TenantInterface = InterfaceRaw<
  TenantAttribute,
  {
    created_uid: string;
    owner_uid: string;
    url: string;
    type: unknown;
    is_owner: string | null;
    as_level: boolean | null;
  }
>;

export type CompTypeInterface = InterfaceRaw<{
  id: number;
  name: string;
  description: string;
}>;

export type TenantInviteRecord = {
  context: string | null;
  level: TenantUserLevel | null;
}

export type TenantInviteInterface = InterfaceRaw<{
  tenant_id: string;
  context: string | null;
  level: TenantUserLevel | null;
  token: string;
  confirmed_at: string
  created_user: unknown;
}>
