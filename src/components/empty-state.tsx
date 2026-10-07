import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  description?: React.ReactNode
  /** Acción principal, p. ej. un botón "Crear pedido" */
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className
      )}
    >
      {Icon && (
        <div className='bg-accent text-accent-foreground flex size-12 items-center justify-center rounded-full'>
          <Icon className='size-6' aria-hidden='true' />
        </div>
      )}
      <div className='space-y-1'>
        <p className='font-medium'>{title}</p>
        {description && (
          <p className='text-muted-foreground mx-auto max-w-sm text-sm'>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}
