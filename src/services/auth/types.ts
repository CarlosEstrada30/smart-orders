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
  accountNo: string
  email: string
  role: string[]
  exp: number
} 