import { useState, useCallback, useEffect, memo, useRef } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { orderStatuses, getUniqueRoutes } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableDateFilter } from './data-table-date-filter'
import type { Order } from '../data/schema'
import type { OrdersQueryParams } from '@/services/orders'

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
    
    return () => clearTimeout(timeoutId)
  }, [localSearch]) // Solo dependencia en localSearch
  
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

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Buscar órdenes...'
          value={localSearch}
          onChange={(event) => handleSearchChange(event.target.value)}
          className='h-8 w-[150px] lg:w-[300px]'
        />
        <div className='flex gap-x-2'>
          {/* Status Filter - usando select simple por ahora */}
          <select
            value={filters.status_filter || ''}
            onChange={(e) => handleStatusChange([e.target.value])}
            className="h-8 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Todos los estados</option>
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          
          {/* Route Filter - usando select simple por ahora */}
          {uniqueRoutes.length > 0 && (
            <select
              value={filters.route_id?.toString() || ''}
              onChange={(e) => handleRouteChange([e.target.value])}
              className="h-8 rounded-md border border-input bg-transparent px-3 text-sm"
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
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={handleClearFilters}
            className='h-8 px-2 lg:px-3'
          >
            Limpiar {filtersCount > 0 && `(${filtersCount})`}
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}

// Memoized version to prevent unnecessary re-renders
export const DataTableToolbar = memo(DataTableToolbarComponent) as <TData>(
  props: DataTableToolbarProps<TData>
) => JSX.Element

