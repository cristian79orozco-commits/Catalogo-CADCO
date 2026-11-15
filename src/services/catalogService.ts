import { supabase } from '../lib/supabase';
import { DEFAULT_BRAND_CONFIG, DEFAULT_SECTION_COPY } from '../data/catalogData';
import { uploadMediaToSupabaseStorage } from './storageService';
import type {
  BrandConfig,
  CatalogProject,
  CertificationTrack,
  CustomCadFile,
  DigitalCertificate,
  HeroShowcaseMode,
  HeroVideoFile,
  SectionCopyConfig,
} from '../types';

export interface RemoteCatalogSnapshot {
  projects: CatalogProject[];
  certificates: DigitalCertificate[];
  trainingTracks: CertificationTrack[];
  brandConfig: BrandConfig | null;
  hasRemoteData: boolean;
}

interface ProjectRow {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  category: CatalogProject['category'];
  quick_summary: string;
  description: string;
  model_type: CatalogProject['modelType'];
  custom_cad_file: CatalogProject['customCadFile'] | null;
  specs: CatalogProject['specs'];
  solidworks_modules: string[];
  tags: string[];
  featured: boolean;
  photos: CatalogProject['photos'];
  sort_order?: number;
}

interface CertificateRow {
  id: string;
  code: string;
  title: string;
  issuer: string;
  credential_id: string;
  issue_date: string;
  description: string;
  image_data_url: string | null;
  sort_order?: number;
}

interface TrainingTrackRow {
  code: CertificationTrack['code'];
  title: string;
  subtitle: string;
  level: string;
  duration: string;
  exam_format: string;
  description: string;
  topics: string[];
  deliverables: string[];
}

interface BrandConfigRow {
  id: string;
  brand_name: string;
  hero_badge: string;
  hero_title_prefix: string;
  hero_title_highlight: string;
  hero_title_suffix: string;
  hero_subtitle: string;
  contact_title: string;
  contact_subtitle: string;
  contact_email: string;
  whatsapp_number: string;
  hero_cad_file?: CustomCadFile | null;
  hero_video_file?: HeroVideoFile | null;
  hero_showcase_mode?: HeroShowcaseMode | null;
  section_copy?: Partial<SectionCopyConfig> | null;
}

function mapProjectToRow(project: CatalogProject, sortOrder = 0): ProjectRow {
  return {
    id: project.id,
    code: project.code,
    title: project.title,
    subtitle: project.subtitle,
    category: project.category,
    quick_summary: project.quickSummary,
    description: project.description,
    model_type: project.modelType,
    custom_cad_file: project.customCadFile ?? null,
    specs: project.specs,
    solidworks_modules: project.solidworksModules,
    tags: project.tags,
    featured: Boolean(project.featured),
    photos: project.photos,
    sort_order: sortOrder,
  };
}

function mapRowToProject(row: ProjectRow): CatalogProject {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    subtitle: row.subtitle,
    category: row.category,
    quickSummary: row.quick_summary,
    description: row.description,
    modelType: row.model_type,
    ...(row.custom_cad_file ? { customCadFile: row.custom_cad_file } : {}),
    specs: row.specs,
    solidworksModules: row.solidworks_modules ?? [],
    tags: row.tags ?? [],
    featured: Boolean(row.featured),
    photos: row.photos ?? [],
  };
}

function mapCertificateToRow(cert: DigitalCertificate, sortOrder = 0): CertificateRow {
  return {
    id: cert.id,
    code: cert.code,
    title: cert.title,
    issuer: cert.issuer,
    credential_id: cert.credentialId,
    issue_date: cert.issueDate,
    description: cert.description,
    image_data_url: cert.imageDataUrl ?? null,
    sort_order: sortOrder,
  };
}

function mapRowToCertificate(row: CertificateRow): DigitalCertificate {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    issuer: row.issuer,
    credentialId: row.credential_id,
    issueDate: row.issue_date,
    description: row.description,
    ...(row.image_data_url ? { imageDataUrl: row.image_data_url } : {}),
  };
}

function mapTrackToRow(track: CertificationTrack): TrainingTrackRow {
  return {
    code: track.code,
    title: track.title,
    subtitle: track.subtitle,
    level: track.level,
    duration: track.duration,
    exam_format: track.examFormat,
    description: track.description,
    topics: track.topics,
    deliverables: track.deliverables,
  };
}

function mapRowToTrack(row: TrainingTrackRow): CertificationTrack {
  return {
    code: row.code,
    title: row.title,
    subtitle: row.subtitle,
    level: row.level,
    duration: row.duration,
    examFormat: row.exam_format,
    description: row.description,
    topics: row.topics ?? [],
    deliverables: row.deliverables ?? [],
  };
}

function mapBrandToRow(config: BrandConfig): BrandConfigRow {
  return {
    id: 'default',
    brand_name: config.brandName,
    hero_badge: config.heroBadge,
    hero_title_prefix: config.heroTitlePrefix,
    hero_title_highlight: config.heroTitleHighlight,
    hero_title_suffix: config.heroTitleSuffix,
    hero_subtitle: config.heroSubtitle,
    contact_title: config.contactTitle,
    contact_subtitle: config.contactSubtitle,
    contact_email: config.contactEmail,
    whatsapp_number: config.whatsappNumber,
    hero_cad_file: config.heroCadFile ?? null,
    hero_video_file: config.heroVideoFile ?? null,
    hero_showcase_mode: config.heroShowcaseMode ?? 'auto',
    section_copy: {
      ...DEFAULT_SECTION_COPY,
      ...(config.sectionCopy ?? {}),
    },
  };
}

function mapRowToBrand(row: BrandConfigRow): BrandConfig {
  return {
    brandName: row.brand_name,
    heroBadge: row.hero_badge,
    heroTitlePrefix: row.hero_title_prefix,
    heroTitleHighlight: row.hero_title_highlight,
    heroTitleSuffix: row.hero_title_suffix,
    heroSubtitle: row.hero_subtitle,
    contactTitle: row.contact_title,
    contactSubtitle: row.contact_subtitle,
    contactEmail: row.contact_email,
    whatsappNumber: row.whatsapp_number,
    adminPin: DEFAULT_BRAND_CONFIG.adminPin,
    ...(row.hero_cad_file ? { heroCadFile: row.hero_cad_file } : {}),
    ...(row.hero_video_file ? { heroVideoFile: row.hero_video_file } : {}),
    heroShowcaseMode: row.hero_showcase_mode ?? 'auto',
    sectionCopy: {
      ...DEFAULT_SECTION_COPY,
      ...(row.section_copy ?? {}),
    },
  };
}

export async function fetchCatalogFromSupabase(): Promise<RemoteCatalogSnapshot | null> {
  if (!supabase) return null;

  const [projectsRes, certsRes, tracksRes, brandRes] = await Promise.all([
    supabase
      .from('catalog_projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false }),
    supabase
      .from('digital_certificates')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false }),
    supabase.from('training_tracks').select('*'),
    supabase.from('brand_config').select('*').eq('id', 'default').maybeSingle(),
  ]);

  if (projectsRes.error) throw projectsRes.error;
  if (certsRes.error) throw certsRes.error;
  if (tracksRes.error) throw tracksRes.error;
  if (brandRes.error) throw brandRes.error;

  const projects = ((projectsRes.data ?? []) as ProjectRow[]).map(mapRowToProject);
  const certificates = ((certsRes.data ?? []) as CertificateRow[]).map(mapRowToCertificate);
  const trainingTracks = ((tracksRes.data ?? []) as TrainingTrackRow[]).map(mapRowToTrack);
  const brandConfig = brandRes.data ? mapRowToBrand(brandRes.data as BrandConfigRow) : null;

  const hasRemoteData =
    projects.length > 0 ||
    certificates.length > 0 ||
    trainingTracks.length > 0 ||
    brandConfig !== null;

  return {
    projects,
    certificates,
    trainingTracks,
    brandConfig,
    hasRemoteData,
  };
}

async function resolveProjectStorageMedia(project: CatalogProject): Promise<CatalogProject> {
  if (!project.customCadFile?.dataUrl.startsWith('data:')) {
    return project;
  }
  const publicUrl = await uploadMediaToSupabaseStorage(
    project.customCadFile.dataUrl,
    'models',
    project.customCadFile.name
  );
  if (!publicUrl) return project;
  return {
    ...project,
    customCadFile: { ...project.customCadFile, dataUrl: publicUrl },
  };
}

async function resolveBrandStorageMedia(config: BrandConfig): Promise<BrandConfig> {
  let nextConfig = config;

  if (config.heroCadFile?.dataUrl.startsWith('data:')) {
    const url = await uploadMediaToSupabaseStorage(
      config.heroCadFile.dataUrl,
      'hero-models',
      config.heroCadFile.name
    );
    if (url) {
      nextConfig = {
        ...nextConfig,
        heroCadFile: { ...config.heroCadFile, dataUrl: url },
      };
    }
  }

  if (config.heroVideoFile?.dataUrl.startsWith('data:')) {
    const url = await uploadMediaToSupabaseStorage(
      config.heroVideoFile.dataUrl,
      'hero-videos',
      config.heroVideoFile.name
    );
    if (url) {
      nextConfig = {
        ...nextConfig,
        heroVideoFile: { ...config.heroVideoFile, dataUrl: url },
      };
    }
  }

  return nextConfig;
}

export async function upsertProjectInSupabase(project: CatalogProject, sortOrder = 0) {
  if (!supabase) return;
  const normalized = await resolveProjectStorageMedia(project);
  const { error } = await supabase
    .from('catalog_projects')
    .upsert({ ...mapProjectToRow(normalized, sortOrder), updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function deleteProjectInSupabase(projectId: string) {
  if (!supabase) return;
  const { error } = await supabase.from('catalog_projects').delete().eq('id', projectId);
  if (error) throw error;
}

export async function upsertCertificateInSupabase(cert: DigitalCertificate, sortOrder = 0) {
  if (!supabase) return;
  const { error } = await supabase
    .from('digital_certificates')
    .upsert({ ...mapCertificateToRow(cert, sortOrder), updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function deleteCertificateInSupabase(certId: string) {
  if (!supabase) return;
  const { error } = await supabase.from('digital_certificates').delete().eq('id', certId);
  if (error) throw error;
}

export async function upsertTrainingTrackInSupabase(track: CertificationTrack) {
  if (!supabase) return;
  const row: TrainingTrackRow = {
    code: track.code,
    title: track.title,
    subtitle: track.subtitle,
    level: track.level,
    duration: track.duration,
    exam_format: track.examFormat,
    description: track.description,
    topics: track.topics,
    deliverables: track.deliverables,
  };
  const { error } = await supabase
    .from('training_tracks')
    .upsert({ ...row, updated_at: new Date().toISOString() });
  if (error) throw error;
}

async function upsertBrandRowSafe(row: BrandConfigRow & { updated_at: string }) {
  if (!supabase) return;
  const { error } = await supabase.from('brand_config').upsert(row);
  if (!error) return;

  // Fallback si la columna section_copy aún no ha sido agregada en la instancia remota de Supabase
  const msg = String(error.message ?? '').toLowerCase();
  if (error.code === '42703' || error.code === 'PGRST204' || msg.includes('section_copy')) {
    const { section_copy: _omit, ...legacyRow } = row;
    const { error: retryError } = await supabase.from('brand_config').upsert(legacyRow);
    if (retryError) throw retryError;
    return;
  }

  throw error;
}

export async function upsertBrandConfigInSupabase(config: BrandConfig) {
  if (!supabase) return;
  const normalized = await resolveBrandStorageMedia(config);
  await upsertBrandRowSafe({ ...mapBrandToRow(normalized), updated_at: new Date().toISOString() });
}

export async function seedSnapshotToSupabase(snapshot: {
  projects: CatalogProject[];
  certificates: DigitalCertificate[];
  trainingTracks: CertificationTrack[];
  brandConfig: BrandConfig;
}) {
  if (!supabase) throw new Error('Supabase no está configurado.');

  const now = new Date().toISOString();

  if (snapshot.projects.length > 0) {
    const resolvedProjects = await Promise.all(
      snapshot.projects.map((p) => resolveProjectStorageMedia(p))
    );
    const projectRows = resolvedProjects.map((p, idx) => ({
      ...mapProjectToRow(p, idx),
      updated_at: now,
    }));
    const { error } = await supabase.from('catalog_projects').upsert(projectRows);
    if (error) throw error;
  }

  if (snapshot.certificates.length > 0) {
    const certRows = snapshot.certificates.map((c, idx) => ({
      ...mapCertificateToRow(c, idx),
      updated_at: now,
    }));
    const { error } = await supabase.from('digital_certificates').upsert(certRows);
    if (error) throw error;
  }

  if (snapshot.trainingTracks.length > 0) {
    const trackRows = snapshot.trainingTracks.map((t) => ({
      ...mapTrackToRow(t),
      exam_format: t.examFormat,
      updated_at: now,
    }));
    const { error } = await supabase.from('training_tracks').upsert(trackRows);
    if (error) throw error;
  }

  const resolvedBrand = await resolveBrandStorageMedia(snapshot.brandConfig);
  await upsertBrandRowSafe({ ...mapBrandToRow(resolvedBrand), updated_at: now });
}

export async function signInAdminWithSupabase(
  email: string,
  password: string
): Promise<{ email: string }> {
  if (!supabase) {
    throw new Error('Supabase no está configurado en las variables de entorno.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes('invalid login credentials')) {
      throw new Error(
        'Correo o contraseña incorrectos en Supabase Auth. Si creaste el usuario por invitación o sin confirmar, actualiza su contraseña desde el SQL Editor de Supabase.'
      );
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error('Tu correo en Supabase Auth aún no está confirmado.');
    }
    throw new Error(error.message || 'Credenciales inválidas.');
  }

  const user = data.user;
  if (!user) {
    throw new Error('No se pudo iniciar sesión.');
  }

  const { data: adminRow, error: adminCheckError } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminCheckError || !adminRow) {
    await supabase.auth.signOut();
    throw new Error(
      'Tu usuario inició sesión, pero no está autorizado en la tabla admin_users.'
    );
  }

  return { email: user.email ?? email.trim() };
}

export async function signOutAdminFromSupabase() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function checkCurrentAdminSession(): Promise<{
  isAdmin: boolean;
  email: string | null;
}> {
  if (!supabase) return { isAdmin: false, email: null };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { isAdmin: false, email: null };
  }

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (!adminRow) {
    return { isAdmin: false, email: null };
  }

  return { isAdmin: true, email: session.user.email ?? null };
}

export function subscribeToCatalogRealtime(onRemoteChange: () => void): () => void {
  if (!supabase) return () => {};

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const triggerDebounced = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onRemoteChange();
    }, 250);
  };

  const channel = supabase
    .channel('cadco-catalog-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'catalog_projects' },
      triggerDebounced
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'digital_certificates' },
      triggerDebounced
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'training_tracks' },
      triggerDebounced
    )
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'brand_config' },
      triggerDebounced
    )
    .subscribe();

  return () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    void supabase?.removeChannel(channel);
  };
}
