import React from 'react'
import { Input } from '@/components/ui/input'
import { useNumericInput, usePriceInput, useQuantityInput } from '@/hooks/use-numeric-input'
import { cn } from '@/lib/utils'

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  allowDecimals?: boolean
  allowNegative?: boolean
}

/**
 * Input numérico genérico con mejor UX
 */
export function NumericInput({
  value,
  onValueChange,
  min,
  max,
  step,
  allowDecimals = true,
  allowNegative = false,
  className,
  ...props
}: NumericInputProps) {
  const numericInput = useNumericInput({
    initialValue: value,
    onValueChange,
    min,
    max,
    step,
    allowDecimals,
    allowNegative
  })

  // Sincronizar con prop value cuando cambie externamente
  React.useEffect(() => {
    if (value !== numericInput.numericValue) {
      numericInput.setValue(value)
    }
  }, [value, numericInput])

  return (
    <Input
      {...props}
      type="number"
      min={min}
      max={max}
      step={step}
      value={numericInput.displayValue}
      onChange={numericInput.onChange}
      onBlur={numericInput.onBlur}
      onFocus={numericInput.onFocus}
      className={cn(className)}
    />
  )
}

/**
 * Input especializado para precios
 */
interface PriceInputProps extends Omit<NumericInputProps, 'allowDecimals' | 'allowNegative' | 'step'> {
  currency?: string
}

export function PriceInput({
  value,
  onValueChange,
  currency,
  className,
  ...props
}: PriceInputProps) {
  const priceInput = usePriceInput(value, onValueChange)

  // Sincronizar con prop value cuando cambie externamente
  React.useEffect(() => {
    if (value !== priceInput.numericValue) {
      priceInput.setValue(value)
    }
  }, [value, priceInput])

  return (
    <div className="relative">
      {currency && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
          {currency}
        </span>
      )}
      <Input
        {...props}
        type="number"
        min={0}
        step={0.01}
        value={priceInput.displayValue}
        onChange={priceInput.onChange}
        onBlur={priceInput.onBlur}
        onFocus={priceInput.onFocus}
        className={cn(
          currency ? 'pl-8' : '',
          className
        )}
      />
    </div>
  )
}

/**
 * Input especializado para cantidades/stock
 */
interface QuantityInputProps extends Omit<NumericInputProps, 'allowDecimals' | 'allowNegative'> {}

export function QuantityInput({
  value,
  onValueChange,
  min = 0,
  max,
  className,
  ...props
}: QuantityInputProps) {
  const quantityInput = useQuantityInput(value, onValueChange, min)

  // Sincronizar con prop value cuando cambie externamente
  React.useEffect(() => {
    if (value !== quantityInput.numericValue) {
      quantityInput.setValue(value)
    }
  }, [value, quantityInput])

  return (
    <Input
      {...props}
      type="number"
      min={min}
      max={max}
      value={quantityInput.displayValue}
      onChange={quantityInput.onChange}
      onBlur={quantityInput.onBlur}
      onFocus={quantityInput.onFocus}
      className={cn(className)}
    />
  )
}
