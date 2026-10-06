import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type StatusTone =
  | 'neutral'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

// Tonos semánticos: único lugar donde un estado se convierte en color
export const statusToneClasses: Record<StatusTone, string> = {
  neutral: 'bg-muted text-muted-foreground border-border',
  primary: 'bg-primary/10 text-primary border-primary/25',
  info: 'bg-info/10 text-info border-info/25',
  success: 'bg-success/10 text-success border-success/25',
  warning:
    'bg-warning/20 text-warning-foreground border-warning/50 dark:text-warning',
  danger: 'bg-destructive/10 text-destructive border-destructive/25',
}

type StatusBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: StatusTone
  icon?: LucideIcon
}

export function StatusBadge({
  tone = 'neutral',
  icon: Icon,
  className,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
        statusToneClasses[tone],
        className
      )}
      {...props}
    >
      {Icon && <Icon className='size-3.5' aria-hidden='true' />}
      {children}
    </span>
  )
}
