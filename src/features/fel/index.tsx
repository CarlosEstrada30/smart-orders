/**
 * FEL Dashboard - Facturación Electrónica Guatemala
 * Dashboard principal del sistema de facturación fiscal
 */

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Receipt,
  DollarSign,
  Users,
  Activity,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFELDashboard } from '@/hooks/use-fel-dashboard'
import { FELStatusIndicator, DocumentActions } from '@/components/FEL'
import type { OrderWithInvoiceInfo, FELInvoice } from '@/services/fel/types'

export function FELDashboard() {
  const {
    summary,
    revenue,
    ordersWithoutDocument,
    failedFELInvoices,
    isLoading,
    error,
    lastUpdated,
    keyMetrics,
    systemAlerts,
    revenueChartData,
    systemHealthIndicator,
    refreshDashboard,
    formatCurrency,
    formatDate,
    hasData,
    hasAlerts
  } = useFELDashboard(60000) // Refresh cada minuto

  // Loading skeleton
  if (isLoading && !hasData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (error && !hasData) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Error cargando dashboard FEL: {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDashboard}
            className="ml-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard FEL</h1>
          <p className="text-muted-foreground">
            Sistema de Facturación Electrónica Guatemala
            {lastUpdated && (
              <span className="ml-2 text-xs">
                • Actualizado {formatDate(lastUpdated.toISOString())}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicador de salud del sistema */}
          <Badge 
            variant={systemHealthIndicator === 'excellent' || systemHealthIndicator === 'good' ? 'default' : 'destructive'}
            className="px-3"
          >
            {systemHealthIndicator === 'excellent' && '🟢 Excelente'}
            {systemHealthIndicator === 'good' && '🟡 Bueno'}
            {systemHealthIndicator === 'warning' && '🟠 Alerta'}
            {systemHealthIndicator === 'critical' && '🔴 Crítico'}
          </Badge>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDashboard}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Alertas del sistema */}
      {hasAlerts && (
        <div className="space-y-2">
          {systemAlerts.map((alert, index) => (
            <Alert 
              key={index}
              variant={alert.type === 'error' ? 'destructive' : alert.type === 'warning' ? 'default' : 'default'}
            >
              {alert.type === 'error' && <AlertTriangle className="h-4 w-4" />}
              {alert.type === 'warning' && <Clock className="h-4 w-4" />}
              {alert.type === 'info' && <Activity className="h-4 w-4" />}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Facturas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {keyMetrics.felInvoices} FEL • {keyMetrics.totalInvoices - keyMetrics.felInvoices} Comprobantes
            </p>
          </CardContent>
        </Card>

        {/* Tasa de Éxito FEL */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Éxito FEL</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{keyMetrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {keyMetrics.felAuthorized} de {keyMetrics.felInvoices} autorizadas
            </p>
          </CardContent>
        </Card>

        {/* Ingresos Fiscales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Fiscales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(keyMetrics.fiscalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {keyMetrics.fiscalPercentage}% del total ({formatCurrency(keyMetrics.totalRevenue)})
            </p>
          </CardContent>
        </Card>

        {/* Pendientes de Acción */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requieren Atención</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {keyMetrics.ordersWithoutDoc + keyMetrics.failedToRetry}
            </div>
            <p className="text-xs text-muted-foreground">
              {keyMetrics.ordersWithoutDoc} sin documento • {keyMetrics.failedToRetry} FEL fallidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contenido principal */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Órdenes sin documento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Órdenes sin Documento
              <Badge variant="outline" className="ml-auto">
                {ordersWithoutDocument.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Órdenes entregadas que necesitan factura o comprobante
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ordersWithoutDocument.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p>¡Todas las órdenes tienen documento!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ordersWithoutDocument.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">#{order.order_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.client.name} • {formatCurrency(order.total_amount)}
                      </div>
                    </div>
                    <DocumentActions 
                      order={order} 
                      variant="compact" 
                      onUpdate={refreshDashboard}
                    />
                  </div>
                ))}
                
                {ordersWithoutDocument.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      Ver todas ({ordersWithoutDocument.length - 5} más)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Facturas FEL con errores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Facturas FEL Fallidas
              <Badge variant="destructive" className="ml-auto">
                {failedFELInvoices.length}
              </Badge>
            </CardTitle>
            <CardDescription>
              Facturas que fallaron en el proceso FEL y necesitan atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            {failedFELInvoices.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p>¡No hay errores FEL!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {failedFELInvoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg border-destructive/20">
                    <div className="flex-1">
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {invoice.client.name} • {formatCurrency(invoice.total_amount)}
                      </div>
                      <div className="text-xs text-destructive mt-1">
                        {invoice.fel.fel_error_message || 'Error desconocido'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FELStatusIndicator
                        fel_status={invoice.fel.fel_status}
                        fel_uuid={invoice.fel.fel_uuid}
                        fel_error_message={invoice.fel.fel_error_message}
                        requires_fel={invoice.fel.requires_fel}
                        size="sm"
                      />
                      <Button variant="destructive" size="sm">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Reintentar
                      </Button>
                    </div>
                  </div>
                ))}
                
                {failedFELInvoices.length > 5 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      Ver todas ({failedFELInvoices.length - 5} más)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de ingresos (si hay datos) */}
      {revenueChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comparación de Ingresos: Fiscales vs Totales
            </CardTitle>
            <CardDescription>
              Ingresos mensuales con desglose fiscal y total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Gráfico de ingresos</p>
                <p className="text-xs">Implementación pendiente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

