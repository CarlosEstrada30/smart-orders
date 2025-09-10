# 🚀 Guía de Despliegue Manual en Render - SmartOrders

## 📋 Prerrequisitos

1. **Cuenta en Render**: Crea una cuenta gratuita en [render.com](https://render.com)
2. **Repositorio Git**: Tu código debe estar en GitHub, GitLab o Bitbucket
3. **Backend API**: Asegúrate de que tu API backend esté desplegada y funcionando

## 🛠️ Paso a Paso

### 1. **Preparación del Código** ✅ YA ESTÁ LISTO

Los siguientes archivos ya fueron configurados:
- ✅ `render.yaml` - Configuración de Blueprint
- ✅ `public/_redirects` - Redirects para SPA
- ✅ `package.json` - Scripts de build y serve actualizados
- ✅ `render-env-vars.md` - Variables de entorno necesarias

### 2. **Crear Web Service en Render**

1. **Inicia sesión** en [render.com](https://render.com)
2. **Clic en "New +"** → **"Web Service"**
3. **Conecta tu repositorio** (GitHub/GitLab/Bitbucket)
4. **Selecciona** el repositorio `smart-orders`

### 3. **Configuración del Servicio**

```yaml
Name: smartorders-frontend
Runtime: Node
Branch: main (o development)
Build Command: npm install --include=dev && npm run build
Start Command: npm start
```

### 4. **Variables de Entorno** 🔑

En la sección **Environment Variables**, agrega:

**Variables básicas:**
```
NODE_ENV=production
VITE_ENVIRONMENT=production
VITE_APP_NAME=SmartOrders
VITE_APP_VERSION=2.0.0
VITE_DEBUG=false
VITE_ENABLE_EXPERIMENTAL_FEATURES=false
VITE_ENABLE_ANALYTICS=true
```

**API Configuration (¡ACTUALIZA CON TU URL REAL!):**
```
VITE_API_BASE_URL=https://tu-backend-api.onrender.com/api/v1
VITE_API_TIMEOUT=15000
```

**Opcional - Si usas Clerk:**
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_tu_key_aqui
```

### 5. **Plan de Hosting**

- **Free Plan**: Para pruebas (se duerme después de 15 min de inactividad)
- **Starter Plan**: $7/mes para producción (siempre activo)

### 6. **Desplegar**

1. **Clic en "Create Web Service"**
2. **Render automáticamente:**
   - Clona tu repositorio
   - Instala dependencias con `npm ci`
   - Ejecuta el build con `npm run build`
   - Inicia la aplicación con `npm start`

### 7. **Verificar Despliegue**

1. **Espera** a que termine el build (5-10 minutos)
2. **Accede** a la URL proporcionada por Render
3. **Verifica** que la aplicación carga correctamente
4. **Prueba** el routing (navega entre páginas)

## 🔧 Comandos de Build

Los siguientes comandos se ejecutarán automáticamente:

```bash
# Instalación de dependencias
npm ci

# Compilación TypeScript + Build de Vite
npm run build

# Servir aplicación estática
npm start  # usa 'npx serve -s dist -l $PORT'
```

## 📁 Estructura de Deploy

```
dist/           # Archivos generados por Vite
├── assets/     # JS, CSS optimizados
├── index.html  # Punto de entrada
└── _redirects  # Redirects para SPA (copiado de public/)
```

## 🔍 Troubleshooting

### ❌ Build falla
```bash
# Verifica localmente:
npm run build
```

### ❌ Aplicación no carga
- Verifica variables de entorno `VITE_API_BASE_URL`
- Revisa logs en Dashboard de Render
- Confirma que el backend API esté funcionando

### ❌ Routing no funciona (404 en refresh)
- Verifica que `public/_redirects` existe
- Revisa configuración de SPA redirects

### ❌ API calls fallan
- Confirma CORS en tu backend
- Verifica URL de API en variables de entorno
- Revisa Network tab en DevTools

## 📧 Soporte

Si tienes problemas:
1. Revisa logs en Render Dashboard
2. Verifica variables de entorno
3. Confirma que el backend esté funcionando
4. Revisa la documentación de Render

---

**🎉 ¡Tu aplicación SmartOrders estará disponible en una URL como:**
`https://smartorders-frontend.onrender.com`
