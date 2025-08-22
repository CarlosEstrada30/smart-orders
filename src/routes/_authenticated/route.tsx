import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'
import { isTokenExpired } from '@/utils/jwt'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context: _context }) => {
    const { accessToken, reset } = useAuthStore.getState().auth
    
    // Verificar si no hay token o si está expirado
    if (!accessToken || isTokenExpired(accessToken)) {
      // Limpiar el store si el token está expirado
      if (accessToken && isTokenExpired(accessToken)) {
        reset()
      }
      
      throw redirect({ 
        to: '/sign-in',
        search: { 
          redirect: window.location.pathname 
        }
      })
    }
  },
  component: AuthenticatedLayout,
})
