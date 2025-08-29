import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { ArrowLeft } from 'lucide-react'
import { InventoryEntryForm } from './components/inventory-entry-form'

export function NewInventoryEntryPage() {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate({ to: '/inventory' })
  }

  const handleCancel = () => {
    navigate({ to: '/inventory' })
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/inventory">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Nueva Entrada de Inventario
              </h1>
              <p className="text-muted-foreground">
                Registra una nueva entrada de productos al inventario
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <InventoryEntryForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Main>
  )
}

