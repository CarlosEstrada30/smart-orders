import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Package, Save, Loader2, Hash } from 'lucide-react'
import { toast } from 'sonner'
import { productsService, type Product, type CreateProductRequest, type UpdateProductRequest } from '@/services/products'
import { ApiError } from '@/services/api/config'
import { PermissionGuard } from '@/components/auth/permission-guard'

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)
  
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

    // Validación básica
    if (!editProductForm.name.trim() || !editProductForm.description.trim() || !editProductForm.sku.trim()) {
      setEditFormError('Nombre, descripción y SKU son obligatorios')
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

  // Función para abrir modal de nuevo producto
  const handleNewProduct = () => {
    setNewProductDialogOpen(true)
    setNewProductForm({ name: '', description: '', price: 0, stock: 0, sku: '' })
    setFormError(null)
  }

  // Función para crear nuevo producto
  const handleCreateProduct = async () => {
    // Validación básica
    if (!newProductForm.name.trim() || !newProductForm.description.trim() || !newProductForm.sku.trim()) {
      setFormError('Nombre, descripción y SKU son obligatorios')
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

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">
              Gestiona el catálogo de productos
            </p>
          </div>
          <PermissionGuard productPermission="can_manage">
            <Button onClick={handleNewProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </PermissionGuard>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Productos</CardTitle>
            <CardDescription>
              {filteredProducts.length} productos encontrados
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, SKU o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <PermissionGuard productPermission="can_view_prices">
                    <TableHead>Precio</TableHead>
                  </PermissionGuard>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{product.sku}</span>
                    </TableCell>
                    <PermissionGuard productPermission="can_view_prices">
                      <TableCell>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-1">Q</span>
                          {product.price.toFixed(2)}
                        </div>
                      </TableCell>
                    </PermissionGuard>
                    <TableCell>
                      <div className="flex items-center">
                        <Hash className="h-3 w-3 mr-1" />
                        {product.stock}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(product.is_active, product.stock)}>
                        {getStatusText(product.is_active, product.stock)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="truncate max-w-[200px] block">{product.description}</span>
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
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <PermissionGuard productPermission="can_manage">
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
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
                <Label htmlFor="modal-sku">SKU *</Label>
                <Input
                  id="modal-sku"
                  type="text"
                  placeholder="SKU del producto"
                  value={newProductForm.sku}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, sku: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modal-price">Precio *</Label>
                <Input
                  id="modal-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={newProductForm.price}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="modal-stock">Stock *</Label>
                <Input
                  id="modal-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newProductForm.stock}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-description">Descripción *</Label>
              <Textarea
                id="modal-description"
                placeholder="Descripción del producto"
                value={newProductForm.description}
                onChange={(e) => setNewProductForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
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
                <Label htmlFor="edit-sku">SKU *</Label>
                <Input
                  id="edit-sku"
                  type="text"
                  placeholder="SKU del producto"
                  value={editProductForm.sku}
                  onChange={(e) => setEditProductForm(prev => ({ ...prev, sku: e.target.value }))}
                  required
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
                <Label htmlFor="edit-stock">Stock *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={editProductForm.stock}
                  onChange={(e) => setEditProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción *</Label>
              <Textarea
                id="edit-description"
                placeholder="Descripción del producto"
                value={editProductForm.description}
                onChange={(e) => setEditProductForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
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
    </Main>
  )
} 