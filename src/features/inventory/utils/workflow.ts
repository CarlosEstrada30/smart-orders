import type { EntryStatus } from '@/services/inventory'

// Definición de transiciones permitidas según la especificación
export const ALLOWED_TRANSITIONS: Record<EntryStatus, EntryStatus[]> = {
  draft: ['pending', 'approved', 'cancelled'],
  pending: ['approved', 'cancelled'],
  approved: ['completed', 'cancelled'],
  completed: [], // Estado final
  cancelled: [] // Estado final
}

// Validar si una transición de estado es permitida
export function isTransitionAllowed(currentStatus: EntryStatus, targetStatus: EntryStatus): boolean {
  return ALLOWED_TRANSITIONS[currentStatus]?.includes(targetStatus) ?? false
}

// Obtener próximos estados válidos para un estado actual
export function getValidNextStates(currentStatus: EntryStatus): EntryStatus[] {
  return ALLOWED_TRANSITIONS[currentStatus] || []
}

// Configuración de acciones y sus transiciones correspondientes
export interface WorkflowAction {
  id: string
  label: string
  targetStatus: EntryStatus
  variant: 'default' | 'outline' | 'destructive' | 'secondary'
  icon: string
  requiresConfirmation: boolean
  confirmationLevel: 'standard' | 'critical' | 'warning'
  description: string
}

// Acciones disponibles por estado según la especificación del flujo
export const WORKFLOW_ACTIONS: Record<EntryStatus, WorkflowAction[]> = {
  draft: [
    {
      id: 'submit',
      label: 'Enviar para Aprobación',
      targetStatus: 'pending',
      variant: 'default',
      icon: 'send',
      requiresConfirmation: true,
      confirmationLevel: 'standard',
      description: 'Envía la entrada al supervisor para revisión y aprobación'
    },
    {
      id: 'approve_direct',
      label: 'Aprobar Directamente',
      targetStatus: 'approved',
      variant: 'outline',
      icon: 'check-circle',
      requiresConfirmation: true,
      confirmationLevel: 'warning',
      description: 'Solo para supervisores: Aprueba directamente sin revisión'
    },
    {
      id: 'cancel',
      label: 'Cancelar',
      targetStatus: 'cancelled',
      variant: 'destructive',
      icon: 'x-circle',
      requiresConfirmation: true,
      confirmationLevel: 'warning',
      description: 'Cancela permanentemente esta entrada'
    }
  ],
  pending: [
    {
      id: 'approve',
      label: 'Aprobar',
      targetStatus: 'approved',
      variant: 'default',
      icon: 'check-circle',
      requiresConfirmation: true,
      confirmationLevel: 'standard',
      description: 'Aprueba la entrada después de verificar la mercancía físicamente'
    },
    {
      id: 'cancel',
      label: 'Rechazar/Cancelar',
      targetStatus: 'cancelled',
      variant: 'destructive',
      icon: 'x-circle',
      requiresConfirmation: true,
      confirmationLevel: 'warning',
      description: 'Rechaza o cancela la entrada permanentemente'
    }
  ],
  approved: [
    {
      id: 'complete',
      label: 'Completar Entrada',
      targetStatus: 'completed',
      variant: 'default',
      icon: 'check-circle-2',
      requiresConfirmation: true,
      confirmationLevel: 'critical',
      description: '⚠️ CRÍTICO: Actualiza el stock permanentemente en el sistema'
    },
    {
      id: 'cancel',
      label: 'Cancelar',
      targetStatus: 'cancelled',
      variant: 'destructive',
      icon: 'x-circle',
      requiresConfirmation: true,
      confirmationLevel: 'warning',
      description: 'Cancela la entrada sin actualizar el stock'
    }
  ],
  completed: [], // No hay acciones disponibles para entradas completadas
  cancelled: [] // No hay acciones disponibles para entradas canceladas
}

// Mensajes de confirmación detallados según la especificación
export function getConfirmationConfig(action: WorkflowAction, entryNumber: string, entryType: string) {
  const baseConfig = {
    title: '',
    description: '',
    confirmLabel: '',
    cancelLabel: 'Cancelar',
    variant: action.confirmationLevel
  }

  switch (action.id) {
    case 'submit':
      return {
        ...baseConfig,
        title: '📋 Enviar para Aprobación',
        description: `¿Enviar la entrada ${entryNumber} (${entryType}) para aprobación del supervisor?\n\nEl supervisor recibirá una notificación para revisar y verificar físicamente la mercancía.`,
        confirmLabel: 'Enviar para Aprobación'
      }

    case 'approve':
    case 'approve_direct':
      return {
        ...baseConfig,
        title: '✅ Aprobar Entrada',
        description: `¿Aprobar la entrada ${entryNumber} (${entryType})?\n\n⚠️ IMPORTANTE: Confirma que has verificado físicamente la mercancía y las cantidades son correctas.\n\nDespués de aprobar, la entrada estará lista para completar y actualizar el stock.`,
        confirmLabel: 'Confirmar Aprobación'
      }

    case 'complete':
      return {
        ...baseConfig,
        title: '🎯 COMPLETAR ENTRADA - ACTUALIZAR STOCK',
        description: `⚠️ ACCIÓN CRÍTICA ⚠️\n\n¿Completar la entrada ${entryNumber} (${entryType})?\n\n🔴 ESTO ACTUALIZARÁ EL STOCK PERMANENTEMENTE\n🔴 Esta acción NO se puede deshacer\n🔴 Los productos se sumarán al inventario actual\n\nConfirma que la mercancía está físicamente en el almacén.`,
        confirmLabel: 'SÍ, ACTUALIZAR STOCK',
        variant: 'critical' as const
      }

    case 'cancel':
      return {
        ...baseConfig,
        title: '❌ Cancelar Entrada',
        description: `¿Cancelar la entrada ${entryNumber} (${entryType})?\n\n⚠️ Esta acción no se puede deshacer\n⚠️ La entrada quedará marcada como cancelada permanentemente\n⚠️ No se actualizará el stock`,
        confirmLabel: 'Confirmar Cancelación'
      }

    default:
      return {
        ...baseConfig,
        title: 'Confirmar Acción',
        description: `¿Confirmar ${action.label.toLowerCase()} en entrada ${entryNumber}?`,
        confirmLabel: 'Confirmar'
      }
  }
}

// Roles y permisos (simulado - en producción vendría del backend)
export type UserRole = 'operario' | 'supervisor' | 'gerente' | 'admin'

// Configuración de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, {
  canCreate: boolean
  canEdit: string[] // Estados en los que puede editar
  canSubmit: boolean
  canApprove: boolean
  canComplete: boolean
  canCancel: string[] // Estados en los que puede cancelar
  canDelete: string[] // Estados en los que puede eliminar
  canViewAll: boolean // Ver todas las entradas o solo las propias
}> = {
  operario: {
    canCreate: true,
    canEdit: ['draft'],
    canSubmit: true,
    canApprove: false,
    canComplete: false,
    canCancel: ['draft'], // Solo sus propias entradas en draft
    canDelete: [],
    canViewAll: false
  },
  supervisor: {
    canCreate: true,
    canEdit: ['draft', 'pending'],
    canSubmit: true,
    canApprove: true,
    canComplete: true,
    canCancel: ['draft', 'pending', 'approved'],
    canDelete: ['draft'],
    canViewAll: true
  },
  gerente: {
    canCreate: true,
    canEdit: ['draft', 'pending', 'approved'],
    canSubmit: true,
    canApprove: true,
    canComplete: true,
    canCancel: ['draft', 'pending', 'approved'],
    canDelete: ['draft', 'pending'],
    canViewAll: true
  },
  admin: {
    canCreate: true,
    canEdit: ['draft', 'pending', 'approved'],
    canSubmit: true,
    canApprove: true,
    canComplete: true,
    canCancel: ['draft', 'pending', 'approved'],
    canDelete: ['draft', 'pending', 'approved'],
    canViewAll: true
  }
}

// Filtrar acciones disponibles según el rol del usuario
export function getAvailableActionsForUser(
  entryStatus: EntryStatus,
  userRole: UserRole,
  isOwner: boolean = false
): WorkflowAction[] {
  const allActions = WORKFLOW_ACTIONS[entryStatus] || []
  const permissions = ROLE_PERMISSIONS[userRole]

  return allActions.filter(action => {
    switch (action.id) {
      case 'submit':
        return permissions.canSubmit

      case 'approve':
      case 'approve_direct':
        return permissions.canApprove

      case 'complete':
        return permissions.canComplete

      case 'cancel':
        return permissions.canCancel.includes(entryStatus) && 
               (permissions.canViewAll || isOwner)

      default:
        return true
    }
  })
}

// Obtener tooltip explicativo para el estado actual
export function getStatusTooltip(status: EntryStatus): string {
  const tooltips = {
    draft: '📝 Borrador: Entrada recién creada, puede ser editada',
    pending: '⏳ Pendiente: Esperando aprobación del supervisor para verificar mercancía',
    approved: '✅ Aprobado: Mercancía verificada, listo para actualizar stock',
    completed: '🎉 Completado: Stock actualizado permanentemente en el sistema',
    cancelled: '❌ Cancelado: Entrada cancelada, no afecta el stock'
  }

  return tooltips[status] || status
}

// Validar si un usuario puede realizar una acción específica
export function canUserPerformAction(
  action: string,
  entryStatus: EntryStatus,
  userRole: UserRole,
  isOwner: boolean = false
): boolean {
  const availableActions = getAvailableActionsForUser(entryStatus, userRole, isOwner)
  return availableActions.some(a => a.id === action)
}
