/**
 * Document Selector
 * Modal para elegir entre Factura FEL o Comprobante
 */

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  Receipt, 
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Building,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderWithInvoiceInfo, OrderWithoutDocument, DocumentType } from '@/services/fel/types'
import { felService } from '@/services/fel'

interface DocumentSelectorProps {
  /** Orden para la cual crear el documento */
  order: OrderWithInvoiceInfo | OrderWithoutDocument
  
  /** Si el modal está abierto */
  isOpen: boolean
  
  /** Callback para cerrar el modal */
  onClose: () => void
  
  /** Callback cuando se selecciona un tipo de documento */
  onSelectDocument?: (documentType: 'invoice' | 'receipt') => void
  
  /** Callback cuando se selecciona crear factura FEL (backward compatibility) */
  onCreateFEL?: (orderId: number) => void
  
  /** Callback cuando se selecciona crear comprobante (backward compatibility) */
  onCreateReceipt?: (orderId: number) => void
  
  /** Tipo de documento sugerido */
  suggestedType?: 'invoice' | 'receipt'
  
  /** Estado de procesamiento */
  isProcessing?: boolean

  /** Usado para backward compatibility con el prop 'open' */
  open?: boolean
}

export function DocumentSelector({
  order,
  isOpen,
  open, // backward compatibility
  onClose,
  onSelectDocument,
  onCreateFEL, // backward compatibility
  onCreateReceipt, // backward compatibility
  suggestedType,
  isProcessing = false
}: DocumentSelectorProps) {

  const [selectedType, setSelectedType] = useState<DocumentType | null>(
    suggestedType || null
  )

  // Determinar modal abierto (backward compatibility)
  const modalIsOpen = isOpen ?? open ?? false

  // Determinar qué tipos de documento están disponibles
  const availableTypes = felService.getAvailableDocumentTypes(order)
  const felValidation = felService.canCreateFEL(order)

  // Información del cliente
  const clientInfo = {
    name: order.client.name,
    nit: order.client.nit,
    hasValidNIT: order.client.nit && order.client.nit.length >= 8 && order.client.nit !== 'C/F',
    hasAddress: !!order.client.address,
    isComplete: felValidation.canCreate
  }

  // Determinar tipo de cliente (empresa o individual)
  const clientType = clientInfo.hasValidNIT ? 'business' : 'individual'

  const handleCreateDocument = () => {
    if (!selectedType) return
    
    // Nuevo callback unificado
    if (onSelectDocument) {
      onSelectDocument(selectedType)
    } else {
      // Backward compatibility
      if (selectedType === 'invoice' && onCreateFEL) {
        onCreateFEL(order.id)
      } else if (selectedType === 'receipt' && onCreateReceipt) {
        onCreateReceipt(order.id)
      }
    }
    
    setSelectedType(null)
    onClose()
  }

  const handleClose = () => {
    setSelectedType(null)
    onClose()
  }

  return (
    <Dialog open={modalIsOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>¿Qué documento necesita el cliente?</DialogTitle>
          <DialogDescription>
            Orden #{order.order_number} • Cliente: {clientInfo.name} • {felService.formatCurrency(order.total_amount)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del cliente */}
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {clientType === 'business' ? (
                  <Building className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nombre:</span>
                <span className="text-sm font-medium">{clientInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">NIT:</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {order.client.nit || 'No registrado'}
                  </span>
                  {clientInfo.hasValidNIT ? (
                    <Badge variant="secondary" className="text-xs">
                      ✅ Válido para FEL
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      ❌ Solo comprobante
                    </Badge>
                  )}
                </div>
              </div>
              {clientInfo.hasAddress && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Dirección:</span>
                  <span className="text-sm">{order.client.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Opciones de documento */}
          <div className="grid gap-4">
            {/* Opción: Comprobante */}
            {availableTypes.includes('receipt') && (
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedType === 'receipt' && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedType('receipt')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-full">
                      <Receipt className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <span>Comprobante Simple</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Sin valor fiscal
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Inmediato
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription>
                    Documento de respaldo para el cliente, generación inmediata
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Generación inmediata (descarga PDF)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>No requiere datos fiscales del cliente</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>No válido para deducción de IVA</span>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Ideal para clientes individuales o cuando no se requiere factura fiscal
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Opción: Factura FEL */}
            {availableTypes.includes('invoice') && (
              <Card 
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selectedType === 'invoice' && "ring-2 ring-primary"
                )}
                onClick={() => setSelectedType('invoice')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span>Factura FEL</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default" className="text-xs">
                          Válida ante SAT
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          15-60 seg
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription>
                    Factura electrónica oficial con UUID del SAT, válida para deducciones fiscales
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Autorizada oficialmente por SAT</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Cliente puede deducir IVA</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>UUID único para verificación</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>Requiere procesamiento con SAT (puede fallar)</span>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Requerida para empresas que necesitan deducir IVA. Cliente: {clientInfo.name}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}

            {/* Mensaje si FEL no está disponible */}
            {!availableTypes.includes('invoice') && felValidation.reason && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">Factura FEL no disponible:</span><br />
                  {felValidation.reason}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
              Cancelar
            </Button>
            
            <Button 
              onClick={handleCreateDocument}
              disabled={!selectedType || isProcessing}
              className="min-w-[120px]"
            >
              {isProcessing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : selectedType === 'invoice' ? (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Crear Factura FEL
                </>
              ) : selectedType === 'receipt' ? (
                <>
                  <Receipt className="h-4 w-4 mr-2" />
                  Generar Comprobante
                </>
              ) : (
                'Seleccionar opción'
              )}
            </Button>
          </div>

          {/* Información adicional */}
          {selectedType === 'invoice' && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                El proceso FEL puede tomar hasta 60 segundos. Recibirá notificación del resultado.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

