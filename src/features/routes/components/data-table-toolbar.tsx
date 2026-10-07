import { Cross2Icon } from '@radix-ui/react-icons'
import { type Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableFacetedFilter } from '@/components/data-table'
import { DataTableViewOptions } from '@/components/data-table'

type DataTableToolbarProps<TData> = {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className='flex flex-wrap items-center justify-between gap-2'>
      <div className='flex flex-1 flex-wrap items-center gap-2'>
        {/* Search input */}
        <div className='flex w-full items-center gap-2 sm:w-auto'>
          <Input
            placeholder='Buscar rutas…'
            value={
              (table.getColumn('name')?.getFilterValue() as string) ?? ''
            }
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className='bg-card h-9 w-full sm:w-72'
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
