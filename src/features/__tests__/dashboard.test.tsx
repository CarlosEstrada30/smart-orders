import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from '../dashboard'
import { mockAuthStore } from '@/test/setup'

vi.mock('@/components/auth/permission-guard', () => ({
  PermissionGuard: ({ children, fallback }: any) => {
    const hasPermission = mockAuthStore.auth.permissions?.reports?.can_view
    return hasPermission ? children : fallback
  },
}))

vi.mock('@/components/layout/main', () => ({
  Main: ({ children }: { children: React.ReactNode }) => (
    <main data-testid="main-layout">{children}</main>
  ),
}))

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render dashboard title', () => {
    render(<Dashboard />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  it('should show access denied when user lacks permissions', () => {
    vi.mocked(vi.doMock)('@/components/auth/permission-guard', () => ({
      PermissionGuard: ({ fallback }: any) => fallback,
    }))

    render(<Dashboard />)
    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument()
  })
})
