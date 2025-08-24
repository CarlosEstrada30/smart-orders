// Tipos para el servicio de usuarios basados en la API
export interface UserCreate {
  email: string
  username: string
  full_name: string
  password: string
  is_active?: boolean
  is_superuser?: boolean
}

export interface UserUpdate {
  email?: string
  username?: string
  full_name?: string
  password?: string
  is_active?: boolean
  is_superuser?: boolean
}

export interface User {
  id: number
  email: string
  username: string
  full_name: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
  updated_at?: string | null
}

export interface UsersListParams {
  skip?: number
  limit?: number
}
