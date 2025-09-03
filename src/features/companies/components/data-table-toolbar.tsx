import { type Table } from '@tanstack/react-table'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from './data-table-view-options'
import { DataTableFacetedFilter } from './data-table-faceted-filter'
import { companyStatuses } from '../data/data'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:space-x-2">
        <Input
          placeholder="Buscar empresas..."
          value={(table.getColumn('nombre')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('nombre')?.setFilterValue(event.target.value)
          }
          className="h-8 w-full sm:w-[150px] lg:w-[250px]"
        />
        {table.getColumn('active') && (
          <DataTableFacetedFilter
            column={table.getColumn('active')}
            title="Estado"
            options={[
              { value: 'true', label: 'Activa', icon: undefined },
              { value: 'false', label: 'Inactiva', icon: undefined }
            ]}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar filtros
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
