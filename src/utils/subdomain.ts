/**
 * Extrae el subdominio de la URL actual
 * 
 * Ejemplos:
 * - bethel.localhost:3000 -> "bethel"
 * - bethel.miapp.com -> "bethel"
 * - localhost:3000 -> ""
 * - miapp.com -> ""
 * - subdomain.app.domain.com -> "subdomain"
 * 
 * @returns El subdominio extraído o cadena vacía si no existe
 */
export function extractSubdomain(): string {
  const hostname = window.location.hostname
  
  // Si es localhost, verificar si hay subdominio
  if (hostname.includes('localhost')) {
    const parts = hostname.split('.')
    // Si solo es "localhost", no hay subdominio
    if (parts.length === 1) {
      return ''
    }
    // Si es "subdomain.localhost", devolver el subdominio
    return parts[0]
  }
  
  // Para dominios de producción
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
 * - En bethel.localhost:3000 con path="/dashboard" -> "http://bethel.localhost:3000/dashboard"
 * - En localhost:3000 con path="/dashboard" -> "http://localhost:3000/dashboard"
 * - En bethel.miapp.com con path="/dashboard" -> "https://bethel.miapp.com/dashboard"
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

