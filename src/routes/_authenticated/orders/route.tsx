import { createFileRoute } from '@tanstack/react-router'
import { OrdersPage } from './orders-page'
import { ErrorBoundary } from '@/components/error-boundary'

function OrdersPageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <OrdersPage />
    </ErrorBoundary>
  )
}

export const Route = createFileRoute('/_authenticated/orders')({
  component: OrdersPageWithErrorBoundary,
}) 