# Flujo Git por checkpoint — `11-week/workshop/`

Estrategia: una rama por checkpoint desde `main`, commits convencionales, integración con `--no-ff` y una etiqueta por checkpoint.
Ejecutar desde la **raíz del repositorio**. La app vive en `11-week/workshop/app/` y la documentación en `11-week/workshop/docs/`.

## Preparación (una sola vez)

```bash
git checkout main
git pull origin main
git status                      # debe estar limpio
```

## CP0 · Setup y configuración

```bash
git checkout -b feat/week11-cp0-setup

git add 11-week/workshop/README.md
git commit -m "docs(week11): README con identidad, bloque CONFIG y estructura del taller"

git add 11-week/workshop/app/package.json 11-week/workshop/app/package-lock.json \
        11-week/workshop/app/tsconfig.json 11-week/workshop/app/vite.config.ts \
        11-week/workshop/app/vitest.config.ts 11-week/workshop/app/index.html \
        11-week/workshop/app/src/setupTests.ts
git commit -m "chore(week11): configura Vite, TypeScript strict y entorno de Vitest"

git add 11-week/workshop/app/src/main.tsx 11-week/workshop/app/src/App.tsx
git commit -m "chore(week11): punto de entrada de la app con Ionic y tokens"

git checkout main
git merge --no-ff feat/week11-cp0-setup -m "merge: CP0 setup del taller semana 11"
git tag -a week11-cp0 -m "CP0: setup completado"
git push origin main --tags
git branch -d feat/week11-cp0-setup
```

## CP1 · Auditoría UX

```bash
git checkout -b docs/week11-cp1-ux-audit

git add 11-week/workshop/docs/01-ux-audit.md
git commit -m "docs(ux): auditoría heurística de Nielsen (8 hallazgos) y diagrama de flujo Mermaid"

git checkout main
git merge --no-ff docs/week11-cp1-ux-audit -m "merge: CP1 auditoría UX"
git tag -a week11-cp1 -m "CP1: auditoría UX"
git push origin main --tags
git branch -d docs/week11-cp1-ux-audit
```

## CP2 · Design tokens

```bash
git checkout -b feat/week11-cp2-design-tokens

git add 11-week/workshop/app/src/theme/tokens.css
git commit -m "feat(theme): design tokens de color, tipografía y espaciado (claro/oscuro)"

git add 11-week/workshop/docs/02-design-tokens.md
git commit -m "docs(theme): documenta tokens y matriz de contraste WCAG AA"

git checkout main
git merge --no-ff feat/week11-cp2-design-tokens -m "merge: CP2 design tokens"
git tag -a week11-cp2 -m "CP2: design tokens"
git push origin main --tags
git branch -d feat/week11-cp2-design-tokens
```

## CP3 · Estados de pantalla y Pull-to-Refresh

```bash
git checkout -b feat/week11-cp3-screen-states

git add 11-week/workshop/app/src/types/cultivo.ts 11-week/workshop/app/src/services/cultivosService.ts
git commit -m "feat(cultivos): tipos y servicio simulado con fallo configurable solo en desarrollo"

git add 11-week/workshop/app/src/hooks/useCultivos.ts
git commit -m "feat(cultivos): hook useCultivos con guardia inFlight, refreshError y guardia de desmontaje"

git add 11-week/workshop/app/src/components/CultivosList.tsx 11-week/workshop/app/src/components/CultivosList.css
git commit -m "feat(ui): CultivosList con estados carga/datos/vacío/error y IonRefresher"

git add 11-week/workshop/app/src/pages/CultivosPage.tsx
git commit -m "feat(ui): página Mis cultivos con h1 semántico y toast para refresco fallido"

git add 11-week/workshop/docs/03-states.md
git commit -m "docs(states): máquina de estados, microcopy y cobertura de pruebas"

git checkout main
git merge --no-ff feat/week11-cp3-screen-states -m "merge: CP3 estados de pantalla y pull-to-refresh"
git tag -a week11-cp3 -m "CP3: estados de pantalla"
git push origin main --tags
git branch -d feat/week11-cp3-screen-states
```

## CP4 · Accesibilidad y responsive

```bash
git checkout -b feat/week11-cp4-a11y-responsive

# Ajustes de foco (::part(native)), metas táctiles y grid responsive
git add 11-week/workshop/app/src/components/CultivosList.css 11-week/workshop/app/src/theme/tokens.css
git diff --cached --quiet || git commit -m "fix(a11y): foco visible con ::part(native), metas de 44px y grid 360/768"

git add 11-week/workshop/docs/04-a11y-responsive.md
git commit -m "docs(a11y): reporte de accesibilidad, responsive y plantilla Lighthouse"

git checkout main
git merge --no-ff feat/week11-cp4-a11y-responsive -m "merge: CP4 accesibilidad y responsive"
git tag -a week11-cp4 -m "CP4: accesibilidad y responsive"
git push origin main --tags
git branch -d feat/week11-cp4-a11y-responsive
```

## CP5 · Pruebas y cierre

```bash
git checkout -b test/week11-cp5-unit-tests

cd 11-week/workshop/app
npm run typecheck                 # sin errores de tipos
npm test                          # 27/27 en verde
npm run build                     # el build debe terminar sin errores de CSS
cd ../../..

git add 11-week/workshop/app/src/components/__tests__/States.test.tsx
git commit -m "test(states): carga, datos, vacío, error, conmutación y pull-to-refresh"

git add 11-week/workshop/app/src/hooks/__tests__/useCultivos.test.tsx
git commit -m "test(hook): useCultivos con renderHook (inFlight, refreshError, desmontaje, StrictMode)"

git add 11-week/workshop/GIT-COMMANDS.md 11-week/workshop/docs/
git commit -m "docs(week11): resultados Lighthouse, capturas y guía de flujo Git"

git push -u origin test/week11-cp5-unit-tests
gh pr create --base main --title "Semana 11: UX/UI y patrones avanzados (CP0–CP5)" \
  --body "Auditoría UX, tokens, estados de pantalla, a11y/responsive y pruebas Vitest (27)."

# Tras la revisión:
git checkout main
git merge --no-ff test/week11-cp5-unit-tests -m "merge: CP5 pruebas y cierre de semana 11"
git tag -a week11-cp5 -m "CP5: entrega final semana 11"
git push origin main --tags
git branch -d test/week11-cp5-unit-tests
```

## Correcciones posteriores a la auditoría (si ya hiciste CP0–CP5)

Si los checkpoints ya están integrados, no reescribas el historial: añade los arreglos en una rama nueva.

```bash
git checkout -b fix/week11-audit-fixes

git add 11-week/workshop/app/src/components/CultivosList.css
git commit -m "fix(css): reemplaza CultivosList.css (contenía TSX) por estilos reales con tokens --cv-*"

git add 11-week/workshop/README.md
git commit -m "docs(readme): identidad del estudiante, Ionic 9 + React 19 y árbol de archivos real"

git add 11-week/workshop/GIT-COMMANDS.md
git commit -m "docs(git): corrige rutas a 11-week/workshop/app/src/"

git add 11-week/workshop/app/src/hooks/useCultivos.ts
git commit -m "fix(hook): guardia isMounted para evitar actualizar estado tras desmontar"

git add 11-week/workshop/app/src/hooks/__tests__/useCultivos.test.tsx
git commit -m "test(hook): suite de useCultivos con renderHook y act (15 pruebas)"

git add 11-week/workshop/app/src/pages/CultivosPage.tsx 11-week/workshop/app/src/theme/tokens.css 11-week/workshop/app/src/services/cultivosService.ts
git commit -m "fix(a11y): h1 semántico, foco con ::part(native) y debug de errores solo en DEV"

git add 11-week/workshop/app/package.json 11-week/workshop/app/package-lock.json \
        11-week/workshop/app/tsconfig.json 11-week/workshop/app/vite.config.ts \
        11-week/workshop/app/index.html 11-week/workshop/app/src/main.tsx 11-week/workshop/app/src/App.tsx
git commit -m "chore(app): scripts dev/build, tsconfig strict y punto de entrada ejecutable"

git checkout main
git merge --no-ff fix/week11-audit-fixes -m "merge: correcciones de la auditoría semana 11"
git tag -a week11-audit-fixes -m "Correcciones post-auditoría"
git push origin main --tags
git branch -d fix/week11-audit-fixes
```

## Verificación final

```bash
git log --oneline --graph --decorate -n 30
git tag -l "week11-*"
```