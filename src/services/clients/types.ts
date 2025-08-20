// Tipos para el servicio de clientes
export interface Client {
  id: number
  name: string
  email: string
  phone: string
  address: string
  is_active: boolean
  created_at: string
  updated_at: string | null
}

export interface CreateClientRequest {
  name: string
  email: string
  phone: string
  address: string
}

export interface UpdateClientRequest {
  name: string
  email: string
  phone: string
  address: string
}

export interface ClientsListParams {
  skip?: number
  limit?: number
  active_only?: boolean
} 