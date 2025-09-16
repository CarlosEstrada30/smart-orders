import { createFileRoute } from '@tanstack/react-router'
import { Routes } from '@/features/routes'
import { ErrorBoundary } from '@/components/error-boundary'

function RoutesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Routes />
    </ErrorBoundary>
  )
}

export const Route = createFileRoute('/_authenticated/routes')({
  component: RoutesWithErrorBoundary,
})
