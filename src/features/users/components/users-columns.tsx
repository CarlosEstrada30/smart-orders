import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { LongText } from '@/components/long-text'
import { type User, getRoleConfig } from '@/services/users'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn(''),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'username',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Username' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36 ps-3'>{row.getValue('username')}</LongText>
    ),
    meta: {
      className: cn(''),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'full_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre Completo' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('full_name')}</LongText>
    ),
    meta: { className: 'w-36' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit text-nowrap'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean
      return (
        <div className='flex space-x-2'>
          <Badge 
            variant='outline' 
            className={cn('capitalize', isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}
          >
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const isActive = row.getValue(id) as boolean
      return value.includes(isActive ? 'active' : 'inactive')
    },
    enableHiding: false,
    enableSorting: false,
  },
  {
    accessorKey: 'role',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Rol' />
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as string
      
      if (!role) {
        return <span className='text-muted-foreground'>Sin rol</span>
      }

      const roleConfig = getRoleConfig(role as any)

      return (
        <div className='flex items-center gap-x-2'>
          <Badge className={roleConfig.color}>
            {roleConfig.displayName}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
