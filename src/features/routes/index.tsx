import { useState, useEffect, useRef } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { Main } from '@/components/layout/main'
import { routesService } from '@/services'
import { RoutesDialogs } from './components/routes-dialogs'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { LoadingState } from '@/components/loading-state'
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
        <PageHeader
          title='Rutas'
          description='Las rutas de entrega. Cada pedido y cada precio especial pertenecen a una ruta.'
          actions={<RoutesPrimaryButtons />}
        />
        {loading ? (
          <LoadingState label='Cargando rutas…' rows={4} />
        ) : (
          <Card className='py-4 sm:py-6'>
            <CardContent className='px-3 sm:px-6'>
              <RoutesTable data={routes} search={search} navigate={navigate} />
            </CardContent>
          </Card>
        )}
      </Main>
      <RoutesDialogs onDataChange={loadRoutes} />
    </RoutesProvider>
  )
}
