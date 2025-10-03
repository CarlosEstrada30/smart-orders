import { apiClient } from '../api/client'

export interface ProductionData {
  id: number
  name: string
  sku: string
  stock: number
  total_comprometidos: number
  total_a_producir: number
}

export interface ProductionSummary {
  total_products: number
  products_needing_production: number
}

export interface RouteInfo {
  route_id: number
  route_name: string
  date: string
}

export interface ProductionQueryParams {
  route_id: number
  date: string // YYYY-MM-DD format
}

export interface ProductionResponse {
  route_info: RouteInfo
  production_summary: ProductionSummary
  products: ProductionData[]
}

class ProductionService {
  /**
   * Obtiene los datos de producción para una ruta y fecha específica
   */
  async getProductionData(params: ProductionQueryParams): Promise<ProductionResponse> {
    
    const response = await apiClient.get<ProductionResponse>('/production/dashboard', {
      route_id: params.route_id.toString(),
      date: params.date
    })
  
    return response
  }

  /**
   * Obtiene las rutas disponibles para el dashboard de producción
   * TODO: Implement backend endpoint /production/routes
   */
  async getAvailableRoutes(): Promise<Array<{id: number, name: string}>> {
    return apiClient.get<Array<{id: number, name: string}>>('/production/routes')
  }

  /**
   * Obtiene el historial de producción para un producto específico
   */
  async getProductProductionHistory(productId: number, days: number = 30): Promise<Array<{
    date: string
    total_stock: number
    committed_stock: number
    available_stock: number
    production_needed: number
  }>> {
    return apiClient.get<Array<{
      date: string
      total_stock: number
      committed_stock: number
      available_stock: number
      production_needed: number
    }>>(`/production/history/${productId}`, {
      params: { days }
    })
  }

  /**
   * Obtiene alertas de producción (productos que necesitan atención)
   * TODO: Implement backend endpoint /production/alerts
   */
  async getProductionAlerts(): Promise<Array<{
    product_id: number
    product_name: string
    product_sku: string
    route_name: string
    status: 'critical' | 'insufficient'
    production_needed: number
    days_until_shortage: number
  }>> {
    return apiClient.get<Array<{
      product_id: number
      product_name: string
      product_sku: string
      route_name: string
      status: 'critical' | 'insufficient'
      production_needed: number
      days_until_shortage: number
    }>>('/production/alerts')
  }

  /**
   * Exporta los datos de producción a Excel
   */
  async exportProductionData(params: ProductionQueryParams): Promise<Blob> {
    const response = await apiClient.get('/production/export', {
      params: {
        route_id: params.route_id,
        date: params.date
      },
      responseType: 'blob'
    })
    return response
  }
}

export const productionService = new ProductionService()
