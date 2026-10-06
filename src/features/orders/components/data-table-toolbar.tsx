import React, { useState, useCallback, useEffect, memo, useRef } from 'react'
import { type Table } from '@tanstack/react-table'
import type { OrdersQueryParams } from '@/services/orders'
import { ordersService } from '@/services/orders'
import { RoutesService } from '@/services/routes'
import { FileText, Route, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModernPDFViewer } from '@/components/pdf-viewer'
import { orderStatuses, paymentStatuses } from '../data/data'
import { DataTableDateFilter } from './data-table-date-filter'

type DataTableToolbarProps<TData> = {
  table?: Table<TData>
  onFiltersChange: (filters: Partial<OrdersQueryParams>) => void
  filters: OrdersQueryParams
  hidePaymentFilter?: boolean
  hideSearch?: boolean
  productSearch?: string
  onProductSearchChange?: (value: string) => void
}

const DataTableToolbarComponent = <TData,>({
  onFiltersChange,
  filters,
  hidePaymentFilter = false,
  hideSearch = false,
  productSearch = '',
  onProductSearchChange,
}: DataTableToolbarProps<TData>) => {
  // Instancia del servicio de rutas
  const routesService = new RoutesService()

  // Estado para todas las rutas (independiente de los datos filtrados)
  const [allRoutes, setAllRoutes] = useState<
    { value: string; label: string; icon: any }[]
  >([])

  // Verificar si hay filtros activos basándose en el estado del backend
  const isFiltered = Boolean(
    filters.search ||
      filters.status_filter ||
      filters.payment_status_filter ||
      filters.route_id ||
      filters.date_from ||
      filters.date_to ||
      productSearch
  )

  // Función helper para parsear fechas desde el backend (formato YYYY-MM-DD)
  const parseDateFromBackend = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day) // month - 1 porque Date usa 0-indexado
  }

  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | null>(
    filters.date_from && filters.date_to
      ? {
          from: parseDateFromBackend(filters.date_from),
          to: parseDateFromBackend(filters.date_to),
        }
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
        const formattedRoutes = routes.map((route) => ({
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
    filters.date_to,
    productSearch,
  ].filter(Boolean).length

  // Handlers para cambios de filtros
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value) // Solo actualizar estado local, el debounce se encarga del resto
  }, [])

  const handleStatusChange = useCallback(
    (values: string[]) => {
      onFiltersChange({ status_filter: values[0] || undefined })
    },
    [onFiltersChange]
  )

  const handleRouteChange = useCallback(
    (values: string[]) => {
      const routeId = values[0] ? parseInt(values[0]) : undefined
      onFiltersChange({ route_id: routeId })
    },
    [onFiltersChange]
  )

  const handlePaymentStatusChange = useCallback(
    (value: string) => {
      onFiltersChange({
        payment_status_filter: value
          ? (value as 'unpaid' | 'partial' | 'paid')
          : undefined,
      })
    },
    [onFiltersChange]
  )

  // Función helper para formatear fechas localmente
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDateRangeChange = useCallback(
    (range: { from?: Date; to?: Date } | null) => {
      setDateRange(range)
      onFiltersChange({
        date_from: range?.from ? formatLocalDate(range.from) : undefined,
        date_to: range?.to ? formatLocalDate(range.to) : undefined,
      })
    },
    [onFiltersChange]
  )

  const handleClearFilters = useCallback(() => {
    setDateRange(null)
    setLocalSearch('')
    onProductSearchChange?.('')
    onFiltersChange({
      search: undefined,
      status_filter: undefined,
      payment_status_filter: undefined,
      route_id: undefined,
      date_from: undefined,
      date_to: undefined,
    })
  }, [onFiltersChange, onProductSearchChange])

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
        search: filters.search,
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

  const selectClass =
    'border-input bg-card text-foreground focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full min-w-0 rounded-md border px-2.5 text-sm outline-none focus-visible:ring-[3px] sm:w-auto sm:min-w-[150px]'

  return (
    <div className='space-y-3'>
      <div className='flex flex-wrap items-center gap-2'>
        <div className='relative w-full sm:w-64'>
          <Search
            aria-hidden='true'
            className='text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2'
          />
          {hideSearch ? (
            <Input
              placeholder='Buscar producto'
              aria-label='Buscar producto'
              value={productSearch}
              onChange={(e) => onProductSearchChange?.(e.target.value)}
              className='bg-card h-9 ps-8'
            />
          ) : (
            <Input
              placeholder='Cliente o número de pedido'
              aria-label='Buscar pedidos'
              value={localSearch}
              onChange={(event) => handleSearchChange(event.target.value)}
              className='bg-card h-9 ps-8'
            />
          )}
        </div>

        <div className='grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap'>
          <select
            aria-label='Estado del pedido'
            value={filters.status_filter || ''}
            onChange={(e) => handleStatusChange([e.target.value])}
            className={selectClass}
          >
            <option value=''>Todos los estados</option>
            {orderStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          {allRoutes.length > 0 && (
            <select
              aria-label='Ruta'
              value={filters.route_id?.toString() || ''}
              onChange={(e) => handleRouteChange([e.target.value])}
              className={selectClass}
            >
              <option value=''>Todas las rutas</option>
              {allRoutes.map((route) => (
                <option key={route.value} value={route.value}>
                  {route.label}
                </option>
              ))}
            </select>
          )}

          {/* El filtro de pago no se aplica al reporte PDF */}
          {!hidePaymentFilter && (
            <select
              aria-label='Estado de pago'
              title='Solo filtra la tabla; no cambia el reporte PDF'
              value={filters.payment_status_filter || ''}
              onChange={(e) => handlePaymentStatusChange(e.target.value)}
              className={selectClass}
            >
              <option value=''>Todos los pagos</option>
              {paymentStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          )}

          <DataTableDateFilter
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>

        {isFiltered && (
          <Button
            variant='ghost'
            onClick={handleClearFilters}
            className='h-9 px-2.5'
          >
            <X aria-hidden='true' />
            Quitar filtros{filtersCount > 0 && ` (${filtersCount})`}
          </Button>
        )}

        <Button
          variant='outline'
          onClick={handlePreviewReport}
          disabled={isLoadingPreview}
          className='bg-card h-9 max-sm:w-full sm:ms-auto'
        >
          <FileText aria-hidden='true' />
          {isLoadingPreview ? 'Generando reporte…' : 'Reporte para ruteros'}
        </Button>
      </div>

      <ModernPDFViewer
        pdfUrl={pdfUrl}
        title='Reporte de Órdenes para Ruteros'
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
