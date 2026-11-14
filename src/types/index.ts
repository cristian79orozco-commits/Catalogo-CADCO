export type CatalogCategory =
  | 'all'
  | 'mecanico'
  | 'planimetria'
  | 'ensambles'
  | 'superficies';

export type ViewerEngine = 'r3f' | 'babylon' | 'online3d';

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
}

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
  specs: TechnicalSpec;
  solidworksModules: string[];
  tags: string[];
  featured?: boolean;
  photos: GalleryPhoto[];
}

export interface CertificationTrack {
  code: 'CSWA' | 'CSWP';
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  examFormat: string;
  description: string;
  topics: string[];
  deliverables: string[];
}

export interface TechStackLicense {
  name: string;
  packageName: string;
  license: string;
  role: string;
  url: string;
}
