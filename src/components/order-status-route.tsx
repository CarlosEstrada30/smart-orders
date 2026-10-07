import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getOrderStatusData } from '@/features/orders/data/data'

// Paradas del pedido en orden; "cancelled" es un desvío fuera de la ruta
const ROUTE_STOPS = [
  'pending',
  'confirmed',
  'in_progress',
  'shipped',
  'delivered',
] as const

type OrderStatusRouteProps = {
  status: string
  /** "full" para el detalle del pedido, "mini" para tablas y listas */
  variant?: 'full' | 'mini'
  className?: string
}

export function OrderStatusRoute({
  status,
  variant = 'full',
  className,
}: OrderStatusRouteProps) {
  const current = ROUTE_STOPS.indexOf(status as (typeof ROUTE_STOPS)[number])
  const isCancelled = status === 'cancelled'
  const statusData = getOrderStatusData(status)
  const summary = isCancelled
    ? 'Pedido cancelado'
    : `${statusData.label}, paso ${current + 1} de ${ROUTE_STOPS.length}`

  if (variant === 'mini') {
    return (
      <div className={cn('flex items-center gap-2', className)} title={summary}>
        <div className='flex items-center' aria-hidden='true'>
          {ROUTE_STOPS.map((stop, i) => (
            <div key={stop} className='flex items-center'>
              {i > 0 && (
                <span
                  className={cn(
                    'h-0.5 w-2',
                    !isCancelled && i <= current ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  isCancelled
                    ? 'bg-destructive/40'
                    : i < current
                      ? 'bg-primary'
                      : i === current
                        ? 'ring-primary/25 bg-primary size-2.5 ring-2'
                        : 'bg-border'
                )}
              />
            </div>
          ))}
        </div>
        <span
          className={cn(
            'text-sm font-medium whitespace-nowrap',
            isCancelled ? 'text-destructive' : 'text-foreground'
          )}
        >
          {statusData.label}
        </span>
        <span className='sr-only'>{summary}</span>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <ol className='flex items-start' aria-label={summary}>
        {ROUTE_STOPS.map((stop, i) => {
          const stopData = getOrderStatusData(stop)
          const done = !isCancelled && i < current
          const active = !isCancelled && i === current
          return (
            <li
              key={stop}
              aria-current={active ? 'step' : undefined}
              className='relative flex flex-1 flex-col items-center gap-2 text-center'
            >
              {i > 0 && (
                <span
                  aria-hidden='true'
                  className={cn(
                    'absolute top-3.5 right-1/2 h-0.5 w-full -translate-y-1/2',
                    !isCancelled && i <= current ? 'bg-primary' : 'bg-border',
                    isCancelled &&
                      'bg-[repeating-linear-gradient(90deg,var(--border)_0_6px,transparent_6px_10px)]'
                  )}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors',
                  done && 'border-primary bg-primary text-primary-foreground',
                  active &&
                    'border-primary bg-card text-primary ring-primary/15 ring-4',
                  !done &&
                    !active &&
                    'border-border bg-card text-muted-foreground'
                )}
              >
                {done ? (
                  <Check className='size-3.5' aria-hidden='true' />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  'text-xs leading-tight',
                  active
                    ? 'text-foreground font-semibold'
                    : 'text-muted-foreground',
                  !active && 'max-sm:sr-only'
                )}
              >
                {stopData.label}
              </span>
            </li>
          )
        })}
      </ol>
      {isCancelled && (
        <p className='text-destructive mt-3 flex items-center justify-center gap-1.5 text-sm font-medium'>
          <X className='size-4' aria-hidden='true' />
          Este pedido fue cancelado
        </p>
      )}
    </div>
  )
}
