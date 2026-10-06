import { memo } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import type { OrdersQueryParams } from '@/services/orders'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TablePaginationInfo } from './orders-table'

type DataTablePaginationProps<TData> = {
  table: Table<TData>
  onFiltersChange: (filters: Partial<OrdersQueryParams>) => void
  filters: OrdersQueryParams
  pagination: TablePaginationInfo
}

const DataTablePaginationComponent = <TData,>({
  table,
  onFiltersChange,
  filters,
  pagination,
}: DataTablePaginationProps<TData>) => {
  // Valores de la nueva estructura de paginación
  const {
    total: totalItems,
    count: currentPageCount,
    page: currentPage,
    pages: totalPages,
    per_page: pageSize,
    has_next: canNextPage,
    has_previous: canPreviousPage,
  } = pagination

  // Handlers para navegación mejorados
  const handlePageSizeChange = (newSize: number) => {
    onFiltersChange({
      limit: newSize,
      skip: 0, // Reset to first page when changing page size
    })
  }

  const handleFirstPage = () => {
    onFiltersChange({ skip: 0 })
  }

  const handlePreviousPage = () => {
    const newSkip = Math.max(0, (currentPage - 2) * pageSize)
    onFiltersChange({ skip: newSkip })
  }

  const handleNextPage = () => {
    const newSkip = currentPage * pageSize
    onFiltersChange({ skip: newSkip })
  }

  const handleLastPage = () => {
    const lastPageSkip = (totalPages - 1) * pageSize
    onFiltersChange({ skip: lastPageSkip })
  }
  return (
    <div className='tabular flex items-center justify-between gap-3'>
      <div className='text-muted-foreground hidden flex-1 text-sm md:block'>
        {table.getFilteredSelectedRowModel().rows.length > 0
          ? `${table.getFilteredSelectedRowModel().rows.length} de ${currentPageCount} seleccionados en esta página`
          : `${totalItems.toLocaleString('es-GT')} pedidos en total`}
      </div>
      <div className='flex w-full items-center justify-between gap-3 md:w-auto md:justify-end lg:gap-6'>
        <div className='flex items-center space-x-2'>
          <p className='text-muted-foreground hidden text-sm sm:block'>
            Por página
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              handlePageSizeChange(Number(value))
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='text-sm font-medium whitespace-nowrap'>
          Página {currentPage} de {totalPages.toLocaleString('es-GT')}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={handleFirstPage}
            disabled={!canPreviousPage}
          >
            <span className='sr-only'>Ir a la primera página</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={handlePreviousPage}
            disabled={!canPreviousPage}
          >
            <span className='sr-only'>Ir a la página anterior</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={handleNextPage}
            disabled={!canNextPage}
          >
            <span className='sr-only'>Ir a la página siguiente</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={handleLastPage}
            disabled={!canNextPage}
          >
            <span className='sr-only'>Ir a la última página</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Memoized version to prevent unnecessary re-renders
export const DataTablePagination = memo(DataTablePaginationComponent) as <
  TData,
>(
  props: DataTablePaginationProps<TData>
) => JSX.Element
