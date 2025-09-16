import { RoutesCreateDialog } from './routes-create-dialog'
import { RoutesEditDialog } from './routes-edit-dialog'
import { RoutesDeleteDialog } from './routes-delete-dialog'
import { RoutesReactivateDialog } from './routes-reactivate-dialog'
import { useEffect, useRef } from 'react'
import { useRoutes } from './routes-provider'

interface RoutesDialogsProps {
  onDataChange: () => void
}

export function RoutesDialogs({ onDataChange }: RoutesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useRoutes()
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const handleClose = (dialogType: string) => {
    setOpen(null)
    
    // Limpiar timeout anterior si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Programar limpieza con cleanup
    timeoutRef.current = setTimeout(() => {
      setCurrentRow(null)
      timeoutRef.current = null
    }, 500)
  }
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      <RoutesCreateDialog
        open={open === 'create'}
        onOpenChange={(isOpen) => {
          if (!isOpen) setOpen(null)
        }}
        onRouteCreated={onDataChange}
      />

      {currentRow && (
        <>
          <RoutesEditDialog
            key={`route-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => {
              if (!isOpen) handleClose('edit')
            }}
            route={currentRow}
            onRouteUpdated={onDataChange}
          />

          <RoutesDeleteDialog
            key={`route-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(isOpen) => {
              if (!isOpen) handleClose('delete')
            }}
            route={currentRow}
            onRouteDeleted={onDataChange}
          />

          <RoutesReactivateDialog
            key={`route-reactivate-${currentRow.id}`}
            open={open === 'reactivate'}
            onOpenChange={(isOpen) => {
              if (!isOpen) handleClose('reactivate')
            }}
            route={currentRow}
            onRouteReactivated={onDataChange}
          />
        </>
      )}
    </>
  )
}
