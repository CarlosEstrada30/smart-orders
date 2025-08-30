/**
 * Hook para Dashboard
 * Maneja el estado y datos del dashboard
 */

import { useState, useEffect, useCallback } from 'react'
import { dashboardService } from '@/services/dashboard'
import type { DashboardMetrics, DashboardState, DashboardFilters } from '@/services/dashboard/types'
import { toast } from 'sonner'

// Configuración del auto-refresh
const AUTO_REFRESH_INTERVAL = 1 * 60 * 1000 // 1 minuto en milisegundos

// Función para obtener el texto del intervalo de refresh
const getRefreshIntervalText = (intervalMs: number): string => {
  const minutes = intervalMs / (60 * 1000)
  if (minutes < 1) {
    const seconds = intervalMs / 1000
    return `${seconds} segundo${seconds !== 1 ? 's' : ''}`
  }
  return `${minutes} minuto${minutes !== 1 ? 's' : ''}`
}

export function useDashboard(filters?: DashboardFilters) {
  const [state, setState] = useState<DashboardState>({
    metrics: undefined,
    isLoading: false,
    error: undefined,
    lastUpdated: undefined
  })

  /**
   * Carga las métricas del dashboard
   */
  const loadDashboardMetrics = useCallback(async (showToast = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }))
    
    try {
      const metrics = await dashboardService.getDashboardMetrics(filters)
      setState({
        metrics,
        isLoading: false,
        error: undefined,
        lastUpdated: new Date()
      })
      
      if (showToast) {
        toast.success('Dashboard actualizado correctamente')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cargando dashboard'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      
      toast.error(`Error: ${errorMessage}`)
      console.error('Error cargando dashboard:', error)
    }
  }, [filters])

  /**
   * Refresca el dashboard manualmente
   */
  const refreshDashboard = useCallback(async () => {
    await loadDashboardMetrics(true)
  }, [loadDashboardMetrics])

  /**
   * Carga inicial del dashboard
   */
  useEffect(() => {
    loadDashboardMetrics()
  }, [loadDashboardMetrics])

  /**
   * Auto-refresh cada minuto
   */
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardMetrics()
    }, AUTO_REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [loadDashboardMetrics])

  return {
    // Estado
    metrics: state.metrics,
    isLoading: state.isLoading,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Acciones
    refreshDashboard,
    loadDashboard: loadDashboardMetrics,
    
    // Funciones de utilidad
    formatCurrency: dashboardService.formatCurrency.bind(dashboardService),
    formatPercentage: dashboardService.formatPercentage.bind(dashboardService),
    formatNumber: dashboardService.formatNumber.bind(dashboardService),
    getRefreshIntervalText: () => getRefreshIntervalText(AUTO_REFRESH_INTERVAL)
  }
}

/**
 * Hook específico para métricas financieras
 */
export function useFinancialMetrics() {
  const { metrics, isLoading, error } = useDashboard()
  
  return {
    financial: metrics?.financial,
    isLoading,
    error
  }
}

/**
 * Hook específico para métricas de pedidos
 */
export function useOrdersMetrics() {
  const { metrics, isLoading, error } = useDashboard()
  
  return {
    orders: metrics?.orders,
    isLoading,
    error
  }
}

/**
 * Hook específico para métricas de inventario
 */
export function useInventoryMetrics() {
  const { metrics, isLoading, error } = useDashboard()
  
  return {
    inventory: metrics?.inventory,
    isLoading,
    error
  }
}

/**
 * Hook específico para actividad reciente
 */
export function useRecentActivity() {
  const { metrics, isLoading, error } = useDashboard()
  
  return {
    recentActivity: metrics?.recentActivity,
    isLoading,
    error
  }
}
