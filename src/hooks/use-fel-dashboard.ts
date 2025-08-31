/**
 * Hook para Dashboard FEL
 * Maneja métricas, resúmenes y datos del dashboard de facturación
 */

import { useState, useEffect, useCallback } from 'react'
import { felService } from '@/services/fel'
import { toast } from 'sonner'
import type {
  FELStatusSummary,
  FiscalRevenueMetrics,
  OrderWithInvoiceInfo,
  FELInvoice
} from '@/services/fel/types'

interface FELDashboardState {
  summary: FELStatusSummary | null
  revenue: FiscalRevenueMetrics | null
  ordersWithoutDocument: OrderWithInvoiceInfo[]
  failedFELInvoices: FELInvoice[]
  isLoading: boolean
  error: string | null
  lastUpdated: Date | null
}

export function useFELDashboard(autoRefreshInterval = 60000) { // 1 minuto por defecto
  const [state, setState] = useState<FELDashboardState>({
    summary: null,
    revenue: null,
    ordersWithoutDocument: [],
    failedFELInvoices: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  })

  /**
   * Carga todos los datos del dashboard
   */
  const loadDashboardData = useCallback(async (showToast = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      // Ejecutar todas las llamadas en paralelo
      const [
        summaryData,
        revenueData,
        ordersData,
        failedInvoicesData
      ] = await Promise.all([
        felService.getFELStatusSummary(),
        felService.getFiscalRevenueMetrics('month'),
        felService.getOrdersWithoutDocument(),
        felService.getFailedFELInvoices()
      ])

      setState({
        summary: summaryData,
        revenue: revenueData,
        ordersWithoutDocument: ordersData,
        failedFELInvoices: failedInvoicesData,
        isLoading: false,
        error: null,
        lastUpdated: new Date()
      })

      if (showToast) {
        toast.success('Dashboard FEL actualizado')
      }

    } catch (error) {
      console.error('Error cargando dashboard FEL:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error cargando datos'
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))

      toast.error('Error cargando dashboard', {
        description: errorMessage
      })
    }
  }, [])

  /**
   * Refresca manualmente el dashboard
   */
  const refreshDashboard = useCallback(async () => {
    await loadDashboardData(true)
  }, [loadDashboardData])

  /**
   * Carga inicial del dashboard
   */
  useEffect(() => {
    loadDashboardData()
  }, [loadDashboardData])

  /**
   * Auto-refresh del dashboard
   */
  useEffect(() => {
    if (autoRefreshInterval <= 0) return

    const interval = setInterval(() => {
      loadDashboardData()
    }, autoRefreshInterval)

    return () => clearInterval(interval)
  }, [loadDashboardData, autoRefreshInterval])

  // ========================================
  // MÉTRICAS COMPUTADAS
  // ========================================

  /**
   * Tasa de éxito FEL
   */
  const felSuccessRate = state.summary ? 
    felService.calculateFELSuccessRate(state.summary) : 0

  /**
   * Error FEL más común
   */
  const mostCommonError = state.summary ? 
    felService.getMostCommonFELError(state.summary) : 'Sin datos'

  /**
   * Porcentaje de ingresos fiscales
   */
  const fiscalRevenuePercentage = state.revenue ? 
    Math.round((state.revenue.fiscal_revenue / state.revenue.total_revenue) * 100) : 0

  /**
   * Órdenes que requieren atención
   */
  const ordersNeedingAttention = state.ordersWithoutDocument.length + state.failedFELInvoices.length

  /**
   * Indicador de salud del sistema FEL
   */
  const systemHealthIndicator: 'excellent' | 'good' | 'warning' | 'critical' = (() => {
    if (!state.summary) return 'warning'
    
    const successRate = felSuccessRate
    const failedCount = state.summary.fel_failed
    
    if (successRate >= 95 && failedCount <= 2) return 'excellent'
    if (successRate >= 85 && failedCount <= 5) return 'good'  
    if (successRate >= 70 && failedCount <= 10) return 'warning'
    return 'critical'
  })()

  /**
   * Alertas del sistema
   */
  const systemAlerts = (() => {
    const alerts: Array<{ type: 'info' | 'warning' | 'error'; message: string }> = []

    if (state.failedFELInvoices.length > 0) {
      alerts.push({
        type: 'error',
        message: `${state.failedFELInvoices.length} facturas FEL fallaron y necesitan atención`
      })
    }

    if (state.ordersWithoutDocument.length > 5) {
      alerts.push({
        type: 'warning',
        message: `${state.ordersWithoutDocument.length} órdenes entregadas sin documento`
      })
    }

    if (felSuccessRate < 80) {
      alerts.push({
        type: 'warning',
        message: `Tasa de éxito FEL baja (${felSuccessRate}%)`
      })
    }

    if (state.revenue && state.revenue.fiscal_percentage < 50) {
      alerts.push({
        type: 'info',
        message: `Solo ${state.revenue.fiscal_percentage}% de ingresos son fiscales`
      })
    }

    return alerts
  })()

  /**
   * Datos para gráfico de ingresos
   */
  const revenueChartData = state.revenue?.monthly_breakdown?.map(item => ({
    month: item.month,
    fiscal: item.fiscal_revenue,
    total: item.total_revenue,
    fiscalCount: item.fiscal_count,
    totalCount: item.total_count
  })) || []

  /**
   * Resumen de métricas clave
   */
  const keyMetrics = {
    totalInvoices: state.summary?.total_invoices || 0,
    felInvoices: state.summary?.fel_invoices || 0,
    felAuthorized: state.summary?.fel_authorized || 0,
    felFailed: state.summary?.fel_failed || 0,
    felPending: state.summary?.fel_pending || 0,
    
    fiscalRevenue: state.revenue?.fiscal_revenue || 0,
    totalRevenue: state.revenue?.total_revenue || 0,
    
    ordersWithoutDoc: state.ordersWithoutDocument.length,
    failedToRetry: state.failedFELInvoices.length,
    
    successRate: felSuccessRate,
    fiscalPercentage: fiscalRevenuePercentage,
    systemHealth: systemHealthIndicator
  }

  return {
    // Estado base
    ...state,
    
    // Acciones
    refreshDashboard,
    loadDashboard: loadDashboardData,
    
    // Métricas computadas
    keyMetrics,
    systemAlerts,
    revenueChartData,
    felSuccessRate,
    mostCommonError,
    fiscalRevenuePercentage,
    ordersNeedingAttention,
    systemHealthIndicator,
    
    // Helpers
    formatCurrency: felService.formatCurrency,
    formatDate: felService.formatDate,
    formatFELUUID: felService.formatFELUUID,
    
    // Estado computado
    hasData: state.summary !== null,
    hasAlerts: systemAlerts.length > 0,
    isHealthy: systemHealthIndicator === 'excellent' || systemHealthIndicator === 'good'
  }
}

