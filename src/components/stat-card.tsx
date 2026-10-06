import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

type StatCardProps = {
  label: string
  value: React.ReactNode
  /** Contexto breve bajo la cifra, p. ej. "12 pedidos pendientes" */
  hint?: React.ReactNode
  icon?: LucideIcon
  isLoading?: boolean
  className?: string
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  isLoading,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn('bg-card min-w-0 rounded-xl border p-3 sm:p-4', className)}
    >
      <div className='text-muted-foreground flex items-center justify-between gap-2 text-sm'>
        <span className='line-clamp-2'>{label}</span>
        {Icon && (
          <Icon className='size-4 shrink-0 max-sm:hidden' aria-hidden='true' />
        )}
      </div>
      {isLoading ? (
        <Skeleton className='mt-2 h-8 w-28' />
      ) : (
        <p className='font-display tabular mt-1 truncate text-xl font-semibold sm:text-[1.75rem] sm:leading-9'>
          {value}
        </p>
      )}
      {hint && !isLoading && (
        <p className='text-muted-foreground mt-1 text-xs'>{hint}</p>
      )}
    </div>
  )
}
