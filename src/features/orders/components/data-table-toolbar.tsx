import { useState, useCallback, useEffect, memo, useRef } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye } from 'lucide-react'
import { orderStatuses, getUniqueRoutes } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableDateFilter } from './data-table-date-filter'
import type { Order } from '../data/schema'
import type { OrdersQueryParams } from '@/services/orders'
import { ordersService } from '@/services/orders'
import { toast } from 'sonner'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  data?: Order[]
  onFiltersChange: (filters: Partial<OrdersQueryParams>) => void
  filters: OrdersQueryParams
}

const DataTableToolbarComponent = <TData,>({
  table,
  data = [],
  onFiltersChange,
  filters,
}: DataTableToolbarProps<TData>) => {
  // Verificar si hay filtros activos basándose en el estado del backend
  const isFiltered = Boolean(
    filters.search || 
    filters.status_filter || 
    filters.route_id || 
    filters.date_from || 
    filters.date_to
  )
  
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | null>(
    filters.date_from && filters.date_to 
      ? { from: new Date(filters.date_from), to: new Date(filters.date_to) }
      : null
  )
  
  // Estado local para el input de búsqueda (para evitar perder el foco)
  const [localSearch, setLocalSearch] = useState(() => filters.search || '')
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
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
  const uniqueRoutes = getUniqueRoutes(data as Order[])
  
  // Información sobre los filtros activos
  const filtersCount = [
    filters.search,
    filters.status_filter, 
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

  const handleDateRangeChange = useCallback((range: { from?: Date; to?: Date } | null) => {
    setDateRange(range)
    onFiltersChange({
      date_from: range?.from ? range.from.toISOString().split('T')[0] : undefined,
      date_to: range?.to ? range.to.toISOString().split('T')[0] : undefined
    })
  }, [onFiltersChange])

  const handleClearFilters = useCallback(() => {
    setDateRange(null)
    setLocalSearch('') // Limpiar estado local también
    onFiltersChange({
      search: undefined,
      status_filter: undefined,
      route_id: undefined,
      date_from: undefined,
      date_to: undefined
    })
  }, [onFiltersChange])

  const handlePreviewReport = useCallback(async () => {
    try {
      setIsLoadingPreview(true)
      
      // Preparar parámetros para el reporte (excluyendo skip y limit)
      const reportParams: OrdersQueryParams = {
        status_filter: filters.status_filter,
        route_id: filters.route_id,
        date_from: filters.date_from,
        date_to: filters.date_to,
        search: filters.search
      }
      
      const url = await ordersService.getOrdersReportPreviewBlob(reportParams)
      
      // Crear ventana de vista previa simple
      const newWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes')
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Reporte de Órdenes para Ruteros</title>
              <meta charset="utf-8">
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  height: 100vh;
                  overflow: hidden;
                }
                .pdf-frame {
                  width: 100%;
                  height: 100vh;
                  border: none;
                }
              </style>
            </head>
            <body>
              <iframe src="${url}" class="pdf-frame"></iframe>
              
              <script>
                // Cleanup cuando se cierre la ventana
                window.addEventListener('beforeunload', () => {
                  window.URL.revokeObjectURL('${url}');
                });
              </script>
            </body>
          </html>
        `)
        newWindow.document.close()
        
        toast.success('Vista previa del reporte abierta en nueva ventana')
      } else {
        toast.error('No se pudo abrir la vista previa. Por favor, permite las ventanas emergentes.')
      }
    } catch (error) {
      toast.error('Error al generar vista previa del reporte')
      console.error('Error previewing report:', error)
    } finally {
      setIsLoadingPreview(false)
    }
  }, [filters])

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
            className="h-8 min-w-[140px] rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Todos los estados</option>
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          
          {/* Route Filter */}
          {uniqueRoutes.length > 0 && (
            <select
              value={filters.route_id?.toString() || ''}
              onChange={(e) => handleRouteChange([e.target.value])}
              className="h-8 min-w-[140px] rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="">Todas las rutas</option>
              {uniqueRoutes.map((route) => (
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
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}

// Memoized version to prevent unnecessary re-renders
export const DataTableToolbar = memo(DataTableToolbarComponent) as <TData>(
  props: DataTableToolbarProps<TData>
) => JSX.Element

