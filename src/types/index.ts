export type BusinessType = 'RESTAURANT' | 'HOTEL' | 'HYBRID' | 'CAFE' | 'RESORT';
export type TenantStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'SETUP_PENDING';

export interface Tenant {
  id: string;
  slug: string;
  public_name: string;
  legal_name: string | null;
  custom_domain: string | null;
  business_type: BusinessType;
  status: TenantStatus;
  parent_tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TenantSettings {
  tenant_id: string;
  timezone: string;
  currency: string;
  country: string | null;
  contact_email: string | null;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  region: string | null;
  postal_code: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}
