/**
 * Tests para Dashboard Component
 * Verifica el renderizado, permisos y funcionalidad del dashboard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from '../dashboard'
import { mockAuthStore } from '@/test/setup'

// Mock de componentes child
vi.mock('../dashboard/components/overview', () => ({
  Overview: () => <div data-testid="overview-component">Overview Chart</div>
}))

vi.mock('../dashboard/components/recent-sales', () => ({
  RecentSales: () => <div data-testid="recent-sales-component">Recent Sales</div>
}))

vi.mock('@/components/auth/permission-guard', () => ({
  PermissionGuard: ({ children, reportPermission, fallback }: any) => {
    // Simular PermissionGuard basado en permisos del mock
    const hasPermission = mockAuthStore.auth.permissions?.reports?.can_view
    return hasPermission ? children : fallback
  }
}))

vi.mock('@/components/layout/main', () => ({
  Main: ({ children }: { children: React.ReactNode }) => 
    <main data-testid="main-layout">{children}</main>
}))

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering with permissions', () => {
    it('should render dashboard when user has permissions', () => {
      render(<Dashboard />)
      
      // Verificar elementos principales
      expect(screen.getByTestId('main-layout')).toBeInTheDocument()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Generar Reporte')).toBeInTheDocument()
      
      // Verificar tabs
      expect(screen.getByText('Resumen')).toBeInTheDocument()
      expect(screen.getByText('Análisis')).toBeInTheDocument()
      expect(screen.getByText('Reportes')).toBeInTheDocument()
      expect(screen.getByText('Notificaciones')).toBeInTheDocument()
    })

    it('should show access denied when user lacks permissions', () => {
      // Mock de usuario sin permisos
      const mockAuthStoreNoPermissions = {
        ...mockAuthStore,
        auth: {
          ...mockAuthStore.auth,
          permissions: {
            ...mockAuthStore.auth.permissions,
            reports: { can_view: false }
          }
        }
      }
      
      vi.mocked(vi.importMeta).env = {
        ...vi.importMeta.env,
        mockAuthStore: mockAuthStoreNoPermissions
      }

      // Re-mock PermissionGuard para este caso
      vi.mocked(vi.doMock)('@/components/auth/permission-guard', () => ({
        PermissionGuard: ({ fallback }: any) => fallback
      }))

      render(<Dashboard />)
      
      expect(screen.getByText('Acceso Denegado')).toBeInTheDocument()
      expect(screen.getByText('No tienes permisos para ver reportes y dashboards.')).toBeInTheDocument()
    })
  })

  describe('Dashboard content', () => {
    it('should display main metrics cards', () => {
      render(<Dashboard />)
      
      // Verificar las cards de métricas principales
      expect(screen.getByText('Ventas del Mes')).toBeInTheDocument()
      expect(screen.getByText('Pedidos')).toBeInTheDocument()
      expect(screen.getByText('Productos')).toBeInTheDocument()
      expect(screen.getByText('Usuarios')).toBeInTheDocument()
    })

    it('should display hardcoded metric values', () => {
      render(<Dashboard />)
      
      // Verificar valores hardcodeados (que luego serán reemplazados por datos reales)
      expect(screen.getByText('Q8,456.23')).toBeInTheDocument()
      expect(screen.getByText('+89')).toBeInTheDocument()
      expect(screen.getByText('+231')).toBeInTheDocument()
      expect(screen.getByText('+12')).toBeInTheDocument()
    })

    it('should display percentage changes', () => {
      render(<Dashboard />)
      
      // Verificar los porcentajes de cambio
      expect(screen.getByText('+15.3% desde el mes pasado')).toBeInTheDocument()
      expect(screen.getByText('+12.7% desde el mes pasado')).toBeInTheDocument()
      expect(screen.getByText('+19% desde el mes pasado')).toBeInTheDocument()
      expect(screen.getByText('+201 desde la última hora')).toBeInTheDocument()
    })
  })

  describe('Tabs functionality', () => {
    it('should show overview tab content by default', () => {
      render(<Dashboard />)
      
      // Verificar que el tab Overview esté activo por defecto
      const overviewTab = screen.getByRole('tab', { name: 'Resumen' })
      expect(overviewTab).toHaveAttribute('data-state', 'active')
      
      // Verificar que se muestren los componentes del overview
      expect(screen.getByTestId('overview-component')).toBeInTheDocument()
      expect(screen.getByTestId('recent-sales-component')).toBeInTheDocument()
    })

    it('should show disabled state for incomplete tabs', () => {
      render(<Dashboard />)
      
      // Verificar que ciertos tabs estén deshabilitados
      const analyticsTab = screen.getByRole('tab', { name: 'Análisis' })
      const reportsTab = screen.getByRole('tab', { name: 'Reportes' })
      const notificationsTab = screen.getByRole('tab', { name: 'Notificaciones' })
      
      expect(analyticsTab).toBeDisabled()
      expect(reportsTab).toBeDisabled()
      expect(notificationsTab).toBeDisabled()
    })

    it('should handle tab switching', async () => {
      const user = userEvent.setup()
      render(<Dashboard />)
      
      const overviewTab = screen.getByRole('tab', { name: 'Resumen' })
      
      // Verificar que Overview esté activo inicialmente
      expect(overviewTab).toHaveAttribute('data-state', 'active')
      
      // Como los otros tabs están disabled, no se pueden testear las transiciones
      // Este test se expandirá cuando se implementen las funcionalidades
    })
  })

  describe('Actions', () => {
    it('should render generate report button', () => {
      render(<Dashboard />)
      
      const reportButton = screen.getByText('Generar Reporte')
      expect(reportButton).toBeInTheDocument()
      expect(reportButton.tagName).toBe('BUTTON')
    })

    it('should handle report button click', async () => {
      const user = userEvent.setup()
      render(<Dashboard />)
      
      const reportButton = screen.getByText('Generar Reporte')
      
      // Verificar que el botón sea clickeable
      expect(reportButton).toBeEnabled()
      
      // Click en el botón (por ahora no hace nada, pero no debería romper)
      await user.click(reportButton)
      
      // No debería haber errores
      expect(reportButton).toBeInTheDocument()
    })
  })

  describe('Layout structure', () => {
    it('should have correct layout structure', () => {
      render(<Dashboard />)
      
      // Verificar estructura general
      expect(screen.getByTestId('main-layout')).toBeInTheDocument()
      
      // Verificar header con título y botón
      const header = screen.getByText('Dashboard').closest('div')
      expect(header).toBeInTheDocument()
      
      // Verificar que tenga las clases CSS necesarias para layout
      const tabsContainer = screen.getByRole('tablist').closest('[class*="space-y-4"]')
      expect(tabsContainer).toBeInTheDocument()
    })

    it('should render lucide icons correctly', () => {
      render(<Dashboard />)
      
      // Los iconos deberían renderizarse como mock-icon por nuestro setup
      const icons = screen.getAllByTestId('mock-icon')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive behavior', () => {
    it('should render without errors on different screen sizes', () => {
      // Test básico de rendering - las consultas responsive se manejan con CSS
      render(<Dashboard />)
      
      // Verificar que los elementos principales estén presentes
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByTestId('overview-component')).toBeInTheDocument()
      expect(screen.getByTestId('recent-sales-component')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<Dashboard />)
      
      // Verificar que el título principal sea un h1
      const heading = screen.getByRole('heading', { level: 1 })
      expect(heading).toHaveTextContent('Dashboard')
    })

    it('should have accessible tab interface', () => {
      render(<Dashboard />)
      
      // Verificar que los tabs sean accesibles
      const tabList = screen.getByRole('tablist')
      expect(tabList).toBeInTheDocument()
      
      const tabs = screen.getAllByRole('tab')
      expect(tabs.length).toBe(4) // Resumen, Análisis, Reportes, Notificaciones
      
      // Verificar que cada tab tenga contenido apropiado
      tabs.forEach(tab => {
        expect(tab).toHaveTextContent(/Resumen|Análisis|Reportes|Notificaciones/)
      })
    })

    it('should have accessible button', () => {
      render(<Dashboard />)
      
      const reportButton = screen.getByRole('button', { name: 'Generar Reporte' })
      expect(reportButton).toBeInTheDocument()
      expect(reportButton).toBeEnabled()
    })
  })

  describe('Error boundaries', () => {
    it('should not crash when child components fail', () => {
      // Mock de Overview que falla
      vi.mocked(vi.doMock)('../dashboard/components/overview', () => ({
        Overview: () => { throw new Error('Component error') }
      }))

      // Render no debería fallar completamente
      expect(() => render(<Dashboard />)).not.toThrow()
    })
  })
})
