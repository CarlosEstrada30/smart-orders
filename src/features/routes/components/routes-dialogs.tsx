import { RoutesCreateDialog } from './routes-create-dialog'
import { RoutesEditDialog } from './routes-edit-dialog'
import { RoutesDeleteDialog } from './routes-delete-dialog'
import { RoutesReactivateDialog } from './routes-reactivate-dialog'
import { useRoutes } from './routes-provider'

interface RoutesDialogsProps {
  onDataChange: () => void
}

export function RoutesDialogs({ onDataChange }: RoutesDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useRoutes()
  
  const handleClose = (dialogType: string) => {
    setOpen(null)
    setTimeout(() => {
      setCurrentRow(null)
    }, 500)
  }

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
