// Tipos para el servicio de autenticación
export interface LoginRequest {
  email: string
  password: string
  subdominio: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface AuthUser {
  email: string
  full_name?: string
  username?: string
  role?: string
  is_active?: boolean
  is_superuser?: boolean
  exp: number
  tenant?: {
    tenant_schema: string
  }
} 