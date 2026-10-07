import { Badge } from '@/components/ui/badge'
import { 
  Package, 
  ShoppingCart, 
  RotateCcw, 
  Settings, 
  ArrowLeftRight, 
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle
} from 'lucide-react'
import type { EntryType, EntryStatus } from './schema'
import { ENTRY_TYPE_LABELS, ENTRY_STATUS_LABELS } from '@/services/inventory'

// Configuración de iconos y estilos para tipos de entrada
export const getEntryTypeData = (type: EntryType) => {
  const typeConfig = {
    production: {
      label: ENTRY_TYPE_LABELS.production,
      icon: Package,
      color: 'bg-info/15 text-info border-info/30',
      description: 'Entrada por producción interna'
    },
    return: {
      label: ENTRY_TYPE_LABELS.return,
      icon: RotateCcw,
      color: 'bg-warning/20 text-warning-foreground dark:text-warning border-warning/50',
      description: 'Devolución de productos'
    },
    adjustment: {
      label: ENTRY_TYPE_LABELS.adjustment,
      icon: Settings,
      color: 'bg-primary/15 text-primary border-primary/30',
      description: 'Ajuste de inventario'
    },
    initial: {
      label: ENTRY_TYPE_LABELS.initial,
      icon: Plus,
      color: 'bg-muted text-foreground border-border',
      description: 'Inventario inicial'
    }
  }

  return typeConfig[type] || typeConfig.adjustment
}

// Configuración de iconos y estilos para estados de entrada
export const getEntryStatusData = (status: EntryStatus) => {
  const statusConfig = {
    draft: {
      label: ENTRY_STATUS_LABELS.draft,
      icon: FileText,
      color: 'bg-muted text-foreground border-border',
      variant: 'secondary' as const,
      description: 'Entrada en borrador'
    },
    pending: {
      label: ENTRY_STATUS_LABELS.pending,
      icon: Clock,
      color: 'bg-warning/20 text-warning-foreground dark:text-warning border-warning/50',
      variant: 'outline' as const,
      description: 'Pendiente de aprobación'
    },
    approved: {
      label: ENTRY_STATUS_LABELS.approved,
      icon: CheckCircle,
      color: 'bg-info/15 text-info border-info/30',
      variant: 'default' as const,
      description: 'Aprobado, listo para completar'
    },
    completed: {
      label: ENTRY_STATUS_LABELS.completed,
      icon: CheckCircle,
      color: 'bg-success/15 text-success border-success/30',
      variant: 'default' as const,
      description: 'Completado y stock actualizado'
    },
    cancelled: {
      label: ENTRY_STATUS_LABELS.cancelled,
      icon: XCircle,
      color: 'bg-destructive/15 text-destructive border-destructive/30',
      variant: 'destructive' as const,
      description: 'Entrada cancelada'
    }
  }

  return statusConfig[status] || statusConfig.draft
}

// Opciones para filtros
export const entryTypeOptions = [
  { value: 'production', label: ENTRY_TYPE_LABELS.production },
  { value: 'return', label: ENTRY_TYPE_LABELS.return },
  { value: 'adjustment', label: ENTRY_TYPE_LABELS.adjustment },
  { value: 'initial', label: ENTRY_TYPE_LABELS.initial }
]

export const entryStatusOptions = [
  { value: 'draft', label: ENTRY_STATUS_LABELS.draft },
  { value: 'pending', label: ENTRY_STATUS_LABELS.pending },
  { value: 'approved', label: ENTRY_STATUS_LABELS.approved },
  { value: 'completed', label: ENTRY_STATUS_LABELS.completed },
  { value: 'cancelled', label: ENTRY_STATUS_LABELS.cancelled }
]

// Configuración de columnas para diferentes tipos de entrada
export const getColumnConfigForType = (type: EntryType) => {
  const baseColumns = ['select', 'entry_number', 'entry_date', 'status', 'total_cost', 'actions']
  
  switch (type) {
    case 'purchase':
      return [...baseColumns.slice(0, 3), 'supplier_info', ...baseColumns.slice(3)]
    case 'production':
      return [...baseColumns.slice(0, 3), 'reference_document', ...baseColumns.slice(3)]
    default:
      return baseColumns
  }
}

// Validaciones específicas por tipo
export const getValidationRulesForType = (type: EntryType) => {
  switch (type) {
    case 'purchase':
      return {
        requiresSupplier: true,
        requiresReference: false,
        allowsNegativeQuantity: false,
        requiresCost: true
      }
    case 'production':
      return {
        requiresSupplier: false,
        requiresReference: true,
        allowsNegativeQuantity: false,
        requiresCost: false
      }
    case 'adjustment':
      return {
        requiresSupplier: false,
        requiresReference: false,
        allowsNegativeQuantity: true,
        requiresCost: false
      }
    case 'return':
      return {
        requiresSupplier: false,
        requiresReference: false,
        allowsNegativeQuantity: false,
        requiresCost: false
      }
    default:
      return {
        requiresSupplier: false,
        requiresReference: false,
        allowsNegativeQuantity: false,
        requiresCost: false
      }
  }
}

// Acciones disponibles por estado
export const getAvailableActionsForStatus = (status: EntryStatus) => {
  switch (status) {
    case 'draft':
      return ['edit', 'delete', 'submit']
    case 'pending':
      return ['view', 'approve', 'cancel']
    case 'approved':
      return ['view', 'complete', 'cancel']
    case 'completed':
      return ['view']
    case 'cancelled':
      return ['view', 'clone']
    default:
      return ['view']
  }
}

// Mensajes de confirmación para acciones
export const getConfirmationMessage = (action: string, entryNumber: string) => {
  const messages = {
    approve: `¿Estás seguro de que quieres aprobar la entrada ${entryNumber}?`,
    complete: `¿Completar la entrada ${entryNumber}? Esto actualizará el stock de los productos.`,
    cancel: `¿Cancelar la entrada ${entryNumber}? Esta acción no se puede deshacer.`,
    delete: `¿Eliminar la entrada ${entryNumber}? Esta acción no se puede deshacer.`,
  }
  
  return messages[action as keyof typeof messages] || `¿Confirmar acción en entrada ${entryNumber}?`
}

