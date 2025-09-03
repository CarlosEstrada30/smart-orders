# Módulo de Gestión de Empresas

## Descripción

Este módulo permite gestionar las empresas (tenants) del sistema multitenant. Incluye funcionalidades para crear, editar, listar y eliminar empresas, cada una con su propio subdominio y base de datos aislada.

## Restricciones de Acceso

El módulo tiene dos condiciones estrictas de acceso:

1. **Dominio Principal**: Solo está disponible cuando se accede sin subdominio (ej: `localhost:3000`, NO `bethel.localhost:3000`)
2. **Superusuario**: Solo usuarios con rol `admin` (superusuario) pueden acceder

## Estructura de Archivos

```
src/
├── features/companies/
│   ├── components/
│   │   ├── companies-columns.tsx       # Definición de columnas para la tabla
│   │   ├── companies-table.tsx         # Tabla principal de empresas
│   │   ├── company-form.tsx            # Formulario para crear/editar empresa
│   │   ├── data-table-*.tsx           # Componentes auxiliares de tabla
│   │   └── index.ts
│   ├── data/
│   │   ├── data.ts                    # Datos mock y configuración
│   │   ├── schema.ts                  # Schemas de validación Zod
│   │   └── index.ts
│   └── index.tsx                      # Página principal del módulo
├── services/companies/
│   ├── companies.service.ts           # Servicios API para empresas
│   ├── types.ts                       # Tipos TypeScript
│   └── index.ts
├── hooks/
│   └── use-companies-permissions.ts   # Hook para verificar permisos
├── components/auth/
│   └── companies-permission-guard.tsx # Guard de permisos
└── routes/_authenticated/companies/
    ├── route.tsx                      # Ruta base con validaciones
    └── index.tsx                      # Componente de ruta
```

## Funcionalidades

### ✅ Implementado
- [x] Lista de empresas con tabla paginada y filtros
- [x] Formulario para crear nuevas empresas
- [x] Validación de subdominios (formato y disponibilidad)
- [x] Sistema de permisos y guards de seguridad
- [x] Integración condicional en navegación
- [x] Interfaz responsiva y moderna
- [x] Conectado con API real de tenants
- [x] Nuevos campos del backend (`active`, `is_trial`)
- [x] Soft delete y restauración de empresas
- [x] Badge especial para empresas de prueba
- [x] Filtro para mostrar empresas inactivas
- [x] Acciones contextuales según estado de empresa
- [x] Estadísticas actualizadas con nuevos campos

### 🚧 Pendiente
- [ ] Formulario de edición completo (requiere ID de empresa)
- [ ] Funcionalidad de eliminación permanente con confirmación
- [ ] Logs de auditoría para cambios

## Cómo Usar

### 1. Acceder al Módulo

1. Asegúrate de estar en el dominio principal (sin subdominio)
2. Inicia sesión con una cuenta de superusuario (rol `admin`)
3. El módulo aparecerá en el sidebar bajo "Sistema > Empresas"

### 2. Crear Nueva Empresa

1. Click en "Nueva Empresa"
2. Completa los campos:
   - **Nombre**: Nombre completo de la empresa
   - **Subdominio**: Identificador único (solo letras, números y guiones)
   - **Empresa de Prueba**: Checkbox opcional para marcar como empresa trial
3. Click en "Crear Empresa"

El sistema automáticamente:
- Creará el registro de la empresa
- Generará un schema de base de datos aislado
- Creará un superusuario por defecto
- La empresa será accesible en `subdominio.dominio.com`
- Las empresas de prueba se mostrarán con badge especial "PRUEBA"

### 3. Gestionar Empresas

- **Ver**: Lista todas las empresas con información básica
- **Filtrar**: Por estado (activa/inactiva) usando los filtros de tabla
- **Mostrar inactivas**: Switch en el header para incluir empresas desactivadas
- **Buscar**: Por nombre de empresa
- **Acceder**: Click en el ícono de enlace externo para abrir la empresa (solo activas)
- **Desactivar**: Soft delete que marca la empresa como inactiva
- **Restaurar**: Reactivar empresas previamente desactivadas
- **Eliminar permanente**: Eliminación destructiva (cuidado)

## Seguridad

- **Guard de Permisos**: Verifica automáticamente las condiciones de acceso
- **Validación de Rutas**: Las rutas tienen validación a nivel de router
- **Normalización**: Los subdominios se normalizan automáticamente
- **Validación**: Esquemas Zod para validación robusta de formularios

## API Endpoints Utilizados

- `GET /api/v1/tenants/` - Obtener lista de empresas (con parámetro `show_inactive`)
- `POST /api/v1/tenants/` - Crear nueva empresa (acepta campo `is_trial`)
- `PUT /api/v1/tenants/{id}` - Actualizar empresa
- `DELETE /api/v1/tenants/{id}` - Desactivar empresa (soft delete)
- `POST /api/v1/tenants/{id}/restore` - Restaurar empresa inactiva
- `DELETE /api/v1/tenants/{id}/permanent` - Eliminar empresa permanentemente

## Mensajes de Error

### No Acceso por Subdominio
Si intentas acceder desde un subdominio, verás:
"El módulo de empresas solo está disponible en el dominio principal"

### Sin Permisos de Superusuario
Si no eres superusuario, verás:
"Se requieren permisos de superusuario (rol Admin)"

## Campos del Backend

### Nuevos Campos Integrados
- **`active: boolean`** - Estado del tenant (reemplaza soft delete)
- **`is_trial: boolean`** - Marca si es empresa de prueba

### Comportamiento Actualizado
- **DELETE soft delete** - No elimina datos, marca `active: false`
- **GET por defecto** - Solo muestra empresas activas
- **Filtro show_inactive** - Para incluir empresas desactivadas

## Próximos Pasos

1. **Implementar Edición**: Agregar funcionalidad completa de edición de empresas
2. **Confirmaciones**: Agregar diálogos de confirmación para eliminación permanente
3. **Logs de Auditoría**: Registrar todos los cambios realizados
4. **Validación Avanzada**: Verificar disponibilidad de subdominios en tiempo real
