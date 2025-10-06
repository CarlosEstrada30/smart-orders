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
  DropdownMenuLabel,
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Package, Save, Loader2, Hash, Upload, Download, CheckCircle, DollarSign } from 'lucide-react'
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

  const getStatusBadgeVariant = (isActive: boolean, stock: number) => {
    if (!isActive) return 'destructive'
    if (stock === 0) return 'destructive'
    if (stock < 10) return 'secondary'
    return 'default'
  }

  const getStatusText = (isActive: boolean, stock: number) => {
    if (!isActive) return 'Inactivo'
    if (stock === 0) return 'Agotado'
    if (stock < 10) return 'Stock Bajo'
    return 'Disponible'
  }

  if (loading) {
    return (
      <Main>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
              <p className="text-muted-foreground">
                Gestiona el catálogo de productos
              </p>
            </div>
            <Button onClick={handleNewProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cargando productos...</CardTitle>
              <CardDescription>
                Obteniendo datos de la API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-muted-foreground">Cargando...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    )
  }

  if (error) {
    return (
      <Main>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
              <p className="text-muted-foreground">
                Gestiona el catálogo de productos
              </p>
            </div>
            <Button onClick={handleNewProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Error al cargar productos</CardTitle>
              <CardDescription>
                No se pudieron obtener los datos de la API
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchProducts}>
                    Reintentar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">
              Gestiona el catálogo de productos
            </p>
          </div>
          <PermissionGuard productPermission="can_manage">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={isExporting}
                    className="w-full sm:w-auto"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span className="hidden sm:inline">Exportando...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Exportar</span>
                        <span className="sm:hidden">Exportar</span>
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Opciones de Exportación</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportAll} disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Todos los productos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportActive} disabled={isExporting}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Solo activos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                onClick={() => setImportDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Importar</span>
                <span className="sm:hidden">Importar</span>
              </Button>
              <Button onClick={handleNewProduct} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Producto</span>
                <span className="sm:hidden">Nuevo</span>
              </Button>
            </div>
          </PermissionGuard>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Productos</CardTitle>
            <CardDescription>
              {filteredProducts.length} productos encontrados
            </CardDescription>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative w-full sm:w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, SKU o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Producto</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[100px]">SKU</TableHead>
                    <PermissionGuard productPermission="can_view_prices">
                      <TableHead className="hidden md:table-cell min-w-[80px]">Precio</TableHead>
                    </PermissionGuard>
                    <TableHead className="hidden lg:table-cell min-w-[80px]">Stock</TableHead>
                    <TableHead className="min-w-[100px]">Estado</TableHead>
                    <TableHead className="hidden xl:table-cell min-w-[150px]">Descripción</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{product.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="font-mono text-sm truncate block max-w-[100px]">{product.sku}</span>
                      </TableCell>
                      <PermissionGuard productPermission="can_view_prices">
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-1">Q</span>
                            <span className="truncate">{product.price.toFixed(2)}</span>
                          </div>
                        </TableCell>
                      </PermissionGuard>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center">
                          <Hash className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span>{product.stock}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(product.is_active, product.stock)}>
                          {getStatusText(product.is_active, product.stock)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <span className="truncate max-w-[150px] block">{product.description}</span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <PermissionGuard productPermission="can_manage">
                              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard productPermission="can_view_prices">
                              <DropdownMenuItem onClick={() => handleManageRoutePrices(product)}>
                                <DollarSign className="mr-2 h-4 w-4" />
                                Precios por Ruta
                              </DropdownMenuItem>
                            </PermissionGuard>
                            <PermissionGuard productPermission="can_manage">
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => openDeleteDialog(product)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </PermissionGuard>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredProducts.length > 0 && (
              <ClientPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filteredProducts.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
              />
            )}
          </CardContent>
        </Card>
      </div>

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
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal para crear nuevo producto */}
      <Dialog open={newProductDialogOpen} onOpenChange={setNewProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{formError}</p>
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
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Producto
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
            <DialogTitle>Editar Producto</DialogTitle>
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
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={editProductForm.price}
                  onChange={(e) => setEditProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={editProductForm.stock}
                  onChange={(e) => setEditProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
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
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{editFormError}</p>
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
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
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