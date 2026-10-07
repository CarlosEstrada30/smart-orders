import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Main } from '@/components/layout/main'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/page-header'
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
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ms-2 mb-2">
        <Link to="/inventory">
          <ArrowLeft aria-hidden="true" />
          Inventario
        </Link>
      </Button>
      <PageHeader
        title="Nueva entrada de inventario"
        description="Registra producto que entra al inventario: producción, compra, devolución o ajuste."
      />
      <InventoryEntryForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </Main>
  )
}
