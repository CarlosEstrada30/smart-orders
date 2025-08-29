import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Trash2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { inventoryService, type InventoryEntryCreate, type InventoryEntryItemCreate } from '@/services/inventory'
import { productsService, type Product } from '@/services/products'
import { ENTRY_TYPE_LABELS, type EntryType } from '@/services/inventory'

interface InventoryEntryFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormItem extends InventoryEntryItemCreate {
  id: string
  product_name?: string
  subtotal: number
}

export function InventoryEntryForm({ onSuccess, onCancel }: InventoryEntryFormProps) {
  const [entryType, setEntryType] = useState<EntryType>('purchase')
  const [supplierInfo, setSupplierInfo] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [referenceDocument, setReferenceDocument] = useState('')
  
  const [items, setItems] = useState<FormItem[]>([])
  const [newItem, setNewItem] = useState({
    product_id: '',
    quantity: 1,
    unit_cost: 0,
    batch_number: '',
    expiry_date: '',
    notes: ''
  })
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoadingProducts(true)
      const productsData = await productsService.getProducts({ limit: 1000, active_only: true })
      setProducts(productsData)
    } catch (error) {
      toast.error('Error al cargar productos')
    } finally {
      setLoadingProducts(false)
    }
  }

  const addItem = () => {
    if (!newItem.product_id || newItem.quantity <= 0) {
      toast.error('Selecciona un producto y una cantidad válida')
      return
    }

    const product = products.find(p => p.id === parseInt(newItem.product_id))
    if (!product) {
      toast.error('Producto no encontrado')
      return
    }

    const formItem: FormItem = {
      id: Date.now().toString(),
      product_id: product.id,
      quantity: newItem.quantity,
      unit_cost: newItem.unit_cost,
      batch_number: newItem.batch_number || null,
      expiry_date: newItem.expiry_date || null,
      notes: newItem.notes || null,
      product_name: product.name,
      subtotal: newItem.quantity * newItem.unit_cost
    }

    setItems([...items, formItem])
    setNewItem({
      product_id: '',
      quantity: 1,
      unit_cost: 0,
      batch_number: '',
      expiry_date: '',
      notes: ''
    })
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, quantity, subtotal: quantity * item.unit_cost }
        : item
    ))
  }

  const updateItemCost = (id: string, cost: number) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, unit_cost: cost, subtotal: item.quantity * cost }
        : item
    ))
  }

  const totalCost = items.reduce((sum, item) => sum + item.subtotal, 0)

  // Helper function to format date to ISO datetime
  const formatDateToISO = (dateString: string | null | undefined): string | null => {
    if (!dateString || dateString.trim() === '') return null
    
    // If the date already includes time, return as is
    if (dateString.includes('T')) return dateString
    
    // If it's just a date (YYYY-MM-DD), add midnight time
    return `${dateString}T00:00:00`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (items.length === 0) {
      toast.error('Agrega al menos un producto')
      return
    }

    try {
      setLoading(true)
      
      const entryData: InventoryEntryCreate = {
        entry_type: entryType,
        supplier_info: supplierInfo || null,
        expected_date: formatDateToISO(expectedDate),
        notes: notes || null,
        reference_document: referenceDocument || null,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          batch_number: item.batch_number,
          expiry_date: formatDateToISO(item.expiry_date),
          notes: item.notes
        }))
      }

      console.log('📅 Datos enviados a la API (fechas formateadas):', {
        expected_date: entryData.expected_date,
        items_with_dates: entryData.items.filter(item => item.expiry_date).map(item => ({
          product_id: item.product_id,
          expiry_date: item.expiry_date
        }))
      })

      await inventoryService.createEntry(entryData)
      toast.success('Entrada de inventario creada exitosamente')
      onSuccess?.()
    } catch (error) {
      toast.error('Error al crear la entrada de inventario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Entry Information */}
      <Card>
        <CardHeader>
          <CardTitle>Información de la Entrada</CardTitle>
          <CardDescription>
            Datos básicos de la entrada de inventario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_type">Tipo de Entrada</Label>
              <Select value={entryType} onValueChange={(value) => setEntryType(value as EntryType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ENTRY_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {entryType === 'purchase' && (
              <div className="space-y-2">
                <Label htmlFor="supplier_info">Proveedor</Label>
                <Input
                  id="supplier_info"
                  value={supplierInfo}
                  onChange={(e) => setSupplierInfo(e.target.value)}
                  placeholder="Nombre del proveedor"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="expected_date">Fecha Esperada</Label>
              <Input
                id="expected_date"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_document">Documento de Referencia</Label>
              <Input
                id="reference_document"
                value={referenceDocument}
                onChange={(e) => setReferenceDocument(e.target.value)}
                placeholder="Número de factura, orden, etc."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales sobre la entrada"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Item Form */}
      <Card>
        <CardHeader>
          <CardTitle>Agregar Productos</CardTitle>
          <CardDescription>
            Selecciona los productos para esta entrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
            <div className="space-y-2 md:col-span-2">
              <Label>Producto</Label>
              <Select 
                value={newItem.product_id} 
                onValueChange={(value) => setNewItem(prev => ({ ...prev, product_id: value }))}
                disabled={loadingProducts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingProducts ? "Cargando..." : "Selecciona producto"} />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          (Stock: {product.stock})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input
                type="number"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Costo Unitario</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newItem.unit_cost}
                onChange={(e) => setNewItem(prev => ({ ...prev, unit_cost: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Lote</Label>
              <Input
                value={newItem.batch_number}
                onChange={(e) => setNewItem(prev => ({ ...prev, batch_number: e.target.value }))}
                placeholder="Opcional"
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Vencimiento</Label>
              <Input
                type="date"
                value={newItem.expiry_date}
                onChange={(e) => setNewItem(prev => ({ ...prev, expiry_date: e.target.value }))}
                placeholder="Opcional"
              />
            </div>

            <Button type="button" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Productos Agregados</CardTitle>
            <CardDescription>
              Lista de productos en esta entrada
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">Costo Unitario</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.product_name}
                      <div className="text-xs text-muted-foreground space-y-1">
                        {item.batch_number && (
                          <div>Lote: {item.batch_number}</div>
                        )}
                        {item.expiry_date && (
                          <div>Vence: {new Date(item.expiry_date).toLocaleDateString()}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-20 text-center"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => updateItemCost(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24 text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Q{item.subtotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg">
                    Q{totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || items.length === 0}>
          {loading ? 'Creando...' : 'Crear Entrada'}
        </Button>
      </div>
    </form>
  )
}

