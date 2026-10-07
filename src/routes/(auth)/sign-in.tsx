import { useState, useEffect } from 'react'
import { createFileRoute, Link, useSearch } from '@tanstack/react-router'
import { ApiError } from '@/services/api/config'
import { authService } from '@/services/auth'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { BrandMark } from '@/assets/brand-mark'
import { useAuthStore } from '@/stores/auth-store'
import { getUserFromToken, isTokenExpired } from '@/utils/jwt'
import { extractSubdomain, redirectWithSubdomain } from '@/utils/subdomain'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthLayout } from '@/features/auth/auth-layout'

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
  const [checkingAuth, setCheckingAuth] = useState(true)

  const {
    setAccessToken,
    setUser,
    reset,
    isLoggingOut,
    setLoggingOut,
    accessToken,
  } = useAuthStore((state) => state.auth)

  // Verificar si el usuario ya está autenticado y redirigir al dashboard
  useEffect(() => {
    if (accessToken && !isTokenExpired(accessToken)) {
      // Usuario ya está logueado, redirigir al dashboard
      const redirectTo = (search as { redirect?: string }).redirect || '/'
      redirectWithSubdomain(redirectTo)
    } else {
      // No hay token válido, mostrar formulario de login
      setCheckingAuth(false)
    }
  }, [accessToken, search])

  // Limpiar el estado de autenticación al cargar la página de sign-in
  useEffect(() => {
    // Si se está haciendo logout, limpiar el estado
    if (isLoggingOut) {
      setLoggingOut(false)
      reset()
    }
  }, [isLoggingOut, reset, setLoggingOut])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('Ingresa tu correo y tu contraseña')
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
        exp: userInfo?.exp || Date.now() + 24 * 60 * 60 * 1000,
        tenant: userInfo?.tenant,
      }

      // Guardar token y usuario en el store
      setAccessToken(response.access_token)
      setUser(user)

      toast.success('Inicio de sesión exitoso')

      // Redirigir a la página original o al dashboard preservando el subdominio
      const redirectTo = (search as { redirect?: string }).redirect || '/'
      redirectWithSubdomain(redirectTo)
    } catch (err) {
      const errorMessage =
        err instanceof ApiError
          ? err.detail
          : 'Error al iniciar sesión. Verifica tus credenciales.'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Mostrar loading mientras se verifica la autenticación
  if (checkingAuth) {
    return (
      <div className='bg-background flex min-h-svh items-center justify-center'>
        <div
          role='status'
          className='flex flex-col items-center gap-3 text-center'
        >
          <BrandMark className='text-primary size-10 animate-pulse' />
          <p className='text-muted-foreground text-sm'>Verificando sesión…</p>
        </div>
      </div>
    )
  }

  return (
    <AuthLayout>
      <div className='mb-8 space-y-2'>
        <h1 className='font-display text-[1.75rem] leading-9 font-semibold'>
          Iniciar sesión
        </h1>
        <p className='text-muted-foreground text-sm'>
          Usa el correo y la contraseña que te asignó el administrador de tu
          empresa.
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-5' noValidate>
        <div className='space-y-2'>
          <Label htmlFor='email'>Correo</Label>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            placeholder='nombre@empresa.com'
            className='h-10'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between gap-2'>
            <Label htmlFor='password'>Contraseña</Label>
            <Link
              to='/forgot-password'
              className='text-muted-foreground hover:text-primary text-sm'
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              placeholder='••••••••'
              className='h-10 pe-10'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='absolute end-0 top-0 h-full px-3 hover:bg-transparent'
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              aria-label={
                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
              }
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type='submit' className='h-10 w-full' disabled={loading}>
          {loading ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Iniciando sesión…
            </>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>
    </AuthLayout>
  )
}
