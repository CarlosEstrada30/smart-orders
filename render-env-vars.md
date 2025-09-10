# Variables de Entorno para Render - SmartOrders

Configura estas variables de entorno en tu dashboard de Render:

## 🔧 Variables Obligatorias

```
NODE_ENV=production
VITE_ENVIRONMENT=production
VITE_APP_NAME=SmartOrders
VITE_APP_VERSION=2.0.0
VITE_DEBUG=false
```

## 🌐 Configuración de API

**¡MUY IMPORTANTE!** - Actualiza con la URL real de tu backend:

```
VITE_API_BASE_URL=https://tu-backend-api.onrender.com/api/v1
VITE_API_TIMEOUT=15000
```

## 🚀 Configuración de Funcionalidades

```
VITE_ENABLE_EXPERIMENTAL_FEATURES=false
VITE_ENABLE_ANALYTICS=true
```

## 🔐 Clerk (Opcional - solo si usas Clerk)

```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_tu_key_aqui
```

---

**Nota:** No incluyas estos valores directamente en tu código. Configúralos en el Dashboard de Render en la sección "Environment Variables" de tu servicio.
