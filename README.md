# PeruRail Booking — React + Vite

Landing de compra de boletos de tren, migrada a React 18 + Vite.

## Stack elegido y por qué es ultra rápido

| Qué | Por qué |
|-----|---------|
| **Vite** | Build en <10s, HMR instantáneo en dev |
| **React 18** | Solo ~45kb gzip. Sin Next.js = menos overhead |
| **CSS puro** | Cero Tailwind, cero Bootstrap = 0 CSS sin usar |
| **SVGs inline** | Logos, banderas e íconos sin requests externos |
| **Brotli + Gzip** | Compresión automática en el build |
| **Cache immutable** | Assets con hash → cache 1 año en browser |
| **Critical CSS inline** | Header/body crítico en `<style>` → sin FOUC |
| **Hotjar/Clarity lazy** | Se cargan en `load` event → no bloquean LCP |

---

## Paso a paso: desde cero hasta Vercel en producción

### 1. Instalar dependencias localmente

```bash
npm install
```

### 2. Probar en local

```bash
npm run dev
# Abre http://localhost:5173
```

### 3. Crear repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre: `perurail-booking` (o el que quieras)
3. Visibility: **Public** (para Vercel gratis) o Private
4. **No** marques "Add a README" (ya tenemos uno)
5. Click **Create repository**

### 4. Subir el código a GitHub

Abre terminal en la carpeta del proyecto:

```bash
git init
git add .
git commit -m "feat: migración a React + Vite"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/perurail-booking.git
git push -u origin main
```

Reemplaza `TU_USUARIO` con tu usuario de GitHub.

### 5. Conectar con Vercel

1. Ve a https://vercel.com → **Add New Project**
2. Click **Import Git Repository** → selecciona `perurail-booking`
3. En **Framework Preset** elige **Vite**
4. En **Build Command**: `npm run build`
5. En **Output Directory**: `dist`
6. Click **Deploy**

Vercel detecta automáticamente el `vercel.json` con los headers de cache.

### 6. Configurar dominio propio (opcional)

En el dashboard de Vercel → Settings → Domains → agrega tu dominio.

---

## Variables de entorno (reemplazar antes de deploy)

En `index.html` reemplaza:
- `GTM-XXXXXXX` → tu ID real de Google Tag Manager
- `YOUR_HOTJAR_ID` → tu ID de Hotjar (número)
- `YOUR_CLARITY_ID` → tu ID de Microsoft Clarity (string)

---

## Por qué va a tener 90-100 en PageSpeed

| Métrica | Técnica aplicada |
|---------|-----------------|
| **LCP** | Logo con `fetchpriority="high"` + `preload`. Mapa con `loading="lazy"` |
| **FID / INP** | JS mínimo, sin bloqueo, sin librerías pesadas |
| **CLS** | Todos los `<img>` tienen `width` y `height` explícitos |
| **FCP** | CSS crítico inline en `<style>` del `<head>` |
| **TTFB** | Vercel Edge Network (CDN global) |
| **JS bundle** | ~45kb React + ~15kb app = ~60kb gzip total |
| **Third-party** | GTM/Hotjar/Clarity cargados en `load` event, no bloquean |

---

## Estructura del proyecto

```
perurail/
├── index.html              # Entry point con CSS crítico inline
├── vite.config.js          # Build + Brotli/Gzip + tree-shaking
├── vercel.json             # Cache headers + security headers
├── src/
│   ├── main.jsx            # Bootstrap React
│   ├── App.jsx             # Componente raíz + lógica
│   ├── index.css           # Estilos completos
│   ├── data/
│   │   └── translations.jsx  # i18n ES/EN/PT + SVG flags
│   └── components/
│       ├── Autocomplete.jsx  # Combobox accesible (keyboard nav)
│       ├── LangSelector.jsx  # Dropdown de idiomas
│       ├── Icons.jsx         # SVGs inline centralizados
│       └── PaymentLogos.jsx  # Logos pago SVG inline
```
