import { useState, useEffect } from 'react'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { LoadingState } from '@/components/loading-state'
import { StatusBadge } from '@/components/status-badge'
import { backendFieldsToRole, getRoleConfig } from '@/services/users/role-mapping'
import { Main } from '@/components/layout/main'
import { AlertCircle, Plus, Search, SearchX, MoreHorizontal, Edit, Trash2, Shield } from 'lucide-react'
import { usersService, type User } from '@/services/users'
import { UsersCreateDialog, UsersEditDialog, UsersDeleteDialog } from '@/features/users/components'
import { toast } from 'sonner'

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Load users from API
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const usersData = await usersService.getUsers()
      setUsers(usersData)
    } catch (err) {
      console.error('Error loading users:', err)
      setError('Revisa tu conexión e intenta de nuevo.')
      toast.error('No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const roleName = (user: User) =>
    getRoleConfig(backendFieldsToRole(user.is_superuser, user.email, user.role)).displayName

  const initials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || 'U'

  const renderActions = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8 p-0">
          <span className="sr-only">Acciones de {user.full_name}</span>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEdit(user)}>
          <Edit />
          Editar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => handleDelete(user)}>
          <Trash2 />
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <Main>
      <PageHeader
        title="Usuarios"
        description="Las personas de tu empresa que usan SmartOrders y su rol."
        actions={
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus aria-hidden="true" />
            Nuevo usuario
          </Button>
        }
      />

      {loading ? (
        <LoadingState label="Cargando usuarios…" rows={4} />
      ) : error ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={AlertCircle}
              title="No se pudieron cargar los usuarios"
              description={error}
              action={<Button onClick={loadUsers}>Reintentar</Button>}
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
                placeholder="Nombre, correo o usuario"
                aria-label="Buscar usuarios"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-card h-9 ps-8"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="Ningún usuario coincide con la búsqueda"
                description="Busca por nombre, correo o nombre de usuario."
              />
            ) : (
              <>
                <div className="hidden overflow-x-auto rounded-lg border md:block">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50 [&>th]:text-muted-foreground">
                        <TableHead>Usuario</TableHead>
                        <TableHead>Correo</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Registrado</TableHead>
                        <TableHead className="w-12">
                          <span className="sr-only">Acciones</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                                  {initials(user.full_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.full_name}</div>
                                <div className="text-muted-foreground text-sm">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5">
                              {user.is_superuser && (
                                <Shield className="text-primary size-3.5" aria-label="Superusuario" />
                              )}
                              {roleName(user)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge tone={user.is_active ? 'success' : 'neutral'}>
                              {user.is_active ? 'Activo' : 'Inactivo'}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="tabular text-muted-foreground">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString('es-GT')
                              : '—'}
                          </TableCell>
                          <TableCell>{renderActions(user)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <ul className="space-y-2 md:hidden">
                  {filteredUsers.map((user) => (
                    <li key={user.id} className="bg-card flex items-center gap-3 rounded-xl border p-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
                          {initials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{user.full_name}</p>
                        <p className="text-muted-foreground truncate text-sm">
                          {roleName(user)}
                          {!user.is_active && ', inactivo'}
                        </p>
                      </div>
                      {renderActions(user)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <UsersCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onUserCreated={loadUsers}
      />

      <UsersEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={selectedUser}
        onUserUpdated={loadUsers}
      />

      <UsersDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        user={selectedUser}
        onUserDeleted={loadUsers}
      />
    </Main>
  )
}
