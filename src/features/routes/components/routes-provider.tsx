import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Route } from '../data/schema'

type RoutesDialogType = 'create' | 'edit' | 'delete' | 'reactivate'

type RoutesContextType = {
  open: RoutesDialogType | null
  setOpen: (str: RoutesDialogType | null) => void
  currentRow: Route | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Route | null>>
}

const RoutesContext = React.createContext<RoutesContextType | null>(null)

export function RoutesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<RoutesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Route | null>(null)

  return (
    <RoutesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RoutesContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRoutes = () => {
  const routesContext = React.useContext(RoutesContext)

  if (!routesContext) {
    throw new Error('useRoutes has to be used within <RoutesProvider>')
  }

  return routesContext
}
