import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BulkPaymentResponse } from '@/services/payments'
import { CheckCircle, AlertTriangle, DollarSign, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BulkPaymentsResultsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: BulkPaymentResponse | null
  onClose: () => void
}

export function BulkPaymentsResultsModal({
  open,
  onOpenChange,
  result,
  onClose,
}: BulkPaymentsResultsModalProps) {
  if (!result) return null

  const handleClose = () => {
    onClose()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <DollarSign className="h-5 w-5" />
            Resultados de Pagos Múltiples
          </DialogTitle>
          <DialogDescription className="text-sm">
            Resumen del procesamiento de {result.total_payments} pago{result.total_payments !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 sm:space-y-6 pb-4">
          {/* Resumen general */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Procesado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold">{result.total_payments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-green-600">Exitosos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  {result.success_count}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-red-600">Fallidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-red-600">
                  {result.failed_count}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Monto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">
                  Q{result.total_amount.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pagos exitosos */}
          {result.payments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Pagos Registrados Exitosamente</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[120px]">Número de Pago</TableHead>
                        <TableHead className="min-w-[80px]">Orden</TableHead>
                        <TableHead className="min-w-[100px]">Monto</TableHead>
                        <TableHead className="min-w-[120px] hidden sm:table-cell">Método</TableHead>
                        <TableHead className="min-w-[100px] hidden md:table-cell">Fecha</TableHead>
                        <TableHead className="min-w-[100px] text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-mono font-medium text-xs sm:text-sm">
                            {payment.payment_number}
                          </TableCell>
                          <TableCell className="text-sm">#{payment.order_id}</TableCell>
                          <TableCell className="font-medium text-sm">
                            Q{payment.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant="outline" className="text-xs">
                              {payment.payment_method === 'cash' && 'Efectivo'}
                              {payment.payment_method === 'credit_card' && 'Tarjeta de Crédito'}
                              {payment.payment_method === 'debit_card' && 'Tarjeta de Débito'}
                              {payment.payment_method === 'bank_transfer' && 'Transferencia Bancaria'}
                              {payment.payment_method === 'check' && 'Cheque'}
                              {payment.payment_method === 'other' && 'Otro'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-muted-foreground hidden md:table-cell">
                            {new Date(payment.payment_date).toLocaleDateString('es-GT', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant={payment.status === 'confirmed' ? 'default' : 'secondary'}
                              className={cn(
                                'text-xs',
                                payment.status === 'confirmed' && 'bg-green-600 hover:bg-green-700'
                              )}
                            >
                              {payment.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Errores */}
          {result.errors.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span>Pagos con Errores</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Orden</TableHead>
                        <TableHead className="min-w-[120px] hidden sm:table-cell">Cliente</TableHead>
                        <TableHead className="min-w-[100px]">Monto</TableHead>
                        <TableHead className="min-w-[120px] hidden md:table-cell">Método</TableHead>
                        <TableHead className="min-w-[200px]">Razón del Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((error, index) => (
                        <TableRow key={`${error.order_id}-${index}`}>
                          <TableCell className="font-medium text-sm">
                            <div className="flex flex-col">
                              <span>{error.order_number || `#${error.order_id}`}</span>
                              {error.client_name && (
                                <span className="text-xs text-muted-foreground sm:hidden">
                                  {error.client_name}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm">
                            {error.client_name || (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">Q{error.amount.toFixed(2)}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className="text-xs">
                              {error.payment_method === 'cash' && 'Efectivo'}
                              {error.payment_method === 'credit_card' && 'Tarjeta de Crédito'}
                              {error.payment_method === 'debit_card' && 'Tarjeta de Débito'}
                              {error.payment_method === 'bank_transfer' && 'Transferencia Bancaria'}
                              {error.payment_method === 'check' && 'Cheque'}
                              {error.payment_method === 'other' && 'Otro'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <span className="text-xs sm:text-sm text-red-600 break-words">
                                {error.reason}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mensaje cuando no hay resultados */}
          {result.payments.length === 0 && result.errors.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No se procesaron pagos. Por favor, intenta nuevamente.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/50">
          <Button onClick={handleClose} className="w-full sm:w-auto">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

