import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { DataTableViewOptions } from './data-table-view-options'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
      <div className='flex flex-1 flex-col gap-4'>
        {/* Search input */}
        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
          <Input
            placeholder='Buscar rutas...'
            value={
              (table.getColumn('name')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='h-8 w-full sm:w-[200px] lg:w-[300px]'
          />
          {isFiltered && (
            <Button
              variant='ghost'
              onClick={() => table.resetColumnFilters()}
              className='h-8 px-2 lg:px-3 w-fit'
            >
              Limpiar
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
        
        {/* Filters row */}
        <div className='flex flex-wrap gap-2'>
          {table.getColumn('status') && (
            <DataTableFacetedFilter
              column={table.getColumn('status')}
              title='Estado'
              options={[
                { label: 'Activa', value: 'active' },
                { label: 'Inactiva', value: 'inactive' },
              ]}
            />
          )}
        </div>
      </div>
      
      {/* Actions */}
      <div className='flex items-center gap-x-2 lg:flex-shrink-0'>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
