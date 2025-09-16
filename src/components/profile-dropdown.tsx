import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth-store'
import { useLogout } from '@/hooks/use-logout'
import { LogOut } from 'lucide-react'

export function ProfileDropdown() {
  const { user } = useAuthStore((state) => state.auth)
  const { logout, isLoggingOut } = useLogout()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
          <Avatar className='h-8 w-8'>
            <AvatarImage src='/avatars/01.png' alt='@shadcn' />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col gap-1.5'>
            <p className='text-sm leading-none font-medium'>
              {user?.email || 'Usuario'}
            </p>
            <p className='text-muted-foreground text-xs leading-none'>
              {user?.role?.join(', ') || 'Usuario'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} disabled={isLoggingOut}>
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
