// Tipos para el servicio de clientes
export interface Client {
  id: number
  name: string
  email: string | null
  phone: string | null
  nit: string | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface CreateClientRequest {
  name: string
  email?: string | null
  phone?: string | null
  nit?: string | null
  address?: string | null
}

export interface UpdateClientRequest {
  name?: string | null
  email?: string | null
  phone?: string | null
  nit?: string | null
  address?: string | null
}

export interface ClientsListParams {
  skip?: number
  limit?: number
  active_only?: boolean
}

// Parámetros para exportación de clientes
export interface ClientsExportParams {
  active_only?: boolean
  skip?: number
  limit?: number
}

// Tipos para carga masiva de clientes
export interface BulkUploadError {
  row: number
  field: string
  error: string
}

export interface BulkUploadResult {
  total_rows: number
  successful_uploads: number
  failed_uploads: number
  success_rate: number
  errors: BulkUploadError[]
  created_clients: Array<{
    id: number
    name: string
    email: string | null
    row: number
  }>
} 