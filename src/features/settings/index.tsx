import { Main } from '@/components/layout/main'
import { PageHeader } from '@/components/page-header'
import { CompanySettingsForm } from './components/company-settings-form'

export function Settings() {
  return (
    <Main className='overflow-y-auto'>
      <PageHeader
        title='Mi empresa'
        description='Nombre, NIT, logo y datos de contacto que aparecen en recibos y facturas.'
      />
      <div className='max-w-4xl pb-8'>
        <CompanySettingsForm />
      </div>
    </Main>
  )
}
