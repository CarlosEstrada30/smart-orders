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