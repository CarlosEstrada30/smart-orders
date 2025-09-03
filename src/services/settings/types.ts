export interface CompanySettings {
  id: number
  company_name: string
  business_name: string
  nit: string
  address?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  logo_url?: string | null
  is_active: boolean
  created_at: string
  updated_at?: string | null
}

export interface CompanySettingsCreate {
  company_name: string
  business_name: string
  nit: string
  address?: string
  phone?: string
  email?: string
  website?: string
  logo?: File
}

export interface CompanySettingsUpdate extends Partial<CompanySettingsCreate> {}

export interface SettingsFormData extends CompanySettingsCreate {
  logo?: File | null
}
