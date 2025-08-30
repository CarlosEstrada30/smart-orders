# 🔧 Configuración de Variables de Entorno - SmartOrders

## ✅ Estado de la Implementación

**COMPLETADO** - Sistema de variables de entorno totalmente configurado y funcional.

---

## 🎯 Lo que se ha logrado

### ✅ Eliminado Hardcoding Crítico
- ❌ ~~`BASE_URL: 'http://localhost:8000/api/v1'`~~ (hardcoded)
- ✅ `BASE_URL: ENV.API_BASE_URL` (configurable)

### ✅ Sistema Centralizado Creado
- `src/config/environment.ts` - Configuración principal
- `src/config/api-config.ts` - Configuración específica de API
- `env.example` - Template de variables de entorno

### ✅ Archivos Actualizados
- `src/services/api/config.ts` - Usa nuevo sistema (retrocompatible)
- `src/routes/_authenticated/clients/edit-client/$clientId/edit-client-page.tsx` - USA apiClient
- `src/routes/_authenticated/clients/new-client/new-client-page.tsx` - USA apiClient

### ✅ Funcionalidades Añadidas
- ✅ Validación automática de configuración
- ✅ Configuración específica por entorno
- ✅ Sistema de logging configurable
- ✅ Utilidades de testing y debug

---

## 🚀 Instrucciones de Uso

### 1. Crear Archivo de Entorno Local

```bash
# Copiar template y crear archivo .env
cp env.example .env
```

### 2. Configurar Variables para Desarrollo

Editar `.env` con tus valores:

```env
# Configuración para desarrollo local
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_ENVIRONMENT=development
VITE_DEBUG=true
VITE_APP_NAME=SmartOrders Dev
VITE_APP_VERSION=1.0.0-dev
```

### 3. Para Diferentes Entornos

#### Staging:
```env
VITE_API_BASE_URL=https://api-staging.smartorders.com/api/v1
VITE_ENVIRONMENT=staging
VITE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

#### Producción:
```env
VITE_API_BASE_URL=https://api.smartorders.com/api/v1
VITE_ENVIRONMENT=production
VITE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### 4. Verificar Configuración

```typescript
// En cualquier archivo TypeScript
import { testConfiguration } from '@/utils/config-test'

// Ejecutar en consola del navegador
testConfiguration()
```

---

## 📁 Archivos Creados

```
SmartOrders/
├── env.example                           # Template de variables
├── src/
│   ├── config/
│   │   ├── environment.ts                # ✨ Sistema centralizado
│   │   └── api-config.ts                 # ✨ Configuración API
│   └── utils/
│       └── config-test.ts                # ✨ Utilidades de testing
```

---

## 🔍 Variables de Entorno Disponibles

| Variable | Descripción | Requerida | Default |
|----------|-------------|-----------|---------|
| `VITE_API_BASE_URL` | URL base de la API backend | ✅ | `http://localhost:8000/api/v1` |
| `VITE_ENVIRONMENT` | Entorno actual | ❌ | `development` |
| `VITE_DEBUG` | Habilitar logs de debug | ❌ | `true` |
| `VITE_APP_NAME` | Nombre de la aplicación | ❌ | `SmartOrders` |
| `VITE_APP_VERSION` | Versión de la app | ❌ | `1.0.0` |
| `VITE_API_TIMEOUT` | Timeout HTTP en ms | ❌ | `10000` |
| `VITE_ENABLE_ANALYTICS` | Habilitar analytics | ❌ | `false` |

---

## 🧪 Testing de Configuración

### Método 1: Consola del Navegador
```javascript
// Verificar configuración actual
console.log(window.ENV)

// Ejecutar tests completos
import('@/utils/config-test').then(test => test.testConfiguration())
```

### Método 2: Código TypeScript
```typescript
import { ENV, validateConfig } from '@/config/environment'
import { API_CONFIG } from '@/config/api-config'

// Verificar configuración
const validation = validateConfig()
console.log('Config valid:', validation.isValid)
console.log('API URL:', API_CONFIG.BASE_URL)
```

---

## ⚠️ Notas Importantes

### Seguridad:
- ✅ El archivo `.env` está en `.gitignore` - NO se commitea
- ✅ Solo variables con prefijo `VITE_` son accesibles en el frontend
- ⚠️ **NUNCA** pongas secretos o keys sensibles en variables `VITE_`

### Compatibilidad:
- ✅ Los archivos existentes siguen funcionando (retrocompatible)
- ✅ El `apiClient` usa automáticamente la nueva configuración
- ✅ Los fetch directos fueron actualizados para usar `apiClient`

### Performance:
- ✅ Validación automática solo en desarrollo
- ✅ Logging condicional según entorno
- ✅ Sin overhead en producción

---

## 🐛 Solución de Problemas

### Error: "API_CONFIG is undefined"
```bash
# Verificar que existe el archivo .env
ls -la .env

# Si no existe, crearlo:
cp env.example .env
```

### Error: "Configuration validation failed"
```typescript
// En consola del navegador:
import('@/config/environment').then(env => {
  const validation = env.validateConfig()
  console.log(validation.errors)
})
```

### Error: "Module not found @/config"
```bash
# Verificar que el alias @ está configurado en vite.config.ts
# Debería tener:
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

---

## 🎉 Resultado

✅ **Sistema de configuración robusto y escalable**  
✅ **Compatible con desarrollo, staging y producción**  
✅ **No más URLs hardcodeadas**  
✅ **Deploy-ready para cualquier entorno**

**El proyecto ahora puede ejecutarse en cualquier entorno simplemente cambiando las variables de entorno.**

---

*Documentación actualizada: $(date)*  
*Parte del roadmap SmartOrders - Fase 0, Paso 1*
