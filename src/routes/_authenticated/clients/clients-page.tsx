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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, UserCheck, Building2, MapPin, Phone } from 'lucide-react'

// Datos de ejemplo para clientes de quesería
const mockClients = [
  {
    id: 1,
    name: 'Restaurante El Bueno',
    type: 'Restaurante',
    contactPerson: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@elbueno.com',
    phone: '+34 123 456 789',
    address: 'Calle Mayor 123, Madrid',
    status: 'Activo',
    totalOrders: 45,
    totalSpent: 2340.50,
    lastOrder: '2024-02-15',
    createdAt: '2023-06-15',
  },
  {
    id: 2,
    name: 'Hotel Plaza Mayor',
    type: 'Hotel',
    contactPerson: 'Luis Martínez',
    email: 'compras@plazamayor.com',
    phone: '+34 987 654 321',
    address: 'Plaza Mayor 1, Madrid',
    status: 'Activo',
    totalOrders: 32,
    totalSpent: 1890.75,
    lastOrder: '2024-02-14',
    createdAt: '2023-08-20',
  },
  {
    id: 3,
    name: 'Catering Delicias',
    type: 'Catering',
    contactPerson: 'Elena Sánchez',
    email: 'pedidos@delicias.com',
    phone: '+34 555 123 456',
    address: 'Avenida de la Paz 45, Barcelona',
    status: 'Activo',
    totalOrders: 67,
    totalSpent: 4567.80,
    lastOrder: '2024-02-16',
    createdAt: '2023-05-10',
  },
  {
    id: 4,
    name: 'Tienda Gourmet',
    type: 'Tienda',
    contactPerson: 'Ana López',
    email: 'compras@gourmet.com',
    phone: '+34 777 888 999',
    address: 'Calle Gourmet 78, Valencia',
    status: 'Activo',
    totalOrders: 28,
    totalSpent: 1234.90,
    lastOrder: '2024-02-12',
    createdAt: '2023-09-05',
  },
  {
    id: 5,
    name: 'Restaurante La Taberna',
    type: 'Restaurante',
    contactPerson: 'Pedro Fernández',
    email: 'pedidos@lataberna.com',
    phone: '+34 111 222 333',
    address: 'Calle de la Taberna 12, Sevilla',
    status: 'Inactivo',
    totalOrders: 15,
    totalSpent: 890.25,
    lastOrder: '2024-01-20',
    createdAt: '2023-10-15',
  },
  {
    id: 6,
    name: 'Hotel Mediterráneo',
    type: 'Hotel',
    contactPerson: 'María González',
    email: 'compras@mediterraneo.com',
    phone: '+34 444 555 666',
    address: 'Paseo Marítimo 34, Málaga',
    status: 'Activo',
    totalOrders: 41,
    totalSpent: 2789.60,
    lastOrder: '2024-02-13',
    createdAt: '2023-07-22',
  },
]

export function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [clients] = useState(mockClients)

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'default'
      case 'Inactivo':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Restaurante':
        return <Building2 className="h-4 w-4" />
      case 'Hotel':
        return <Building2 className="h-4 w-4" />
      case 'Catering':
        return <UserCheck className="h-4 w-4" />
      case 'Tienda':
        return <UserCheck className="h-4 w-4" />
      default:
        return <UserCheck className="h-4 w-4" />
    }
  }

  return (
    <Main>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gestiona los clientes de la quesería
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {filteredClients.length} clientes encontrados
            </CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pedidos</TableHead>
                  <TableHead>Total Gastado</TableHead>
                  <TableHead>Último Pedido</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[200px]">{client.address}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(client.type)}
                        <span>{client.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{client.contactPerson}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {client.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(client.status)}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{client.totalOrders}</TableCell>
                    <TableCell className="font-medium">€{client.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>{client.lastOrder}</TableCell>
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