/**
 * Hook para obtener distribución de órdenes por estado
 */

import { useState, useEffect } from 'react'
import { dashboardService } from '@/services/dashboard'
import type { StatusDistributionResponse, StatusDistributionFilters } from '@/services/dashboard/types'

interface UseOrderStatusDistributionOptions {
  filters?: StatusDistributionFilters
  enabled?: boolean
}

export function useOrderStatusDistribution(options: UseOrderStatusDistributionOptions = {}) {
  const { filters, enabled = true } = options
  
  const [data, setData] = useState<StatusDistributionResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await dashboardService.getOrderStatusDistribution(filters)
      setData(result)
    } catch (err) {
      console.error('Error loading order status distribution:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [enabled, filters?.year, filters?.month])

  return {
    data,
    isLoading,
    error,
    refetch: loadData,
    // Computed values
    totalOrders: data?.total_orders || 0,
    periodName: data?.period_name || '',
    statusData: data?.status_data || [],
    hasData: data?.status_data && data.status_data.length > 0,
  }
}

/**
 * Hook específico para obtener distribución del mes actual
 */
export function useCurrentMonthStatusDistribution() {
  return useOrderStatusDistribution({
    // Sin filtros = mes y año actual
    filters: undefined
  })
}

/**
 * Hook para obtener distribución de un mes específico
 */
export function useMonthStatusDistribution(year: number, month: number) {
  return useOrderStatusDistribution({
    filters: { year, month }
  })
}
