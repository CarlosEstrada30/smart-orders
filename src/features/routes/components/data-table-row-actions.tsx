import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2, Edit, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Route } from '../data/schema'
import { useRoutes } from './routes-provider'
import { PermissionGuard } from '@/components/auth/permission-guard'

type DataTableRowActionsProps = {
  row: Row<Route>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useRoutes()
  const route = row.original
  
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Abrir menú</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <PermissionGuard routePermission="can_manage">
            <DropdownMenuItem
              onClick={() => {
                setCurrentRow(route)
                setOpen('edit')
              }}
            >
              Editar
              <DropdownMenuShortcut>
                <Edit size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </PermissionGuard>
          <DropdownMenuSeparator />
          <PermissionGuard routePermission="can_manage">
            {route.is_active ? (
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(route)
                  setOpen('delete')
                }}
                className='text-red-500!'
              >
                Desactivar
                <DropdownMenuShortcut>
                  <Trash2 size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(route)
                  setOpen('reactivate')
                }}
                className='text-green-600!'
              >
                Reactivar
                <DropdownMenuShortcut>
                  <RotateCcw size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            )}
          </PermissionGuard>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
