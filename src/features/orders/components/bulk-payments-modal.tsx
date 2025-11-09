import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { paymentsService } from '@/services/payments'
import type { PaymentMethod, CreatePaymentRequest, BulkPaymentResponse } from '@/services/payments'
import type { Order } from '../data/schema'
import { toast } from 'sonner'
import { Loader2, DollarSign, AlertCircle, CheckCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BulkPaymentsResultsModal } from './bulk-payments-results-modal'

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
  { value: 'debit_card', label: 'Tarjeta de Débito' },
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  { value: 'check', label: 'Cheque' },
  { value: 'other', label: 'Otro' },
]

type PaymentMode = 'full' | 'custom'
type PaymentMethodMode = 'common' | 'individual'

interface OrderPaymentConfig {
  orderId: number
  amount: number
  paymentMethod: PaymentMethod
  isValid: boolean
  error?: string
}

export function BulkPaymentsModal({
  open,
  onOpenChange,
  orders,
  onPaymentsCreated,
}: BulkPaymentsModalProps) {
  const [loading, setLoading] = useState(false)
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('full')
  const [paymentMethodMode, setPaymentMethodMode] = useState<PaymentMethodMode>('common')
  const [commonPaymentMethod, setCommonPaymentMethod] = useState<PaymentMethod>('cash')
  const [commonNotes, setCommonNotes] = useState<string>('')
  const [orderConfigs, setOrderConfigs] = useState<Map<number, OrderPaymentConfig>>(new Map())
  const [bulkResult, setBulkResult] = useState<BulkPaymentResponse | null>(null)
  const [showResults, setShowResults] = useState(false)

  // Filtrar órdenes válidas (no canceladas y con saldo pendiente)
  const validOrders = useMemo(() => {
    return orders.filter((order) => {
      const isCancelled = order.status === 'cancelled'
      const isPaid = order.payment_status === 'paid'
      const balanceDue = order.balance_due ?? (order.total_amount ?? 0) - (order.paid_amount ?? 0)
      const hasBalance = balanceDue > 0
      return !isCancelled && !isPaid && hasBalance
    })
  }, [orders])

  const invalidOrders = useMemo(() => {
    return orders.filter((order) => {
      const isCancelled = order.status === 'cancelled'
      const isPaid = order.payment_status === 'paid'
      const balanceDue = order.balance_due ?? (order.total_amount ?? 0) - (order.paid_amount ?? 0)
      const hasBalance = balanceDue > 0
      return isCancelled || isPaid || !hasBalance
    })
  }, [orders])

  // Inicializar configuraciones de órdenes
  useEffect(() => {
    if (open && validOrders.length > 0) {
      const configs = new Map<number, OrderPaymentConfig>()
      validOrders.forEach((order) => {
        const balanceDue = order.balance_due ?? (order.total_amount ?? 0) - (order.paid_amount ?? 0)
        configs.set(order.id!, {
          orderId: order.id!,
          amount: paymentMode === 'full' ? balanceDue : balanceDue,
          paymentMethod: commonPaymentMethod,
          isValid: true,
        })
      })
      setOrderConfigs(configs)
    }
  }, [open, validOrders, paymentMode, commonPaymentMethod])

  // Actualizar montos cuando cambia el modo
  useEffect(() => {
    if (paymentMode === 'full') {
      const newConfigs = new Map(orderConfigs)
      validOrders.forEach((order) => {
        const config = newConfigs.get(order.id!)
        if (config) {
          const balanceDue = order.balance_due ?? (order.total_amount ?? 0) - (order.paid_amount ?? 0)
          newConfigs.set(order.id!, {
            ...config,
            amount: balanceDue,
            isValid: true,
            error: undefined,
          })
        }
      })
      setOrderConfigs(newConfigs)
    }
  }, [paymentMode, validOrders])

  // Actualizar método de pago común
  useEffect(() => {
    if (paymentMethodMode === 'common') {
      const newConfigs = new Map(orderConfigs)
      orderConfigs.forEach((config, orderId) => {
        newConfigs.set(orderId, {
          ...config,
          paymentMethod: commonPaymentMethod,
        })
      })
      setOrderConfigs(newConfigs)
    }
  }, [commonPaymentMethod, paymentMethodMode])

  const handleOrderAmountChange = (orderId: number, amount: number) => {
    const order = validOrders.find((o) => o.id === orderId)
    if (!order) return

    const balanceDue = order.balance_due ?? (order.total_amount ?? 0) - (order.paid_amount ?? 0)
    const config = orderConfigs.get(orderId)
    if (!config) return

    const newConfig: OrderPaymentConfig = {
      ...config,
      amount,
      isValid: amount > 0 && amount <= balanceDue,
      error:
        amount <= 0
          ? 'El monto debe ser mayor a 0'
          : amount > balanceDue
            ? `El monto no puede exceder el saldo pendiente (Q${balanceDue.toFixed(2)})`
            : undefined,
    }

    const newConfigs = new Map(orderConfigs)
    newConfigs.set(orderId, newConfig)
    setOrderConfigs(newConfigs)
  }

  const handleOrderPaymentMethodChange = (orderId: number, method: PaymentMethod) => {
    const config = orderConfigs.get(orderId)
    if (!config) return

    const newConfigs = new Map(orderConfigs)
    newConfigs.set(orderId, {
      ...config,
      paymentMethod: method,
    })
    setOrderConfigs(newConfigs)
  }

  const totalAmount = useMemo(() => {
    let total = 0
    orderConfigs.forEach((config) => {
      if (config.isValid) {
        total += config.amount
      }
    })
    return total
  }, [orderConfigs])

  const canSubmit = useMemo(() => {
    if (validOrders.length === 0) return false
    if (orderConfigs.size === 0) return false

    let allValid = true
    orderConfigs.forEach((config) => {
      if (!config.isValid) {
        allValid = false
      }
    })

    return allValid && orderConfigs.size > 0
  }, [orderConfigs, validOrders.length])

  const handleSubmit = async () => {
    if (!canSubmit) return

    const payments: CreatePaymentRequest[] = []
    orderConfigs.forEach((config) => {
      if (config.isValid) {
        payments.push({
          order_id: config.orderId,
          amount: config.amount,
          payment_method: config.paymentMethod,
          notes: commonNotes || null,
        })
      }
    })

    if (payments.length === 0) {
      toast.error('No hay pagos válidos para procesar')
      return
    }

    try {
      setLoading(true)
      const result = await paymentsService.createBulkPayments({ payments })
      
      setBulkResult(result)
      setShowResults(true)
      onOpenChange(false)

      if (result.success_count > 0) {
        toast.success(
          `${result.success_count} pago${result.success_count !== 1 ? 's' : ''} registrado${result.success_count !== 1 ? 's' : ''} exitosamente`
        )
      }

      if (result.failed_count > 0) {
        toast.warning(
          `${result.failed_count} pago${result.failed_count !== 1 ? 's' : ''} falló${result.failed_count !== 1 ? 'ron' : ''}`
        )
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al registrar los pagos'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setPaymentMode('full')
      setPaymentMethodMode('common')
      setCommonPaymentMethod('cash')
      setCommonNotes('')
      setOrderConfigs(new Map())
      onOpenChange(false)
    }
  }

  const handleCloseResults = () => {
    setShowResults(false)
    setBulkResult(null)
    onPaymentsCreated()
  }

  if (validOrders.length === 0) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>No hay órdenes válidas</DialogTitle>
            <DialogDescription>
              Las órdenes seleccionadas no pueden recibir pagos. Verifica que:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>No estén canceladas</li>
              <li>No estén completamente pagadas</li>
              <li>Tengan saldo pendiente</li>
            </ul>
            {invalidOrders.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Órdenes inválidas:</p>
                {invalidOrders.map((order) => {
                  const isCancelled = order.status === 'cancelled'
                  const isPaid = order.payment_status === 'paid'
                  const balanceDue = order.balance_due ?? (order.total_amount ?? 0) - (order.paid_amount ?? 0)
                  
                  return (
                    <div key={order.id} className="text-sm p-2 bg-muted rounded">
                      <span className="font-medium">
                        {order.order_number || `Orden #${order.id}`}
                      </span>
                      {isCancelled && <Badge variant="destructive" className="ml-2">Cancelada</Badge>}
                      {isPaid && <Badge variant="secondary" className="ml-2">Pagada</Badge>}
                      {!isCancelled && !isPaid && balanceDue <= 0 && (
                        <Badge variant="outline" className="ml-2">Sin saldo</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <DollarSign className="h-5 w-5" />
            Registrar Pagos Múltiples
          </DialogTitle>
          <DialogDescription className="text-sm">
            Configura los pagos para {validOrders.length} orden{validOrders.length !== 1 ? 'es' : ''} seleccionada{validOrders.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 sm:space-y-6 pb-4">
          {/* Resumen */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Órdenes válidas</p>
                  <p className="text-xl sm:text-2xl font-bold">{validOrders.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total a pagar</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    Q{totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Método</p>
                  <p className="text-base sm:text-lg font-medium">
                    {paymentMethodMode === 'common'
                      ? PAYMENT_METHODS.find((m) => m.value === commonPaymentMethod)?.label
                      : 'Individual'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de pagos */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Modo de Pago</Label>
                <Select
                  value={paymentMode}
                  onValueChange={(value) => setPaymentMode(value as PaymentMode)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Pagar saldo completo</SelectItem>
                    <SelectItem value="custom">Monto personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <Select
                  value={paymentMethodMode}
                  onValueChange={(value) => setPaymentMethodMode(value as PaymentMethodMode)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Método común</SelectItem>
                    <SelectItem value="individual">Método individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {paymentMethodMode === 'common' && (
              <div className="space-y-2">
                <Label>Método de Pago Común</Label>
                <Select
                  value={commonPaymentMethod}
                  onValueChange={(value) => setCommonPaymentMethod(value as PaymentMethod)}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                placeholder="Notas adicionales sobre los pagos..."
                value={commonNotes}
                onChange={(e) => setCommonNotes(e.target.value)}
                disabled={loading}
                rows={2}
              />
            </div>
          </div>

          {/* Tabla de órdenes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Órdenes a Pagar</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {paymentMode === 'full'
                  ? 'Se pagará el saldo completo de cada orden'
                  : 'Ajusta el monto para cada orden'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[100px]">Orden</TableHead>
                      <TableHead className="min-w-[120px] hidden sm:table-cell">Cliente</TableHead>
                      <TableHead className="min-w-[80px] hidden md:table-cell">Total</TableHead>
                      <TableHead className="min-w-[100px]">Saldo</TableHead>
                      <TableHead className="min-w-[120px]">Monto</TableHead>
                      <TableHead className="min-w-[140px]">Método</TableHead>
                      <TableHead className="min-w-[60px] text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {validOrders.map((order) => {
                      const config = orderConfigs.get(order.id!)
                      const balanceDue = order.balance_due ?? (order.total_amount ?? 0) - (order.paid_amount ?? 0)
                      
                      if (!config) return null

                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{order.order_number || `#${order.id}`}</span>
                              <span className="text-xs text-muted-foreground sm:hidden">
                                {order.client?.name || `Cliente #${order.client_id}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {order.client?.name || `Cliente #${order.client_id}`}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            Q{(order.total_amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">Q{balanceDue.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            {paymentMode === 'full' ? (
                              <span className="font-medium text-sm">Q{balanceDue.toFixed(2)}</span>
                            ) : (
                              <div className="flex flex-col gap-1">
                                <NumericInput
                                  value={config.amount}
                                  onValueChange={(value) => handleOrderAmountChange(order.id!, value)}
                                  min={0}
                                  max={balanceDue}
                                  step={0.01}
                                  allowDecimals={true}
                                  allowNegative={false}
                                  disabled={loading}
                                  className="w-full sm:w-24"
                                />
                                {config.error && (
                                  <p className="text-xs text-red-600">{config.error}</p>
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {paymentMethodMode === 'common' ? (
                              <Badge variant="outline" className="text-xs">
                                {PAYMENT_METHODS.find((m) => m.value === commonPaymentMethod)?.label}
                              </Badge>
                            ) : (
                              <Select
                                value={config.paymentMethod}
                                onValueChange={(value) =>
                                  handleOrderPaymentMethodChange(order.id!, value as PaymentMethod)
                                }
                                disabled={loading}
                              >
                                <SelectTrigger className="w-full sm:w-40 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PAYMENT_METHODS.map((method) => (
                                    <SelectItem key={method.value} value={method.value}>
                                      {method.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {config.isValid ? (
                              <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600 mx-auto" />
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/50">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!canSubmit || loading}
              className="w-full sm:w-auto"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar {validOrders.length} Pago{validOrders.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <BulkPaymentsResultsModal
      open={showResults}
      onOpenChange={setShowResults}
      result={bulkResult}
      onClose={handleCloseResults}
    />
    </>
  )
}

