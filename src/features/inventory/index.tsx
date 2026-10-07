import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { StatCard } from '@/components/stat-card'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Main } from '@/components/layout/main'
import { AlertCircle, Banknote, CheckCircle, Clock, Package, Plus, RefreshCw } from 'lucide-react'
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
      setError(`Revisa tu conexión e intenta de nuevo (${errorMessage}).`)
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

  return (
    <Main>
      <PageHeader
        title="Inventario"
        description="Entradas de producto: producción, compras, devoluciones y ajustes."
        actions={
          <>
            <Button onClick={refreshData} variant="outline" className="bg-card" disabled={loading}>
              <RefreshCw className={cn(loading && 'animate-spin')} aria-hidden="true" />
              Actualizar
            </Button>
            <PermissionGuard inventoryPermission="can_manage">
              <Button asChild>
                <Link to="/inventory/new-entry">
                  <Plus aria-hidden="true" />
                  Nueva entrada
                </Link>
              </Button>
            </PermissionGuard>
          </>
        }
      />

      {error ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={AlertCircle}
              title="No se pudo cargar el inventario"
              description={error}
              action={<Button onClick={loadData}>Reintentar</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            <StatCard
              label="Entradas registradas"
              value={(summary?.total_entries ?? 0).toLocaleString('es-GT')}
              icon={Package}
              isLoading={loading}
            />
            <StatCard
              label="Por aprobar"
              value={(summary?.pending_entries ?? 0).toLocaleString('es-GT')}
              hint="Pendientes de revisión"
              icon={Clock}
              isLoading={loading}
            />
            <StatCard
              label="Completadas hoy"
              value={(summary?.completed_today ?? 0).toLocaleString('es-GT')}
              icon={CheckCircle}
              isLoading={loading}
            />
            {canViewCosts && (
              <StatCard
                label="Costo total"
                value={formatCurrency(summary?.total_cost ?? 0)}
                icon={Banknote}
                isLoading={loading}
              />
            )}
          </div>

          {loading ? (
            <LoadingState label="Cargando entradas…" />
          ) : (
            <Card className="py-4 sm:py-6">
              <CardContent className="px-3 sm:px-6">
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
          )}
        </div>
      )}
    </Main>
  )
}
