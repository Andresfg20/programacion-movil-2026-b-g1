<!--
CONFIG
STUDENT:      Andrés Felipe Gómez Anacona
CODE:         9024125527
DATE:         19/10/2026
FRAMEWORK:    Ionic React 9 + React 19 (Vite 8)
LANGUAGE:     TypeScript (strict)
ENTITY:       Cultivos   (singular: Cultivo)
WORKSHOP_DIR: 11-week/workshop/
APP_DIR:      11-week/workshop/app/
TESTING:      Vitest 5 + React Testing Library (jsdom)
-->

# Semana 11 · UX/UI y patrones de interfaz avanzados — Cultivos

| | |
|---|---|
| **Estudiante** | Andrés Felipe Gómez Anacona |
| **Código** | 9024125527 |
| **Fecha** | 19/10/2026 |

Taller de la Semana 11 aplicado al módulo **Cultivos** de la app móvil (Ionic React + TypeScript).
Cubre los checkpoints **CP0 a CP5**: auditoría UX, design tokens, estados de pantalla, accesibilidad/responsive y pruebas.

## CONFIG

| Clave | Valor |
|---|---|
| Framework | Ionic React 9 + React 19 |
| Bundler | Vite 8 |
| Lenguaje | TypeScript (`strict: true`) |
| Entidad principal | Cultivos (`Cultivo`) |
| Carpeta del taller | `11-week/workshop/` |
| Carpeta de la app | `11-week/workshop/app/` |
| Pruebas | Vitest 5 + @testing-library/react (27 pruebas) |
| Viewports objetivo | 360 px (1 columna) y 768 px (2 columnas) |

## Estructura

```
11-week/workshop/
├── README.md
├── GIT-COMMANDS.md
├── docs/
│   ├── 01-ux-audit.md
│   ├── 02-design-tokens.md
│   ├── 03-states.md
│   ├── 04-a11y-responsive.md
│   └── Screenshots/
│       └── 03-states-tests.png
└── app/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── vitest.config.ts
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── setupTests.ts
        ├── theme/
        │   └── tokens.css
        ├── types/
        │   └── cultivo.ts
        ├── services/
        │   └── cultivosService.ts
        ├── hooks/
        │   ├── useCultivos.ts
        │   └── __tests__/
        │       └── useCultivos.test.tsx
        ├── pages/
        │   └── CultivosPage.tsx
        └── components/
            ├── CultivosList.tsx
            ├── CultivosList.css
            └── __tests__/
                └── States.test.tsx
```

## Setup

```bash
cd 11-week/workshop/app
npm install
npm run dev        # servidor de desarrollo
```

`main.tsx` importa los estilos en este orden (el orden importa): CSS base de Ionic → fuentes → `theme/tokens.css`, de modo que los tokens `--cv-*` sobrescriben las variables `--ion-*`.

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | `tsc` (strict) + build de producción |
| `npm run preview` | Sirve el build (usar para Lighthouse) |
| `npm run typecheck` | Solo verificación de tipos |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run test:watch` | Pruebas en modo observación |

## Probar los estados manualmente

- **Carga**: recargar la página; el skeleton dura ~1,2 s (`cultivosService.ts`).
- **Error**: con `npm run dev`, en la consola del navegador ejecutar `window.cultivosDebug.setSimulatedFailure(true)` y pulsar **Reintentar** (o desplazar para refrescar). Volver a `false` para recuperar.
- **Vacío**: devolver `[]` desde `fetchCultivos()`.
- **Pull-to-refresh**: emular un dispositivo táctil en DevTools y arrastrar la lista hacia abajo. Si falla con datos visibles, aparece un `IonToast` y la lista se conserva.

`window.cultivosDebug` solo existe en desarrollo (`import.meta.env.DEV`).

## Pruebas

| Archivo | Pruebas | Cubre |
|---|---|---|
| `src/components/__tests__/States.test.tsx` | 12 | Estados carga/datos/vacío/error, conmutación, pull-to-refresh |
| `src/hooks/__tests__/useCultivos.test.tsx` | 15 | Estados del hook, guardia `inFlight`, `refreshError`, desmontaje y StrictMode |

> `IonRefresher` se mockea en `States.test.tsx` porque, en jsdom, el wrapper de Ionic 9 no aplica `disabled` ni registra `onIonRefresh` de forma observable. Se valida el contrato propio del componente (deshabilitado al cargar y `complete()` siempre invocado).

## Checkpoints

| CP | Entregable | Archivos |
|---|---|---|
| CP0 | Setup y configuración | `README.md`, `app/package.json`, `app/tsconfig.json`, `app/vite.config.ts`, `app/vitest.config.ts`, `app/index.html`, `app/src/main.tsx`, `app/src/App.tsx`, `app/src/setupTests.ts` |
| CP1 | Auditoría UX | `docs/01-ux-audit.md` |
| CP2 | Design tokens y contraste | `docs/02-design-tokens.md`, `app/src/theme/tokens.css` |
| CP3 | Estados de pantalla + Pull-to-Refresh | `docs/03-states.md`, `app/src/components/CultivosList.*`, `app/src/hooks/useCultivos.ts`, `app/src/pages/`, `app/src/services/`, `app/src/types/` |
| CP4 | Accesibilidad y responsive | `docs/04-a11y-responsive.md` |
| CP5 | Pruebas y cierre | `app/src/**/__tests__/*.test.tsx`, `GIT-COMMANDS.md` |

## Documentación

1. [Auditoría UX](docs/01-ux-audit.md)
2. [Design tokens](docs/02-design-tokens.md)
3. [Estados de pantalla](docs/03-states.md)
4. [Accesibilidad y responsive](docs/04-a11y-responsive.md)