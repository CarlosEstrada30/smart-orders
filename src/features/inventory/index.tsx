import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { Plus, Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { inventoryService, type InventoryEntryListResponse, type InventoryEntrySummary } from '@/services/inventory'
import { InventoryTable } from './components/inventory-table'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { usePermissions, useRole, useAutoLoadPermissions, useInventoryPermissions } from '@/hooks/use-permissions'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { useNavigationCleanup } from '@/hooks/use-navigation-cleanup'

export function InventoryPage() {
  const { isMounted } = useNavigationCleanup()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<InventoryEntryListResponse[]>([])
  const [summary, setSummary] = useState<InventoryEntrySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { accessToken } = useAuthStore((state) => state.auth)
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // Cargar permisos automáticamente
  useAutoLoadPermissions()
  
  // Hooks de permisos
  const { role } = useRole()
  const { canManage, canViewCosts } = useInventoryPermissions()

  useEffect(() => {
    if (accessToken && isMounted()) {
      loadData()
    } else if (!accessToken && isMounted()) {
      setError('No hay token de autenticación. Por favor, inicia sesión.')
      setLoading(false)
    }
    
    // Cleanup al cambiar accessToken o desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [accessToken, isMounted])

  const loadData = async () => {
    if (!isMounted()) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Cancelar peticiones anteriores
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Crear nuevo controller
      abortControllerRef.current = new AbortController()
      
      // Usar Promise.all con manejo de errores mejorado
      const [entriesData, summaryData] = await Promise.allSettled([
        inventoryService.getEntries({ limit: 100 }),
        inventoryService.getEntriesSummary()
      ])
      
      // Solo actualizar estado si el componente sigue montado
      if (!isMounted()) return
      
      // Manejar resultados de Promise.allSettled
      const entries = entriesData.status === 'fulfilled' ? (entriesData.value || []) : []
      const summary = summaryData.status === 'fulfilled' ? summaryData.value : null
      setEntries(entries)
      setSummary(summary)
      
      // Si alguna promesa falló, mostrar advertencia pero no bloquear la UI
      if (entriesData.status === 'rejected' || summaryData.status === 'rejected') {
        console.warn('Some inventory data failed to load')
        toast.error('Algunos datos de inventario no se pudieron cargar')
      }
      
    } catch (err) {
      if (!isMounted() || (err instanceof Error && err.name === 'AbortError')) {
        return // Componente desmontado o petición cancelada
      }
      
      console.error('Error loading inventory data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar los datos de inventario: ${errorMessage}`)
      toast.error('Error al cargar los datos de inventario')
    } finally {
      if (isMounted()) {
        setLoading(false)
      }
    }
  }

  const handleViewEntry = (entry: InventoryEntryListResponse) => {
    navigate({ to: '/inventory-detail/$entryId', params: { entryId: entry.id.toString() } })
  }

  const handleSubmitEntry = (entry: InventoryEntryListResponse) => {
    // Refresh data after submit
    loadData()
  }

  const handleEditEntry = (entry: InventoryEntryListResponse) => {
    // Navigate to edit entry
    // TODO: Implement edit functionality
  }

  const handleDeleteEntry = (entry: InventoryEntryListResponse) => {
    // Show confirmation dialog and delete
    // TODO: Implement delete functionality
  }

  const refreshData = () => {
    loadData()
  }

  if (loading) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Cargando inventario...</p>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  if (error) {
    return (
      <Main>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <Button className="mt-4" onClick={loadData}>
                Reintentar
              </Button>
            </div>
          </div>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
            <p className="text-muted-foreground">
              Gestiona las entradas de inventario y el stock de productos
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={refreshData} variant="outline">
              Actualizar
            </Button>
            {/* Solo mostrar el botón si el usuario puede gestionar inventario */}
            <PermissionGuard inventoryPermission="can_manage">
              <Link to="/inventory/new-entry">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Entrada
                </Button>
              </Link>
            </PermissionGuard>
          </div>
        </div>


        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Entradas de Inventario</CardTitle>
            <CardDescription>
              Lista de todas las entradas de inventario registradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryTable
              data={entries}
              onViewEntry={handleViewEntry}
              onEditEntry={handleEditEntry}
              onDeleteEntry={handleDeleteEntry}
              onSubmitEntry={handleSubmitEntry}
              onApproveEntry={refreshData}
              onCompleteEntry={refreshData}
              onCancelEntry={refreshData}
              userRole={role || 'employee'} // Usar rol real del usuario
            />
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}
