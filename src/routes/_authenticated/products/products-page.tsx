import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Main } from '@/components/layout/main'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Package } from 'lucide-react'

// Datos de ejemplo para productos de quesería
const mockProducts = [
  {
    id: 1,
    name: 'Queso Manchego Curado',
    category: 'Quesos Curados',
    price: 24.99,
    stock: 15,
    status: 'Disponible',
    sku: 'MAN-001',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    name: 'Queso Cabrales',
    category: 'Quesos Azules',
    price: 18.50,
    stock: 8,
    status: 'Stock Bajo',
    sku: 'CAB-002',
    createdAt: '2024-01-20',
  },
  {
    id: 3,
    name: 'Queso Idiazábal Ahumado',
    category: 'Quesos Ahumados',
    price: 22.75,
    stock: 12,
    status: 'Disponible',
    sku: 'IDI-003',
    createdAt: '2024-01-10',
  },
  {
    id: 4,
    name: 'Queso Tetilla',
    category: 'Quesos Frescos',
    price: 12.99,
    stock: 0,
    status: 'Agotado',
    sku: 'TET-004',
    createdAt: '2024-01-25',
  },
  {
    id: 5,
    name: 'Queso Mahón',
    category: 'Quesos Curados',
    price: 19.99,
    stock: 20,
    status: 'Disponible',
    sku: 'MAH-005',
    createdAt: '2024-02-01',
  },
  {
    id: 6,
    name: 'Queso de Burgos',
    category: 'Quesos Frescos',
    price: 8.50,
    stock: 25,
    status: 'Disponible',
    sku: 'BUR-006',
    createdAt: '2024-02-05',
  },
  {
    id: 7,
    name: 'Queso Roncal',
    category: 'Quesos Curados',
    price: 28.99,
    stock: 6,
    status: 'Stock Bajo',
    sku: 'RON-007',
    createdAt: '2024-02-10',
  },
  {
    id: 8,
    name: 'Queso Zamorano',
    category: 'Quesos Curados',
    price: 26.50,
    stock: 18,
    status: 'Disponible',
    sku: 'ZAM-008',
    createdAt: '2024-02-12',
  },
]

export function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [products] = useState(mockProducts)

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Disponible':
        return 'default'
      case 'Stock Bajo':
        return 'secondary'
      case 'Agotado':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">
              Gestiona el catálogo de quesos y productos lácteos
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Quesos</CardTitle>
            <CardDescription>
              {filteredProducts.length} productos encontrados
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar quesos..."
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
                  <TableHead>Queso</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
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
                    <TableCell>{product.category}</TableCell>
                    <TableCell>€{product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(product.status)}>
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.createdAt}</TableCell>
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
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
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
    </Main>
  )
} 