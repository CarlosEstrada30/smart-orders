import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OrdersQueryParams } from '@/services/orders'
import type { TablePaginationInfo } from './orders-table'
import { memo } from 'react'

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
    has_previous: canPreviousPage
  } = pagination
  
  // Handlers para navegación mejorados
  const handlePageSizeChange = (newSize: number) => {
    onFiltersChange({
      limit: newSize,
      skip: 0  // Reset to first page when changing page size
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
    <div
      className='flex items-center justify-between overflow-clip px-2'
      style={{ overflowClipMargin: 1 }}
    >
      <div className='text-muted-foreground hidden flex-1 text-sm sm:block'>
        {table.getFilteredSelectedRowModel().rows.length} de{' '}
        {currentPageCount} orden(es) seleccionada(s) en esta página.
      </div>
      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='hidden text-sm font-medium sm:block'>Filas por página</p>
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
        <div className='flex w-[150px] items-center justify-center text-sm font-medium'>
          <div className='text-center'>
            <div>Página {currentPage} de {totalPages}</div>
            {totalItems > 0 && (
              <div className='text-xs text-muted-foreground'>
                {currentPageCount} de {totalItems} registros
              </div>
            )}
          </div>
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
export const DataTablePagination = memo(DataTablePaginationComponent) as <TData>(
  props: DataTablePaginationProps<TData>
) => JSX.Element

