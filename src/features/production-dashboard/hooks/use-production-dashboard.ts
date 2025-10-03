import { useState, useEffect, useCallback } from 'react'
import { productionService } from '@/services/production'
import { routesService } from '@/services/routes'
import type { 
  ProductionResponse, 
  ProductionQueryParams,
  ProductionData 
} from '@/services/production'
import type { Route } from '@/services/routes'

export function useProductionDashboard() {
  const [productionData, setProductionData] = useState<ProductionResponse | null>(null)
  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  })

  // Load available routes on mount
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setLoading(true)
        const routes = await routesService.getRoutes({ active_only: true })
        setAvailableRoutes(routes)
        
        // Set first route as default if available
        if (routes.length > 0 && !selectedRoute) {
          setSelectedRoute(routes[0].id)
        }
      } catch (err) {
        console.error('Error loading routes:', err)
        setError('Error al cargar las rutas disponibles')
      } finally {
        setLoading(false)
      }
    }

    loadRoutes()
  }, [])


  const loadProductionData = useCallback(async () => {
    if (!selectedRoute || !selectedDate) return

    try {
      setLoading(true)
      setError(null)
      
      const params: ProductionQueryParams = {
        route_id: selectedRoute,
        date: selectedDate
      }
      
      const data = await productionService.getProductionData(params)
      setProductionData(data)
    } catch (err) {
      console.error('Error loading production data:', err)
      setError('Error al cargar los datos de producción')
      setProductionData(null)
    } finally {
      setLoading(false)
    }
  }, [selectedRoute, selectedDate])

  // Load production data when route or date changes
  useEffect(() => {
    if (selectedRoute && selectedDate) {
      loadProductionData()
    }
  }, [selectedRoute, selectedDate, loadProductionData])

  const refetchData = useCallback(() => {
    loadProductionData()
  }, [loadProductionData])

  const exportData = useCallback(async () => {
    if (!selectedRoute || !selectedDate) return

    try {
      const params: ProductionQueryParams = {
        route_id: selectedRoute,
        date: selectedDate
      }
      
      const blob = await productionService.exportProductionData(params)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `produccion_${selectedDate}_ruta_${selectedRoute}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting data:', err)
      setError('Error al exportar los datos')
    }
  }, [selectedRoute, selectedDate])

  return {
    productionData,
    availableRoutes,
    loading,
    error,
    selectedRoute,
    selectedDate,
    setSelectedRoute,
    setSelectedDate,
    refetchData,
    exportData
  }
}
