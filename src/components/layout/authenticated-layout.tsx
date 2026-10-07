import { Outlet } from '@tanstack/react-router'
import { BrandMark } from '@/assets/brand-mark'
import { useAuthStore } from '@/stores/auth-store'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { useCompanySettings } from '@/hooks/use-company-settings'
import { useAutoLoadPermissions, usePermissions } from '@/hooks/use-permissions'
import { useTokenExpiration } from '@/hooks/use-token-expiration'
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { SkipToMain } from '@/components/skip-to-main'
import { ThemeSwitch } from '@/components/theme-switch'
import { WhatsAppStatus } from '@/components/whatsapp-status'
import { MobileTabBar } from './mobile-tab-bar'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { PermissionsLoadingCompact } from './permissions-loading'
import { useFilteredSidebarData } from './protected-sidebar'
import { TeamSwitcher } from './team-switcher'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  const { isLoggingOut } = useAuthStore((state) => state.auth)

  // Verificar expiración del token
  useTokenExpiration()

  // Cargar permisos automáticamente al montar el layout
  useAutoLoadPermissions()

  // Verificar estado de permisos
  const { isLoading: permissionsLoading } = usePermissions()

  // Cargar settings de la empresa automáticamente
  useCompanySettings()

  // Obtener datos del sidebar filtrados por permisos
  const { isLoading: sidebarLoading, ...filteredSidebarData } =
    useFilteredSidebarData()

  // Mostrar loading durante logout para evitar mostrar "Acceso Denegado"
  if (isLoggingOut) {
    return (
      <div className='bg-background flex min-h-screen items-center justify-center'>
        <div
          role='status'
          className='flex flex-col items-center gap-3 text-center'
        >
          <BrandMark className='text-primary size-10 animate-pulse' />
          <p className='font-medium'>Cerrando sesión…</p>
        </div>
      </div>
    )
  }

  // Mostrar loading mientras cargan los permisos iniciales
  if (permissionsLoading) {
    return <PermissionsLoadingCompact />
  }

  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <LayoutProvider>
          <SkipToMain />
          <AppSidebar>
            <SidebarHeader>
              <TeamSwitcher
                teams={filteredSidebarData.teams}
                isLoading={sidebarLoading}
              />
            </SidebarHeader>
            <SidebarContent>
              {filteredSidebarData.navGroups.map((props) => (
                <NavGroup key={props.title} {...props} />
              ))}
            </SidebarContent>
            <SidebarFooter>
              <NavUser user={filteredSidebarData.user} />
            </SidebarFooter>
            <SidebarRail />
          </AppSidebar>
          <SidebarInset
            className={cn(
              // If layout is fixed, set the height
              // to 100svh to prevent overflow
              'has-[[data-layout=fixed]]:h-svh',

              // If layout is fixed and sidebar is inset,
              // set the height to 100svh - 1rem (total margins) to prevent overflow
              // 'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-1rem)]',
              'peer-data-[variant=inset]:has-[[data-layout=fixed]]:h-[calc(100svh-(var(--spacing)*4))]',

              // Set content container, so we can use container queries
              '@container/content',

              // Espacio para la barra inferior en el celular
              'max-md:pb-20'
            )}
          >
            <Header fixed>
              <div className='ms-auto flex items-center gap-2 sm:gap-3'>
                <WhatsAppStatus />
                <Search />
                <ThemeSwitch />
                <div className='md:hidden'>
                  <ProfileDropdown />
                </div>
              </div>
            </Header>
            {children ?? <Outlet />}
            <MobileTabBar navGroups={filteredSidebarData.navGroups} />
          </SidebarInset>
        </LayoutProvider>
      </SidebarProvider>
    </SearchProvider>
  )
}
