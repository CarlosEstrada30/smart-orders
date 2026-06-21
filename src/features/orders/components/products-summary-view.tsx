import { Package } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { OrdersProductsSummary } from '@/services/orders'

interface ProductsSummaryViewProps {
  data: OrdersProductsSummary | undefined
  isLoading: boolean
  isError: boolean
  productSearch: string
}

function formatQty(value: number): string {
  return value % 1 === 0 ? String(Math.round(value)) : value.toFixed(2)
}

export function ProductsSummaryView({ data, isLoading, isError, productSearch }: ProductsSummaryViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </div>
    )
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">Error al cargar el consolidado. Intenta de nuevo.</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <Package className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm">No hay órdenes con ruta asignada para los filtros seleccionados.</p>
      </div>
    )
  }

  const filtered = productSearch.trim()
    ? data.products.filter((p) =>
        p.product_name.toLowerCase().includes(productSearch.trim().toLowerCase())
      )
    : data.products

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-right w-36">Cantidad total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((product) => (
            <TableRow key={product.product_id}>
              <TableCell className="font-medium">{product.product_name}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatQty(product.total_quantity)}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                No se encontró ningún producto con ese nombre.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="border-t pt-4 text-sm text-muted-foreground">
        {data.total_order_count} {data.total_order_count === 1 ? 'orden' : 'órdenes'}
      </div>
    </div>
  )
}
