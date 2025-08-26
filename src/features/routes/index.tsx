import { useState, useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { routesService } from '@/services'
import { RoutesDialogs } from './components/routes-dialogs'
import { RoutesPrimaryButtons } from './components/routes-primary-buttons'
import { RoutesProvider } from './components/routes-provider'
import { RoutesTable } from './components/routes-table'
import { type Route } from './data/schema'
import { toast } from 'sonner'

const route = getRouteApi('/_authenticated/routes/')

export function Routes() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)

  const loadRoutes = async () => {
    try {
      setLoading(true)
      const data = await routesService.getRoutes()
      setRoutes(data)
    } catch (error) {
      console.error('Error loading routes:', error)
      toast.error('Error al cargar las rutas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRoutes()
  }, [])

  return (
    <RoutesProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Gestión de Rutas</h2>
            <p className='text-muted-foreground'>
              Administra las rutas de entrega del sistema.
            </p>
          </div>
          <RoutesPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Cargando rutas...</p>
            </div>
          ) : (
            <RoutesTable data={routes} search={search} navigate={navigate} />
          )}
        </div>
      </Main>

      <RoutesDialogs onDataChange={loadRoutes} />
    </RoutesProvider>
  )
}
