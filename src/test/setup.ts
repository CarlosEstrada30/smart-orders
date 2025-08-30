/**
 * Setup file para Vitest
 * Se ejecuta antes de todos los tests para configurar el entorno
 */

import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll, afterAll } from 'vitest'

// Limpiar después de cada test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// ===== MOCKS GLOBALES =====

// Mock del módulo de autenticación
export const mockAuthStore = {
  auth: {
    user: { 
      id: 1, 
      name: 'Test User', 
      email: 'test@example.com',
      role: 'admin'
    },
    accessToken: 'test-token-123',
    permissions: {
      role: 'admin',
      is_superuser: true,
      users: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      orders: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      products: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      clients: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      reports: { can_view: true },
      inventory: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      routes: { can_view: true, can_create: true, can_edit: true, can_delete: true }
    },
    setUser: vi.fn(),
    setPermissions: vi.fn(),
    setAccessToken: vi.fn(),
    reset: vi.fn(),
    checkTokenExpiration: vi.fn(() => false)
  }
}

// Mock simplificado que siempre retorna el estado mockeado
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: () => mockAuthStore
  }
}))

// Mock de la configuración de entorno para tests
vi.mock('@/config/environment', async () => {
  const actual = await vi.importActual('@/config/environment')
  return {
    ...actual,
    ENV: {
      NODE_ENV: 'test',
      ENVIRONMENT: 'test',
      APP_NAME: 'SmartOrders Test',
      APP_VERSION: '1.0.0-test',
      DEBUG: false,
      API_BASE_URL: 'http://localhost:8000/api/v1',
      API_TIMEOUT: 5000,
      ENABLE_EXPERIMENTAL_FEATURES: false,
      ENABLE_ANALYTICS: false,
      CLERK_PUBLISHABLE_KEY: ''
    }
  }
})

// Mock de la configuración de API
vi.mock('@/config/api-config', async () => {
  const actual = await vi.importActual('@/config/api-config')
  return {
    ...actual,
    API_CONFIG: {
      BASE_URL: 'http://localhost:8000/api/v1',
      TIMEOUT: 5000,
      HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      RETRY_ATTEMPTS: 0,
      RETRY_DELAY: 0,
      CACHE_TTL: 0,
      ENABLE_REQUEST_LOGGING: false,
      ENABLE_ERROR_LOGGING: false,
    }
  }
})

// Mock del router de TanStack
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router')
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({ id: '1' })),
    useSearch: vi.fn(() => ({})),
    Link: vi.fn(({ children }) => children),
    useRouter: vi.fn(() => ({
      navigate: vi.fn(),
      history: { push: vi.fn(), replace: vi.fn() }
    }))
  }
})

// Mock de React Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query')
  return {
    ...actual,
    useQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn()
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null
    })),
    useQueryClient: vi.fn(() => ({
      invalidateQueries: vi.fn(),
      setQueryData: vi.fn(),
      getQueryData: vi.fn()
    }))
  }
})

// Mock de Sonner (toast notifications)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  },
  Toaster: vi.fn(({ children }) => children)
}))

// Mock de Lucide React icons
vi.mock('lucide-react', () => {
  const MockIcon = vi.fn(() => 'MockIcon')
  
  return new Proxy({}, {
    get: (target, prop) => MockIcon
  })
})

// ===== CONFIGURACIÓN DE FETCH MOCK =====

// Mock global de fetch para APIs
global.fetch = vi.fn()

// Configurar fetch mock por defecto
beforeAll(() => {
  (global.fetch as any).mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({}),
    text: async () => '',
    blob: async () => new Blob(),
    headers: new Headers(),
  })
})

afterAll(() => {
  vi.restoreAllMocks()
})

// ===== UTILIDADES PARA TESTS =====

// Helper para mockear respuestas de API exitosas
export const mockApiSuccess = (data: any) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => data,
    headers: new Headers({
      'content-type': 'application/json',
    }),
  })
}

// Helper para mockear errores de API
export const mockApiError = (status: number, message: string) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    json: async () => ({ detail: message }),
    headers: new Headers(),
  })
}

// Helper para mockear errores de red
export const mockNetworkError = () => {
  (global.fetch as any).mockRejectedValueOnce(new Error('Network Error'))
}

// Configuración de ResizeObserver para componentes que lo necesiten
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Configuración de IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}))

// Mock de matchMedia para responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Silenciar console.error durante tests (opcional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Configuración adicional para tests
export { mockAuthStore }
