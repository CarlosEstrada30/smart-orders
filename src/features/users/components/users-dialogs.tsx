import { UsersCreateDialog } from './users-create-dialog'
import { UsersEditDialog } from './users-edit-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UsersInviteDialog } from './users-invite-dialog'
import { useUsers } from './users-provider'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, onUserCreated, onUserUpdated, onUserDeleted } = useUsers()
  return (
    <>
      <UsersCreateDialog
        key='user-add'
        open={open === 'add'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'add' : null)}
        onUserCreated={() => {
          onUserCreated?.()
          setOpen(null)
        }}
      />

      <UsersInviteDialog
        key='user-invite'
        open={open === 'invite'}
        onOpenChange={() => setOpen('invite')}
      />

      {currentRow && (
        <>
          <UsersEditDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'edit' : null)
              if (!isOpen) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            user={currentRow}
            onUserUpdated={() => {
              onUserUpdated?.()
              setOpen(null)
              setCurrentRow(null)
            }}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            user={currentRow}
            onUserDeleted={() => {
              onUserDeleted?.()
              setOpen(null)
              setCurrentRow(null)
            }}
          />
        </>
      )}
    </>
  )
}
