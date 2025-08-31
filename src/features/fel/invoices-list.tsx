/**
 * FEL Invoices List
 * Lista completa de facturas FEL con filtros y acciones
 */

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Search,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Receipt,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { felService } from '@/services/fel'
import { useFELProcessing } from '@/hooks/use-fel-processing'
import { usePaymentFlow } from '@/hooks/use-payment-flow'
import { FELStatusIndicator, DocumentActions } from '@/components/FEL'
import type { 
  FELInvoice, 
  InvoiceFilters,
  InvoiceStatus,
  FELStatus,
  PaymentMethod
} from '@/services/fel/types'

interface InvoicesListState {
  invoices: FELInvoice[]
  isLoading: boolean
  error: string | null
  filters: InvoiceFilters
  pagination: {
    page: number
    totalPages: number
    totalItems: number
  }
}

export function FELInvoicesList() {
  const [state, setState] = useState<InvoicesListState>({
    invoices: [],
    isLoading: true,
    error: null,
    filters: {},
    pagination: {
      page: 1,
      totalPages: 1,
      totalItems: 0
    }
  })

  const [selectedInvoice, setSelectedInvoice] = useState<FELInvoice | null>(null)

  // Hooks para acciones
  const felProcessing = useFELProcessing()
  const paymentFlow = usePaymentFlow()

  // Cargar facturas
  const loadInvoices = React.useCallback(async (filters: InvoiceFilters = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const invoices = await felService.getInvoices(filters)
      
      setState(prev => ({
        ...prev,
        invoices,
        isLoading: false,
        filters,
        pagination: {
          page: 1,
          totalPages: Math.ceil(invoices.length / 20),
          totalItems: invoices.length
        }
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error cargando facturas'
      }))
    }
  }, [])

  // Efecto inicial
  useEffect(() => {
    loadInvoices()
  }, [loadInvoices])

  // Manejar cambios de filtros
  const handleFilterChange = (key: keyof InvoiceFilters, value: any) => {
    const newFilters = { ...state.filters, [key]: value }
    if (value === '' || value === undefined || value === 'all') {
      delete newFilters[key]
    }
    loadInvoices(newFilters)
  }

  // Datos filtrados y paginados
  const displayedInvoices = useMemo(() => {
    const startIndex = (state.pagination.page - 1) * 20
    const endIndex = startIndex + 20
    return state.invoices.slice(startIndex, endIndex)
  }, [state.invoices, state.pagination.page])

  // Estadísticas de los resultados
  const statistics = useMemo(() => {
    const invoices = state.invoices
    return {
      total: invoices.length,
      fel: invoices.filter(i => i.fel.requires_fel).length,
      receipts: invoices.filter(i => !i.fel.requires_fel).length,
      authorized: invoices.filter(i => i.fel.fel_status === 'authorized').length,
      failed: invoices.filter(i => ['error', 'rejected'].includes(i.fel.fel_status)).length,
      totalAmount: invoices.reduce((sum, i) => sum + i.total_amount, 0),
      paidAmount: invoices.reduce((sum, i) => sum + i.paid_amount, 0),
    }
  }, [state.invoices])

  // Loading state
  if (state.isLoading && state.invoices.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facturas FEL</h1>
          <p className="text-muted-foreground">
            Gestión completa de facturas y comprobantes
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadInvoices(state.filters)}
            disabled={state.isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", state.isLoading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{statistics.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{statistics.fel}</div>
            <p className="text-xs text-muted-foreground">FEL</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{statistics.receipts}</div>
            <p className="text-xs text-muted-foreground">Comprobantes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{statistics.authorized}</div>
            <p className="text-xs text-muted-foreground">Autorizadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{statistics.failed}</div>
            <p className="text-xs text-muted-foreground">Fallidas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-bold">{felService.formatCurrency(statistics.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Total Facturado</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Búsqueda */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Número, cliente..."
                  className="pl-8"
                  value={state.filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Estado de factura */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado Factura</label>
              <Select 
                value={state.filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="issued">Emitida</SelectItem>
                  <SelectItem value="paid">Pagada</SelectItem>
                  <SelectItem value="overdue">Vencida</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Estado FEL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado FEL</label>
              <Select 
                value={state.filters.fel_status || 'all'}
                onValueChange={(value) => handleFilterChange('fel_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="authorized">Autorizada</SelectItem>
                  <SelectItem value="processing">Procesando</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="rejected">Rechazada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de documento */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select 
                value={state.filters.requires_fel?.toString() || 'all'}
                onValueChange={(value) => {
                  if (value === 'all') {
                    handleFilterChange('requires_fel', undefined)
                  } else {
                    handleFilterChange('requires_fel', value === 'true')
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Facturas FEL</SelectItem>
                  <SelectItem value="false">Comprobantes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Método de pago */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Pago</label>
              <Select 
                value={state.filters.payment_method || 'all'}
                onValueChange={(value) => handleFilterChange('payment_method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="cash">Efectivo</SelectItem>
                  <SelectItem value="credit_card">Tarjeta</SelectItem>
                  <SelectItem value="bank_transfer">Transferencia</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de facturas */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas y Comprobantes</CardTitle>
          <CardDescription>
            Mostrando {displayedInvoices.length} de {statistics.total} resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : displayedInvoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron facturas</p>
            </div>
          ) : (
            <div className="space-y-1">
              {displayedInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  {/* Información principal */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Factura */}
                    <div>
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {felService.formatDate(invoice.issue_date)}
                      </div>
                    </div>

                    {/* Cliente */}
                    <div>
                      <div className="font-medium text-sm">{invoice.client.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {invoice.client.nit || 'Sin NIT'}
                      </div>
                    </div>

                    {/* Monto */}
                    <div>
                      <div className="font-medium">{felService.formatCurrency(invoice.total_amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {invoice.balance_due > 0 ? (
                          <span className="text-orange-600">
                            Saldo: {felService.formatCurrency(invoice.balance_due)}
                          </span>
                        ) : (
                          <span className="text-green-600">Pagada</span>
                        )}
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="flex flex-col gap-1">
                      <FELStatusIndicator
                        fel_status={invoice.fel.fel_status}
                        fel_uuid={invoice.fel.fel_uuid}
                        fel_error_message={invoice.fel.fel_error_message}
                        invoice_status={invoice.status}
                        requires_fel={invoice.fel.requires_fel}
                        size="sm"
                      />
                      
                      <Badge variant="outline" className="text-xs w-fit">
                        {invoice.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    {/* Botón de descarga */}
                    {invoice.pdf_generated && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          felService.downloadInvoicePDF(invoice.id)
                            .then((blob) => {
                              const url = window.URL.createObjectURL(blob)
                              const link = document.createElement('a')
                              link.href = url
                              link.download = `${invoice.invoice_number}.pdf`
                              link.click()
                              window.URL.revokeObjectURL(url)
                            })
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    {/* Botón de pago */}
                    {invoice.balance_due > 0 && invoice.status === 'issued' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Aquí abrir modal de pago
                          setSelectedInvoice(invoice)
                        }}
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pagar
                      </Button>
                    )}

                    {/* Botón de reintentar FEL */}
                    {['error', 'rejected'].includes(invoice.fel.fel_status) && 
                     invoice.fel.fel_attempts < invoice.fel.fel_max_attempts && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={felProcessing.isProcessing}
                        onClick={() => {
                          felProcessing.retryFEL(invoice.id)
                            .then(() => loadInvoices(state.filters))
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Reintentar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TODO: Aquí irían los modales para pago, detalles, etc. */}
      
    </div>
  )
}
