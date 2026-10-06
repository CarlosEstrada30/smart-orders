import { BrandMark } from '@/assets/brand-mark'
import { extractSubdomain } from '@/utils/subdomain'

type AuthLayoutProps = {
  children: React.ReactNode
}

// Las paradas de un pedido, de la toma a la entrega
const ROUTE_STOPS = [
  { label: 'Pedido tomado', detail: 'Registro rápido de pedidos' },
  {
    label: 'Asignado a ruta',
    detail: 'Cada pedido va a la ruta que le corresponde',
  },
  {
    label: 'Consolidado por ruta',
    detail: 'Un resumen de qué cargar en cada camión',
  },
  { label: 'Comprobante enviado', detail: 'El cliente lo recibe por WhatsApp' },
  {
    label: 'Entregado',
    detail: 'Se entrega el pedido y se gestionan los cobros',
  },
]

export function AuthLayout({ children }: AuthLayoutProps) {
  const subdomain = extractSubdomain()

  return (
    <div className='bg-background grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]'>
      <aside className='bg-sidebar text-sidebar-foreground relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14'>
        <div className='flex items-center gap-2.5'>
          <span className='bg-sidebar-primary text-sidebar-primary-foreground flex size-9 items-center justify-center rounded-lg'>
            <BrandMark className='size-5' />
          </span>
          <span className='font-display text-lg font-semibold text-white'>
            SmartOrders
          </span>
        </div>

        <div className='max-w-md'>
          <h2 className='font-display text-[2.5rem] leading-[1.1] font-semibold text-white'>
            Tus pedidos, organizados por ruta.
          </h2>
          <ol className='mt-10 space-y-0'>
            {ROUTE_STOPS.map((stop, i) => (
              <li
                key={stop.label}
                className='relative flex gap-4 pb-6 last:pb-0'
              >
                {i < ROUTE_STOPS.length - 1 && (
                  <span
                    aria-hidden='true'
                    className='bg-sidebar-border absolute top-5 left-[9px] h-full w-0.5'
                  />
                )}
                <span
                  aria-hidden='true'
                  className={
                    i === ROUTE_STOPS.length - 1
                      ? 'bg-sidebar-primary relative mt-0.5 size-5 shrink-0 rounded-full'
                      : 'border-sidebar-primary bg-sidebar relative mt-0.5 size-5 shrink-0 rounded-full border-2'
                  }
                />
                <div>
                  <p className='font-medium text-white'>{stop.label}</p>
                  <p className='text-sidebar-foreground/75 text-sm'>
                    {stop.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <p className='text-sidebar-foreground/60 text-sm'>
          Hecho para distribuidoras en Guatemala
        </p>
      </aside>

      <main className='flex flex-col px-4 py-10 sm:px-8'>
        <div className='flex items-center gap-2 lg:hidden'>
          <span className='bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg'>
            <BrandMark className='size-5' />
          </span>
          <span className='font-display font-semibold'>SmartOrders</span>
        </div>
        <div className='mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10'>
          {children}
        </div>
        {subdomain && (
          <p className='text-muted-foreground text-center text-sm'>
            Estás ingresando a{' '}
            <span className='text-foreground font-medium'>{subdomain}</span>
          </p>
        )}
      </main>
    </div>
  )
}
