export type CatalogCategory =
  | 'all'
  | 'mecanico'
  | 'planimetria'
  | 'ensambles'
  | 'superficies';

export type CadModelType =
  | 'planetary-gear'
  | 'hydraulic-flange'
  | 'robot-gripper'
  | 'sheet-metal-bracket'
  | 'piston-assembly'
  | 'industrial-valve';

export type VisualKind = 'render' | 'blueprint' | 'detail';

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  kind: VisualKind;
  drawingCode: string;
  scale: string;
  imageDataUrl?: string; // Optimized .webp image uploaded by admin
}

export interface CustomCadFile {
  name: string;
  dataUrl: string;
}

export interface HeroVideoFile {
  name: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  durationSec: number;
  originalSizeKb: number;
  optimizedSizeKb: number;
}

export type HeroShowcaseMode = 'auto' | 'video' | 'cad3d' | 'procedural';

export interface TechnicalSpec {
  material: string;
  tolerancia: string;
  software: string;
  norma: string;
  proceso: string;
  tiempoEntrega: string;
}

export interface CatalogProject {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: Exclude<CatalogCategory, 'all'>;
  quickSummary: string;
  description: string;
  modelType: CadModelType;
  customCadFile?: CustomCadFile;
  specs: TechnicalSpec;
  solidworksModules: string[];
  tags: string[];
  featured?: boolean;
  photos: GalleryPhoto[];
}

export interface DigitalCertificate {
  id: string;
  code: string;
  title: string;
  issuer: string;
  credentialId: string;
  issueDate: string;
  description: string;
  imageDataUrl?: string; // Optimized .webp certificate image
}

export interface CertificationTrack {
  code: string;
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  examFormat: string;
  description: string;
  topics: string[];
  deliverables: string[];
}

export interface SectionCopyConfig {
  navPortfolioLabel: string;
  navCertificatesLabel: string;
  navTrainingLabel: string;
  navContactLabel: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  certificatesBadge: string;
  certificatesTitlePrefix: string;
  certificatesTitleHighlight: string;
  certificatesSubtitle: string;
  trainingBadge: string;
  trainingTitlePrefix: string;
  trainingTitleHighlight: string;
  trainingSubtitle: string;
}

export interface BrandConfig {
  brandName: string;
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  heroTitleSuffix: string;
  heroSubtitle: string;
  contactTitle: string;
  contactSubtitle: string;
  contactEmail: string;
  whatsappNumber: string;
  adminPin: string;
  heroCadFile?: CustomCadFile;
  heroVideoFile?: HeroVideoFile;
  heroShowcaseMode?: HeroShowcaseMode;
  sectionCopy?: Partial<SectionCopyConfig>;
}
