import { useState, useEffect, useRef } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { routesService } from '@/services'
import { RoutesDialogs } from './components/routes-dialogs'
import { RoutesPrimaryButtons } from './components/routes-primary-buttons'
import { RoutesProvider } from './components/routes-provider'
import { RoutesTable } from './components/routes-table'
import { type Route } from './data/schema'
import { toast } from 'sonner'
import { useNavigationCleanup } from '@/hooks/use-navigation-cleanup'

const route = getRouteApi('/_authenticated/routes/')

export function Routes() {
  const { isMounted } = useNavigationCleanup()
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [routes, setRoutes] = useState<Route[]>([])
  const [loading, setLoading] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const loadRoutes = async () => {
    if (!isMounted()) return
    
    try {
      setLoading(true)
      
      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Crear nuevo controller para la petición actual
      abortControllerRef.current = new AbortController()
      
      const data = await routesService.getRoutes()
      
      // Solo actualizar estado si el componente sigue montado
      if (isMounted()) {
        setRoutes(data)
      }
    } catch (error) {
      if (!isMounted() || (error instanceof Error && error.name === 'AbortError')) {
        return // Petición cancelada o componente desmontado
      }
      
      console.error('Error loading routes:', error)
      toast.error('Error al cargar las rutas')
    } finally {
      if (isMounted()) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    loadRoutes()
    
    // Cleanup al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, []) // Sin dependencias para evitar re-ejecuciones

  return (
    <RoutesProvider>
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
