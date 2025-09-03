import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ExternalLink, MoreHorizontal, Pencil, Trash, RefreshCcw, Shield } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from './data-table-column-header'
import { type Company } from '../data/schema'

export const companiesColumns: ColumnDef<Company>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Seleccionar todas"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Seleccionar fila"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue('nombre')}</span>
            {row.original.is_trial && (
              <Badge variant="outline" className="text-xs px-1 py-0 bg-yellow-50 text-yellow-700 border-yellow-200">
                PRUEBA
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {row.original.subdominio}.{window.location.hostname}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'subdominio',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Subdominio" />
    ),
    cell: ({ row }) => {
      const subdomain = row.getValue('subdominio') as string
      const url = `${window.location.protocol}//${subdomain}.${window.location.hostname}${window.location.port ? `:${window.location.port}` : ''}`
      
      return (
        <div className="flex items-center gap-2">
          <code className="rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {subdomain}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="h-6 w-6 p-0"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: 'active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Estado" />
    ),
    cell: ({ row }) => {
      const active = row.getValue('active') as boolean
      
      return (
        <Badge variant={active ? 'default' : 'secondary'}>
          {active ? 'Activa' : 'Inactiva'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de Creación" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('created_at'))
      return (
        <div className="text-sm">
          {format(date, 'dd MMM yyyy', { locale: es })}
        </div>
      )
    },
  },
  {
    id: 'actions',
    header: 'Acciones',
    cell: ({ row }) => {
      const company = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(company.subdominio)}>
              Copiar subdominio
            </DropdownMenuItem>
            {company.active && (
              <DropdownMenuItem>
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir empresa
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            
            {company.active ? (
              <DropdownMenuItem className="text-destructive">
                <Trash className="mr-2 h-4 w-4" />
                Desactivar
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem className="text-green-600">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Restaurar
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Shield className="mr-2 h-4 w-4" />
              Eliminar permanente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
