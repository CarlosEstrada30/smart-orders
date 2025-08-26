import { apiClient } from '../api/client'
import { ApiError } from '../api/config'
import type { 
  Route, 
  CreateRouteRequest, 
  UpdateRouteRequest, 
  RoutesListParams 
} from './types'

// Servicio para manejar operaciones de rutas
export class RoutesService {
  private readonly baseEndpoint = '/routes'

  // Obtener lista de rutas
  async getRoutes(params: RoutesListParams = {}): Promise<Route[]> {
    try {
      const queryParams: Record<string, string> = {}
      
      if (params.skip !== undefined) queryParams.skip = params.skip.toString()
      if (params.limit !== undefined) queryParams.limit = params.limit.toString()
      if (params.active_only !== undefined) queryParams.active_only = params.active_only.toString()
      if (params.search !== undefined) queryParams.search = params.search

      return await apiClient.get<Route[]>(this.baseEndpoint, queryParams)
    } catch (error) {
      throw this.handleError(error, 'Error al obtener rutas')
    }
  }

  // Obtener una ruta por ID
  async getRouteById(id: number): Promise<Route> {
    try {
      return await apiClient.get<Route>(`${this.baseEndpoint}/${id}`)
    } catch (error) {
      throw this.handleError(error, 'Error al obtener la ruta')
    }
  }

  // Crear una nueva ruta
  async createRoute(routeData: CreateRouteRequest): Promise<Route> {
    try {
      return await apiClient.post<Route>(this.baseEndpoint, routeData)
    } catch (error) {
      throw this.handleError(error, 'Error al crear la ruta')
    }
  }

  // Actualizar una ruta
  async updateRoute(id: number, routeData: UpdateRouteRequest): Promise<Route> {
    try {
      return await apiClient.put<Route>(`${this.baseEndpoint}/${id}`, routeData)
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar la ruta')
    }
  }

  // Eliminar (desactivar) una ruta
  async deleteRoute(id: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseEndpoint}/${id}`)
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar la ruta')
    }
  }

  // Reactivar una ruta
  async reactivateRoute(id: number): Promise<Route> {
    try {
      return await apiClient.post<Route>(`${this.baseEndpoint}/${id}/reactivate`)
    } catch (error) {
      throw this.handleError(error, 'Error al reactivar la ruta')
    }
  }

  // Buscar rutas por nombre
  async searchRoutes(name: string): Promise<Route[]> {
    try {
      return await this.getRoutes({ search: name })
    } catch (error) {
      throw this.handleError(error, 'Error al buscar rutas')
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
export const routesService = new RoutesService()
