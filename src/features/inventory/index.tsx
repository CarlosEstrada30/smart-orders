import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { Plus, Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'
import { inventoryService, type InventoryEntryListResponse, type InventoryEntrySummary } from '@/services/inventory'
import { InventoryTable } from './components/inventory-table'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'

export function InventoryPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<InventoryEntryListResponse[]>([])
  const [summary, setSummary] = useState<InventoryEntrySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { accessToken } = useAuthStore((state) => state.auth)

  useEffect(() => {
    if (accessToken) {
      loadData()
    } else {
      setError('No hay token de autenticación. Por favor, inicia sesión.')
      setLoading(false)
    }
  }, [accessToken])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading inventory data...')
      
      const [entriesData, summaryData] = await Promise.all([
        inventoryService.getEntries({ limit: 100 }),
        inventoryService.getEntriesSummary()
      ])
      
      console.log('Inventory data loaded:', { entriesData, summaryData })
      setEntries(entriesData || [])
      setSummary(summaryData)
    } catch (err) {
      console.error('Error loading inventory data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar los datos de inventario: ${errorMessage}`)
      toast.error('Error al cargar los datos de inventario')
    } finally {
      setLoading(false)
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
    console.log('Edit entry:', entry)
  }

  const handleDeleteEntry = (entry: InventoryEntryListResponse) => {
    // Show confirmation dialog and delete
    console.log('Delete entry:', entry)
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
            <Link to="/inventory/new-entry">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Entrada
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_entries || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Q{(summary.total_cost || 0).toFixed(2)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.pending_entries || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completadas Hoy</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.completed_today || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio por Entrada</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  Q{((summary.total_entries || 0) > 0 ? ((summary.total_cost || 0) / summary.total_entries).toFixed(2) : '0.00')}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Show message when no summary data */}
        {!summary && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Entradas</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Q0.00</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completadas Hoy</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio por Entrada</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Q0.00</div>
              </CardContent>
            </Card>
          </div>
        )}

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
              userRole="supervisor"
            />
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}
