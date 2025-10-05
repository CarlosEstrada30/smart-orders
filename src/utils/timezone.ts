/**
 * Utilidades para manejo de zona horaria del cliente
 */

/**
 * Obtiene la zona horaria del cliente usando la API de Intl
 * @returns La zona horaria del cliente (ej: "America/New_York", "Europe/Madrid")
 */
export function getClientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    // Fallback en caso de que la API de Intl no esté disponible
    console.warn('No se pudo obtener la zona horaria del cliente:', error)
    return 'UTC'
  }
}

/**
 * Verifica si el navegador soporta la API de Intl para zona horaria
 * @returns true si el navegador soporta la detección de zona horaria
 */
export function isTimezoneSupported(): boolean {
  try {
    return typeof Intl !== 'undefined' && 
           typeof Intl.DateTimeFormat !== 'undefined' &&
           typeof Intl.DateTimeFormat().resolvedOptions === 'function'
  } catch {
    return false
  }
}

