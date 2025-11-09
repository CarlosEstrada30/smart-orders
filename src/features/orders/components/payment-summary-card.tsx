import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { paymentsService } from '@/services/payments'
import type { PaymentSummary, OrderPaymentStatus } from '@/services/payments'
import { toast } from 'sonner'
import { Loader2, DollarSign, Plus } from 'lucide-react'
import { CreatePaymentModal } from './create-payment-modal'
import { cn } from '@/lib/utils'

interface PaymentSummaryCardProps {
  orderId: number
  orderNumber?: string
  totalAmount: number
  onPaymentCreated?: () => void
}

const PAYMENT_STATUS_CONFIG: Record<
  OrderPaymentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }
> = {
  unpaid: { 
    label: 'Sin Pagar', 
    variant: 'outline',
    className: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
  },
  partial: { label: 'Pago Parcial', variant: 'secondary' },
  paid: { label: 'Pagado', variant: 'default' },
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
      const paymentSummary = await paymentsService.getOrderPaymentSummary(
        orderId
      )
      setSummary(paymentSummary)
    } catch (error) {
      toast.error('Error al cargar el resumen de pagos')
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
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumen de Pagos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!summary) {
    return null
  }

  const statusConfig =
    PAYMENT_STATUS_CONFIG[summary.payment_status] ||
    PAYMENT_STATUS_CONFIG.unpaid

  const canCreatePayment =
    summary.payment_status !== 'paid' && summary.balance_due > 0

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumen de Pagos
            </CardTitle>
            {canCreatePayment && (
              <Button
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Registrar Pago
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total de la Orden</p>
              <p className="text-2xl font-bold">Q{summary.total_amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monto Pagado</p>
              <p className="text-2xl font-bold text-green-600">
                Q{summary.paid_amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Pendiente</p>
              <p
                className={`text-2xl font-bold ${
                  summary.balance_due > 0
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}
              >
                Q{summary.balance_due.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado de Pago</p>
              <div className="mt-1">
                <Badge 
                  variant={statusConfig.variant}
                  className={cn(statusConfig.className)}
                >
                  {statusConfig.label}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Número de Pagos: <strong>{summary.payment_count}</strong>
            </p>
          </div>
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


