// Utilidad para decodificar JWT
export function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (_error) {
    // Error decodificando JWT
    return null
  }
}

// Función para verificar si el token está expirado
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true
  
  const currentTime = Math.floor(Date.now() / 1000)
  return decoded.exp < currentTime
}

// Función para obtener información del usuario del JWT
export function getUserFromToken(token: string) {
  const decoded = decodeJWT(token)
  if (!decoded) return null
  
  return {
    email: decoded.sub || decoded.email,
    exp: decoded.exp,
    // Agregar más campos según tu JWT
  }
} 