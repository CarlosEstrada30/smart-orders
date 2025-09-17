/**
 * Hook para manejar analytics mensuales con filtros
 */

import { useState, useEffect } from 'react'
import { dashboardService } from '@/services/dashboard'
import type { MonthlyAnalyticsResponse, AnalyticsFilters } from '@/services/dashboard/types'

interface UseMonthlyAnalyticsOptions {
  filters?: Omit<AnalyticsFilters, 'status_filter'>
  enabled?: boolean
}

export function useMonthlyAnalytics(options: UseMonthlyAnalyticsOptions = {}) {
  const { filters, enabled = true } = options
  
  const [data, setData] = useState<MonthlyAnalyticsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    if (!enabled) return

    try {
      setIsLoading(true)
      setError(null)
      
      const result = await dashboardService.getMonthlyAnalytics(filters)
      setData(result)
    } catch (err) {
      console.error('Error loading monthly analytics:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [enabled, filters?.year, filters?.start_date, filters?.end_date])

  return {
    data,
    isLoading,
    error,
    refetch: loadData,
    // Computed values
    totalRevenue: data?.total_amount || 0,
    totalOrders: data?.total_orders || 0,
    averageOrderValue: data && data.total_orders > 0 
      ? data.total_amount / data.total_orders 
      : 0,
    monthsWithData: data?.monthly_data?.length || 0,
    hasData: data?.monthly_data && data.monthly_data.length > 0,
  }
}

/**
 * Hook específico para obtener datos de ventas del año actual
 */
export function useCurrentYearSales() {
  const currentYear = new Date().getFullYear()
  
  return useMonthlyAnalytics({
    filters: { year: currentYear }
  })
}

/**
 * Hook para comparar años
 */
export function useYearComparison(currentYear: number, previousYear: number) {
  const currentYearData = useMonthlyAnalytics({ 
    filters: { year: currentYear } 
  })
  
  const previousYearData = useMonthlyAnalytics({ 
    filters: { year: previousYear } 
  })

  const growthRate = currentYearData.totalRevenue && previousYearData.totalRevenue
    ? ((currentYearData.totalRevenue - previousYearData.totalRevenue) / previousYearData.totalRevenue) * 100
    : 0

  return {
    current: currentYearData,
    previous: previousYearData,
    growthRate,
    isLoading: currentYearData.isLoading || previousYearData.isLoading,
    hasError: !!currentYearData.error || !!previousYearData.error,
  }
}

