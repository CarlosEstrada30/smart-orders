import { apiClient } from '../api/client'
import { ApiError } from '../api/config'
import type { 
  ProductRoutePrice,
  CreateProductRoutePriceRequest,
  UpdateProductRoutePriceRequest
} from './types'

// Servicio para manejar operaciones de precios por ruta
export class ProductRoutePricesService {
  private readonly baseEndpoint = '/product-route-prices'

  // Obtener todos los precios por ruta de un producto
  async getProductRoutePrices(productId: number): Promise<ProductRoutePrice[]> {
    try {
      return await apiClient.get<ProductRoutePrice[]>(`${this.baseEndpoint}/product/${productId}`)
    } catch (error) {
      throw this.handleError(error, 'Error al obtener precios por ruta del producto')
    }
  }

  // Crear precio específico para un producto en una ruta
  async createProductRoutePrice(data: CreateProductRoutePriceRequest): Promise<ProductRoutePrice> {
    try {
      return await apiClient.post<ProductRoutePrice>(this.baseEndpoint, data)
    } catch (error) {
      throw this.handleError(error, 'Error al crear precio por ruta')
    }
  }

  // Actualizar precio específico por route_price_id
  async updateProductRoutePrice(routePriceId: number, data: UpdateProductRoutePriceRequest): Promise<ProductRoutePrice> {
    try {
      return await apiClient.put<ProductRoutePrice>(`${this.baseEndpoint}/${routePriceId}`, data)
    } catch (error) {
      throw this.handleError(error, 'Error al actualizar precio por ruta')
    }
  }

  // Eliminar precio específico de un producto para una ruta
  async deleteProductRoutePrice(productId: number, routeId: number): Promise<void> {
    try {
      await apiClient.delete<void>(`${this.baseEndpoint}/product/${productId}/route/${routeId}`)
    } catch (error) {
      throw this.handleError(error, 'Error al eliminar precio por ruta')
    }
  }

  // Obtener precio específico por route_price_id
  async getProductRoutePrice(routePriceId: number): Promise<ProductRoutePrice | null> {
    try {
      return await apiClient.get<ProductRoutePrice>(`${this.baseEndpoint}/${routePriceId}`)
    } catch (error) {
      // Si el precio no existe, retornar null en lugar de lanzar error
      if (error instanceof ApiError && error.status === 404) {
        return null
      }
      throw this.handleError(error, 'Error al obtener precio específico por ruta')
    }
  }

  // Obtener todos los precios por ruta (paginado)
  async getAllProductRoutePrices(skip = 0, limit = 100): Promise<ProductRoutePrice[]> {
    try {
      const queryParams = { skip: skip.toString(), limit: limit.toString() }
      return await apiClient.get<ProductRoutePrice[]>(this.baseEndpoint, queryParams)
    } catch (error) {
      throw this.handleError(error, 'Error al obtener todos los precios por ruta')
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
export const productRoutePricesService = new ProductRoutePricesService()
