/**
 * Dashboard Service
 * Servicio para obtener métricas del dashboard usando endpoints existentes
 */

import { apiClient } from '@/services/api/client'
import type { 
  DashboardMetrics, 
  InvoiceSummary, 
  InventoryEntrySummary, 
  LowStockProduct,
  OrderSummary,
  DashboardFilters,
  SalesChartData,
  MonthlyAnalyticsResponse,
  AnalyticsFilters,
  DeliveredOrdersMetrics,
  StatusDistributionResponse,
  StatusDistributionFilters
} from './types'

class DashboardService {
  /**
   * Obtiene resumen de facturas
   */
  async getInvoiceSummary(): Promise<InvoiceSummary> {
    return await apiClient.get<InvoiceSummary>('/invoices/summary')
  }

  /**
   * Obtiene resumen de inventario
   */
  async getInventorySummary(): Promise<InventoryEntrySummary> {
    return await apiClient.get<InventoryEntrySummary>('/inventory/entries/summary')
  }

  /**
   * Obtiene productos con stock bajo
   */
  async getLowStockProducts(threshold: number = 10): Promise<LowStockProduct[]> {
    return await apiClient.get<LowStockProduct[]>(`/products/low-stock?threshold=${threshold}`)
  }

  /**
   * Obtiene pedidos recientes
   */
  async getRecentOrders(limit: number = 5): Promise<OrderSummary[]> {
    try {
      const response = await apiClient.get<any>(`/orders/?limit=${limit}`)
      
      // Verificar si la respuesta usa la nueva estructura con items y pagination
      if (response && response.items && Array.isArray(response.items)) {
        return response.items
      } else if (Array.isArray(response)) {
        // Formato legacy: array directo
        return response
      } else if (response && response.data && Array.isArray(response.data)) {
        // Formato legacy: objeto con data
        return response.data
      } else {
        // Fallback seguro
        console.warn('Estructura de respuesta inesperada en getRecentOrders:', response)
        return []
      }
    } catch (error) {
      console.error('Error obteniendo órdenes recientes:', error)
      return []
    }
  }

  /**
   * Obtiene pedidos por status
   */
  async getOrdersByStatus(status: string): Promise<OrderSummary[]> {
    try {
      const response = await apiClient.get<any>(`/orders/?status_filter=${status}`)
      
      // Verificar si la respuesta usa la nueva estructura con items y pagination
      if (response && response.items && Array.isArray(response.items)) {
        return response.items
      } else if (Array.isArray(response)) {
        // Formato legacy: array directo
        return response
      } else if (response && response.data && Array.isArray(response.data)) {
        // Formato legacy: objeto con data
        return response.data
      } else {
        // Fallback seguro
        console.warn('Estructura de respuesta inesperada en getOrdersByStatus:', response)
        return []
      }
    } catch (error) {
      console.error('Error obteniendo órdenes por status:', error)
      return []
    }
  }

  /**
   * Obtiene todos los pedidos (para calcular métricas)
   */
  async getAllOrders(): Promise<OrderSummary[]> {
    try {
      const response = await apiClient.get<any>('/orders/')
      
      // Verificar si la respuesta usa la nueva estructura con items y pagination
      if (response && response.items && Array.isArray(response.items)) {
        return response.items
      } else if (Array.isArray(response)) {
        // Formato legacy: array directo
        return response
      } else if (response && response.data && Array.isArray(response.data)) {
        // Formato legacy: objeto con data
        return response.data
      } else {
        // Fallback seguro
        console.warn('Estructura de respuesta inesperada en getAllOrders:', response)
        return []
      }
    } catch (error) {
      console.error('Error obteniendo todas las órdenes:', error)
      return []
    }
  }

  /**
   * Obtiene todos los productos
   */
  async getAllProducts(): Promise<any[]> {
    return await apiClient.get<any[]>('/products/')
  }

  /**
   * Calcula métricas del dashboard combinando múltiples endpoints
   */
  async getDashboardMetrics(filters?: DashboardFilters): Promise<DashboardMetrics> {
    try {
      // Ejecutar todas las llamadas en paralelo con manejo de errores individual
      const [
        invoiceSummary,
        inventorySummary,
        lowStockProducts,
        recentOrders,
        allOrders,
        products
      ] = await Promise.allSettled([
        this.getInvoiceSummary(),
        this.getInventorySummary(),
        this.getLowStockProducts(),
        this.getRecentOrders(),
        this.getAllOrders(),
        this.getAllProducts()
      ])

      // Extraer valores con fallbacks seguros
      const invoiceData = invoiceSummary.status === 'fulfilled' ? invoiceSummary.value : {
        total_invoices: 0, total_amount: 0, paid_amount: 0, pending_amount: 0, overdue_count: 0, overdue_amount: 0
      }
      
      const inventoryData = inventorySummary.status === 'fulfilled' ? inventorySummary.value : {
        total_entries: 0, pending_entries: 0, completed_today: 0, total_cost: 0
      }
      
      const lowStockData = lowStockProducts.status === 'fulfilled' ? lowStockProducts.value || [] : []
      const recentOrdersData = recentOrders.status === 'fulfilled' ? recentOrders.value || [] : []
      const allOrdersData = allOrders.status === 'fulfilled' ? allOrders.value || [] : []
      const productsData = products.status === 'fulfilled' ? products.value || [] : []

      // Asegurar que son arrays antes de usar métodos de array
      const ordersArray = Array.isArray(allOrdersData) ? allOrdersData : []
      const productsArray = Array.isArray(productsData) ? productsData : []
      const lowStockArray = Array.isArray(lowStockData) ? lowStockData : []
      const recentOrdersArray = Array.isArray(recentOrdersData) ? recentOrdersData : []

      // Calcular métricas de pedidos
      const pendingOrders = ordersArray.filter(o => o.status === 'pending').length
      const confirmedOrders = ordersArray.filter(o => o.status === 'confirmed').length
      const deliveredOrders = ordersArray.filter(o => o.status === 'delivered').length
      
      // Calcular pedidos de hoy
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = ordersArray.filter(o => 
        o.created_at && o.created_at.startsWith(today)
      ).length
      
      // Simplificar: solo usar cálculo local para evitar llamadas API extra
      const currentMonthByStatus = {
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      }
      const currentMonthTotal = 0 // Se puede calcular localmente si es necesario

      // Calcular ingresos usando solo datos locales de órdenes (sin llamadas API extra)
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1 // 0-11 -> 1-12
      
      // Filtrar órdenes del mes actual
      const currentMonthOrders = ordersArray.filter(order => {
        if (!order.created_at || order.status !== 'delivered') return false
        const orderDate = new Date(order.created_at)
        return orderDate.getFullYear() === currentYear && 
               (orderDate.getMonth() + 1) === currentMonth
      })
      
      const totalRevenue = currentMonthOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const currentMonthDelivered = currentMonthOrders.length
      const averageOrderValue = ordersArray.length > 0 ? totalRevenue / ordersArray.length : 0
      
      // Cálculo simple de crecimiento (simulado)
      const monthlyGrowth = this.calculateGrowth(totalRevenue)
      
      const orderGrowth = this.calculateGrowth(ordersArray.length)

      return {
        financial: {
          totalRevenue: totalRevenue, // Ahora viene de órdenes entregadas del mes
          paidAmount: totalRevenue, // Consideramos todas las órdenes entregadas como "pagadas"
          pendingAmount: 0, // No usamos facturas pendientes
          overdueAmount: 0, // No usamos facturas vencidas
          overdueCount: 0, // No contamos facturas vencidas
          monthlyGrowth,
          currentMonthDelivered // Número de órdenes entregadas del mes actual
        },
        orders: {
          totalOrders: ordersArray.length,
          pendingOrders,
          confirmedOrders, 
          deliveredOrders,
          todayOrders,
          averageOrderValue,
          orderGrowth,
          // Simplificado: no necesitamos estos datos para el nuevo card
          currentMonthByStatus,
          currentMonthTotal
        },
        inventory: {
          totalEntries: inventoryData.total_entries,
          pendingEntries: inventoryData.pending_entries,
          completedToday: inventoryData.completed_today,
          totalCost: inventoryData.total_cost,
          lowStockCount: lowStockArray.length,
          lowStockProducts: lowStockArray
        },
        products: {
          totalActive: productsArray.filter(p => p.is_active).length,
          lowStockCount: lowStockArray.length,
          newThisMonth: 0 // Por ahora 0, se puede calcular después
        },
        recentActivity: {
          recentOrders: recentOrdersArray,
          recentInvoices: [] // Se puede agregar después
        }
      }
    } catch (error) {
      console.error('Error obteniendo métricas del dashboard:', error)
      throw error
    }
  }

  // Método comentado - ya no se usa para evitar llamadas API duplicadas
  // async getDeliveredOrdersMetrics(): Promise<DeliveredOrdersMetrics> { ... }

  // Método comentado - ya no se usa para evitar llamadas API duplicadas  
  // async getOrderStatusDistribution(filters?: StatusDistributionFilters): Promise<StatusDistributionResponse> { ... }

  /**
   * NOTA: Este método solo debe ser usado por la gráfica Overview
   * El dashboard principal NO debe usarlo para evitar llamadas duplicadas
   */
  async getMonthlyAnalytics(filters?: Omit<AnalyticsFilters, 'status_filter'>): Promise<MonthlyAnalyticsResponse> {
    console.warn('getMonthlyAnalytics llamado - verificar que no sea duplicado')
    try {
      const queryParams = new URLSearchParams({
        status_filter: 'delivered'
      })
      
      if (filters?.year) queryParams.append('year', filters.year.toString())
      if (filters?.start_date) queryParams.append('start_date', filters.start_date)
      if (filters?.end_date) queryParams.append('end_date', filters.end_date)
      
      return await apiClient.get<MonthlyAnalyticsResponse>(
        `/orders/analytics/monthly-summary?${queryParams.toString()}`
      )
    } catch (error) {
      console.error('Error obteniendo analytics mensual:', error)
      throw error
    }
  }

  /**
   * Obtiene datos para el gráfico de ventas desde el nuevo endpoint
   */
  async getSalesChartData(filters?: Omit<AnalyticsFilters, 'status_filter'>): Promise<SalesChartData[]> {
    try {
      // Construir parámetros de la query
      const queryParams = new URLSearchParams({
        status_filter: 'delivered' // Siempre filtrar por órdenes entregadas
      })
      
      // Agregar filtros opcionales
      if (filters?.year) {
        queryParams.append('year', filters.year.toString())
      }
      if (filters?.start_date) {
        queryParams.append('start_date', filters.start_date)
      }
      if (filters?.end_date) {
        queryParams.append('end_date', filters.end_date)
      }
      
      // Llamar al nuevo endpoint
      const response = await apiClient.get<MonthlyAnalyticsResponse>(
        `/orders/analytics/monthly-summary?${queryParams.toString()}`
      )
      
      // Crear array base con todos los 12 meses (nombres completos para el backend)
      const allMonths = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
      
      // Nombres cortos para la visualización
      const shortMonths = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ]
      
      // Crear un mapa de los datos del backend por mes
      const dataByMonth = new Map<string, { total_amount: number, order_count: number }>()
      response.monthly_data.forEach(item => {
        dataByMonth.set(item.month_name, {
          total_amount: item.total_amount,
          order_count: item.order_count
        })
      })
      
      // Crear el array final con todos los meses, llenando con 0 los faltantes
      return allMonths.map((monthName, index) => {
        const data = dataByMonth.get(monthName) || { total_amount: 0, order_count: 0 }
        return {
          month: shortMonths[index], // Usar nombre corto para visualización
          sales: data.total_amount,
          orders: data.order_count,
          revenue: data.total_amount // Mantenemos compatibilidad
        }
      })
      
    } catch (error) {
      console.error('Error obteniendo datos del gráfico de ventas:', error)
      
      // Si hay error, retornar datos por defecto con todos los meses (nombres cortos)
      const fallbackMonths = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
      ]
      
      return fallbackMonths.map(monthName => ({
        month: monthName,
        sales: 0,
        orders: 0,
        revenue: 0
      }))
    }
  }

  /**
   * Refresca la caché del dashboard
   */
  async refreshDashboard(): Promise<DashboardMetrics> {
    // Limpiar cualquier caché si existe
    return await this.getDashboardMetrics()
  }

  /**
   * Calcula el crecimiento porcentual (simulado)
   * En el futuro se podría comparar con datos del período anterior
   */
  private calculateGrowth(currentValue: number): number {
    // Por ahora retornamos un valor simulado basado en el valor actual
    // En el futuro se podría comparar con datos históricos
    return Math.round((Math.random() * 30 - 5) * 100) / 100 // Entre -5% y +25%
  }

  /**
   * Formatea números para mostrar en el dashboard
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount)
  }

  /**
   * Formatea porcentajes
   */
  formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value}%`
  }

  /**
   * Formatea números grandes
   */
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value.toString()
  }
}

export const dashboardService = new DashboardService()
