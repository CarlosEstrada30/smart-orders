import { useNavigate, useRouter } from '@tanstack/react-router'
import { BrandMark } from '@/assets/brand-mark'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type ErrorPageProps = {
  code?: string
  title: string
  description: React.ReactNode
  /** Oculta el código y los botones (p. ej. dentro de un layout) */
  minimal?: boolean
  showActions?: boolean
  className?: string
}

export function ErrorPage({
  code,
  title,
  description,
  minimal = false,
  showActions = true,
  className,
}: ErrorPageProps) {
  const navigate = useNavigate()
  const { history } = useRouter()

  return (
    <div
      className={cn(
        'flex h-svh w-full items-center justify-center px-4',
        className
      )}
    >
      <div className='flex max-w-md flex-col items-start gap-3'>
        {!minimal && (
          <div className='text-primary flex items-center gap-3'>
            <BrandMark className='size-8' />
            {code && (
              <span className='font-display tabular text-5xl font-semibold'>
                {code}
              </span>
            )}
          </div>
        )}
        <h1 className='font-display text-2xl font-semibold'>{title}</h1>
        <p className='text-muted-foreground'>{description}</p>
        {!minimal && showActions && (
          <div className='mt-4 flex flex-wrap gap-3'>
            <Button variant='outline' onClick={() => history.go(-1)}>
              Volver
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>Ir al inicio</Button>
          </div>
        )}
      </div>
    </div>
  )
}
