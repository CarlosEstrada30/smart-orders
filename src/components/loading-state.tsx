import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type LoadingStateProps = {
  /** Texto para lectores de pantalla */
  label?: string
  variant?: 'table' | 'detail' | 'cards'
  rows?: number
  className?: string
}

export function LoadingState({
  label = 'Cargando…',
  variant = 'table',
  rows = 6,
  className,
}: LoadingStateProps) {
  return (
    <div
      role='status'
      aria-live='polite'
      className={cn('space-y-4', className)}
    >
      <span className='sr-only'>{label}</span>
      {variant === 'table' && (
        <div className='bg-card space-y-3 rounded-xl border p-4'>
          <Skeleton className='h-9 w-full max-w-sm' />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className='h-10 w-full' />
          ))}
        </div>
      )}
      {variant === 'detail' && (
        <>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-16 w-full' />
          <div className='grid gap-4 md:grid-cols-3'>
            <Skeleton className='h-48 md:col-span-2' />
            <Skeleton className='h-48' />
          </div>
        </>
      )}
      {variant === 'cards' && (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className='h-28 rounded-xl' />
          ))}
        </div>
      )}
    </div>
  )
}
