import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NumericInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { paymentsService } from '@/services/payments'
import type { PaymentMethod, CreatePaymentRequest } from '@/services/payments'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CreatePaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: number
  orderNumber?: string
  totalAmount: number
  balanceDue: number
  onPaymentCreated: () => void
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit_card', label: 'Tarjeta de Crédito' },
  { value: 'debit_card', label: 'Tarjeta de Débito' },
  { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  { value: 'check', label: 'Cheque' },
  { value: 'other', label: 'Otro' },
]

export function CreatePaymentModal({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  totalAmount,
  balanceDue,
  onPaymentCreated,
}: CreatePaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreatePaymentRequest>({
    order_id: orderId,
    amount: balanceDue,
    payment_method: 'cash',
    notes: null,
  })

  // Resetear formulario cuando se abre/cierra el modal
  useEffect(() => {
    if (open) {
      setFormData({
        order_id: orderId,
        amount: balanceDue,
        payment_method: 'cash',
        notes: null,
      })
      setError(null)
    }
  }, [open, orderId, balanceDue])

  const handleInputChange = (
    field: keyof CreatePaymentRequest,
    value: string | number | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validaciones
    if (formData.amount <= 0) {
      setError('El monto debe ser mayor a 0')
      return
    }

    if (formData.amount > balanceDue) {
      setError(`El monto no puede exceder el saldo pendiente (Q${balanceDue.toFixed(2)})`)
      return
    }

    try {
      setLoading(true)
      await paymentsService.createPayment(formData)
      toast.success('Pago registrado exitosamente')
      onPaymentCreated()
      onOpenChange(false)
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al registrar el pago'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        order_id: orderId,
        amount: balanceDue,
        payment_method: 'cash',
        notes: null,
      })
      setError(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registra un pago para la orden{' '}
            {orderNumber || `#${orderId}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Monto *</Label>
            <NumericInput
              id="amount"
              placeholder="0.00"
              value={formData.amount}
              onValueChange={(value) => handleInputChange('amount', value)}
              min={0}
              max={balanceDue}
              step={0.01}
              allowDecimals={true}
              allowNegative={false}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Saldo pendiente: Q{balanceDue.toFixed(2)} | Total orden: Q
              {totalAmount.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Método de Pago *</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) =>
                handleInputChange('payment_method', value as PaymentMethod)
              }
              disabled={loading}
            >
              <SelectTrigger id="payment_method">
                <SelectValue placeholder="Selecciona un método de pago" />
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Notas adicionales sobre el pago..."
              value={formData.notes || ''}
              onChange={(e) =>
                handleInputChange('notes', e.target.value || null)
              }
              disabled={loading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || formData.amount <= 0 || formData.amount > balanceDue}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Pago
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


