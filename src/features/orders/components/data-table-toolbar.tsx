import React, { useState, useCallback, useEffect, memo, useRef } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Eye, Route, X, Info } from 'lucide-react'
import { orderStatuses } from '../data/data'
import { DataTableDateFilter } from './data-table-date-filter'
import type { OrdersQueryParams } from '@/services/orders'
import { ordersService } from '@/services/orders'
import { RoutesService } from '@/services/routes'
import { toast } from 'sonner'
import { ModernPDFViewer } from '@/components/pdf-viewer'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  onFiltersChange: (filters: Partial<OrdersQueryParams>) => void
  filters: OrdersQueryParams
}

const DataTableToolbarComponent = <TData,>({
  table,
  onFiltersChange,
  filters,
}: DataTableToolbarProps<TData>) => {
  // Instancia del servicio de rutas
  const routesService = new RoutesService()
  
  // Estado para todas las rutas (independiente de los datos filtrados)
  const [allRoutes, setAllRoutes] = useState<{ value: string; label: string; icon: any }[]>([])
  
  // Verificar si hay filtros activos basándose en el estado del backend
  const isFiltered = Boolean(
    filters.search || 
    filters.status_filter || 
    filters.payment_status_filter ||
    filters.route_id || 
    filters.date_from || 
    filters.date_to
  )
  
  // Función helper para parsear fechas desde el backend (formato YYYY-MM-DD)
  const parseDateFromBackend = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day) // month - 1 porque Date usa 0-indexado
  }

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | null>(
    filters.date_from && filters.date_to 
      ? { from: parseDateFromBackend(filters.date_from), to: parseDateFromBackend(filters.date_to) }
      : null
  )
  
  // Estado local para el input de búsqueda (para evitar perder el foco)
  const [localSearch, setLocalSearch] = useState(() => filters.search || '')
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const isInitialMount = useRef(true)
  
  // Debounce para la búsqueda (evita llamadas excesivas al backend)
  useEffect(() => {
    // No ejecutar en el primer render
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    
    // Solo ejecutar si hay una diferencia real
    const normalizedLocal = localSearch.trim() || undefined
    const normalizedFilter = filters.search || undefined
    
    if (normalizedLocal === normalizedFilter) return
    
    const timeoutId = setTimeout(() => {
      onFiltersChange({ search: normalizedLocal })
    }, 500)
    
    // Cleanup crítico - limpiar timeout al desmontar o cambiar
    return () => {
      clearTimeout(timeoutId)
    }
  }, [localSearch, onFiltersChange]) // Incluir onFiltersChange para estabilidad
  
  // Cargar todas las rutas al montar el componente
  useEffect(() => {
    const loadAllRoutes = async () => {
      try {
        const routes = await routesService.getRoutes({ active_only: true })
        const formattedRoutes = routes.map(route => ({
          value: route.id.toString(),
          label: route.name,
          icon: Route,
        }))
        
        // Agregar opción para órdenes sin ruta
        formattedRoutes.push({
          value: 'null',
          label: 'Sin ruta asignada',
          icon: X,
        })
        
        setAllRoutes(formattedRoutes)
      } catch (error) {
        console.error('Error al cargar rutas:', error)
        toast.error('Error al cargar las rutas')
      }
    }
    
    loadAllRoutes()
  }, [])
  
  // Cleanup effect al desmontar el componente
  useEffect(() => {
    return () => {
      // Limpiar cualquier timeout pendiente
      isInitialMount.current = true
    }
  }, [])
  
  // Sincronizar estado local SOLO cuando los filtros cambien externamente
  useEffect(() => {
    const externalSearch = filters.search || ''
    if (externalSearch !== localSearch) {
      setLocalSearch(externalSearch)
    }
  }, [filters.search]) // No incluir localSearch aquí para evitar loops
  
  // Obtener rutas únicas de los datos
  
  // Información sobre los filtros activos
  const filtersCount = [
    filters.search,
    filters.status_filter,
    filters.payment_status_filter,
    filters.route_id,
    filters.date_from,
    filters.date_to
  ].filter(Boolean).length

  // Handlers para cambios de filtros
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value) // Solo actualizar estado local, el debounce se encarga del resto
  }, [])

  const handleStatusChange = useCallback((values: string[]) => {
    onFiltersChange({ status_filter: values[0] || undefined })
  }, [onFiltersChange])

  const handleRouteChange = useCallback((values: string[]) => {
    const routeId = values[0] ? parseInt(values[0]) : undefined
    onFiltersChange({ route_id: routeId })
  }, [onFiltersChange])

  const handlePaymentStatusChange = useCallback((value: string) => {
    onFiltersChange({ 
      payment_status_filter: value ? (value as 'unpaid' | 'partial' | 'paid') : undefined 
    })
  }, [onFiltersChange])

  // Función helper para formatear fechas localmente
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDateRangeChange = useCallback((range: { from?: Date; to?: Date } | null) => {
    setDateRange(range)
    onFiltersChange({
      date_from: range?.from ? formatLocalDate(range.from) : undefined,
      date_to: range?.to ? formatLocalDate(range.to) : undefined
    })
  }, [onFiltersChange])

  const handleClearFilters = useCallback(() => {
    setDateRange(null)
    setLocalSearch('') // Limpiar estado local también
    onFiltersChange({
      search: undefined,
      status_filter: undefined,
      payment_status_filter: undefined,
      route_id: undefined,
      date_from: undefined,
      date_to: undefined
    })
  }, [onFiltersChange])

  const handlePreviewReport = useCallback(async () => {
    try {
      setIsLoadingPreview(true)
      
      // Preparar parámetros para el reporte (excluyendo skip, limit y payment_status_filter)
      // El filtro de pagos NO se incluye en el reporte
      const reportParams: OrdersQueryParams = {
        status_filter: filters.status_filter,
        route_id: filters.route_id,
        date_from: filters.date_from,
        date_to: filters.date_to,
        search: filters.search
      }
      
      const url = await ordersService.getOrdersReportPreviewBlob(reportParams)
      setPdfUrl(url)
      setPdfViewerOpen(true)
      toast.success('Abriendo vista previa del reporte')
    } catch (_error) {
      toast.error('Error al generar vista previa del reporte')
    } finally {
      setIsLoadingPreview(false)
    }
  }, [filters])

  const handleClosePdfViewer = useCallback(() => {
    setPdfViewerOpen(false)
    // Cleanup del blob URL
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
  }, [pdfUrl])


  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
      <div className='flex flex-1 flex-col gap-4'>
        {/* Search input */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            placeholder='Buscar órdenes...'
            value={localSearch}
            onChange={(event) => handleSearchChange(event.target.value)}
            className='h-8 w-full sm:w-[200px] lg:w-[300px]'
          />
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={handleClearFilters}
              className='h-8 px-2 lg:px-3 w-fit'
            >
              Limpiar {filtersCount > 0 && `(${filtersCount})`}
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
        
        {/* Filters row */}
        <div className='flex flex-wrap gap-2'>
          {/* Status Filter */}
          <select
            value={filters.status_filter || ''}
            onChange={(e) => handleStatusChange([e.target.value])}
            className="h-8 min-w-[140px] rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="">Todos los estados</option>
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          
          {/* Route Filter */}
          {allRoutes.length > 0 && (
            <select
              value={filters.route_id?.toString() || ''}
              onChange={(e) => handleRouteChange([e.target.value])}
              className="h-8 min-w-[140px] rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Todas las rutas</option>
              {allRoutes.map((route) => (
                <option key={route.value} value={route.value}>
                  {route.label}
                </option>
              ))}
            </select>
          )}
          
          {/* Date Filter */}
          <DataTableDateFilter
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
          
          {/* Payment Status Filter - Solo para visualización */}
          <div className='flex items-center gap-1'>
            <select
              value={filters.payment_status_filter || ''}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              className="h-8 min-w-[160px] rounded-md border border-input bg-background text-foreground px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Todos los pagos</option>
              <option value="unpaid">Sin Pagar</option>
              <option value="partial">Pago Parcial</option>
              <option value="paid">Pagado</option>
            </select>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='inline-flex items-center cursor-help'>
                  <Info className='h-4 w-4 text-muted-foreground' />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className='max-w-xs'>
                  Este filtro solo afecta la visualización de la tabla.<br />
                  No se incluye en la generación del reporte PDF.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className='flex items-center gap-x-2 lg:flex-shrink-0'>
        <Button
          variant='outline'
          onClick={handlePreviewReport}
          disabled={isLoadingPreview}
          className='h-8 px-3'
        >
          <Eye className='mr-2 h-4 w-4' />
          {isLoadingPreview ? 'Cargando...' : 'Ver Reporte'}
        </Button>
      </div>

      <ModernPDFViewer
        pdfUrl={pdfUrl}
        title="Reporte de Órdenes para Ruteros"
        isOpen={pdfViewerOpen}
        onClose={handleClosePdfViewer}
      />
    </div>
  )
}

// Memoized version to prevent unnecessary re-renders
export const DataTableToolbar = memo(DataTableToolbarComponent) as <TData>(
  props: DataTableToolbarProps<TData>
) => React.JSX.Element

