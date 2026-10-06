import { Link, useLocation } from '@tanstack/react-router'
import { Menu, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useOrderPermissions } from '@/hooks/use-permissions'
import { useSidebar } from '@/components/ui/sidebar'
import { type NavGroup, type NavLink } from './types'

// Accesos del celular, en este orden, si el usuario tiene permiso
const TAB_URLS = ['/', '/orders', '/clients'] as const
const TAB_LABELS: Record<string, string> = {
  '/': 'Inicio',
  '/orders': 'Pedidos',
  '/clients': 'Clientes',
}

type MobileTabBarProps = {
  navGroups: NavGroup[]
}

/** Barra inferior para vendedores en el celular (solo < md) */
export function MobileTabBar({ navGroups }: MobileTabBarProps) {
  const { setOpenMobile } = useSidebar()
  const { canCreate } = useOrderPermissions()
  const pathname = useLocation({ select: (location) => location.pathname })

  const allowed = navGroups
    .flatMap((group) => group.items)
    .filter((item): item is NavLink => 'url' in item && !!item.url)
  const tabs = TAB_URLS.map((url) =>
    allowed.find((item) => item.url === url)
  ).filter((item): item is NavLink => !!item)

  const isActive = (url: string) =>
    url === '/' ? pathname === '/' : pathname.startsWith(url)

  const tabClass =
    'text-muted-foreground flex min-w-0 flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium'

  const tabLinks = tabs.map((item) => (
    <Link
      key={item.url as string}
      to={item.url}
      className={cn(tabClass, isActive(item.url as string) && 'text-primary')}
      aria-current={isActive(item.url as string) ? 'page' : undefined}
    >
      {item.icon && <item.icon className='size-5' aria-hidden='true' />}
      <span className='truncate'>
        {TAB_LABELS[item.url as string] ?? item.title}
      </span>
    </Link>
  ))

  // La acción central queda entre el segundo y el tercer acceso
  const middle = Math.min(2, tabLinks.length)

  return (
    <nav
      aria-label='Navegación principal'
      className='bg-card/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden'
    >
      <div className='mx-auto flex max-w-md items-end px-2'>
        {tabLinks.slice(0, middle)}
        {canCreate && (
          <div className='flex flex-1 justify-center'>
            <Link
              to='/new-order'
              className='bg-primary text-primary-foreground ring-card -mt-5 flex size-14 flex-col items-center justify-center rounded-full shadow-md ring-4'
              aria-label='Nuevo pedido'
            >
              <Plus className='size-6' aria-hidden='true' />
            </Link>
          </div>
        )}
        {tabLinks.slice(middle)}
        <button
          type='button'
          className={tabClass}
          onClick={() => setOpenMobile(true)}
        >
          <Menu className='size-5' aria-hidden='true' />
          <span>Más</span>
        </button>
      </div>
    </nav>
  )
}
