import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context: _context }) => {
    const token = useAuthStore.getState().auth.accessToken
    if (!token) {
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
