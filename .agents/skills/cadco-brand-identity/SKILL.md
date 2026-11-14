---
name: cadco-brand-identity
description: >-
  Guía oficial de identidad de marca, sistema de diseño y componentes UI para CADCO
  (Catálogo de Ingeniería CAD 3D, Planimetría Técnica y Capacitación SolidWorks).
  Úsala obligatoriamente antes de crear, rediseñar o estilizar secciones, vistas,
  modales, cards, botones o formularios en este proyecto para mantener coherencia visual y técnica.
---

# CADCO — Guía de Identidad de Marca y Sistema Visual

> *"Ingeniería CAD de precisión, modelado paramétrico y documentación técnica bajo normas ASME / ISO."*

Esta skill adapta la estructura de la **Guía de Identidad de Marca** al ecosistema real de **CADCO** (`catalogo cadco`), unificando su personalidad técnica, tokens CSS (`src/index.css`), tipografía (`index.html`), componentes React/Tailwind y arquitectura de secciones.

---

## 1. Personalidad de Marca (Atributos del Negocio)

| Atributo | Definición para CADCO |
| :--- | :--- |
| **Sensación** | Precisa, ingenieril, técnica y "High-End". Estética de estación de trabajo CAD / plano técnico digital (*blueprint* oscuro) pensada para clientes industriales, ingenieros y estudiantes de certificación. |
| **Valores** | Precisión milimétrica, estandarización normativa (ASME / ISO / GD&T), claridad documental y excelencia en la formación técnica (SolidWorks CSWA / CSWP). |
| **Tono** | Experto, técnico y directo. Basado en especificaciones reales (códigos de pieza, materiales, tolerancias y procesos) sin relleno ni adjetivos vacíos. |
| **Misión** | Proveer diseño CAD 3D, modelado mecánico paramétrico, planimetría técnica y capacitación especializada para transformar conceptos de ingeniería en piezas y ensambles listos para fabricación. |

---

## 2. Paleta de Colores (Tokens Oficiales)

Todos los colores principales están declarados en `src/index.css` bajo `:root` y aplicados en las clases Tailwind de los componentes:

| Nombre | Token CSS / Valor | Uso Principal |
| :--- | :--- | :--- |
| **Obsidian CAD (Fondo Base)** | `--cadco-bg: #050608` | Fondo global (`body`, `.bg-cad-grid`). Base de profundidad y contraste técnico. |
| **Superficie Oscura** | `--cadco-surface: #0b0e13` | Fondo de tarjetas (`ProjectCard`), barras de navegación y contenedores principales (`bg-[#0b0e13]/90`). |
| **Panel Elevado** | `--cadco-panel: #11161f` | Paneles internos, modales (`AdminStudioModal`, `ProjectInspectorModal`) y bloques de especificaciones. |
| **Teal Técnico CADCO** | `--cadco-teal: #5bb5b9` | Color de marca principal: CTAs primarios, badges destacados, selección de texto, bordes activos y acentos de ingeniería. |
| **Teal Brillante (Acento)** | `--cadco-teal-bright: #2dd4bf` | Estados de foco intenso, indicadores activos, métricas clave y detalles de alta visibilidad. |
| **Borde Técnico** | `--cadco-border: rgba(91, 181, 185, 0.18)` / `border-white/10` | Líneas divisorias sutiles, contornos de cards y rejilla `.bg-cad-grid` (24px / 120px). |
| **Texto Principal / Secundario** | `#f1f5f9` (`text-slate-100`) / `#94a3b8` (`text-slate-400`) | Lectura principal de alta legibilidad sobre fondos oscuros y descripciones técnicas. |

**Regla de uso:** Usar **Teal (`#5bb5b9`)** exclusivamente para CTAs primarios, estados activos y elementos técnicos clave (códigos de proyecto, etiquetas `Destacado`). Mantener **Obsidian (`#050608`)** y **Superficie (`#0b0e13`)** como base dominante.

---

## 3. Tipografía

Configurada en `index.html` (Google Fonts) y `src/index.css`:

| Rol | Familia | Clases / Selectores | Uso |
| :--- | :--- | :--- | :--- |
| **Titulares** | `Space Grotesk` (500, 600, 700) | `h1, h2, h3, h4, .font-display` | Títulos de sección, encabezados de cards, héroe y modales. Transmite precisión geométrica e industrial. |
| **Cuerpo de Texto** | `Inter` (400, 500, 600, 700) | `html` (default) | Párrafos, descripciones de proyectos, listas de especificaciones y microcopy. |
| **Técnico / Códigos** | `JetBrains Mono` (400, 500, 600) | `.font-mono-tech` | Códigos de proyecto (ej. `CAD-001`), badges técnicos, dimensiones, tolerancias GD&T y etiquetas de estado. |

---

## 4. Escala Tipográfica

| Nivel | Tamaño / Estilo Recomendado | Configuración |
| :--- | :--- | :--- |
| **H1 (Hero Principal)** | `36px – 48px` (`text-4xl sm:text-5xl`) | `Space Grotesk Bold`, `tracking-tight`, contraste blanco + acento `#5bb5b9`. |
| **H2 (Sección)** | `24px – 30px` (`text-2xl sm:text-3xl`) | `Space Grotesk SemiBold/Bold`, acompañado de etiqueta superior en `.font-mono-tech` o badge técnico. |
| **H3 (Card / Subtítulo)** | `18px – 20px` (`text-lg font-semibold`) | `Space Grotesk`, `text-slate-100`. |
| **Body (Estándar)** | `14px – 16px` (`text-sm` / `text-base`) | `Inter Regular`, `leading-relaxed` (~1.6) para máxima claridad en descripciones técnicas. |
| **Microcopy / Badges** | `10px – 12px` (`text-[11px]` / `text-xs`) | `JetBrains Mono` (`.font-mono-tech`) para códigos y `Inter Medium` para botones compactos. |

---

## 5. Componentes: Botones

Seguir exactamente los patrones establecidos en `src/components/catalog/ProjectCard.tsx` y `src/App.tsx`:

### Botón Primario (CTA de Acción / Visor 3D)
- **Fondo:** `#5bb5b9` (`bg-[#5bb5b9]`)
- **Texto:** `#020617` (`text-slate-950 font-semibold`)
- **Forma y Espaciado:** `rounded-lg` (o `rounded-xl` en hero), `px-3 py-1.5 text-xs` (compacto) o `px-5 py-2.5 text-sm` (principal).
- **Hover:** `#4ea5a9` (`hover:bg-[#4ea5a9]`), `shadow-lg` sutil.

### Botón Secundario (Planimetría / Acciones Auxiliares)
- **Fondo:** `bg-black/80` o transparente con `backdrop-blur-md`
- **Borde:** `border border-white/20` (o `border-white/15`)
- **Texto:** `text-slate-100` (`font-medium`)
- **Hover:** Borde y texto en Teal (`hover:border-[#5bb5b9] hover:text-[#5bb5b9]`).

---

## 6. Cards y Formularios

### Diseño de Card CADCO (`ProjectCard` y Tarjetas de Sección)
- **Fondo:** `bg-[#0b0e13]/90` (superficie oscura semitransparente sobre `.bg-cad-grid`).
- **Borde:** `border border-white/10`, esquinas `rounded-2xl`.
- **Hover:** Elevación suave (`hover:-translate-y-1`), borde Teal (`hover:border-[#5bb5b9]/50`) y sombra ambiental Teal (`hover:shadow-[0_12px_40px_-12px_rgba(91,181,185,0.28)]`).
- **Área Visual:** Contenedor superior `aspect-[16/10]` en `bg-[#070a0f]` con `border-b border-white/10`, badges superiores en `bg-black/75 backdrop-blur-sm` y acciones rápidas en la parte inferior.

### Inputs de Datos y Buscadores
- **Fondo:** `bg-[#0b0e13]` o `bg-black/60`
- **Borde:** `border border-white/15`, `rounded-xl`
- **Texto / Placeholder:** `text-slate-100 placeholder:text-slate-500`
- **Focus:** `focus:border-[#5bb5b9] focus:outline-none focus:ring-1 focus:ring-[#5bb5b9]/40`

---

## 7. Estilo de Imágenes y Visuales Técnicos

- **Iluminación y Contraste:** Renderizados CAD 3D y capturas técnicas con alto contraste sobre fondos oscuros (`#070a0f`), resaltando aristas metálicas, chaflanes, roscas y acabados industriales.
- **Textura:** Superficies mecanizadas, mallas poligonales, planos 2D con cotas y simbología GD&T, y rejilla de coordenadas `.bg-cad-grid`.
- **Composición:** Encuadre limpio y centrado (`TechnicalVisual`, `R3FCadViewer`) sin ruido decorativo que compita con la geometría de la pieza o la legibilidad del plano.

---

## 8. Atmósfera Visual

> **Esencia de la Precisión Técnica:** La interfaz debe sentirse como un entorno de ingeniería profesional (estilo visor CAD / blueprint digital). No se presenta un portafolio genérico: se exhibe rigor constructivo, dominio paramétrico y capacidad de manufactura real.

---

## 9. Estructura de Secciones Web (Arquitectura CADCO)

Basada en la estructura activa en `src/App.tsx`:

| Sección | Prioridad | Objetivo Estratégico |
| :--- | :--- | :--- |
| **Hero & Visor 3D Destacado** | Alta | Impacto inmediato con el modelo 3D interactivo (`R3FCadViewer`), propuesta de valor CADCO y acceso directo al catálogo. |
| **Catálogo Interactivo de Proyectos** | Alta | Filtrado por especialidad (`Modelado Mecánico`, `Planimetría & GD&T`, `Ensambles & Cinemática`, `Chapa & Superficies`), búsqueda por código/tags e inspección 3D + galería de planos. |
| **Certificaciones Oficiales (`CertificatesSection`)** | Alta | Prueba de autoridad técnica mediante credenciales verificables de SolidWorks (`CSWP`, `CSWA`). |
| **Capacitación SolidWorks (`TrainingSection`)** | Media | Oferta formativa estructurada para preparación de certificaciones oficiales y dominio profesional del software. |
| **Contacto Directo & Asesoría (`ContactSection`)** | Media | Conversión directa vía correo/WhatsApp para proyectos de ingeniería CAD, documentación técnica o mentoría. |
| **Admin Studio (`AdminStudioModal`)** | Operativa | Gestión interna protegida por PIN (`brandConfig`) para administrar proyectos, certificados y configuración de marca sin tocar código. |

---

## Checklist Rápido al Crear o Editar UI en CADCO

1. ¿Usé `#050608` / `#0b0e13` / `#11161f` para fondos y `#5bb5b9` para acentos primarios sin introducir colores ajenos a la paleta?
2. ¿Los títulos usan `Space Grotesk`, el cuerpo `Inter` y los códigos/especificaciones `.font-mono-tech` (`JetBrains Mono`)?
3. ¿Los botones respetan las variantes **Primario** (`bg-[#5bb5b9] text-slate-950`) y **Secundario** (`border-white/20 hover:border-[#5bb5b9]`)?
4. ¿Las cards mantienen `rounded-2xl border-white/10 bg-[#0b0e13]/90` con el hover glow Teal oficial?
