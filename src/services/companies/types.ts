export interface Company {
  id: string
  nombre: string
  subdominio: string
  token: string
  schema_name: string
  created_at: string
  // Nuevos campos del backend
  active: boolean
  is_trial: boolean
}

export interface CompanyCreate {
  nombre: string
  subdominio: string
  is_trial?: boolean
}

export interface CompanyUpdate {
  nombre?: string
  subdominio?: string
  is_trial?: boolean
}

export interface CompaniesListParams {
  page?: number
  limit?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  show_inactive?: boolean
}

export interface CompaniesListResponse {
  items: Company[]
  total: number
  page: number
  limit: number
  total_pages: number
}
