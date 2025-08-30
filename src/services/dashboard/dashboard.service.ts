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
  SalesChartData
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
    return await apiClient.get<OrderSummary[]>(`/orders/?limit=${limit}`)
  }

  /**
   * Obtiene pedidos por status
   */
  async getOrdersByStatus(status: string): Promise<OrderSummary[]> {
    return await apiClient.get<OrderSummary[]>(`/orders/?status_filter=${status}`)
  }

  /**
   * Obtiene todos los pedidos (para calcular métricas)
   */
  async getAllOrders(): Promise<OrderSummary[]> {
    return await apiClient.get<OrderSummary[]>('/orders/')
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
      // Ejecutar todas las llamadas en paralelo
      const [
        invoiceSummary,
        inventorySummary,
        lowStockProducts,
        recentOrders,
        allOrders,
        products
      ] = await Promise.all([
        this.getInvoiceSummary(),
        this.getInventorySummary(),
        this.getLowStockProducts(),
        this.getRecentOrders(),
        this.getAllOrders(),
        this.getAllProducts()
      ])

      // Calcular métricas de pedidos
      const pendingOrders = allOrders.filter(o => o.status === 'pending').length
      const confirmedOrders = allOrders.filter(o => o.status === 'confirmed').length
      const deliveredOrders = allOrders.filter(o => o.status === 'delivered').length
      
      // Calcular pedidos de hoy
      const today = new Date().toISOString().split('T')[0]
      const todayOrders = allOrders.filter(o => 
        o.created_at.startsWith(today)
      ).length

      // Calcular valor promedio de pedido
      const totalRevenue = allOrders.reduce((sum, order) => sum + order.total_amount, 0)
      const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0

      // Calcular crecimiento (simulado por ahora)
      const monthlyGrowth = this.calculateGrowth(invoiceSummary.total_amount)
      const orderGrowth = this.calculateGrowth(allOrders.length)

      return {
        financial: {
          totalRevenue: invoiceSummary.total_amount,
          paidAmount: invoiceSummary.paid_amount,
          pendingAmount: invoiceSummary.pending_amount,
          overdueAmount: invoiceSummary.overdue_amount,
          overdueCount: invoiceSummary.overdue_count,
          monthlyGrowth
        },
        orders: {
          totalOrders: allOrders.length,
          pendingOrders,
          confirmedOrders, 
          deliveredOrders,
          todayOrders,
          averageOrderValue,
          orderGrowth
        },
        inventory: {
          totalEntries: inventorySummary.total_entries,
          pendingEntries: inventorySummary.pending_entries,
          completedToday: inventorySummary.completed_today,
          totalCost: inventorySummary.total_cost,
          lowStockCount: lowStockProducts.length,
          lowStockProducts
        },
        products: {
          totalActive: products.filter(p => p.is_active).length,
          lowStockCount: lowStockProducts.length,
          newThisMonth: 0 // Por ahora 0, se puede calcular después
        },
        recentActivity: {
          recentOrders,
          recentInvoices: [] // Se puede agregar después
        }
      }
    } catch (error) {
      console.error('Error obteniendo métricas del dashboard:', error)
      throw error
    }
  }

  /**
   * Obtiene datos para el gráfico de ventas (simulado por ahora)
   */
  async getSalesChartData(): Promise<SalesChartData[]> {
    // Por ahora retornamos datos simulados
    // En el futuro se puede crear un endpoint específico
    const months = [
      'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ]

    return months.map(month => ({
      month,
      sales: Math.floor(Math.random() * 50000) + 10000,
      orders: Math.floor(Math.random() * 100) + 10,
      revenue: Math.floor(Math.random() * 100000) + 20000
    }))
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
