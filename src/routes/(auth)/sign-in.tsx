import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { authService } from '@/services/auth'
import { ApiError } from '@/services/api/config'
import { getUserFromToken } from '@/utils/jwt'
import { extractSubdomain, redirectWithSubdomain } from '@/utils/subdomain'
import { toast } from 'sonner'

export const Route = createFileRoute('/(auth)/sign-in')({
  component: SignInPage,
})

function SignInPage() {
  const search = useSearch({ from: '/(auth)/sign-in' })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { setAccessToken, setUser } = useAuthStore((state) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Extraer subdominio de la URL actual
      const subdominio = extractSubdomain()
      
      // Login real con la API
      const response = await authService.login({ email, password, subdominio })

      // Decodificar JWT para obtener información del usuario
      const userInfo = getUserFromToken(response.access_token)
      
      // Crear usuario con información del JWT
      const user = {
        email: userInfo?.email || email,
        full_name: userInfo?.full_name,
        username: userInfo?.username,
        role: userInfo?.role,
        is_active: userInfo?.is_active,
        is_superuser: userInfo?.is_superuser,
        exp: userInfo?.exp || (Date.now() + (24 * 60 * 60 * 1000)),
        tenant: userInfo?.tenant
      }

      // Guardar token y usuario en el store
      setAccessToken(response.access_token)
      setUser(user)

      toast.success('Inicio de sesión exitoso')

      // Redirigir a la página original o al dashboard preservando el subdominio
      const redirectTo = (search as { redirect?: string }).redirect || '/'
      redirectWithSubdomain(redirectTo)

    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.detail : 'Error al iniciar sesión. Verifica tus credenciales.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
