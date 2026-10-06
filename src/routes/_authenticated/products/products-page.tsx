import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PriceInput, QuantityInput } from '@/components/ui/numeric-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { StatusBadge, type StatusTone } from '@/components/status-badge'
import { formatCurrency } from '@/lib/format'
import { Main } from '@/components/layout/main'
import { AlertCircle, Plus, Search, SearchX, MoreHorizontal, Edit, Trash2, Package, Save, Loader2, Upload, Download, CheckCircle, DollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { productsService, type Product, type CreateProductRequest, type UpdateProductRequest, type ProductBulkUploadResult } from '@/services/products'
import { ApiError } from '@/services/api/config'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { BulkImport } from '@/components/bulk-import'
import { RoutePricesManager } from '@/features/products/components/route-prices-manager'
import { ClientPagination } from '@/components/ui/client-pagination'

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // Estado para el modal de nuevo producto
  const [newProductDialogOpen, setNewProductDialogOpen] = useState(false)
  const [newProductForm, setNewProductForm] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sku: '',
  })
  const [creatingProduct, setCreatingProduct] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Estado para el modal de editar producto
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false)
  const [editProductForm, setEditProductForm] = useState<UpdateProductRequest>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sku: '',
  })
  const [editingProduct, setEditingProduct] = useState(false)
  const [editFormError, setEditFormError] = useState<string | null>(null)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)

  // Estado para el modal de importación
  const [importDialogOpen, setImportDialogOpen] = useState(false)

  // Estado para exportación
  const [isExporting, setIsExporting] = useState(false)

  // Estado para el modal de precios por ruta
  const [routePricesDialogOpen, setRoutePricesDialogOpen] = useState(false)
  const [selectedProductForPrices, setSelectedProductForPrices] = useState<Product | null>(null)

  // Función para abrir modal de editar producto
  const handleEditProduct = (product: Product) => {
    setProductToEdit(product)
    setEditProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
    })
    setEditFormError(null)
    setEditProductDialogOpen(true)
  }

  // Función para actualizar producto
  const handleUpdateProduct = async () => {
    if (!productToEdit) return

    // Validación básica - solo nombre y precio son requeridos
    if (!editProductForm.name.trim()) {
      setEditFormError('El nombre es obligatorio')
      return
    }

    if (editProductForm.price <= 0) {
      setEditFormError('El precio debe ser mayor a 0')
      return
    }

    if (editProductForm.stock < 0) {
      setEditFormError('El stock no puede ser negativo')
      return
    }

    try {
      setEditingProduct(true)
      setEditFormError(null)

      await productsService.updateProduct(productToEdit.id, editProductForm)

      // Producto actualizado exitosamente
      toast.success('Producto actualizado exitosamente')
      setEditProductDialogOpen(false)
      
      // Recargar la lista de productos
      fetchProducts()
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.detail : 'Error desconocido al actualizar el producto'
      setEditFormError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setEditingProduct(false)
    }
  }

  // Función para obtener los productos de la API
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await productsService.getProducts({ skip: 0, limit: 100, active_only: true })
      setProducts(data)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.detail : 'Error desconocido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Función para eliminar producto
  const handleDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      setDeleting(true)
      
      await productsService.deleteProduct(productToDelete.id)

      // Producto eliminado exitosamente
      toast.success('Producto eliminado exitosamente')
      
      // Actualizar la lista de productos
      setProducts(products.filter(product => product.id !== productToDelete.id))
      
      // Cerrar diálogo
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.detail : 'Error al eliminar el producto'
      toast.error(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  // Función para abrir diálogo de eliminación
  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  // Función para abrir modal de precios por ruta
  const handleManageRoutePrices = (product: Product) => {
    setSelectedProductForPrices(product)
    setRoutePricesDialogOpen(true)
  }

  // Función para abrir modal de nuevo producto
  const handleNewProduct = () => {
    setNewProductDialogOpen(true)
    setNewProductForm({ name: '', description: '', price: 0, stock: 0, sku: '' })
    setFormError(null)
  }

  // Función para crear nuevo producto
  const handleCreateProduct = async () => {
    // Validación básica - solo nombre y precio son requeridos
    if (!newProductForm.name.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }

    if (newProductForm.price <= 0) {
      setFormError('El precio debe ser mayor a 0')
      return
    }

    if (newProductForm.stock < 0) {
      setFormError('El stock no puede ser negativo')
      return
    }

    try {
      setCreatingProduct(true)
      setFormError(null)

      await productsService.createProduct(newProductForm)

      // Producto creado exitosamente
      toast.success('Producto creado exitosamente')
      setNewProductDialogOpen(false)
      
      // Recargar la lista de productos
      fetchProducts()
    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.detail : 'Error desconocido al crear el producto'
      setFormError(errorMessage)
    } finally {
      setCreatingProduct(false)
    }
  }

  // Funciones para importación masiva
  const handleDownloadTemplate = async () => {
    return await productsService.downloadTemplate()
  }

  const handleBulkUpload = async (file: File) => {
    return await productsService.bulkUpload(file)
  }

  const handleImportComplete = (result: ProductBulkUploadResult) => {
    // Recargar la lista de productos para mostrar los nuevos datos
    fetchProducts()
    
    // Cerrar el modal de importación
    setImportDialogOpen(false)
  }

  // Función para exportar todos los productos
  const handleExportAll = async () => {
    try {
      setIsExporting(true)
      const blob = await productsService.exportProducts({})
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `productos_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Productos exportados exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al exportar productos'
      toast.error(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  // Función para exportar solo productos activos
  const handleExportActive = async () => {
    try {
      setIsExporting(true)
      const blob = await productsService.exportProducts({ active_only: true })
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `productos_activos_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Productos activos exportados exitosamente')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al exportar productos activos'
      toast.error(errorMessage)
    } finally {
      setIsExporting(false)
    }
  }

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts()
  }, [])

  // Filtrar productos basado en el término de búsqueda
  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [products, searchTerm])

  // Calcular datos de paginación
  const totalPages = Math.ceil(filteredProducts.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Resetear página cuando cambie el filtro
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Resetear página cuando cambie el tamaño de página
  useEffect(() => {
    setCurrentPage(1)
  }, [pageSize])

  const getStockStatus = (isActive: boolean, stock: number): { label: string; tone: StatusTone } => {
    if (!isActive) return { label: 'Inactivo', tone: 'neutral' }
    if (stock === 0) return { label: 'Agotado', tone: 'danger' }
    if (stock < 10) return { label: 'Stock bajo', tone: 'warning' }
    return { label: 'Disponible', tone: 'success' }
  }

  const renderProductActions = (product: Product) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Acciones de {product.name}</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <PermissionGuard productPermission="can_manage">
          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
            <Edit />
            Editar
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard productPermission="can_view_prices">
          <DropdownMenuItem onClick={() => handleManageRoutePrices(product)}>
            <DollarSign />
            Precios por ruta
          </DropdownMenuItem>
        </PermissionGuard>
        <PermissionGuard productPermission="can_manage">
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => openDeleteDialog(product)}>
            <Trash2 />
            Eliminar
          </DropdownMenuItem>
        </PermissionGuard>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <Main>
      <PageHeader
        title="Productos"
        description={
          loading || error
            ? 'Tu catálogo, con precio base, stock y precios por ruta'
            : `${filteredProducts.length.toLocaleString('es-GT')} productos${searchTerm ? ' con esa búsqueda' : ''}`
        }
        actions={
          <PermissionGuard productPermission="can_manage">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-card" disabled={isExporting}>
                  {isExporting ? (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Download aria-hidden="true" />
                  )}
                  {isExporting ? 'Exportando…' : 'Exportar'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportAll} disabled={isExporting}>
                  <Download />
                  Todos los productos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportActive} disabled={isExporting}>
                  <CheckCircle />
                  Solo activos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="bg-card" onClick={() => setImportDialogOpen(true)}>
              <Upload aria-hidden="true" />
              Importar
            </Button>
            <Button onClick={handleNewProduct}>
              <Plus aria-hidden="true" />
              Nuevo producto
            </Button>
          </PermissionGuard>
        }
      />

      {loading ? (
        <LoadingState label="Cargando productos…" />
      ) : error ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={AlertCircle}
              title="No se pudieron cargar los productos"
              description={error}
              action={<Button onClick={fetchProducts}>Reintentar</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="gap-4 py-4 sm:py-6 max-md:border-0 max-md:bg-transparent max-md:py-0 max-md:shadow-none">
          <CardContent className="space-y-4 max-md:px-0">
            <div className="relative w-full sm:w-72">
              <Search
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2"
              />
              <Input
                placeholder="Nombre, SKU o descripción"
                aria-label="Buscar productos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card h-9 ps-8"
              />
            </div>

            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={searchTerm ? SearchX : Package}
                title={searchTerm ? 'Ningún producto coincide con la búsqueda' : 'Todavía no hay productos'}
                description={
                  searchTerm
                    ? 'Prueba con el SKU o una parte del nombre.'
                    : 'Agrega tu primer producto o importa el catálogo desde Excel.'
                }
                action={
                  !searchTerm && (
                    <PermissionGuard productPermission="can_manage">
                      <Button onClick={handleNewProduct}>
                        <Plus aria-hidden="true" />
                        Nuevo producto
                      </Button>
                    </PermissionGuard>
                  )
                }
              />
            ) : (
              <>
                {/* Escritorio: tabla */}
                <div className="hidden overflow-x-auto rounded-lg border md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50 [&>th]:text-muted-foreground">
                        <TableHead>Producto</TableHead>
                        <TableHead>SKU</TableHead>
                        <PermissionGuard productPermission="can_view_prices">
                          <TableHead className="text-right">Precio base</TableHead>
                        </PermissionGuard>
                        <TableHead className="text-right">Stock</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="hidden xl:table-cell">Descripción</TableHead>
                        <TableHead className="w-12">
                          <span className="sr-only">Acciones</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="tabular">
                      {paginatedProducts.map((product) => {
                        const status = getStockStatus(product.is_active, product.stock)
                        return (
                          <TableRow key={product.id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                            <PermissionGuard productPermission="can_view_prices">
                              <TableCell className="text-right whitespace-nowrap">
                                {formatCurrency(product.price)}
                              </TableCell>
                            </PermissionGuard>
                            <TableCell className="text-right">
                              {product.stock.toLocaleString('es-GT')}
                            </TableCell>
                            <TableCell>
                              <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                            </TableCell>
                            <TableCell className="text-muted-foreground hidden max-w-[16rem] truncate xl:table-cell">
                              {product.description || '—'}
                            </TableCell>
                            <TableCell>{renderProductActions(product)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Celular: lista */}
                <ul className="space-y-2 md:hidden">
                  {paginatedProducts.map((product) => {
                    const status = getStockStatus(product.is_active, product.stock)
                    return (
                      <li key={product.id} className="bg-card tabular flex items-start gap-3 rounded-xl border p-3">
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <p className="font-medium break-words">{product.name}</p>
                          <p className="text-muted-foreground text-sm">
                            {product.sku}, {product.stock.toLocaleString('es-GT')} en stock
                          </p>
                          <div className="flex items-center gap-2">
                            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                            <PermissionGuard productPermission="can_view_prices">
                              <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
                            </PermissionGuard>
                          </div>
                        </div>
                        {renderProductActions(product)}
                      </li>
                    )
                  })}
                </ul>

                <ClientPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={filteredProducts.length}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto{' '}
              <span className="font-semibold">{productToDelete?.name}</span> de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive"
            >
              {deleting ? 'Eliminando…' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para crear nuevo producto */}
      <Dialog open={newProductDialogOpen} onOpenChange={setNewProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo producto</DialogTitle>
            <DialogDescription>
              Completa los datos del nuevo producto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-name">Nombre *</Label>
                <Input
                  id="modal-name"
                  type="text"
                  placeholder="Nombre del producto"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-sku">SKU</Label>
                <Input
                  id="modal-sku"
                  type="text"
                  placeholder="SKU del producto"
                  value={newProductForm.sku}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-price">Precio *</Label>
                <PriceInput
                  id="modal-price"
                  placeholder="0.00"
                  value={newProductForm.price}
                  onValueChange={(value) => setNewProductForm(prev => ({ ...prev, price: value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-stock">Stock</Label>
                <QuantityInput
                  id="modal-stock"
                  placeholder="0"
                  value={newProductForm.stock}
                  onValueChange={(value) => setNewProductForm(prev => ({ ...prev, stock: value }))}
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-description">Descripción</Label>
              <Textarea
                id="modal-description"
                placeholder="Descripción del producto"
                value={newProductForm.description}
                onChange={(e) => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            {/* Mensaje de Error */}
            {formError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                <p className="text-destructive text-sm">{formError}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setNewProductDialogOpen(false)}
              disabled={creatingProduct}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleCreateProduct}
              disabled={creatingProduct}
            >
              {creatingProduct ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear producto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar producto */}
      <Dialog open={editProductDialogOpen} onOpenChange={setEditProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Modifica los datos del producto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre *</Label>
                <Input
                  id="edit-name"
                  type="text"
                  placeholder="Nombre del producto"
                  value={editProductForm.name}
                  onChange={(e) => setEditProductForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  type="text"
                  placeholder="SKU del producto"
                  value={editProductForm.sku}
                  onChange={(e) => setEditProductForm(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Precio *</Label>
                <PriceInput
                  id="edit-price"
                  placeholder="0.00"
                  value={editProductForm.price}
                  onValueChange={(value) => setEditProductForm(prev => ({ ...prev, price: value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <QuantityInput
                  id="edit-stock"
                  placeholder="0"
                  value={editProductForm.stock}
                  onValueChange={(value) => setEditProductForm(prev => ({ ...prev, stock: value }))}
                  min={0}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                placeholder="Descripción del producto"
                value={editProductForm.description}
                onChange={(e) => setEditProductForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            
            {/* Mensaje de Error */}
            {editFormError && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                <p className="text-destructive text-sm">{editFormError}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setEditProductDialogOpen(false)}
              disabled={editingProduct}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleUpdateProduct}
              disabled={editingProduct}
            >
              {editingProduct ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Componente de importación masiva */}
      <BulkImport
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        title="Productos"
        description="Importa múltiples productos desde un archivo de Excel"
        onDownloadTemplate={handleDownloadTemplate}
        onUploadFile={handleBulkUpload}
        onImportComplete={handleImportComplete}
      />

      {/* Modal de gestión de precios por ruta */}
      <RoutePricesManager
        product={selectedProductForPrices}
        isOpen={routePricesDialogOpen}
        onClose={() => {
          setRoutePricesDialogOpen(false)
          setSelectedProductForPrices(null)
        }}
      />
    </Main>
  )
} 