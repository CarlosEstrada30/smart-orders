import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthLayout } from '../auth-layout'

export function ForgotPassword() {
  return (
    <AuthLayout>
      <div className='space-y-2'>
        <h1 className='font-display text-[1.75rem] leading-9 font-semibold'>
          ¿Olvidaste tu contraseña?
        </h1>
        <p className='text-muted-foreground'>
          Pide al administrador de tu empresa que la restablezca desde{' '}
          <span className='text-foreground font-medium'>
            Administración › Usuarios
          </span>
          . Después podrás iniciar sesión con la nueva contraseña.
        </p>
      </div>
      <Button asChild variant='outline' className='mt-8 h-10 w-fit'>
        <Link to='/sign-in'>
          <ArrowLeft aria-hidden='true' />
          Volver a iniciar sesión
        </Link>
      </Button>
    </AuthLayout>
  )
}
