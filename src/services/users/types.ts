import { UserRole } from '../auth/permissions.service'

// Tipos para el servicio de usuarios basados en la API
export interface UserCreate {
  email: string
  username: string
  full_name: string
  password: string
  is_active?: boolean
  is_superuser?: boolean
  // Campo virtual para el frontend - se mapea a is_superuser en el backend
  role?: UserRole
}

export interface UserUpdate {
  email?: string
  username?: string
  full_name?: string
  password?: string
  is_active?: boolean
  is_superuser?: boolean
  // Campo virtual para el frontend - se mapea a is_superuser en el backend
  role?: UserRole
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
  // Campo virtual para el frontend - se deriva de is_superuser y otros factores
  role?: UserRole
}

export interface UsersListParams {
  skip?: number
  limit?: number
}
