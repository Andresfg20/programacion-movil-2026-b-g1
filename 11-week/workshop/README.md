<!--
CONFIG
FRAMEWORK:    Ionic React 8 (Vite)
LANGUAGE:     TypeScript
ENTITY:       Cultivos   (singular: Cultivo)
WORKSHOP_DIR: 11-week/workshop/
TESTING:      Vitest + React Testing Library (jsdom)
-->

# Semana 11 · UX/UI y patrones de interfaz avanzados — Cultivos

Taller de la Semana 11 aplicado al módulo **Cultivos** de la app móvil (Ionic React + TypeScript).
Cubre los checkpoints **CP0 a CP5**: auditoría UX, design tokens, estados de pantalla, accesibilidad/responsive y pruebas.

## CONFIG

| Clave | Valor |
|---|---|
| Framework | Ionic React 8 + Vite |
| Lenguaje | TypeScript (strict) |
| Entidad principal | Cultivos (`Cultivo`) |
| Carpeta del taller | `11-week/workshop/` |
| Pruebas | Vitest + @testing-library/react |
| Viewports objetivo | 360 px (móvil) y 768 px (tablet) |

> Para cambiar de entidad: renombrar `Cultivo*` en `src/` y ajustar los textos de `CultivosList.tsx`.

## Estructura

```
11-week/workshop/
├── README.md
├── GIT-COMMANDS.md
├── vitest.config.ts
├── docs/
│   ├── 01-ux-audit.md
│   ├── 02-design-tokens.md
│   ├── 03-states.md
│   └── 04-a11y-responsive.md
└── src/
    ├── setupTests.ts
    ├── theme/tokens.css
    ├── types/cultivo.ts
    ├── services/cultivosService.ts
    ├── hooks/useCultivos.ts
    ├── pages/CultivosPage.tsx
    └── components/
        ├── CultivosList.tsx
        ├── CultivosList.css
        └── __tests__/States.test.tsx
```

## Setup

```bash
# 1. Crear la app (si aún no existe) dentro de 11-week/workshop/
npm i -g @ionic/cli
ionic start workshop blank --type=react --capacitor
cd workshop   # o mover el contenido a 11-week/workshop/

# 2. Dependencias de pruebas y tipografía
npm i -D vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/dom
npm i @fontsource-variable/bricolage-grotesque @fontsource-variable/source-sans-3

# 3. Copiar los archivos de este taller sobre el proyecto
```

En `src/main.tsx` importar tokens y fuentes **después** de los CSS de Ionic:

```tsx
import '@ionic/react/css/core.css';
/* ...resto de CSS de Ionic... */
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/source-sans-3';
import './theme/tokens.css';
```

En `src/App.tsx`, registrar la ruta:

```tsx
import CultivosPage from './pages/CultivosPage';
// ...
<Route exact path="/cultivos"><CultivosPage /></Route>
<Route exact path="/"><Redirect to="/cultivos" /></Route>
```

Si TypeScript no reconoce `import './X.css'`, asegurar que existe `src/vite-env.d.ts` con `/// <reference types="vite/client" />` (la plantilla de Ionic ya lo incluye).

## Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run build && npm run preview` | Build para auditar con Lighthouse |

## Probar los estados manualmente

- **Carga**: recargar la página; el skeleton dura ~1,2 s (`cultivosService.ts`).
- **Error**: en consola del navegador o en el servicio, llamar `setSimulatedFailure(true)` y pulsar **Reintentar**.
- **Vacío**: devolver `[]` desde `fetchCultivos()`.
- **Pull-to-refresh**: emular un dispositivo táctil en DevTools y arrastrar la lista hacia abajo.

## Checkpoints

| CP | Entregable | Archivos |
|---|---|---|
| CP0 | Setup y configuración | `README.md`, `vitest.config.ts`, `src/setupTests.ts` |
| CP1 | Auditoría UX | `docs/01-ux-audit.md` |
| CP2 | Design tokens y contraste | `docs/02-design-tokens.md`, `src/theme/tokens.css` |
| CP3 | Estados de pantalla + Pull-to-Refresh | `docs/03-states.md`, `src/components/CultivosList.*`, `src/hooks`, `src/pages`, `src/services`, `src/types` |
| CP4 | Accesibilidad y responsive | `docs/04-a11y-responsive.md` |
| CP5 | Pruebas y cierre | `src/components/__tests__/States.test.tsx`, `GIT-COMMANDS.md` |

## Documentación

1. [Auditoría UX](docs/01-ux-audit.md)
2. [Design tokens](docs/02-design-tokens.md)
3. [Estados de pantalla](docs/03-states.md)
4. [Accesibilidad y responsive](docs/04-a11y-responsive.md)
