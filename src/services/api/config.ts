/**
 * DEPRECATED: Este archivo se mantiene por compatibilidad
 * Usar @/config/api-config.ts para nueva configuración
 */
import { API_CONFIG as NEW_API_CONFIG } from '@/config/api-config'

// Re-exportar configuración desde el nuevo sistema
export const API_CONFIG = {
  BASE_URL: NEW_API_CONFIG.BASE_URL,
  TIMEOUT: NEW_API_CONFIG.TIMEOUT,
  HEADERS: NEW_API_CONFIG.HEADERS,
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