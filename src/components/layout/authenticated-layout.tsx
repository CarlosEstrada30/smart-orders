import { Outlet } from '@tanstack/react-router'
import { getCookie } from '@/lib/cookies'
import { cn } from '@/lib/utils'
import { LayoutProvider } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { useAutoLoadPermissions } from '@/hooks/use-permissions'
import { useCompanySettings } from '@/hooks/use-company-settings'
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SkipToMain } from '@/components/skip-to-main'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { sidebarData } from './data/sidebar-data'
import { useFilteredSidebarData } from './protected-sidebar'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { useTokenExpiration } from '@/hooks/use-token-expiration'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const defaultOpen = getCookie('sidebar_state') !== 'false'
  
  // Verificar expiración del token
  useTokenExpiration()
  
  // Cargar permisos automáticamente al montar el layout
  useAutoLoadPermissions()
  
  // Cargar settings de la empresa automáticamente
  useCompanySettings()
  
  // Obtener datos del sidebar filtrados por permisos
  const filteredSidebarData = useFilteredSidebarData()
  
  return (
    <SearchProvider>
      <SidebarProvider defaultOpen={defaultOpen}>
        <LayoutProvider>
          <SkipToMain />
          <AppSidebar>
            <SidebarHeader>
              <TeamSwitcher teams={filteredSidebarData.teams} />
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
              '@container/content'
            )}
          >
            <Header fixed>
              <div className='ms-auto flex items-center space-x-4'>
                <Search />
                <ThemeSwitch />
                <ConfigDrawer />
                <ProfileDropdown />
              </div>
            </Header>
            {children ?? <Outlet />}
          </SidebarInset>
        </LayoutProvider>
      </SidebarProvider>
    </SearchProvider>
  )
}
