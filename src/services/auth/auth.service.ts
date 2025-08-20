import { apiClient } from '../api/client'
import { ApiError } from '../api/config'
import type { LoginRequest, LoginResponse } from './types'

// Servicio para manejar operaciones de autenticación
export class AuthService {
  private readonly baseEndpoint = '/auth'

  // Login con la API real
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      return await apiClient.post<LoginResponse>(`${this.baseEndpoint}/login`, credentials)
    } catch (error) {
      throw this.handleError(error, 'Error al iniciar sesión')
    }
  }

  // Método privado para manejar errores
  private handleError(error: unknown, defaultMessage: string): ApiError {
    if (error instanceof ApiError) {
      return error
    }
    
    return new ApiError(
      0,
      defaultMessage,
      error instanceof Error ? error.message : 'Error desconocido'
    )
  }
}

// Instancia singleton del servicio
export const authService = new AuthService() 