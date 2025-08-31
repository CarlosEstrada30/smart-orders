/**
 * FEL Error Handler
 * Componente para manejar y mostrar errores FEL con opciones de recuperación
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle,
  RefreshCw,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { 
  FELInvoice, 
  FELErrorCode, 
  FEL_ERROR_CODES 
} from '@/services/fel/types'

interface FELErrorHandlerProps {
  /** Factura con error FEL */
  invoice: FELInvoice
  
  /** Si está procesando una acción */
  isProcessing?: boolean
  
  /** Callback para reintentar FEL */
  onRetryFEL?: () => void
  
  /** Callback para generar comprobante alternativo */
  onCreateReceipt?: () => void
  
  /** Callback para editar datos del cliente */
  onEditClient?: () => void
  
  /** Si mostrar detalles técnicos expandibles */
  showTechnicalDetails?: boolean
  
  /** Clase CSS adicional */
  className?: string
}

export function FELErrorHandler({
  invoice,
  isProcessing = false,
  onRetryFEL,
  onCreateReceipt,
  onEditClient,
  showTechnicalDetails = true,
  className
}: FELErrorHandlerProps) {

  const [showDetails, setShowDetails] = React.useState(false)
  
  const { fel } = invoice

  // Obtener información del error
  const getErrorInfo = () => {
    const errorCode = fel.fel_error_code
    const message = fel.fel_error_message || 'Error desconocido'
    
    // Obtener descripción amigable del error
    const friendlyMessage = errorCode && FEL_ERROR_CODES[errorCode] 
      ? FEL_ERROR_CODES[errorCode]
      : message

    return {
      code: errorCode,
      message,
      friendlyMessage,
      canRetry: fel.fel_attempts < fel.fel_max_attempts,
      attemptsLeft: fel.fel_max_attempts - fel.fel_attempts
    }
  }

  const errorInfo = getErrorInfo()

  // Determinar acciones recomendadas según el tipo de error
  const getRecommendedActions = () => {
    const actions: Array<{
      type: 'retry' | 'receipt' | 'edit_client' | 'contact_support'
      label: string
      description: string
      priority: 'high' | 'medium' | 'low'
      icon: React.ComponentType<any>
    }> = []

    switch (errorInfo.code) {
      case 'invalid_nit':
      case 'client_incomplete':
        actions.push({
          type: 'edit_client',
          label: 'Corregir Datos del Cliente',
          description: 'Actualizar NIT, nombre o dirección',
          priority: 'high',
          icon: ExternalLink
        })
        if (errorInfo.canRetry) {
          actions.push({
            type: 'retry',
            label: 'Reintentar FEL',
            description: 'Después de corregir los datos',
            priority: 'medium',
            icon: RefreshCw
          })
        }
        actions.push({
          type: 'receipt',
          label: 'Generar Comprobante',
          description: 'Sin valor fiscal como alternativa',
          priority: 'low',
          icon: FileText
        })
        break

      case 'connection_timeout':
      case 'server_error':
        if (errorInfo.canRetry) {
          actions.push({
            type: 'retry',
            label: 'Reintentar FEL',
            description: 'El error puede ser temporal',
            priority: 'high',
            icon: RefreshCw
          })
        }
        actions.push({
          type: 'receipt',
          label: 'Generar Comprobante',
          description: 'Mientras se resuelve el problema',
          priority: 'medium',
          icon: FileText
        })
        break

      case 'duplicate_document':
        actions.push({
          type: 'contact_support',
          label: 'Contactar Soporte',
          description: 'Documento ya existe en SAT',
          priority: 'high',
          icon: ExternalLink
        })
        break

      default:
        if (errorInfo.canRetry) {
          actions.push({
            type: 'retry',
            label: 'Reintentar FEL',
            description: `${errorInfo.attemptsLeft} intentos restantes`,
            priority: 'medium',
            icon: RefreshCw
          })
        }
        actions.push({
          type: 'receipt',
          label: 'Generar Comprobante',
          description: 'Alternativa sin valor fiscal',
          priority: 'medium',
          icon: FileText
        })
        break
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }

  const recommendedActions = getRecommendedActions()

  // Manejar acciones
  const handleAction = (actionType: string) => {
    switch (actionType) {
      case 'retry':
        onRetryFEL?.()
        break
      case 'receipt':
        onCreateReceipt?.()
        break
      case 'edit_client':
        onEditClient?.()
        break
      case 'contact_support':
        // Aquí podrías abrir un modal de contacto o redirigir
        window.open('mailto:soporte@smartorders.com?subject=Error FEL - Factura ' + invoice.invoice_number)
        break
    }
  }

  return (
    <Card className={cn("border-destructive", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Error en Factura FEL
        </CardTitle>
        <CardDescription>
          Factura {invoice.invoice_number} • {invoice.client.name}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Información del error */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">{errorInfo.friendlyMessage}</div>
              {errorInfo.code && (
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="destructive" className="text-xs">
                    {errorInfo.code.toUpperCase()}
                  </Badge>
                  <span>
                    Intentos: {fel.fel_attempts}/{fel.fel_max_attempts}
                  </span>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>

        {/* Acciones recomendadas */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Acciones Recomendadas:</h4>
          
          {recommendedActions.map((action, index) => {
            const IconComponent = action.icon
            const isDisabled = isProcessing || (action.type === 'retry' && !errorInfo.canRetry)
            
            return (
              <div key={action.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-full",
                    action.priority === 'high' && "bg-red-100",
                    action.priority === 'medium' && "bg-yellow-100", 
                    action.priority === 'low' && "bg-gray-100"
                  )}>
                    <IconComponent className={cn(
                      "h-4 w-4",
                      action.priority === 'high' && "text-red-600",
                      action.priority === 'medium' && "text-yellow-600",
                      action.priority === 'low' && "text-gray-600"
                    )} />
                  </div>
                  
                  <div>
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                </div>
                
                <Button 
                  size="sm" 
                  variant={index === 0 ? "default" : "outline"}
                  disabled={isDisabled}
                  onClick={() => handleAction(action.type)}
                  className="min-w-[80px]"
                >
                  {isProcessing && action.type === 'retry' ? (
                    <>
                      <Clock className="h-3 w-3 mr-1 animate-spin" />
                      Procesando
                    </>
                  ) : (
                    action.label.split(' ')[0] // Primera palabra del label
                  )}
                </Button>
              </div>
            )
          })}
        </div>

        {/* Detalles técnicos expandibles */}
        {showTechnicalDetails && (
          <Collapsible open={showDetails} onOpenChange={setShowDetails}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between text-xs"
              >
                Detalles Técnicos
                {showDetails ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-2">
              <div className="border-t pt-3 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Estado FEL:</span>
                    <div className="text-muted-foreground">{fel.fel_status}</div>
                  </div>
                  <div>
                    <span className="font-medium">Código Error:</span>
                    <div className="text-muted-foreground">
                      {fel.fel_error_code || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Intentos:</span>
                    <div className="text-muted-foreground">
                      {fel.fel_attempts} de {fel.fel_max_attempts}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Última Actualización:</span>
                    <div className="text-muted-foreground">
                      {new Date(invoice.updated_at || '').toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {fel.fel_error_message && (
                  <div>
                    <span className="font-medium text-xs">Mensaje Completo:</span>
                    <div className="text-xs text-muted-foreground mt-1 p-2 bg-muted rounded">
                      {fel.fel_error_message}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Información adicional */}
        <div className="text-xs text-muted-foreground">
          Si el problema persiste, contacte al soporte técnico con el número de factura: {invoice.invoice_number}
        </div>
      </CardContent>
    </Card>
  )
}

