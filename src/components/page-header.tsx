import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: React.ReactNode
  description?: React.ReactNode
  /** Botones o acciones alineadas a la derecha */
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3',
        className
      )}
    >
      <div className='min-w-0 space-y-1'>
        <h1 className='font-display text-2xl font-semibold sm:text-[1.75rem] sm:leading-9'>
          {title}
        </h1>
        {description && (
          <p className='text-muted-foreground max-w-prose text-sm'>
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className='flex flex-wrap items-center gap-2'>{actions}</div>
      )}
    </div>
  )
}
