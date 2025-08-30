/**
 * Configuración de API - SmartOrders
 * 
 * Este archivo contiene toda la configuración relacionada con las llamadas a la API,
 * usando el sistema de variables de entorno centralizado.
 */

import { ENV, ENVIRONMENT_CONFIG } from './environment'

// Configuración principal de la API
export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  TIMEOUT: ENV.API_TIMEOUT,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Configuración de retry
  RETRY_ATTEMPTS: ENV.ENVIRONMENT === 'production' ? 3 : 1,
  RETRY_DELAY: 1000, // ms
  
  // Configuración de cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos en milisegundos
  
  // Configuración de logging
  ENABLE_REQUEST_LOGGING: ENVIRONMENT_CONFIG.enableLogging,
  ENABLE_ERROR_LOGGING: ENVIRONMENT_CONFIG.enableErrorReporting,
  
} as const

// Endpoints principales de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout', 
    ME: '/auth/me',
    PERMISSIONS: '/auth/permissions',
    REFRESH: '/auth/refresh',
  },
  
  // Órdenes
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: number) => `/orders/${id}`,
    BY_CLIENT: (clientId: number) => `/orders/client/${clientId}`,
    STATUS: (id: number, status: string) => `/orders/${id}/status/${status}`,
    ITEMS: (id: number) => `/orders/${id}/items`,
    REMOVE_ITEM: (orderId: number, itemId: number) => `/orders/${orderId}/items/${itemId}`,
    RECEIPT: (id: number) => `/orders/${id}/receipt`,
    RECEIPT_PREVIEW: (id: number) => `/orders/${id}/receipt/preview`,
    RECEIPT_GENERATE: (id: number) => `/orders/${id}/receipt/generate`,
  },
  
  // Clientes
  CLIENTS: {
    BASE: '/clients',
    BY_ID: (id: number) => `/clients/${id}`,
  },
  
  // Productos
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: number) => `/products/${id}`,
  },
  
  // Usuarios
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    ROLES: '/users/roles',
  },
  
  // Inventario
  INVENTORY: {
    BASE: '/inventory',
    BY_ID: (id: number) => `/inventory/${id}`,
    LOW_STOCK: '/inventory/low-stock',
  },
  
  // Rutas
  ROUTES: {
    BASE: '/routes',
    BY_ID: (id: number) => `/routes/${id}`,
  },
  
  // Dashboard y reportes
  DASHBOARD: {
    METRICS: '/dashboard/metrics',
    REVENUE_CHART: '/dashboard/revenue-chart',
    ORDERS_CHART: '/dashboard/orders-chart',
  },
  
  // Pagos (para implementación futura)
  PAYMENTS: {
    BASE: '/payments',
    BY_ORDER: (orderId: number) => `/orders/${orderId}/payments`,
    SUMMARY: (orderId: number) => `/orders/${orderId}/payment-summary`,
  },
  
  // Notificaciones (para implementación futura)
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: number) => `/notifications/${id}/read`,
  },
  
  // Reportes (para implementación futura)
  REPORTS: {
    SALES: '/reports/sales',
    PRODUCTS: '/reports/products',
    CLIENTS: '/reports/clients',
  }
  
} as const

// Tipos de respuesta de la API (mantener compatibilidad)
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface ApiErrorResponse {
  detail: string
  status: number
  message?: string
}

// Clase para manejar errores de la API (mantener compatibilidad)
export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
    message?: string
  ) {
    super(message || detail)
    this.name = 'ApiError'
  }
  
  // Métodos de utilidad
  isNetworkError(): boolean {
    return this.status === 0 || this.status >= 500
  }
  
  isClientError(): boolean {
    return this.status >= 400 && this.status < 500
  }
  
  isAuthError(): boolean {
    return this.status === 401 || this.status === 403
  }
  
  isValidationError(): boolean {
    return this.status === 422
  }
}

// Configuración específica por entorno
export const getApiConfig = () => {
  const config = { ...API_CONFIG }
  
  // Ajustes específicos por entorno
  switch (ENV.ENVIRONMENT) {
    case 'development':
      return {
        ...config,
        TIMEOUT: 15000, // Más tiempo para desarrollo
        RETRY_ATTEMPTS: 1,
      }
      
    case 'staging':
      return {
        ...config,
        TIMEOUT: 12000,
        RETRY_ATTEMPTS: 2,
      }
      
    case 'production':
      return {
        ...config,
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3,
      }
      
    case 'test':
      return {
        ...config,
        TIMEOUT: 5000,
        RETRY_ATTEMPTS: 0,
      }
      
    default:
      return config
  }
}

// Exportar configuración específica del entorno
export const CURRENT_API_CONFIG = getApiConfig()

// Función de utilidad para construir URLs completas
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`
  
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, value.toString())
    })
    url += `?${searchParams.toString()}`
  }
  
  return url
}

// Función de utilidad para logging de requests (solo en desarrollo)
export const logApiRequest = (method: string, url: string, data?: any): void => {
  if (API_CONFIG.ENABLE_REQUEST_LOGGING && ENV.DEBUG) {
    console.group(`🌐 API ${method.toUpperCase()} ${url}`)
    if (data) {
      console.log('Request Data:', data)
    }
    console.groupEnd()
  }
}

// Función de utilidad para logging de errores
export const logApiError = (error: ApiError | Error, context?: string): void => {
  if (API_CONFIG.ENABLE_ERROR_LOGGING) {
    console.error('🚨 API Error:', {
      message: error.message,
      context,
      stack: ENV.DEBUG ? error.stack : undefined,
      ...(error instanceof ApiError ? {
        status: error.status,
        detail: error.detail,
        type: error.isNetworkError() ? 'network' : 
              error.isAuthError() ? 'auth' : 
              error.isClientError() ? 'client' : 'unknown'
      } : {})
    })
  }
}
