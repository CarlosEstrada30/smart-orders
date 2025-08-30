/**
 * Utilidad para probar y debuggear la configuración de variables de entorno
 * 
 * Este archivo puede ser usado para verificar que las variables de entorno
 * estén configuradas correctamente en diferentes ambientes.
 */

import { ENV, validateConfig, printConfig, ENVIRONMENT_CONFIG } from '@/config/environment'
import { API_CONFIG, buildApiUrl, logApiRequest } from '@/config/api-config'

/**
 * Función para probar la configuración del sistema
 */
export const testConfiguration = () => {
  console.group('🧪 SmartOrders Configuration Test')
  
  // Mostrar información del entorno
  console.log('📊 Environment Info:')
  console.log(`  Environment: ${ENV.ENVIRONMENT}`)
  console.log(`  Node Environment: ${ENV.NODE_ENV}`)
  console.log(`  Debug Mode: ${ENV.DEBUG}`)
  console.log(`  App Version: ${ENV.APP_VERSION}`)
  
  // Mostrar configuración de API
  console.log('\n🌐 API Configuration:')
  console.log(`  Base URL: ${API_CONFIG.BASE_URL}`)
  console.log(`  Timeout: ${API_CONFIG.TIMEOUT}ms`)
  console.log(`  Retry Attempts: ${API_CONFIG.RETRY_ATTEMPTS}`)
  
  // Validar configuración
  console.log('\n✅ Configuration Validation:')
  const validation = validateConfig()
  if (validation.isValid) {
    console.log('  ✅ All configuration is valid!')
  } else {
    console.log('  ❌ Configuration errors found:')
    validation.errors.forEach(error => console.log(`    - ${error}`))
  }
  
  // Probar construcción de URLs
  console.log('\n🔗 URL Building Test:')
  const testUrls = [
    buildApiUrl('/orders'),
    buildApiUrl('/clients', { active: 'true', limit: '10' }),
    buildApiUrl('/products/1')
  ]
  testUrls.forEach(url => console.log(`  ${url}`))
  
  // Probar logging de requests (solo en desarrollo)
  if (ENV.DEBUG) {
    console.log('\n📝 Request Logging Test:')
    logApiRequest('GET', '/orders/test', { test: true })
  }
  
  console.groupEnd()
}

/**
 * Función para mostrar ejemplos de configuración para diferentes entornos
 */
export const showEnvironmentExamples = () => {
  console.group('📋 Environment Configuration Examples')
  
  console.log('Development (.env):')
  console.log(`VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development
VITE_DEBUG=true
VITE_APP_NAME=SmartOrders Dev
VITE_APP_VERSION=1.0.0-dev`)
  
  console.log('\nStaging (.env.staging):')
  console.log(`VITE_API_BASE_URL=https://api-staging.smartorders.com/api/v1
VITE_ENVIRONMENT=staging
VITE_DEBUG=false
VITE_APP_NAME=SmartOrders Staging
VITE_APP_VERSION=1.0.0-staging
VITE_ENABLE_ANALYTICS=true`)
  
  console.log('\nProduction (.env.production):')
  console.log(`VITE_API_BASE_URL=https://api.smartorders.com/api/v1
VITE_ENVIRONMENT=production
VITE_DEBUG=false
VITE_APP_NAME=SmartOrders
VITE_APP_VERSION=1.0.0
VITE_ENABLE_ANALYTICS=true`)
  
  console.groupEnd()
}

/**
 * Función para verificar conectividad con la API
 */
export const testApiConnectivity = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing API connectivity...')
    
    // Probar con una simple llamada fetch
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      headers: API_CONFIG.HEADERS,
    })
    
    if (response.ok) {
      console.log('✅ API is reachable')
      return true
    } else {
      console.log(`⚠️  API responded with status: ${response.status}`)
      return false
    }
  } catch (error) {
    console.error('❌ API connectivity test failed:', error)
    return false
  }
}

// Ejecutar test automáticamente en desarrollo
if (ENV.DEBUG && ENV.ENVIRONMENT === 'development') {
  // Retrasar la ejecución para evitar conflictos con el startup
  setTimeout(() => {
    printConfig()
    // Uncomment para ejecutar tests automáticamente:
    // testConfiguration()
  }, 1000)
}

export default {
  testConfiguration,
  showEnvironmentExamples,
  testApiConnectivity,
}
