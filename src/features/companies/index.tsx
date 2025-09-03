import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import { CompaniesTable } from './components/companies-table'
import { CompanyForm } from './components/company-form'
import { companiesService } from '@/services/companies'
import { mockCompanies } from './data/data' // Temporal para desarrollo

export default function CompaniesPage() {
  const search = useSearch({ strict: false })
  const navigate = (opts: { search: unknown }) => {
    // TODO: Implementar navegación real
    console.log('Navigate:', opts)
  }

  // Estado del diálogo
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  
  // Estado para mostrar empresas inactivas
  const [showInactive, setShowInactive] = useState(false)

  // Query para obtener empresas
  const { 
    data: companiesData, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['companies', search, showInactive],
    queryFn: () => companiesService.getCompanies({
      page: Number(search.page) || 1,
      limit: Number(search.limit) || 20,
      search: search.search as string,
      show_inactive: showInactive,
    }),
    // Usar API real
    enabled: true,
    // Quitar initialData para usar API real
  })

  const handleSuccess = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando empresas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Empresas</h1>
          <p className="text-muted-foreground">
            Administra las empresas y sus subdominios en el sistema multitenant.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive" className="text-sm">
              Mostrar inactivas
            </Label>
          </div>
          
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Empresa
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Empresas
              </p>
              <p className="text-2xl font-bold">{companiesData?.total || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Empresas Activas
              </p>
              <p className="text-2xl font-bold text-green-600">
                {companiesData?.items.filter(c => c.active).length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Empresas Inactivas
              </p>
              <p className="text-2xl font-bold text-red-600">
                {companiesData?.items.filter(c => !c.active).length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Empresas de Prueba
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {companiesData?.items.filter(c => c.is_trial).length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <CompaniesTable
        data={companiesData?.items || []}
        search={search}
        navigate={navigate}
      />

      {/* Dialogs */}
      <CompanyForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
        mode="create"
      />
      
      <CompanyForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
        mode="edit"
      />
    </div>
  )
}
