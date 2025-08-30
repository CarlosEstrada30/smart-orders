import { useState, useEffect } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { usersService, type User } from '@/services/users'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const userData = await usersService.getUsers()
      setUsers(userData)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleUserCreated = () => {
    loadUsers() // Recargar la lista después de crear un usuario
  }

  const handleUserUpdated = () => {
    loadUsers() // Recargar la lista después de actualizar un usuario
  }

  const handleUserDeleted = () => {
    loadUsers() // Recargar la lista después de eliminar un usuario
  }

  return (
    <UsersProvider onUserCreated={handleUserCreated} onUserUpdated={handleUserUpdated} onUserDeleted={handleUserDeleted}>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Lista de Usuarios</h2>
            <p className='text-muted-foreground'>
              Gestiona los usuarios del sistema y sus roles.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando usuarios...</span>
            </div>
          ) : (
            <UsersTable data={users} search={search} navigate={navigate} />
          )}
        </div>
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
