# 04 · Accesibilidad y responsive — Módulo Cultivos

## 1. Metas táctiles (mínimo 44 × 44 px)

| Elemento | Tamaño | Cómo se garantiza |
|---|---|---|
| `IonItem` de cultivo | ≥ 64 px de alto, ancho completo | `--min-height: 64px` en `.cultivos-list ion-item` |
| Botones de estado (Reintentar / Actualizar / Registrar cultivo) | ≥ 44 × 44 px | `.state-action { min-height: var(--cv-touch-min); min-width: var(--cv-touch-min) }` |
| Refresher | Gesto de arrastre a pantalla completa | `IonRefresher` nativo |
| Botón «Cerrar» del toast | 44 px (por defecto de Ionic) | Verificar en dispositivo |
| Separación entre ítems | 12 px (360) / 16 px (768) | `gap` del grid |

Los badges (28 px) **no son interactivos**; el ítem completo es el objetivo táctil.

## 2. Atributos ARIA y semántica

| Elemento | Atributo | Motivo |
|---|---|---|
| Lista en carga | `aria-busy="true"` | Anuncia que el contenido se está cargando |
| Texto «Cargando cultivos…» | `role="status"` + `.sr-only` | Mensaje solo para lectores de pantalla |
| Filas skeleton | `aria-hidden="true"` | Evita que se lean 6 filas vacías |
| Lista de datos | `aria-label="Lista de cultivos"` | Nombre accesible del grupo |
| Panel de error | `role="alert"` | Anuncio inmediato y asertivo |
| Panel vacío | `role="status"` | Anuncio cortés, no interrumpe |
| Iconos decorativos | `aria-hidden="true"` | El significado ya está en el texto adyacente |
| Estado del cultivo | Texto visible en el badge | No depende solo del color (WCAG 1.4.1) |
| Ítems con acción | `button` + `detail` en `IonItem` | Rol y foco de botón nativos |
| Foco | `:focus-visible` con anillo de 3 px | WCAG 2.4.7 |
| Movimiento | `animated` del skeleton desactivado con `prefers-reduced-motion` | WCAG 2.3.3 |

Orden de lectura: título de página → lista (o panel de estado) → acciones. Los textos están en español (`lang="es"` recomendado en `index.html`).

## 3. Responsive

| Viewport | Layout | Detalle |
|---|---|---|
| **360 px** | 1 columna | Padding 16 px; ítem a ancho completo; botones apilables (`flex-wrap`) |
| **768 px** | 2 columnas | `@media (min-width: 768px)` → `grid-template-columns: repeat(2, minmax(0,1fr))`, padding 24 px, contenedor máx. 960 px centrado |

### Checklist de verificación manual

- [ ] 360 × 640: sin scroll horizontal; el nombre largo («Frijol cargamanto») no desborda.
- [ ] 360 px: badge «Listo para cosechar» visible sin truncar el nombre.
- [ ] 768 × 1024: lista en 2 columnas con alturas homogéneas.
- [ ] Zoom del navegador al 200 %: contenido legible sin pérdida de funcionalidad.
- [ ] Modo oscuro: contrastes según `02-design-tokens.md`.
- [ ] Teclado: Tab recorre ítems y botones con foco visible.
- [ ] Lector de pantalla (TalkBack/VoiceOver): anuncia carga, lista, vacío y error.
- [ ] `prefers-reduced-motion`: skeleton sin animación.

## 4. Plantilla de auditoría Lighthouse

**Cómo ejecutarla**

```bash
npm run build && npm run preview          # sirve en http://localhost:4173
npx lighthouse http://localhost:4173 --form-factor=mobile  --view --output=html --output-path=./docs/lighthouse-mobile.html
npx lighthouse http://localhost:4173 --form-factor=desktop --screen-emulation.disabled --view --output=html --output-path=./docs/lighthouse-desktop.html
```

**Metadatos**

| Campo | Valor |
|---|---|
| Fecha | ____ / ____ / ________ |
| Versión de Lighthouse | ________ |
| URL auditada | http://localhost:4173/cultivos |
| Dispositivo / throttling | Mobile · Slow 4G · CPU 4× |
| Responsable | ________________ |

**Resultados**

| Categoría | Meta | Mobile | Desktop | Estado |
|---|---|---|---|---|
| Performance | ≥ 85 | ____ | ____ | ☐ Cumple ☐ No cumple |
| Accessibility | ≥ 95 | ____ | ____ | ☐ Cumple ☐ No cumple |
| Best Practices | ≥ 90 | ____ | ____ | ☐ Cumple ☐ No cumple |
| SEO | ≥ 90 | ____ | ____ | ☐ Cumple ☐ No cumple |

**Métricas clave (mobile)**

| Métrica | Meta | Resultado |
|---|---|---|
| First Contentful Paint | ≤ 1,8 s | ____ |
| Largest Contentful Paint | ≤ 2,5 s | ____ |
| Total Blocking Time | ≤ 200 ms | ____ |
| Cumulative Layout Shift | ≤ 0,1 | ____ |

**Hallazgos y plan de corrección**

| # | Auditoría fallida | Elemento | Prioridad | Acción | Estado |
|---|---|---|---|---|---|
| 1 | | | Alta / Media / Baja | | ☐ |
| 2 | | | | | ☐ |
| 3 | | | | | ☐ |

**Notas:** CLS bajo se espera porque el skeleton reserva el espacio de la lista; si el CLS sube, revisar la carga de fuentes (`font-display: swap`).
