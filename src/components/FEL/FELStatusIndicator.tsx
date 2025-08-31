/**
 * FEL Status Indicator
 * Componente visual para mostrar el estado de facturas FEL
 */

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { 
  CheckCircle, 
  Clock, 
  Loader2, 
  XCircle, 
  AlertTriangle, 
  Timer,
  FileText,
  Copy
} from 'lucide-react'
import type { FELStatus, InvoiceStatus } from '@/services/fel/types'
import { FEL_STATUS_COLORS, FEL_STATUS_ICONS } from '@/services/fel/types'

interface FELStatusIndicatorProps {
  /** Estado FEL actual */
  fel_status?: FELStatus
  
  /** UUID de la factura FEL (si existe) */
  fel_uuid?: string
  
  /** Mensaje de error FEL */
  fel_error_message?: string
  
  /** Estado general de la factura */
  invoice_status?: InvoiceStatus
  
  /** Si requiere procesamiento FEL */
  requires_fel?: boolean
  
  /** Mostrar UUID completo en tooltip */
  showFullUUID?: boolean
  
  /** Tamaño del indicador */
  size?: 'sm' | 'md' | 'lg'
  
  /** Variante visual */
  variant?: 'badge' | 'icon' | 'full'
  
  /** Mostrar indicador de procesamiento animado */
  animated?: boolean
  
  /** Callback cuando se copia el UUID */
  onCopyUUID?: (uuid: string) => void
  
  /** Clase CSS adicional */
  className?: string
}

export function FELStatusIndicator({
  fel_status,
  fel_uuid,
  fel_error_message,
  invoice_status,
  requires_fel = false,
  showFullUUID = false,
  size = 'md',
  variant = 'badge',
  animated = true,
  onCopyUUID,
  className
}: FELStatusIndicatorProps) {

  // Determinar el estado visual principal
  const getDisplayStatus = () => {
    // Si no requiere FEL, es un comprobante simple
    if (!requires_fel) {
      return {
        status: 'receipt' as const,
        label: 'Comprobante',
        color: 'bg-gray-100 text-gray-800',
        icon: FileText,
        description: 'Comprobante sin valor fiscal'
      }
    }

    // Estados FEL específicos
    switch (fel_status) {
      case 'authorized':
        return {
          status: 'authorized' as const,
          label: 'FEL Autorizada',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          description: 'Factura autorizada por SAT'
        }
      
      case 'processing':
        return {
          status: 'processing' as const,
          label: 'Procesando FEL',
          color: 'bg-blue-100 text-blue-800',
          icon: animated ? Loader2 : Clock,
          description: 'Enviando a SAT para autorización'
        }
      
      case 'pending':
        return {
          status: 'pending' as const,
          label: 'Pendiente FEL',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          description: 'Preparando para envío a SAT'
        }
      
      case 'rejected':
        return {
          status: 'rejected' as const,
          label: 'FEL Rechazada',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          description: 'Rechazada por SAT'
        }
      
      case 'error':
        return {
          status: 'error' as const,
          label: 'Error FEL',
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
          description: 'Error en proceso FEL'
        }
      
      case 'timeout':
        return {
          status: 'timeout' as const,
          label: 'Timeout FEL',
          color: 'bg-orange-100 text-orange-800',
          icon: Timer,
          description: 'Proceso FEL demorado'
        }
      
      default:
        return {
          status: 'unknown' as const,
          label: 'Estado Desconocido',
          color: 'bg-gray-100 text-gray-800',
          icon: AlertTriangle,
          description: 'Estado FEL no definido'
        }
    }
  }

  const displayInfo = getDisplayStatus()
  const IconComponent = displayInfo.icon

  // Formatear UUID para mostrar
  const formatUUID = (uuid?: string) => {
    if (!uuid) return null
    
    if (showFullUUID) return uuid
    
    if (uuid.length > 12) {
      return `${uuid.substring(0, 8)}...${uuid.substring(uuid.length - 4)}`
    }
    
    return uuid
  }

  // Manejar copia de UUID
  const handleCopyUUID = async () => {
    if (!fel_uuid || !onCopyUUID) return
    
    try {
      await navigator.clipboard.writeText(fel_uuid)
      onCopyUUID(fel_uuid)
    } catch (error) {
      console.error('Error copiando UUID:', error)
    }
  }

  // Contenido del tooltip
  const tooltipContent = (
    <div className="space-y-2">
      <div>
        <span className="font-medium">{displayInfo.label}</span>
        <p className="text-xs text-muted-foreground">{displayInfo.description}</p>
      </div>
      
      {fel_uuid && (
        <div>
          <span className="text-xs font-medium">UUID SAT:</span>
          <div className="flex items-center gap-1 mt-1">
            <code className="text-xs bg-muted px-1 rounded">
              {showFullUUID ? fel_uuid : formatUUID(fel_uuid)}
            </code>
            {onCopyUUID && (
              <Copy 
                className="h-3 w-3 cursor-pointer hover:text-primary" 
                onClick={handleCopyUUID}
              />
            )}
          </div>
        </div>
      )}
      
      {fel_error_message && (
        <div>
          <span className="text-xs font-medium text-destructive">Error:</span>
          <p className="text-xs text-destructive">{fel_error_message}</p>
        </div>
      )}
      
      {invoice_status && (
        <div>
          <span className="text-xs font-medium">Estado Factura:</span>
          <span className="text-xs text-muted-foreground ml-1 capitalize">
            {invoice_status}
          </span>
        </div>
      )}
    </div>
  )

  // Renderizado según variante
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center justify-center rounded-full",
              {
                "h-6 w-6": size === 'sm',
                "h-8 w-8": size === 'md', 
                "h-10 w-10": size === 'lg'
              },
              displayInfo.color,
              className
            )}>
              <IconComponent 
                className={cn(
                  {
                    "h-3 w-3": size === 'sm',
                    "h-4 w-4": size === 'md',
                    "h-5 w-5": size === 'lg'
                  },
                  {
                    "animate-spin": animated && displayInfo.status === 'processing'
                  }
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (variant === 'full') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg border",
              displayInfo.color,
              className
            )}>
              <IconComponent 
                className={cn(
                  "h-4 w-4",
                  {
                    "animate-spin": animated && displayInfo.status === 'processing'
                  }
                )}
              />
              <div className="flex flex-col">
                <span className={cn(
                  "font-medium",
                  {
                    "text-xs": size === 'sm',
                    "text-sm": size === 'md',
                    "text-base": size === 'lg'
                  }
                )}>
                  {displayInfo.label}
                </span>
                {fel_uuid && (
                  <span className="text-xs opacity-75">
                    {formatUUID(fel_uuid)}
                  </span>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Variante badge (por defecto)
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary"
            className={cn(
              "inline-flex items-center gap-1",
              displayInfo.color,
              {
                "text-xs px-2 py-1": size === 'sm',
                "text-sm px-3 py-1": size === 'md',
                "text-base px-4 py-2": size === 'lg'
              },
              className
            )}
          >
            <IconComponent 
              className={cn(
                {
                  "h-3 w-3": size === 'sm',
                  "h-4 w-4": size === 'md',
                  "h-5 w-5": size === 'lg'
                },
                {
                  "animate-spin": animated && displayInfo.status === 'processing'
                }
              )}
            />
            <span>{displayInfo.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

