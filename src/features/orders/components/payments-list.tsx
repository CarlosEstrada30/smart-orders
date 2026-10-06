import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { paymentsService } from '@/services/payments'
import type { Payment, PaymentMethod } from '@/services/payments'
import { es } from 'date-fns/locale'
import { Loader2, X, Trash2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
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
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { EmptyState } from '@/components/empty-state'
import { StatusBadge } from '@/components/status-badge'

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
        error instanceof Error ? error.message : 'Error al cancelar el pago'
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
      <div role='status' className='space-y-2'>
        <span className='sr-only'>Cargando pagos…</span>
        <Skeleton className='h-10 w-full' />
        <Skeleton className='h-10 w-full' />
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <EmptyState
        icon={Wallet}
        title='Aún no hay pagos'
        description='Los abonos que registres aparecerán aquí.'
        className='py-6'
      />
    )
  }

  return (
    <>
      <div className='overflow-x-auto rounded-lg border'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50 hover:bg-muted/50 [&>th]:text-muted-foreground'>
              <TableHead>Pago</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className='font-medium'>
                  {payment.payment_number}
                </TableCell>
                <TableCell>
                  {format(new Date(payment.payment_date), 'dd/MM/yyyy HH:mm', {
                    locale: es,
                  })}
                </TableCell>
                <TableCell className='tabular font-medium whitespace-nowrap'>
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  {PAYMENT_METHOD_LABELS[payment.payment_method]}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    tone={payment.status === 'confirmed' ? 'success' : 'danger'}
                  >
                    {payment.status === 'confirmed'
                      ? 'Confirmado'
                      : 'Cancelado'}
                  </StatusBadge>
                </TableCell>
                <TableCell className='max-w-[200px] truncate'>
                  {payment.notes || '-'}
                </TableCell>
                <TableCell className='text-right'>
                  {payment.status === 'confirmed' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => openCancelDialog(payment)}
                      disabled={cancellingId === payment.id}
                      title='Cancelar pago'
                    >
                      {cancellingId === payment.id ? (
                        <Loader2 className='h-4 w-4 animate-spin' />
                      ) : (
                        <X className='text-destructive h-4 w-4' />
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
              <strong>{paymentToCancel?.payment_number}</strong> por un monto de{' '}
              <strong>{formatCurrency(paymentToCancel?.amount)}</strong>. Esta
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
              className='bg-destructive hover:bg-destructive/90 text-white'
            >
              {cancellingId !== null ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Cancelando...
                </>
              ) : (
                <>
                  <Trash2 className='mr-2 h-4 w-4' />
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
