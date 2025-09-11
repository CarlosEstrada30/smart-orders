import { useState, useCallback } from 'react'

interface UseNumericInputProps {
  initialValue?: number
  onValueChange?: (value: number) => void
  min?: number
  max?: number
  step?: number
  allowDecimals?: boolean
  allowNegative?: boolean
}

interface UseNumericInputReturn {
  displayValue: string
  numericValue: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur: () => void
  onFocus: () => void
  setValue: (value: number) => void
  isEditing: boolean
}

/**
 * Hook para manejar inputs numéricos con mejor UX
 * Permite al usuario borrar y escribir libremente mientras edita
 */
export function useNumericInput({
  initialValue = 0,
  onValueChange,
  min,
  max,
  step,
  allowDecimals = true,
  allowNegative = false
}: UseNumericInputProps = {}): UseNumericInputReturn {
  
  const [displayValue, setDisplayValue] = useState(initialValue.toString())
  const [numericValue, setNumericValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)

  // Validar y sanitizar el valor numérico
  const validateValue = useCallback((value: number): number => {
    let validatedValue = value

    // Aplicar límites
    if (min !== undefined && validatedValue < min) {
      validatedValue = min
    }
    if (max !== undefined && validatedValue > max) {
      validatedValue = max
    }

    // Aplicar step si se especifica
    if (step !== undefined && step > 0) {
      validatedValue = Math.round(validatedValue / step) * step
    }

    // Redondear decimales si no se permiten
    if (!allowDecimals) {
      validatedValue = Math.round(validatedValue)
    }

    // Manejar valores negativos
    if (!allowNegative && validatedValue < 0) {
      validatedValue = 0
    }

    return validatedValue
  }, [min, max, step, allowDecimals, allowNegative])

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDisplayValue(value)

    // Permitir valores temporales durante la edición (campo vacío, signo negativo, punto decimal)
    if (value === '' || value === '-' || value.endsWith('.') || value.endsWith(',')) {
      return
    }

    // Para inputs tipo number, el navegador ya valida el formato
    const parsed = allowDecimals ? parseFloat(value) : parseInt(value, 10)
    if (!isNaN(parsed)) {
      const validatedValue = validateValue(parsed)
      setNumericValue(validatedValue)
      onValueChange?.(validatedValue)
    }
  }, [allowDecimals, onValueChange, validateValue])

  const onBlur = useCallback(() => {
    setIsEditing(false)
    
    let finalValue = numericValue

    // Si el campo está vacío o solo tiene caracteres inválidos, usar el mínimo o 0
    if (displayValue === '' || displayValue === '-' || displayValue === '.' || displayValue === ',') {
      finalValue = min !== undefined ? min : 0
    } else {
      // Parsear el valor final y validar
      const parsed = allowDecimals ? parseFloat(displayValue) : parseInt(displayValue, 10)
      if (!isNaN(parsed)) {
        finalValue = validateValue(parsed)
      } else {
        // Si el parsing falla, mantener el valor anterior o usar mínimo
        finalValue = numericValue || (min !== undefined ? min : 0)
      }
    }

    setNumericValue(finalValue)
    setDisplayValue(finalValue.toString())
    onValueChange?.(finalValue)
  }, [displayValue, numericValue, validateValue, allowDecimals, min, onValueChange])

  const onFocus = useCallback(() => {
    setIsEditing(true)
  }, [])

  const setValue = useCallback((value: number) => {
    const validatedValue = validateValue(value)
    setNumericValue(validatedValue)
    setDisplayValue(validatedValue.toString())
    onValueChange?.(validatedValue)
  }, [validateValue, onValueChange])

  return {
    displayValue,
    numericValue,
    onChange,
    onBlur,
    onFocus,
    setValue,
    isEditing
  }
}

/**
 * Hook especializado para precios
 */
export function usePriceInput(initialValue?: number, onValueChange?: (value: number) => void) {
  return useNumericInput({
    initialValue,
    onValueChange,
    min: 0,
    step: 0.01,
    allowDecimals: true,
    allowNegative: false
  })
}

/**
 * Hook especializado para cantidades/stock
 */
export function useQuantityInput(initialValue?: number, onValueChange?: (value: number) => void, min: number = 0) {
  return useNumericInput({
    initialValue,
    onValueChange,
    min,
    allowDecimals: false,
    allowNegative: false
  })
}
