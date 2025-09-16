import { createFileRoute } from '@tanstack/react-router'
import { ClientsPage } from './clients-page'
import { ErrorBoundary } from '@/components/error-boundary'

function ClientsPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ClientsPage />
    </ErrorBoundary>
  )
}

export const Route = createFileRoute('/_authenticated/clients')({
  component: ClientsPageWithErrorBoundary,
}) 