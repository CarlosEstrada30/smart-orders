/**
 * Obtiene el dominio principal desde variables de entorno o configuración por defecto
 */
function getMainDomains(): string[] {
  const envMainDomain = import.meta.env.VITE_MAIN_DOMAIN
  const defaultDomains = ['localhost']
  
  if (envMainDomain) {
    return [...defaultDomains, envMainDomain]
  }
  
  // Dominios por defecto si no hay configuración específica
  return [
    ...defaultDomains,
    'smart-orders.onrender.com',  // Dominio de producción en Render
    'miapp.com',                  // Ejemplo de dominio personalizado
  ]
}

/**
 * Extrae el subdominio de la URL actual
 * 
 * Ejemplos:
 * - smart-orders.localhost:3000 -> "smart-orders"
 * - other-subdomain.smart-orders.onrender.com -> "other-subdomain"
 * - smart-orders.onrender.com -> ""
 * - localhost:3000 -> ""
 * - subdomain.miapp.com -> "subdomain"
 * - miapp.com -> ""
 * 
 * @returns El subdominio extraído o cadena vacía si no existe
 */
export function extractSubdomain(): string {
  const hostname = window.location.hostname
  
  // Verificar si es un dominio principal configurado
  const mainDomains = getMainDomains()
  for (const mainDomain of mainDomains) {
    if (hostname === mainDomain || hostname.startsWith('localhost')) {
      // Para localhost, verificar si hay subdominio
      if (hostname.includes('localhost')) {
        const parts = hostname.split('.')
        // Si solo es "localhost", no hay subdominio
        if (parts.length === 1) {
          return ''
        }
        // Si es "subdomain.localhost", devolver el subdominio
        return parts[0]
      }
      // Para otros dominios principales, no hay subdominio
      return ''
    }
    
    // Verificar si es un subdominio de un dominio principal
    if (hostname.endsWith('.' + mainDomain)) {
      const parts = hostname.split('.')
      // El subdominio es todo antes del dominio principal
      const subdomainParts = parts.slice(0, parts.length - mainDomain.split('.').length)
      return subdomainParts.join('.')
    }
  }
  
  // Lógica de respaldo para dominios no configurados
  const parts = hostname.split('.')
  
  // Si hay al menos 3 partes (subdomain.domain.com), extraer subdominio
  // Si solo hay 2 partes (domain.com), no hay subdominio
  if (parts.length >= 3) {
    return parts[0]
  }
  
  return ''
}

/**
 * Verifica si la URL actual tiene un subdominio
 * @returns true si existe un subdominio, false en caso contrario
 */
export function hasSubdomain(): boolean {
  return extractSubdomain() !== ''
}

/**
 * Construye una URL preservando el subdominio actual
 * 
 * Ejemplos:
 * - En smart-orders.localhost:3000 con path="/dashboard" -> "http://smart-orders.localhost:3000/dashboard"
 * - En localhost:3000 con path="/dashboard" -> "http://localhost:3000/dashboard"
 * - En smart-orders.miapp.com con path="/dashboard" -> "https://smart-orders.miapp.com/dashboard"
 * 
 * @param path El path de destino (debe empezar con /)
 * @returns URL completa preservando el subdominio actual
 */
export function buildUrlWithSubdomain(path: string): string {
  const { protocol, hostname, port } = window.location
  
  // Asegurar que el path empiece con /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  
  // Construir la URL base
  let baseUrl = `${protocol}//${hostname}`
  
  // Agregar puerto si existe y no es el puerto por defecto
  if (port && port !== '80' && port !== '443') {
    baseUrl += `:${port}`
  }
  
  return `${baseUrl}${normalizedPath}`
}

/**
 * Redirige a una URL preservando el subdominio actual
 * 
 * @param path El path de destino
 */
export function redirectWithSubdomain(path: string): void {
  const url = buildUrlWithSubdomain(path)
  window.location.href = url
}

