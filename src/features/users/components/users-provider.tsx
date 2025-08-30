import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type User } from '@/services/users'

type UsersDialogType = 'invite' | 'add' | 'edit' | 'delete'

type UsersContextType = {
  open: UsersDialogType | null
  setOpen: (str: UsersDialogType | null) => void
  currentRow: User | null
  setCurrentRow: React.Dispatch<React.SetStateAction<User | null>>
  onUserCreated?: () => void
  onUserUpdated?: () => void
  onUserDeleted?: () => void
}

const UsersContext = React.createContext<UsersContextType | null>(null)

interface UsersProviderProps {
  children: React.ReactNode
  onUserCreated?: () => void
  onUserUpdated?: () => void
  onUserDeleted?: () => void
}

export function UsersProvider({ children, onUserCreated, onUserUpdated, onUserDeleted }: UsersProviderProps) {
  const [open, setOpen] = useDialogState<UsersDialogType>(null)
  const [currentRow, setCurrentRow] = useState<User | null>(null)

  return (
    <UsersContext value={{ 
      open, 
      setOpen, 
      currentRow, 
      setCurrentRow, 
      onUserCreated, 
      onUserUpdated, 
      onUserDeleted 
    }}>
      {children}
    </UsersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUsers = () => {
  const usersContext = React.useContext(UsersContext)

  if (!usersContext) {
    throw new Error('useUsers has to be used within <UsersContext>')
  }

  return usersContext
}
