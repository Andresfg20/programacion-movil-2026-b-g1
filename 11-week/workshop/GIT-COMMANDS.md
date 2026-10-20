# Flujo Git por checkpoint — `11-week/workshop/`

Estrategia: una rama por checkpoint desde `main`, commits convencionales, integración con `--no-ff` y una etiqueta por checkpoint.
Ejecutar desde la raíz del repositorio.

## Preparación (una sola vez)

```bash
git checkout main
git pull origin main
git status                      # debe estar limpio
```

## CP0 · Setup y configuración

```bash
git checkout -b feat/week11-cp0-setup
mkdir -p 11-week/workshop/docs 11-week/workshop/src/{theme,types,services,hooks,pages,components/__tests__}

git add 11-week/workshop/README.md 11-week/workshop/vitest.config.ts 11-week/workshop/src/setupTests.ts
git commit -m "chore(week11): configura taller, README con bloque CONFIG y entorno de Vitest"

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

git add 11-week/workshop/src/theme/tokens.css
git commit -m "feat(theme): agrega design tokens de color, tipografía y espaciado (claro/oscuro)"

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

git add 11-week/workshop/src/types/cultivo.ts 11-week/workshop/src/services/cultivosService.ts
git commit -m "feat(cultivos): agrega tipos y servicio simulado con fallo configurable"

git add 11-week/workshop/src/hooks/useCultivos.ts
git commit -m "feat(cultivos): hook useCultivos con guardia de peticiones y error de refresco"

git add 11-week/workshop/src/components/CultivosList.tsx 11-week/workshop/src/components/CultivosList.css
git commit -m "feat(ui): CultivosList con estados carga/datos/vacío/error y IonRefresher"

git add 11-week/workshop/src/pages/CultivosPage.tsx
git commit -m "feat(ui): página Mis cultivos con toast para refresco fallido"

git add 11-week/workshop/docs/03-states.md
git commit -m "docs(states): documenta máquina de estados, microcopy y cobertura"

git checkout main
git merge --no-ff feat/week11-cp3-screen-states -m "merge: CP3 estados de pantalla y pull-to-refresh"
git tag -a week11-cp3 -m "CP3: estados de pantalla"
git push origin main --tags
git branch -d feat/week11-cp3-screen-states
```

## CP4 · Accesibilidad y responsive

```bash
git checkout -b feat/week11-cp4-a11y-responsive

# Si el ajuste de a11y/responsive modificó estilos o componentes, inclúyelos también:
git add 11-week/workshop/src/components/CultivosList.css 11-week/workshop/src/components/CultivosList.tsx
git diff --cached --quiet || git commit -m "fix(a11y): metas táctiles de 44px, ARIA y grid responsive 360/768"

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

npm test                                   # debe pasar 11/11 antes de commitear
npx tsc --noEmit                           # sin errores de tipos

git add 11-week/workshop/src/components/__tests__/States.test.tsx
git commit -m "test(states): valida carga, datos, vacío, error, conmutación y pull-to-refresh"

git add 11-week/workshop/GIT-COMMANDS.md 11-week/workshop/docs/
git commit -m "docs(week11): completa resultados Lighthouse y guía de flujo Git"

git push -u origin test/week11-cp5-unit-tests
# Abrir Pull Request hacia main (GitHub CLI opcional):
gh pr create --base main --title "Semana 11: UX/UI y patrones avanzados (CP0–CP5)" \
  --body "Auditoría UX, tokens, estados de pantalla, a11y/responsive y pruebas Vitest."

# Tras la revisión:
git checkout main
git merge --no-ff test/week11-cp5-unit-tests -m "merge: CP5 pruebas y cierre de semana 11"
git tag -a week11-cp5 -m "CP5: entrega final semana 11"
git push origin main --tags
git branch -d test/week11-cp5-unit-tests
```

## Verificación final

```bash
git log --oneline --graph --decorate -n 25
git tag -l "week11-*"
```
