import { useState, useEffect } from 'react'
import { paymentsService } from '@/services/payments'
import type { PaymentSummary } from '@/services/payments'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/status-badge'
import { getPaymentStatusData } from '../data/data'
import { CreatePaymentModal } from './create-payment-modal'

interface PaymentSummaryCardProps {
  orderId: number
  orderNumber?: string
  totalAmount: number
  onPaymentCreated?: () => void
}

export function PaymentSummaryCard({
  orderId,
  orderNumber,
  totalAmount,
  onPaymentCreated,
}: PaymentSummaryCardProps) {
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const loadSummary = async () => {
    try {
      setLoading(true)
      const paymentSummary =
        await paymentsService.getOrderPaymentSummary(orderId)
      setSummary(paymentSummary)
    } catch (error) {
      toast.error('No se pudo cargar el cobro del pedido')
      console.error('Error loading payment summary:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (orderId) {
      loadSummary()
    }
  }, [orderId])

  const handlePaymentCreated = () => {
    loadSummary()
    onPaymentCreated?.()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='font-display text-lg'>Cobro</CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Skeleton className='h-2 w-full rounded-full' />
          <Skeleton className='h-5 w-2/3' />
          <Skeleton className='h-9 w-full' />
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return null
  }

  const payment = getPaymentStatusData(summary.payment_status)
  const canCreatePayment =
    summary.payment_status !== 'paid' && summary.balance_due > 0
  const paidPercent =
    summary.total_amount > 0
      ? Math.min(
          100,
          Math.round((summary.paid_amount / summary.total_amount) * 100)
        )
      : 0

  return (
    <>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between gap-2'>
          <CardTitle className='font-display text-lg'>Cobro</CardTitle>
          <StatusBadge tone={payment.tone}>{payment.label}</StatusBadge>
        </CardHeader>
        <CardContent className='tabular space-y-4'>
          <div>
            <p className='text-muted-foreground text-sm'>Saldo pendiente</p>
            <p className='font-display text-2xl font-semibold'>
              {formatCurrency(summary.balance_due)}
            </p>
          </div>

          <div className='space-y-1.5'>
            <div
              className='bg-muted h-2 overflow-hidden rounded-full'
              role='progressbar'
              aria-label='Porcentaje cobrado'
              aria-valuenow={paidPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className='bg-success h-full rounded-full transition-[width]'
                style={{ width: `${paidPercent}%` }}
              />
            </div>
            <p className='text-muted-foreground text-sm'>
              Cobrado {formatCurrency(summary.paid_amount)} de{' '}
              {formatCurrency(summary.total_amount)}
              {summary.payment_count > 0 &&
                ` en ${summary.payment_count} ${summary.payment_count === 1 ? 'pago' : 'pagos'}`}
            </p>
          </div>

          {canCreatePayment && (
            <Button className='w-full' onClick={() => setCreateModalOpen(true)}>
              <Plus aria-hidden='true' />
              Registrar pago
            </Button>
          )}
        </CardContent>
      </Card>

      <CreatePaymentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        orderId={orderId}
        orderNumber={orderNumber}
        totalAmount={summary.total_amount}
        balanceDue={summary.balance_due}
        onPaymentCreated={handlePaymentCreated}
      />
    </>
  )
}
