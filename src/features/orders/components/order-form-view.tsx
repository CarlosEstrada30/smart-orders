import {
  AlertCircle,
  PackagePlus,
  Plus,
  Save,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QuantityInput } from '@/components/ui/numeric-input'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState } from '@/components/empty-state'
import { StepTitle } from './step-title'

type Option = { value: string; label: string; disabled?: boolean }

export interface OrderFormItem {
  product_id: number
  product_name: string
  price: number
  quantity: number
  subtotal: number
}

type OrderFormViewProps = {
  error: string | null
  routeOptions: Option[]
  clientOptions: Option[]
  productOptions: Option[]
  loadingRoutes: boolean
  loadingClients: boolean
  loadingProducts: boolean
  selectedRoute: string
  selectedClient: string
  selectedProduct: string
  quantity: number
  orderItems: OrderFormItem[]
  discount: number
  notes: string
  subtotal: number
  total: number
  /** Ocupado guardando */
  saving: boolean
  submitLabel: string
  savingLabel: string
  onSubmit: (e: React.FormEvent) => void
  onRouteChange: (value: string) => void
  onClientChange: (value: string) => void
  onNewClient: () => void
  onProductChange: (value: string) => void
  onQuantityChange: (value: number) => void
  onAddItem: () => void
  onItemQuantityChange: (index: number, value: number) => void
  onRemoveItem: (index: number) => void
  onDiscountChange: (value: number) => void
  onNotesChange: (value: string) => void
}

/** Formulario de pedido (crear y editar): pasos a la izquierda, resumen fijo */
export function OrderFormView({
  error,
  routeOptions,
  clientOptions,
  productOptions,
  loadingRoutes,
  loadingClients,
  loadingProducts,
  selectedRoute,
  selectedClient,
  selectedProduct,
  quantity,
  orderItems,
  discount,
  notes,
  subtotal,
  total,
  saving,
  submitLabel: idleLabel,
  savingLabel,
  onSubmit,
  onRouteChange,
  onClientChange,
  onNewClient,
  onProductChange,
  onQuantityChange,
  onAddItem,
  onItemQuantityChange,
  onRemoveItem,
  onDiscountChange,
  onNotesChange,
}: OrderFormViewProps) {
  const missing = [
    !selectedRoute && 'la ruta',
    !selectedClient && 'el cliente',
    orderItems.length === 0 && 'al menos un producto',
  ].filter(Boolean) as string[]
  const isBusy = saving || loadingClients || loadingProducts || loadingRoutes
  const canSubmit = missing.length === 0 && !isBusy
  const submitLabel = saving ? savingLabel : idleLabel

  // El descuento se edita en el resumen (escritorio) o en el paso 1 (celular)
  const renderDiscountInput = (id: string, className?: string) => (
    <Input
      id={id}
      type='number'
      inputMode='decimal'
      min='0'
      step='0.01'
      placeholder='0.00'
      value={discount || ''}
      onChange={(e) => {
        const value = parseFloat(e.target.value)
        onDiscountChange(isNaN(value) || value < 0 ? 0 : value)
      }}
      className={cn('tabular h-10', className)}
    />
  )

  return (
    <>
      {error && (
        <Alert variant='destructive' className='mb-4'>
          <AlertCircle aria-hidden='true' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={onSubmit} className='grid gap-4 lg:grid-cols-3 lg:gap-6'>
        <div className='space-y-4 lg:col-span-2 lg:space-y-6'>
          {/* Paso 1 */}
          <Card>
            <CardHeader>
              <StepTitle step={1} done={!!selectedRoute && !!selectedClient}>
                Ruta, cliente y notas
              </StepTitle>
              <CardDescription>
                El precio de cada producto depende de la ruta.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-2'>
                <div className='flex h-8 items-center'>
                  <Label htmlFor='route'>Ruta de entrega</Label>
                </div>
                <Combobox
                  options={routeOptions}
                  value={selectedRoute}
                  onValueChange={onRouteChange}
                  placeholder={
                    loadingRoutes ? 'Cargando rutas…' : 'Selecciona una ruta'
                  }
                  searchPlaceholder='Buscar ruta'
                  emptyMessage='No hay rutas con ese nombre.'
                  disabled={loadingRoutes}
                />
              </div>
              <div className='space-y-2'>
                <div className='flex h-8 items-center justify-between'>
                  <Label htmlFor='client'>Cliente</Label>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={onNewClient}
                    className='text-primary h-8 px-2'
                  >
                    <UserPlus aria-hidden='true' />
                    Nuevo cliente
                  </Button>
                </div>
                <Combobox
                  options={clientOptions}
                  value={selectedClient}
                  onValueChange={onClientChange}
                  placeholder={
                    loadingClients
                      ? 'Cargando clientes…'
                      : 'Selecciona un cliente'
                  }
                  searchPlaceholder='Buscar por nombre o teléfono'
                  emptyMessage='No hay clientes con ese dato.'
                  disabled={loadingClients}
                />
              </div>
              <div className='space-y-2 lg:hidden'>
                <Label htmlFor='discount-mobile'>
                  Descuento en quetzales{' '}
                  <span className='text-muted-foreground font-normal'>
                    (opcional)
                  </span>
                </Label>
                {renderDiscountInput('discount-mobile')}
              </div>
              <div className='space-y-2 lg:col-span-2'>
                <Label htmlFor='notes'>
                  Notas{' '}
                  <span className='text-muted-foreground font-normal'>
                    (opcional)
                  </span>
                </Label>
                <Textarea
                  id='notes'
                  placeholder='Ej.: entregar antes de las 10 a. m.'
                  value={notes}
                  onChange={(e) => onNotesChange(e.target.value)}
                  rows={2}
                  className='min-h-10'
                />
              </div>
            </CardContent>
          </Card>

          {/* Paso 2 */}
          <Card>
            <CardHeader>
              <StepTitle step={2} done={orderItems.length > 0}>
                Productos
              </StepTitle>
              <CardDescription>
                {selectedRoute
                  ? 'Los precios ya corresponden a la ruta elegida.'
                  : 'Mostrando precios generales hasta que elijas una ruta.'}
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end'>
                <div className='space-y-2'>
                  <Label htmlFor='product'>Producto</Label>
                  <Combobox
                    options={productOptions}
                    value={selectedProduct}
                    onValueChange={onProductChange}
                    placeholder={
                      loadingProducts
                        ? 'Cargando productos…'
                        : 'Selecciona un producto'
                    }
                    searchPlaceholder='Buscar producto'
                    emptyMessage='No hay productos con ese nombre.'
                    disabled={loadingProducts}
                  />
                </div>
                <div className='grid grid-cols-[1fr_auto] gap-3 sm:contents'>
                  <div className='space-y-2'>
                    <Label htmlFor='quantity'>Cantidad</Label>
                    <QuantityInput
                      id='quantity'
                      value={quantity}
                      onValueChange={onQuantityChange}
                      min={0.01}
                      allowDecimals={true}
                      className='tabular h-10'
                    />
                  </div>
                  <Button
                    type='button'
                    onClick={onAddItem}
                    variant='secondary'
                    className='h-10 self-end'
                    disabled={!selectedProduct || quantity <= 0}
                  >
                    <Plus aria-hidden='true' />
                    Agregar
                  </Button>
                </div>
              </div>

              {orderItems.length > 0 ? (
                <ul className='tabular divide-y rounded-lg border'>
                  {orderItems.map((item, index) => (
                    <li
                      key={item.product_id}
                      className='grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 p-3 sm:grid-cols-[minmax(0,1fr)_7rem_6.5rem_auto]'
                    >
                      <div className='min-w-0'>
                        <p className='font-medium break-words'>
                          {item.product_name}
                        </p>
                        <p className='text-muted-foreground text-sm'>
                          {formatCurrency(item.price)} c/u
                        </p>
                      </div>
                      <span className='text-end font-semibold sm:order-3'>
                        {formatCurrency(item.subtotal)}
                      </span>
                      <QuantityInput
                        id={`quantity-${index}`}
                        aria-label={`Cantidad de ${item.product_name}`}
                        value={item.quantity}
                        onValueChange={(value) =>
                          onItemQuantityChange(index, value)
                        }
                        min={0.01}
                        allowDecimals={true}
                        className='h-10 sm:order-2'
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => onRemoveItem(index)}
                        className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 justify-self-end sm:order-4'
                        aria-label={`Quitar ${item.product_name}`}
                      >
                        <Trash2 aria-hidden='true' />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={PackagePlus}
                  title='Aún no hay productos'
                  description='Busca un producto, indica la cantidad y presiona Agregar.'
                  className='rounded-lg border border-dashed py-8'
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen: lateral en escritorio */}
        <div className='hidden lg:block'>
          <Card className='sticky top-20'>
            <CardHeader>
              <CardTitle className='font-display text-lg'>Resumen</CardTitle>
            </CardHeader>
            <CardContent className='tabular space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>
                  Subtotal ({orderItems.length}{' '}
                  {orderItems.length === 1 ? 'producto' : 'productos'})
                </span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className='flex items-center justify-between gap-3'>
                <Label
                  htmlFor='discount'
                  className='text-muted-foreground font-normal'
                >
                  Descuento
                </Label>
                <div className='w-28'>
                  {renderDiscountInput('discount', 'h-8 text-end')}
                </div>
              </div>
              <div className='flex items-baseline justify-between border-t pt-3'>
                <span className='font-medium'>Total</span>
                <span className='font-display text-2xl font-semibold'>
                  {formatCurrency(total)}
                </span>
              </div>
              <Button
                type='submit'
                className='mt-3 h-10 w-full'
                disabled={!canSubmit}
              >
                <Save aria-hidden='true' />
                {submitLabel}
              </Button>
              {missing.length > 0 && (
                <p className='text-muted-foreground text-center text-xs'>
                  Falta elegir {missing.join(', ')}.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Resumen: barra fija en celular y tableta, sobre la barra de navegación */}
        <div className='bg-card/95 fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+3.5rem)] z-30 border-t px-4 py-3 backdrop-blur md:bottom-0 lg:hidden'>
          <div className='mx-auto flex max-w-3xl items-center justify-between gap-3'>
            <div className='tabular min-w-0'>
              <p className='text-muted-foreground truncate text-xs'>
                {missing.length > 0
                  ? `Falta ${missing[0]}`
                  : `${orderItems.length} ${orderItems.length === 1 ? 'producto' : 'productos'}`}
              </p>
              <p className='font-display text-xl font-semibold'>
                {formatCurrency(total)}
              </p>
            </div>
            <Button type='submit' className='h-11 px-5' disabled={!canSubmit}>
              {submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </>
  )
}
