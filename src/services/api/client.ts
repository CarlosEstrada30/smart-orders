import { API_CONFIG, ApiError } from './config'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

// Cliente HTTP base
class ApiClient {
  private baseURL: string
  private defaultHeaders: HeadersInit

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.defaultHeaders = API_CONFIG.HEADERS
  }

  // Método para obtener headers con token
  private getHeaders(): HeadersInit {
    const token = useAuthStore.getState().auth.accessToken
    return {
      ...this.defaultHeaders,
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  // Método para manejar errores de autenticación
  private handleAuthError(status: number) {
    if (status === 401) {
      // Token expirado o inválido
      toast.error('Sesión expirada. Por favor, inicia sesión nuevamente.')
      
      // Limpiar el store de autenticación
      useAuthStore.getState().auth.reset()
      
      // Redirigir al login
      const currentPath = window.location.pathname
      window.location.href = `/sign-in?redirect=${encodeURIComponent(currentPath)}`
      
      return true // Indica que el error fue manejado
    }
    return false
  }

  // Método genérico para hacer peticiones
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        // Manejar errores de autenticación
        if (this.handleAuthError(response.status)) {
          throw new ApiError(
            response.status,
            'Sesión expirada',
            'Token de autenticación inválido o expirado'
          )
        }

        const errorData = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }))

        throw new ApiError(
          response.status,
          errorData.detail || `Error ${response.status}`,
          response.statusText
        )
      }

      // Si la respuesta es 204 (No Content), retornar null
      if (response.status === 204) {
        return null as T
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      throw new ApiError(
        0,
        'Error de red',
        error instanceof Error ? error.message : 'Error desconocido'
      )
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params).toString()}`
      : endpoint
    
    return this.request<T>(url, { method: 'GET' })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// Instancia singleton del cliente
export const apiClient = new ApiClient() 