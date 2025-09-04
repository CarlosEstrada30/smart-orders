import { useState } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { orderStatuses, getUniqueRoutes } from '../data/data'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableDateFilter } from './data-table-date-filter'
import type { Order } from '../data/schema'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
  data?: Order[]
}

export function DataTableToolbar<TData>({
  table,
  data = [],
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date } | null>(null)
  
  // Obtener rutas únicas de los datos
  const uniqueRoutes = getUniqueRoutes(data as Order[])

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Buscar órdenes por número...'
          value={
            (table.getColumn('order_number')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn('order_number')?.setFilterValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[300px]'
        />
        <div className='flex gap-x-2'>
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Estado'
              options={orderStatuses.map((status) => ({
                label: status.label,
                value: status.value,
                icon: status.icon,
              }))}
            />
          )}
          
          {table.getColumn('route') && uniqueRoutes.length > 0 && (
            <DataTableFacetedFilter
              column={table.getColumn('route')}
              title='Ruta'
              options={uniqueRoutes}
            />
          )}
          
          {table.getColumn('created_at') && (
            <DataTableDateFilter
              dateRange={dateRange}
              onDateRangeChange={(range) => {
                setDateRange(range)
                table.getColumn('created_at')?.setFilterValue(range)
              }}
            />
          )}
        </div>
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={() => table.resetColumnFilters()}
            className='h-8 px-2 lg:px-3'
          >
            Limpiar
            <Cross2Icon className='ms-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}

