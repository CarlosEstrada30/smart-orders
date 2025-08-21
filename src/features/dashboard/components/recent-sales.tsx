import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export function RecentSales() {
  return (
    <div className='space-y-8'>
      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9'>
          <AvatarImage src='/avatars/01.png' alt='Avatar' />
          <AvatarFallback>MG</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>María González</p>
            <p className='text-muted-foreground text-sm'>
              PED-001
            </p>
          </div>
          <div className='flex flex-col items-end space-y-1'>
            <div className='font-medium'>Q66.73</div>
            <Badge variant="secondary" className="text-xs">Pendiente</Badge>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Avatar className='flex h-9 w-9 items-center justify-center space-y-0 border'>
          <AvatarImage src='/avatars/02.png' alt='Avatar' />
          <AvatarFallback>CR</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Carlos Rodríguez</p>
            <p className='text-muted-foreground text-sm'>
              PED-002
            </p>
          </div>
          <div className='flex flex-col items-end space-y-1'>
            <div className='font-medium'>Q89.95</div>
            <Badge variant="default" className="text-xs">En Proceso</Badge>
          </div>
        </div>
      </div>
      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9'>
          <AvatarImage src='/avatars/03.png' alt='Avatar' />
          <AvatarFallback>LM</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Luis Martínez</p>
            <p className='text-muted-foreground text-sm'>
              PED-003
            </p>
          </div>
          <div className='flex flex-col items-end space-y-1'>
            <div className='font-medium'>Q156.72</div>
            <Badge variant="outline" className="text-xs">Enviado</Badge>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9'>
          <AvatarImage src='/avatars/04.png' alt='Avatar' />
          <AvatarFallback>ES</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Elena Sánchez</p>
            <p className='text-muted-foreground text-sm'>PED-004</p>
          </div>
          <div className='flex flex-col items-end space-y-1'>
            <div className='font-medium'>Q234.88</div>
            <Badge variant="default" className="text-xs">Entregado</Badge>
          </div>
        </div>
      </div>

      <div className='flex items-center gap-4'>
        <Avatar className='h-9 w-9'>
          <AvatarImage src='/avatars/05.png' alt='Avatar' />
          <AvatarFallback>RE</AvatarFallback>
        </Avatar>
        <div className='flex flex-1 flex-wrap items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm leading-none font-medium'>Rest. El Bueno</p>
            <p className='text-muted-foreground text-sm'>
              PED-005
            </p>
          </div>
          <div className='flex flex-col items-end space-y-1'>
            <div className='font-medium'>Q98.45</div>
            <Badge variant="destructive" className="text-xs">Cancelado</Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
