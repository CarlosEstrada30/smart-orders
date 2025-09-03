import { Building2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/components/layout/main'
import { CompanySettingsForm } from './components/company-settings-form'

export function Settings() {
  return (
    <Main className="overflow-y-auto">
      <div className='space-y-0.5'>
        <div className='flex items-center gap-2'>
          <Building2 className='h-8 w-8 text-primary' />
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Configuración de Empresa
          </h1>
        </div>
        <p className='text-muted-foreground'>
          Administra la información general de tu empresa, incluyendo nombre, NIT, logo y datos de contacto.
        </p>
      </div>
      <Separator className='my-4 lg:my-6' />
      <div className='max-w-4xl pb-8'>
        <CompanySettingsForm />
      </div>
    </Main>
  )
}
