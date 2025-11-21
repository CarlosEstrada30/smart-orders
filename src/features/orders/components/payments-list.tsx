import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { paymentsService } from '@/services/payments'
import type { Payment, PaymentMethod } from '@/services/payments'
import { toast } from 'sonner'
import { Loader2, X, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface PaymentsListProps {
  orderId: number
  onPaymentCancelled?: () => void
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  credit_card: 'Tarjeta de Crédito',
  debit_card: 'Tarjeta de Débito',
  bank_transfer: 'Transferencia Bancaria',
  check: 'Cheque',
  other: 'Otro',
}

export function PaymentsList({
  orderId,
  onPaymentCancelled,
}: PaymentsListProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [paymentToCancel, setPaymentToCancel] = useState<Payment | null>(null)

  const loadPayments = async () => {
    try {
      setLoading(true)
      const orderPayments = await paymentsService.getOrderPayments(
        orderId,
        false // Incluir todos los pagos, incluso cancelados
      )
      setPayments(orderPayments)
    } catch (error) {
      toast.error('Error al cargar los pagos')
      console.error('Error loading payments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      loadPayments()
    }
  }, [orderId])

  const handleCancelPayment = async () => {
    if (!paymentToCancel) return

    try {
      setCancellingId(paymentToCancel.id)
      await paymentsService.cancelPayment(paymentToCancel.id)
      toast.success('Pago cancelado exitosamente')
      setCancelDialogOpen(false)
      setPaymentToCancel(null)
      await loadPayments()
      onPaymentCancelled?.()
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al cancelar el pago'
      toast.error(errorMessage)
    } finally {
      setCancellingId(null)
    }
  }

  const openCancelDialog = (payment: Payment) => {
    if (payment.status === 'cancelled') {
      toast.info('Este pago ya está cancelado')
      return
    }
    setPaymentToCancel(payment)
    setCancelDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay pagos registrados para esta orden
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número de Pago</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">
                  {payment.payment_number}
                </TableCell>
                <TableCell>
                  {format(new Date(payment.payment_date), 'dd/MM/yyyy HH:mm', {
                    locale: es,
                  })}
                </TableCell>
                <TableCell>Q{payment.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {PAYMENT_METHOD_LABELS[payment.payment_method]}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === 'confirmed' ? 'default' : 'destructive'
                    }
                  >
                    {payment.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {payment.notes || '-'}
                </TableCell>
                <TableCell className="text-right">
                  {payment.status === 'confirmed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openCancelDialog(payment)}
                      disabled={cancellingId === payment.id}
                      title="Cancelar pago"
                    >
                      {cancellingId === payment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar este pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de cancelar el pago{' '}
              <strong>{paymentToCancel?.payment_number}</strong> por un monto
              de <strong>Q{paymentToCancel?.amount.toFixed(2)}</strong>. Esta
              acción actualizará automáticamente el saldo de la orden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancellingId !== null}>
              No cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPayment}
              disabled={cancellingId !== null}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancellingId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Sí, cancelar pago
                  </>
                )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


