import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { IconFacebook, IconGithub } from '@/assets/brand-icons'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { authService } from '@/services'
import type { LoginRequest } from '@/services/auth'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const formSchema = z.object({
  email: z.email({
    error: (iss) => (iss.input === '' ? 'Please enter your email' : undefined),
  }),
  password: z
    .string()
    .min(1, 'Please enter your password')
    .min(7, 'Password must be at least 7 characters long'),
})

export function UserAuthForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLFormElement>) {
  const router = useRouter()
  const { setAccessToken, setUser } = useAuthStore(state => state.auth)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {
      // Guardar token
      setAccessToken(response.access_token)
      
      // Guardar usuario si viene en la respuesta
      if (response.user) {
        setUser(response.user)
      }
      
      // Mostrar mensaje de éxito
      toast.success('¡Bienvenido! Sesión iniciada correctamente')
      
      // Redirigir al dashboard
      router.navigate({ to: '/' })
    },
    onError: (error: any) => {
      console.error('Login error:', error)
      
      let errorMessage = 'Error al iniciar sesión'
      
      if (error?.detail) {
        errorMessage = error.detail
      } else if (error?.message) {
        errorMessage = error.message
      } else if (error?.status === 401) {
        errorMessage = 'Email o contraseña incorrectos'
      }
      
      toast.error(errorMessage)
    },
  })

  function onSubmit(data: z.infer<typeof formSchema>) {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder='name@example.com' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='text-muted-foreground absolute end-0 -top-0.5 text-sm font-medium hover:opacity-75'
              >
                Forgot password?
              </Link>
            </FormItem>
          )}
        />
        <Button 
          className='mt-2' 
          disabled={loginMutation.isPending}
          type="submit"
        >
          {loginMutation.isPending ? 'Iniciando sesión...' : 'Login'}
        </Button>

        <div className='relative my-2'>
          <div className='absolute inset-0 flex items-center'>
            <span className='w-full border-t' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-2'>
          <Button variant='outline' type='button' disabled={loginMutation.isPending}>
            <IconGithub className='h-4 w-4' /> GitHub
          </Button>
          <Button variant='outline' type='button' disabled={loginMutation.isPending}>
            <IconFacebook className='h-4 w-4' /> Facebook
          </Button>
        </div>
      </form>
    </Form>
  )
}
