/**
 * FEL Processing Loader
 * Componente para mostrar progreso de procesamiento FEL
 */

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
// Progress component inline
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Timer,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FELStatus } from '@/services/fel/types'

interface FELProcessingLoaderProps {
  /** Si está abierto el modal */
  open: boolean
  
  /** Estado actual del proceso FEL */
  status: FELStatus | null
  
  /** Progreso del procesamiento (0-100) */
  progress: number
  
  /** Tiempo transcurrido en segundos */
  timeElapsed: number
  
  /** Tiempo estimado restante en segundos */
  estimatedTimeLeft: number
  
  /** Mensaje de error si existe */
  error: string | null
  
  /** UUID si el proceso fue exitoso */
  fel_uuid?: string
  
  /** Si se puede cancelar el proceso */
  canCancel?: boolean
  
  /** Si se puede reintentar */
  canRetry?: boolean
  
  /** Callback para cancelar */
  onCancel?: () => void
  
  /** Callback para reintentar */
  onRetry?: () => void
  
  /** Callback para cerrar */
  onClose?: () => void
}

export function FELProcessingLoader({
  open,
  status,
  progress,
  timeElapsed,
  estimatedTimeLeft,
  error,
  fel_uuid,
  canCancel = true,
  canRetry = false,
  onCancel,
  onRetry,
  onClose
}: FELProcessingLoaderProps) {

  // Configuración visual según el estado
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'Preparando Factura FEL',
          description: 'Validando datos antes del envío a SAT',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          icon: Clock,
          showProgress: true,
          showTimer: true
        }

      case 'processing':
        return {
          title: 'Procesando con SAT',
          description: 'Enviando factura para autorización fiscal',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          icon: Loader2,
          showProgress: true,
          showTimer: true,
          iconSpin: true
        }

      case 'authorized':
        return {
          title: '¡Factura FEL Autorizada!',
          description: 'La factura fue autorizada exitosamente por SAT',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: CheckCircle,
          showProgress: false,
          showTimer: false
        }

      case 'rejected':
        return {
          title: 'Factura FEL Rechazada',
          description: 'SAT rechazó la factura por datos incorrectos',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: XCircle,
          showProgress: false,
          showTimer: false
        }

      case 'error':
        return {
          title: 'Error en Proceso FEL',
          description: 'Ocurrió un error técnico durante el procesamiento',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: AlertTriangle,
          showProgress: false,
          showTimer: false
        }

      case 'timeout':
        return {
          title: 'Proceso FEL Demorado',
          description: 'El proceso está tomando más tiempo del esperado',
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          icon: Timer,
          showProgress: false,
          showTimer: true
        }

      default:
        return {
          title: 'Procesando...',
          description: 'Iniciando proceso de facturación',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          icon: Loader2,
          showProgress: true,
          showTimer: true,
          iconSpin: true
        }
    }
  }

  const config = getStatusConfig()
  const IconComponent = config.icon

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  // Determinar si el proceso terminó
  const isFinished = ['authorized', 'rejected', 'error', 'timeout'].includes(status || '')
  const isSuccess = status === 'authorized'
  const isError = ['rejected', 'error', 'timeout'].includes(status || '')

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={!isFinished ? undefined : handleClose}>
      <DialogContent className="max-w-md" hideCloseButton={!isFinished}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn("p-2 rounded-full", config.bgColor)}>
              <IconComponent 
                className={cn(
                  "h-5 w-5",
                  config.color,
                  config.iconSpin && "animate-spin"
                )}
              />
            </div>
            {config.title}
          </DialogTitle>
          <DialogDescription>
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barra de progreso */}
          {config.showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progreso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Información de tiempo */}
          {config.showTimer && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-2xl">{formatTime(timeElapsed)}</div>
                <div className="text-muted-foreground">Transcurrido</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-2xl">
                  {estimatedTimeLeft > 0 ? formatTime(estimatedTimeLeft) : '--'}
                </div>
                <div className="text-muted-foreground">Restante</div>
              </div>
            </div>
          )}

          {/* UUID si está autorizada */}
          {isSuccess && fel_uuid && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-medium text-green-800">UUID SAT:</div>
                  <code className="text-xs bg-white px-2 py-1 rounded border">
                    {fel_uuid}
                  </code>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Mensaje de error */}
          {isError && error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium">Error:</div>
                <div className="text-sm mt-1">{error}</div>
              </AlertDescription>
            </Alert>
          )}

          {/* Estados intermedios con información */}
          {status === 'processing' && (
            <Alert className="bg-blue-50 border-blue-200">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertDescription className="text-blue-800">
                La factura está siendo verificada por SAT. Este proceso puede tomar hasta 60 segundos.
              </AlertDescription>
            </Alert>
          )}

          {status === 'timeout' && (
            <Alert className="bg-orange-50 border-orange-200">
              <Timer className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                El proceso está tomando más tiempo del esperado. Puede verificar el estado más tarde.
              </AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2 justify-end">
            {!isFinished && canCancel && onCancel && (
              <Button variant="outline" onClick={onCancel} size="sm">
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}

            {isError && canRetry && onRetry && (
              <Button onClick={onRetry} size="sm">
                <Loader2 className="h-4 w-4 mr-1" />
                Reintentar
              </Button>
            )}

            {isFinished && (
              <Button onClick={handleClose} variant={isSuccess ? "default" : "outline"} size="sm">
                {isSuccess ? 'Continuar' : 'Cerrar'}
              </Button>
            )}
          </div>

          {/* Información adicional para estados finales */}
          {isSuccess && (
            <div className="text-xs text-center text-muted-foreground">
              La factura FEL ha sido autorizada y ya puede ser utilizada para deducciones fiscales.
            </div>
          )}

          {status === 'rejected' && (
            <div className="text-xs text-center text-muted-foreground">
              Verifique los datos del cliente y la orden antes de reintentar.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
