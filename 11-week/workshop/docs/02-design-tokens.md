# 02 · Design tokens — Módulo Cultivos

Los tokens viven en `src/theme/tokens.css` y se mapean a las variables de Ionic (`--ion-*`).
Dirección visual: verdes de hoja sobre superficies frías de tono salvia, un acento tierra para advertencias y tipografía con carácter para títulos (Bricolage Grotesque) y una humanista muy legible para datos (Source Sans 3).

## Colores (modo claro)

| Token | Valor | Uso |
|---|---|---|
| `--cv-ink` | `#16231B` | Texto principal |
| `--cv-ink-muted` | `#4B5A50` | Texto secundario (variedad, lote, fecha) |
| `--cv-surface` | `#F3F5F1` | Fondo de pantalla |
| `--cv-surface-raised` | `#FFFFFF` | Tarjetas/ítems |
| `--cv-primary` | `#2C5E3B` | Acciones primarias, iconos de marca |
| `--cv-on-primary` | `#FFFFFF` | Texto sobre primario |
| `--cv-earth` | `#8A3F0F` | Acento tierra (énfasis, advertencias) |
| `--cv-danger` | `#A12727` | Errores |
| `--cv-focus` | `#1B5FC4` | Anillo de foco |
| `--cv-divider` | `#D5DDD7` | Bordes decorativos (no comunican información) |

### Estados del cultivo

| Estado | Fondo | Texto |
|---|---|---|
| Sano | `#DCEBDD` | `#1E4A2B` |
| Requiere atención | `#FBE3CF` | `#6B2F08` |
| Listo para cosechar | `#F6E7A8` | `#4A3B00` |

### Modo oscuro (`prefers-color-scheme: dark`)

| Token | Valor |
|---|---|
| `--cv-ink` | `#E8EEE9` |
| `--cv-ink-muted` | `#A9B7AD` |
| `--cv-surface` | `#16231B` |
| `--cv-surface-raised` | `#1F2F25` |
| `--cv-primary` / `--cv-on-primary` | `#9FD0AE` / `#16231B` |
| `--cv-earth` | `#F0A97A` |
| `--cv-danger` | `#FF9A94` |
| `--cv-focus` | `#8FB8FF` |

## Tipografía

| Token | Valor | Uso |
|---|---|---|
| `--cv-font-display` | Bricolage Grotesque Variable, system-ui | Títulos de ítem y de estados |
| `--cv-font-body` | Source Sans 3 Variable, system-ui | Texto, etiquetas, botones |
| `--cv-fs-xs` | 0.75rem (12 px) | Badges |
| `--cv-fs-sm` | 0.875rem (14 px) | Metadatos |
| `--cv-fs-md` | 1rem (16 px) | Texto base, títulos de ítem |
| `--cv-fs-lg` | 1.25rem (20 px) | Subtítulos |
| `--cv-fs-xl` | 1.5rem (24 px) | Títulos de estado |
| `--cv-fs-2xl` | 1.875rem (30 px) | Títulos de página grandes |
| `--cv-lh-tight` / `--cv-lh-body` | 1.25 / 1.5 | Interlineado |

El texto base nunca baja de 14 px; los 12 px se reservan para badges en negrita media. Las líneas de lectura quedan por debajo de 80 caracteres por el ancho máximo de las tarjetas y del panel de estado (420 px).

## Espaciado, forma y ergonomía

| Token | Valor |
|---|---|
| `--cv-space-1` … `--cv-space-7` | 4, 8, 12, 16, 24, 32, 48 px |
| `--cv-radius-sm` / `-md` / `-pill` | 8 px / 12 px / 999 px |
| `--cv-touch-min` | 44 px |

## Matriz de contraste WCAG

Ratios calculados con la fórmula de luminancia relativa de WCAG 2.1. Umbral exigido para texto normal: **4,5:1** (AA).

### Modo claro

| Texto | Fondo | Ratio | AA texto normal (≥4,5) | AAA (≥7) |
|---|---|---|---|---|
| `--cv-ink` `#16231B` | `--cv-surface` `#F3F5F1` | **14,83:1** | ✅ | ✅ |
| `--cv-ink` `#16231B` | `--cv-surface-raised` `#FFFFFF` | **16,27:1** | ✅ | ✅ |
| `--cv-ink-muted` `#4B5A50` | `--cv-surface` `#F3F5F1` | **6,65:1** | ✅ | ❌ |
| `--cv-ink-muted` `#4B5A50` | `--cv-surface-raised` `#FFFFFF` | **7,30:1** | ✅ | ✅ |
| `--cv-on-primary` `#FFFFFF` | `--cv-primary` `#2C5E3B` | **7,58:1** | ✅ | ✅ |
| `--cv-primary` `#2C5E3B` | `--cv-surface` `#F3F5F1` | **6,91:1** | ✅ | ❌ |
| `--cv-earth` `#8A3F0F` | `--cv-surface` `#F3F5F1` | **6,84:1** | ✅ | ❌ |
| `--cv-danger` `#A12727` | `--cv-surface` `#F3F5F1` | **6,75:1** | ✅ | ❌ |
| `--cv-danger` `#A12727` | `--cv-surface-raised` `#FFFFFF` | **7,41:1** | ✅ | ✅ |
| Badge Sano `#1E4A2B` | `#DCEBDD` | **8,20:1** | ✅ | ✅ |
| Badge Atención `#6B2F08` | `#FBE3CF` | **8,35:1** | ✅ | ✅ |
| Badge Cosecha `#4A3B00` | `#F6E7A8` | **8,82:1** | ✅ | ✅ |

### Modo oscuro

| Texto | Fondo | Ratio | AA texto normal (≥4,5) | AAA (≥7) |
|---|---|---|---|---|
| `#E8EEE9` | `#16231B` | **13,82:1** | ✅ | ✅ |
| `#E8EEE9` | `#1F2F25` | **11,96:1** | ✅ | ✅ |
| `#A9B7AD` (muted) | `#16231B` | **7,80:1** | ✅ | ✅ |
| `#A9B7AD` (muted) | `#1F2F25` | **6,75:1** | ✅ | ❌ |
| `#16231B` sobre primario `#9FD0AE` | — | **9,38:1** | ✅ | ✅ |
| `#F0A97A` (earth) | `#16231B` | **8,26:1** | ✅ | ✅ |
| `#FF9A94` (danger) | `#16231B` | **7,98:1** | ✅ | ✅ |

### Elementos no textuales (WCAG 1.4.11, mínimo 3:1)

| Elemento | Contraste | Resultado |
|---|---|---|
| Anillo de foco `#1B5FC4` sobre `#F3F5F1` | **5,50:1** | ✅ |
| Anillo de foco `#1B5FC4` sobre `#FFFFFF` | **6,03:1** | ✅ |
| Anillo de foco oscuro `#8FB8FF` sobre `#16231B` | **8,11:1** | ✅ |

`--cv-divider` (1,26:1) es **decorativo**: los ítems se identifican por su texto y no por el borde, por lo que no aplica el criterio 1.4.11.

> Verificación: cualquier cambio de color debe recalcularse con la herramienta de contraste de Chrome DevTools o con `npx wcag-contrast <fg> <bg>` antes de integrarse.
