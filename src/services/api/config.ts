// Configuración base de la API
export const API_CONFIG = {
  BASE_URL: 'https://b0dc3a506e8d.ngrok-free.app/api/v1',
  TIMEOUT: 10000, // 10 segundos
  HEADERS: {
    'Content-Type': 'application/json',
  },
} as const

// Tipos de respuesta de la API
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface ApiErrorResponse {
  detail: string
  status: number
  message?: string
}

// Clase para manejar errores de la API
export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    message?: string
  ) {
    super(message || detail)
    this.name = 'ApiError'
  }
} 