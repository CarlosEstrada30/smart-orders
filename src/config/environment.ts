/**
 * Sistema de Configuración Centralizado - SmartOrders
 * 
 * Este archivo centraliza todas las variables de entorno y configuraciones
 * para diferentes ambientes (development, staging, production).
 * 
 * ⚠️  IMPORTANTE: 
 * - Todas las variables de entorno en Vite deben empezar con VITE_
 * - Los valores por defecto deben ser seguros para desarrollo
 * - NUNCA incluir secretos o keys sensibles en este archivo
 */

// Validar que estamos en un entorno válido
type Environment = 'development' | 'staging' | 'production' | 'test'

const validateEnvironment = (env: string): Environment => {
  const validEnvs: Environment[] = ['development', 'staging', 'production', 'test']
  return validEnvs.includes(env as Environment) ? (env as Environment) : 'development'
}

// Configuración principal del entorno
export const ENV = {
  // Entorno actual
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  ENVIRONMENT: validateEnvironment(import.meta.env.VITE_ENVIRONMENT || 'development'),
  
  // Configuración de la aplicación
  APP_NAME: import.meta.env.VITE_APP_NAME || 'SmartOrders',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEBUG: import.meta.env.VITE_DEBUG === 'true' || import.meta.env.NODE_ENV === 'development',
  
  // Configuración de la API
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
  
  // Configuración de funcionalidades
  ENABLE_EXPERIMENTAL_FEATURES: import.meta.env.VITE_ENABLE_EXPERIMENTAL_FEATURES === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  
  // Configuración de Clerk (opcional)
  CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  
} as const

// Verificaciones de configuración según el entorno
export const CONFIG_VALIDATIONS = {
  development: {
    required: ['API_BASE_URL'],
    optional: ['CLERK_PUBLISHABLE_KEY']
  },
  staging: {
    required: ['API_BASE_URL'],
    optional: ['CLERK_PUBLISHABLE_KEY', 'ENABLE_ANALYTICS']
  },
  production: {
    required: ['API_BASE_URL', 'APP_VERSION'],
    optional: ['CLERK_PUBLISHABLE_KEY', 'ENABLE_ANALYTICS']
  },
  test: {
    required: ['API_BASE_URL'],
    optional: []
  }
} as const

// Función para validar configuración
export const validateConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const currentEnv = ENV.ENVIRONMENT
  const validation = CONFIG_VALIDATIONS[currentEnv]
  
  // Verificar variables requeridas
  for (const required of validation.required) {
    const value = ENV[required as keyof typeof ENV]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`Variable requerida faltante o vacía: ${required}`)
    }
  }
  
  // Verificar URL de API válida
  if (ENV.API_BASE_URL && !isValidUrl(ENV.API_BASE_URL)) {
    errors.push(`URL de API inválida: ${ENV.API_BASE_URL}`)
  }
  
  // Verificar timeout válido
  if (ENV.API_TIMEOUT < 1000 || ENV.API_TIMEOUT > 60000) {
    errors.push(`Timeout de API fuera de rango válido (1000-60000ms): ${ENV.API_TIMEOUT}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Utilidad para validar URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

// Configuraciones específicas por entorno
export const getEnvironmentConfig = () => {
  const baseConfig = {
    apiTimeout: ENV.API_TIMEOUT,
    enableLogging: ENV.DEBUG,
    enableErrorReporting: ENV.ENVIRONMENT !== 'development',
  }
  
  switch (ENV.ENVIRONMENT) {
    case 'development':
      return {
        ...baseConfig,
        enableDevTools: true,
        enableMocking: false,
        logLevel: 'debug' as const,
      }
      
    case 'staging':
      return {
        ...baseConfig,
        enableDevTools: true,
        enableMocking: false,
        logLevel: 'info' as const,
      }
      
    case 'production':
      return {
        ...baseConfig,
        enableDevTools: false,
        enableMocking: false,
        logLevel: 'error' as const,
      }
      
    case 'test':
      return {
        ...baseConfig,
        enableDevTools: false,
        enableMocking: true,
        logLevel: 'warn' as const,
      }
      
    default:
      return baseConfig
  }
}

// Exportar configuración específica del entorno
export const ENVIRONMENT_CONFIG = getEnvironmentConfig()

// Función de debug para imprimir configuración (solo en desarrollo)
export const printConfig = (): void => {
  if (ENV.ENVIRONMENT === 'development' && ENV.DEBUG) {
    console.group('🔧 SmartOrders Configuration')
    console.log('Environment:', ENV.ENVIRONMENT)
    console.log('API Base URL:', ENV.API_BASE_URL)
    console.log('Debug Mode:', ENV.DEBUG)
    console.log('App Version:', ENV.APP_VERSION)
    
    const validation = validateConfig()
    if (!validation.isValid) {
      console.error('⚠️  Configuration Errors:', validation.errors)
    } else {
      console.log('✅ Configuration Valid')
    }
    console.groupEnd()
  }
}

// Llamar validación al importar (solo en desarrollo)
if (ENV.ENVIRONMENT === 'development') {
  const validation = validateConfig()
  if (!validation.isValid) {
    console.error('❌ SmartOrders Configuration Error:', validation.errors)
  }
}
