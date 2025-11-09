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
  
  // Función auxiliar para formatear el valor de display
  const formatDisplayValue = useCallback((value: number): string => {
    if (allowDecimals && step !== undefined && step < 1) {
      // Formatear según la precisión del step
      const decimals = Math.abs(Math.log10(step))
      return value.toFixed(decimals)
    } else if (allowDecimals) {
      // Por defecto, 2 decimales para montos/precios
      return value.toFixed(2)
    } else {
      return value.toString()
    }
  }, [allowDecimals, step])

  // Validar y formatear el valor inicial
  const validatedInitialValue = (() => {
    let val = initialValue
    if (step !== undefined && step > 0) {
      val = Math.round(val / step) * step
    }
    if (allowDecimals && step !== undefined && step < 1) {
      const decimals = Math.abs(Math.log10(step))
      val = Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals)
    } else if (allowDecimals) {
      val = Math.round(val * 100) / 100
    }
    return val
  })()

  const [displayValue, setDisplayValue] = useState(formatDisplayValue(validatedInitialValue))
  const [numericValue, setNumericValue] = useState(validatedInitialValue)
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
    } else if (step !== undefined && step < 1) {
      // Redondear a la precisión del step para evitar errores de punto flotante
      // Si step es 0.01, redondear a 2 decimales; si es 0.1, a 1 decimal, etc.
      const decimals = Math.abs(Math.log10(step))
      validatedValue = Math.round(validatedValue * Math.pow(10, decimals)) / Math.pow(10, decimals)
    } else if (allowDecimals) {
      // Por defecto, redondear a 2 decimales para montos/precios
      validatedValue = Math.round(validatedValue * 100) / 100
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

    // Formatear el displayValue para evitar errores de precisión de punto flotante
    const formattedDisplay = formatDisplayValue(finalValue)

    setNumericValue(finalValue)
    setDisplayValue(formattedDisplay)
    onValueChange?.(finalValue)
  }, [displayValue, numericValue, validateValue, formatDisplayValue, min, onValueChange])

  const onFocus = useCallback(() => {
    setIsEditing(true)
  }, [])

  const setValue = useCallback((value: number) => {
    const validatedValue = validateValue(value)
    
    // Formatear el displayValue para evitar errores de precisión de punto flotante
    const formattedDisplay = formatDisplayValue(validatedValue)
    
    setNumericValue(validatedValue)
    setDisplayValue(formattedDisplay)
    onValueChange?.(validatedValue)
  }, [validateValue, formatDisplayValue, onValueChange])

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
export function useQuantityInput(initialValue?: number, onValueChange?: (value: number) => void, min: number = 0, allowDecimals: boolean = false) {
  return useNumericInput({
    initialValue,
    onValueChange,
    min,
    allowDecimals,
    allowNegative: false
  })
}
