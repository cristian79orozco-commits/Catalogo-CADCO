import type {
  BrandConfig,
  CatalogCategory,
  CatalogProject,
  CertificationTrack,
  DigitalCertificate,
} from '../types';

export const CATEGORY_LABELS: Record<CatalogCategory, string> = {
  all: 'Todos los Trabajos',
  mecanico: 'Modelado Mecánico',
  planimetria: 'Planimetría & GD&T',
  ensambles: 'Ensambles & Cinemática',
  superficies: 'Chapa & Superficies',
};

export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  brandName: 'CADCO',
  heroBadge: 'Portafolio Profesional · SolidWorks CSWA & CSWP',
  heroTitlePrefix: 'Catálogo de',
  heroTitleHighlight: 'Ingeniería CAD 3D',
  heroTitleSuffix: '& Planimetría Técnica',
  heroSubtitle:
    'Explora una selección de trabajos realizados en modelado mecánico paramétrico, ensambles complejos, chapa metálica y documentación técnica bajo normas ASME / ISO.',
  contactTitle: 'Contacto Directo & Asesoría CAD',
  contactSubtitle:
    '¿Te interesa desarrollar un proyecto de diseño CAD, documentación técnica o prepararte para las certificaciones oficiales CSWA / CSWP? Escríbeme directamente.',
  contactEmail: 'cristian79orozco@gmail.com',
  whatsappNumber: '',
  adminPin: 'CADCO2026',
};

export const DEFAULT_DIGITAL_CERTIFICATES: DigitalCertificate[] = [
  {
    id: 'cert-cswp',
    code: 'CSWP',
    title: 'Certified SolidWorks Professional (CSWP)',
    issuer: 'Dassault Systèmes · SolidWorks Corporation',
    credentialId: 'C-XXXXXXXXXX',
    issueDate: 'Certificación Oficial Vigente',
    description:
      'Acredita dominio avanzado en modelado paramétrico complejo, configuraciones múltiples, tablas de diseño, ecuaciones y ensambles mecánicos de alta precisión.',
  },
  {
    id: 'cert-cswa',
    code: 'CSWA',
    title: 'Certified SolidWorks Associate (CSWA)',
    issuer: 'Dassault Systèmes · SolidWorks Corporation',
    credentialId: 'C-XXXXXXXXXX',
    issueDate: 'Certificación Oficial Vigente',
    description:
      'Certificación oficial en fundamentos de diseño mecánico 3D, croquizado paramétrico, propiedades físicas, ensambles y lectura de planimetría técnica.',
  },
];

export const CATALOG_PROJECTS: CatalogProject[] = [
  {
    id: 'reductor-planetario',
    code: 'CADCO-001',
    title: 'Reductor Planetario Epicicloidal 4:1',
    subtitle: 'Ensamble mecánico multipieza con tren de engranajes rectos',
    category: 'ensambles',
    featured: true,
    quickSummary:
      'Modelado completo en SolidWorks con validación cinemática, análisis de interferencias, lista de materiales (BOM) y planimetría de conjunto.',
    description:
      'Proyecto de diseño mecánico integral que demuestra el dominio de relaciones de posición avanzadas, cálculo geométrico de engranajes (solar, tres satélites a 120° y corona), ajustes normalizados H7/g6 y documentación técnica multi-hoja.',
    modelType: 'planetary-gear',
    specs: {
      material: 'Acero AISI 4140 / Aluminio 6061-T6',
      tolerancia: 'ISO 2768-mK | Ajuste H7/g6',
      software: 'SolidWorks (CSWP)',
      norma: 'ASME Y14.5 / ISO 1328',
      proceso: 'Ensamble Paramétrico + BOM',
      tiempoEntrega: 'Nivel Avanzado',
    },
    solidworksModules: ['Ensambles', 'Engranajes', 'Estudio de Movimiento', 'Planos GD&T'],
    tags: ['Engranajes', 'Transmisión', 'BOM', 'SolidWorks'],
    photos: [
      {
        id: 'pg-1',
        title: 'Vista Isométrica de Conjunto',
        caption: 'Render técnico del tren epicicloidal y carcasa coaxial.',
        kind: 'render',
        drawingCode: 'CADCO-001-R01',
        scale: '1:1',
      },
      {
        id: 'pg-2',
        title: 'Planimetría Técnica & Tolerancias GD&T',
        caption: 'Vistas ortogonales, diámetro primitivo Ø96 mm y concentricidad 0.02 mm.',
        kind: 'blueprint',
        drawingCode: 'CADCO-001-PL02',
        scale: '1:2',
      },
      {
        id: 'pg-3',
        title: 'Corte de Sección A-A',
        caption: 'Detalle longitudinal de alojamiento de rodamientos y chavetero.',
        kind: 'detail',
        drawingCode: 'CADCO-001-DT03',
        scale: '2:1',
      },
    ],
  },
  {
    id: 'brida-hidraulica-cnc',
    code: 'CADCO-002',
    title: 'Brida Hidráulica de Alta Presión',
    subtitle: 'Diseño paramétrico con tabla de configuraciones y GD&T',
    category: 'planimetria',
    featured: true,
    quickSummary:
      'Pieza paramétrica con tabla de diseño para múltiples diámetros nominales y plano técnico certificado bajo norma ASME Y14.5.',
    description:
      'Trabajo enfocado en planimetría técnica de precisión. El modelo paramétrico permite regenerar diámetros nominales DN25 a DN100 mediante tablas de diseño en SolidWorks, incluyendo cuadro de control de características (perpendicularidad, planitud y posición verdadera).',
    modelType: 'hydraulic-flange',
    specs: {
      material: 'Acero Inoxidable AISI 316L',
      tolerancia: '±0.02 mm en alojamiento O-Ring',
      software: 'SolidWorks + Tablas de Diseño',
      norma: 'ASME Y14.5-2018 / SAE J518',
      proceso: 'Modelado Paramétrico + Planimetría',
      tiempoEntrega: 'Nivel Profesional',
    },
    solidworksModules: ['Modelado Paramétrico', 'Tablas de Diseño', 'GD&T DimXpert', 'Planos 2D'],
    tags: ['Hidráulica', 'GD&T', 'Planimetría', 'Configuraciones'],
    photos: [
      {
        id: 'hf-1',
        title: 'Vista Isométrica del Componente',
        caption: 'Brida de 6 taladros avellanados con cuello soldable y cara sellada.',
        kind: 'render',
        drawingCode: 'CADCO-002-R01',
        scale: '1:1',
      },
      {
        id: 'hf-2',
        title: 'Plano Técnico con Cotas GD&T',
        caption: 'Posición verdadera Ø0.05 en 6x Ø11 mm y acabado superficial Ra 0.8.',
        kind: 'blueprint',
        drawingCode: 'CADCO-002-PL01',
        scale: '1:1',
      },
      {
        id: 'hf-3',
        title: 'Detalle de Ranura O-Ring',
        caption: 'Geometría de sellado axial con chaflán de entrada 15°.',
        kind: 'detail',
        drawingCode: 'CADCO-002-DT02',
        scale: '5:1',
      },
    ],
  },
  {
    id: 'pinza-robotica-articulada',
    code: 'CADCO-003',
    title: 'Pinza Robótica Paralela (End-Effector)',
    subtitle: 'Mecanismo articulado de 2 dedos sincronizados',
    category: 'ensambles',
    featured: true,
    quickSummary:
      'Diseño mecánico y estudio de movimiento para efector final robótico, con brida normalizada ISO 9409-1 y detección de colisiones.',
    description:
      'Proyecto demostrativo de cinemática en SolidWorks. Integra base de montaje ISO 9409-1, eslabones paralelos sincronizados y mordazas intercambiables, validando el rango completo de apertura (0–65 mm) sin interferencias.',
    modelType: 'robot-gripper',
    specs: {
      material: 'Aluminio 7075-T6 / PA12-CF',
      tolerancia: '±0.05 mm en ejes de pivote',
      software: 'SolidWorks Motion',
      norma: 'ISO 9409-1 (Brida Robot)',
      proceso: 'Cinemática + Ensamble',
      tiempoEntrega: 'Nivel Avanzado',
    },
    solidworksModules: ['Ensambles', 'Controlador de Relaciones', 'Detección de Interferencias', 'STEP'],
    tags: ['Robótica', 'Cinemática', 'Ensambles', 'Aluminio'],
    photos: [
      {
        id: 'rg-1',
        title: 'Render de Efector Final Completo',
        caption: 'Acabado aluminio anodizado oscuro con mordazas de precisión.',
        kind: 'render',
        drawingCode: 'CADCO-003-R01',
        scale: '1:1',
      },
      {
        id: 'rg-2',
        title: 'Esquema Cinemático y Carrera',
        caption: 'Recorrido de apertura 65 mm con movimiento simétrico.',
        kind: 'blueprint',
        drawingCode: 'CADCO-003-PL01',
        scale: '1:2',
      },
      {
        id: 'rg-3',
        title: 'Despiece de Eslabones y Pasadores',
        caption: 'Bujes autolubricantes y tornillería normalizada DIN 912.',
        kind: 'detail',
        drawingCode: 'CADCO-003-DT02',
        scale: '2:1',
      },
    ],
  },
  {
    id: 'soporte-chapa-metalica',
    code: 'CADCO-004',
    title: 'Soporte Estructural en Chapa Metálica',
    subtitle: 'Desarrollo de plegado, nervios de rigidez y patrón plano',
    category: 'superficies',
    quickSummary:
      'Diseño en módulo Sheet Metal con cálculo de Factor K, alivio de esquinas, tabla de dobleces y validación estructural estática.',
    description:
      'Consola estructural diseñada en el módulo de Chapa Metálica de SolidWorks. Optimizada mediante pestañas dobladas y cartelas de refuerzo, generando desarrollo plano (Flat Pattern) exacto con radios de doblez y tabla de pliegues.',
    modelType: 'sheet-metal-bracket',
    specs: {
      material: 'Acero A36 Calibre 12 (2.66 mm)',
      tolerancia: 'DIN 6935 (Factor K = 0.42)',
      software: 'SolidWorks Sheet Metal',
      norma: 'ISO 2768-m',
      proceso: 'Chapa Desplegada + FEA',
      tiempoEntrega: 'Nivel Profesional',
    },
    solidworksModules: ['Chapa Metálica', 'Chapa Desplegada', 'Exportación DXF', 'Simulación Estática'],
    tags: ['Chapa Metálica', 'Flat Pattern', 'Plegado', 'Sheet Metal'],
    photos: [
      {
        id: 'sm-1',
        title: 'Modelo 3D Plegado con Cartelas',
        caption: 'Refuerzos laterales y ranuras oblongas de ajuste.',
        kind: 'render',
        drawingCode: 'CADCO-004-R01',
        scale: '1:1',
      },
      {
        id: 'sm-2',
        title: 'Desarrollo Plano + Tabla de Dobleces',
        caption: 'Líneas de centro de doblez, radios interiores R3.0 y cotas.',
        kind: 'blueprint',
        drawingCode: 'CADCO-004-PL01',
        scale: '1:2',
      },
      {
        id: 'sm-3',
        title: 'Verificación de Rigidez Estática',
        caption: 'Análisis de deformación bajo carga axial (FS > 3.2).',
        kind: 'detail',
        drawingCode: 'CADCO-004-DT02',
        scale: '1:1',
      },
    ],
  },
  {
    id: 'subensamble-piston-biela',
    code: 'CADCO-005',
    title: 'Subensamble Pistón - Biela - Cigüeñal',
    subtitle: 'Conjunto motriz monocilíndrico de alta precisión',
    category: 'mecanico',
    quickSummary:
      'Modelado avanzado de sólidos y superficies con cálculo de propiedades físicas, centro de masa y vista explosionada dinámica.',
    description:
      'Proyecto demostrativo de modelado mecánico complejo: cabeza de pistón con ranuras para anillos de compresión, bulón flotante, biela en perfil H y cigüeñal con contrapesos balanceados mediante propiedades físicas de SolidWorks.',
    modelType: 'piston-assembly',
    specs: {
      material: 'Aluminio 4032 / Acero 4340',
      tolerancia: '±0.01 mm en muñones',
      software: 'SolidWorks Modelado Avanzado',
      norma: 'ISO 286 / ANSI B4.1',
      proceso: 'Sólidos + Superficies',
      tiempoEntrega: 'Nivel Avanzado',
    },
    solidworksModules: ['Sólidos Avanzados', 'Superficies', 'Propiedades Físicas', 'Vista Explosionada'],
    tags: ['Automotriz', 'Motor', 'Biela', 'Pistón'],
    photos: [
      {
        id: 'pa-1',
        title: 'Render Estudio Conjunto Motriz',
        caption: 'Ensamble dinámico con contrapesos y anillos de compresión.',
        kind: 'render',
        drawingCode: 'CADCO-005-R01',
        scale: '1:1',
      },
      {
        id: 'pa-2',
        title: 'Planimetría de Biela Perfil H',
        caption: 'Distancia entre centros 142.00 mm ±0.015 y paralelismo.',
        kind: 'blueprint',
        drawingCode: 'CADCO-005-PL01',
        scale: '1:1',
      },
      {
        id: 'pa-3',
        title: 'Corte de Cabeza de Pistón',
        caption: 'Detalle de falda, aligeramiento interno y ranuras.',
        kind: 'detail',
        drawingCode: 'CADCO-005-DT02',
        scale: '2:1',
      },
    ],
  },
  {
    id: 'valvula-industrial-dn80',
    code: 'CADCO-006',
    title: 'Válvula Industrial de Compuerta DN80',
    subtitle: 'Levantamiento dimensional y documentación técnica completa',
    category: 'mecanico',
    quickSummary:
      'Ingeniería inversa y reconstrucción CAD 3D de válvula industrial con plano general de ensamble, cortes de sección y despiece.',
    description:
      'Reconstrucción CAD 3D de válvula de compuerta DN80 PN16. Incluye cuerpo principal bridado, bonete empernado, prensaestopas, husillo trapezoidal y volante manual, con planimetría completa de ensamble y detalle.',
    modelType: 'industrial-valve',
    specs: {
      material: 'Hierro Dúctil GGG40 / AISI 420',
      tolerancia: 'ISO 8062 CT8',
      software: 'SolidWorks',
      norma: 'EN 1092-1 PN16 / API 600',
      proceso: 'Ingeniería Inversa + Planos',
      tiempoEntrega: 'Nivel Profesional',
    },
    solidworksModules: ['Ángulos de Salida', 'Configuraciones', 'Vistas de Sección', 'Lista de Materiales'],
    tags: ['Válvulas', 'Piping', 'Ingeniería Inversa', 'PN16'],
    photos: [
      {
        id: 'iv-1',
        title: 'Vista Isométrica Válvula DN80',
        caption: 'Cuerpo bridado PN16 con volante manual y bonete empernado.',
        kind: 'render',
        drawingCode: 'CADCO-006-R01',
        scale: '1:2',
      },
      {
        id: 'iv-2',
        title: 'Plano General de Ensamble y Corte',
        caption: 'Dimensiones cara-a-cara 180 mm y lista de componentes.',
        kind: 'blueprint',
        drawingCode: 'CADCO-006-PL01',
        scale: '1:2',
      },
      {
        id: 'iv-3',
        title: 'Detalle de Rosca Trapezoidal',
        caption: 'Perfil Tr 20x4 y geometría de cierre hermético.',
        kind: 'detail',
        drawingCode: 'CADCO-006-DT02',
        scale: '4:1',
      },
    ],
  },
];

export const CERTIFICATION_TRACKS: CertificationTrack[] = [
  {
    code: 'CSWA',
    title: 'Certified SolidWorks Associate',
    subtitle: 'Preparación Intensiva desde Cero hasta Aprobación Garantizada',
    level: 'Nivel Fundamental / Universitario',
    duration: '16 horas prácticas (4 semanas)',
    examFormat: 'Examen oficial Dassault Systèmes · 180 min · 14 preguntas',
    description:
      'Programa diseñado para estudiantes de ingeniería y técnicos que buscan dominar las bases sólidas del modelado paramétrico y aprobar el examen CSWA en su primer intento.',
    topics: [
      'Croquizado 2D completamente definido y relaciones geométricas',
      'Operaciones base: Extruir, Revolución, Nervios, Matriz lineal/circular',
      'Uso de Variables Globales y Ecuaciones paramétricas',
      'Lectura de propiedades físicas (Masa, Volumen, Centro de Masa)',
      'Ensambles básicos, relaciones de posición estándar y detección de colisiones',
      'Interpretación de vistas ortogonales, cortes de sección y detalles en planos',
    ],
    deliverables: [
      '3 Simulacros cronometrados idénticos al examen real',
      'Banco de +40 piezas tipo CSWA resueltas paso a paso',
      'Asesoría 1-a-1 para optimización de tiempo en examen',
    ],
  },
  {
    code: 'CSWP',
    title: 'Certified SolidWorks Professional',
    subtitle: 'Dominio Avanzado en Configuraciones, Ecuaciones y Ensambles',
    level: 'Nivel Profesional / Industria',
    duration: '24 horas prácticas (6 semanas)',
    examFormat: '3 Segmentos Oficiales · Modelado, Configuraciones y Ensambles',
    description:
      'Entrenamiento de alto rendimiento enfocado en velocidad, robustez del árbol de operaciones (FeatureManager) y técnicas avanzadas exigidas en los 3 segmentos del examen CSWP.',
    topics: [
      'Segmento 1: Modelado rápido con ecuaciones vinculadas y modificación sin errores',
      'Segmento 2: Configuraciones múltiples, Tablas de Diseño (Excel) y supresión de operaciones',
      'Segmento 3: Ensambles avanzados, relaciones de ancho, leva, ranura y sustitución de piezas',
      'Sistemas de coordenadas locales y medición de centro de gravedad en movimiento',
      'Buenas prácticas para evitar reconstrucciones rotas bajo presión de tiempo',
    ],
    deliverables: [
      'Simulacros completos por cada uno de los 3 segmentos CSWP',
      'Plantillas y atajos de teclado de productividad industrial',
      'Revisión en vivo de archivos .SLDPRT y .SLDASM',
    ],
  },
];
