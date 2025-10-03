import { useState } from 'react'
import { Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface DateFilterProps {
  onDateRangeChange: (range: { from?: Date; to?: Date } | null) => void
  dateRange: { from?: Date; to?: Date } | null
}

export function DataTableDateFilter({ onDateRangeChange, dateRange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [quickSelect, setQuickSelect] = useState<string>('')
  // Función helper para formatear fechas localmente
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [fromDate, setFromDate] = useState<string>(
    dateRange?.from ? formatLocalDate(dateRange.from) : ''
  )
  const [toDate, setToDate] = useState<string>(
    dateRange?.to ? formatLocalDate(dateRange.to) : ''
  )

  const handleQuickSelect = (value: string) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay())
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)

    let range = null

    switch (value) {
      case 'today':
        range = { from: today, to: today }
        break
      case 'yesterday':
        range = { from: yesterday, to: yesterday }
        break
      case 'this-week':
        range = { from: thisWeekStart, to: today }
        break
      case 'this-month':
        range = { from: thisMonthStart, to: today }
        break
      case 'last-month':
        range = { from: lastMonthStart, to: lastMonthEnd }
        break
      default:
        range = null
    }

    if (range) {
      // Usar métodos locales en lugar de toISOString() para evitar problemas de zona horaria
      const formatLocalDate = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      }
      
      setFromDate(formatLocalDate(range.from))
      setToDate(formatLocalDate(range.to))
      onDateRangeChange(range)
    }

    setQuickSelect(value)
  }

  const handleCustomDateChange = () => {
    let range = null
    
    if (fromDate && toDate) {
      range = {
        from: new Date(fromDate),
        to: new Date(toDate)
      }
    } else if (fromDate) {
      range = {
        from: new Date(fromDate),
        to: new Date(fromDate)
      }
    }

    onDateRangeChange(range)
    setQuickSelect('custom')
  }

  const handleClear = () => {
    setFromDate('')
    setToDate('')
    setQuickSelect('')
    onDateRangeChange(null)
  }

  const formatDateRange = () => {
    if (!dateRange?.from) return null
    
    const from = dateRange.from.toLocaleDateString()
    const to = dateRange.to ? dateRange.to.toLocaleDateString() : from
    
    return from === to ? from : `${from} - ${to}`
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-dashed"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Fecha
          {dateRange?.from && (
            <>
              <div className="hidden space-x-1 sm:flex">
                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                  {formatDateRange()}
                </Badge>
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Selección rápida</label>
            <Select value={quickSelect} onValueChange={handleQuickSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="yesterday">Ayer</SelectItem>
                <SelectItem value="this-week">Esta semana</SelectItem>
                <SelectItem value="this-month">Este mes</SelectItem>
                <SelectItem value="last-month">Mes pasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rango personalizado</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  placeholder="Fecha desde"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  placeholder="Fecha hasta"
                />
              </div>
            </div>
            <Button
              onClick={handleCustomDateChange}
              disabled={!fromDate}
              className="w-full"
              size="sm"
            >
              Aplicar rango
            </Button>
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={handleClear}
              size="sm"
            >
              <X className="mr-1 h-4 w-4" />
              Limpiar
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              size="sm"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
