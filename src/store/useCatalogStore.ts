import { create } from 'zustand';
import {
  CATALOG_PROJECTS,
  CERTIFICATION_TRACKS,
  DEFAULT_BRAND_CONFIG,
  DEFAULT_DIGITAL_CERTIFICATES,
} from '../data/catalogData';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  checkCurrentAdminSession,
  deleteCertificateInSupabase,
  deleteProjectInSupabase,
  fetchCatalogFromSupabase,
  seedSnapshotToSupabase,
  signInAdminWithSupabase,
  signOutAdminFromSupabase,
  subscribeToCatalogRealtime,
  syncTrainingTracksInSupabase,
  upsertBrandConfigInSupabase,
  upsertCertificateInSupabase,
  upsertProjectInSupabase,
  upsertTrainingTrackInSupabase,
} from '../services/catalogService';
import type {
  BrandConfig,
  CatalogCategory,
  CatalogProject,
  CertificationTrack,
  DigitalCertificate,
} from '../types';

const STORAGE_KEY = 'cadco_catalog_storage_v2';
const GH_TOKEN_KEY = 'cadco_owner_gh_token';
const GH_REPO = 'cristian79orozco-commits/Catalogo-CADCO';

export type CatalogViewTab = 'portfolio' | 'certificates' | 'training' | 'contact';

interface PersistedSnapshot {
  projects: CatalogProject[];
  certificates: DigitalCertificate[];
  trainingTracks: CertificationTrack[];
  brandConfig: BrandConfig;
}

function loadInitialSnapshot(): PersistedSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedSnapshot>;
      return {
        projects: parsed.projects?.length ? parsed.projects : CATALOG_PROJECTS,
        certificates: parsed.certificates ?? DEFAULT_DIGITAL_CERTIFICATES,
        trainingTracks: parsed.trainingTracks?.length
          ? parsed.trainingTracks
          : CERTIFICATION_TRACKS,
        brandConfig: parsed.brandConfig
          ? { ...DEFAULT_BRAND_CONFIG, ...parsed.brandConfig }
          : DEFAULT_BRAND_CONFIG,
      };
    }
  } catch {
    // Fallback to defaults
  }
  return {
    projects: CATALOG_PROJECTS,
    certificates: DEFAULT_DIGITAL_CERTIFICATES,
    trainingTracks: CERTIFICATION_TRACKS,
    brandConfig: DEFAULT_BRAND_CONFIG,
  };
}

function saveSnapshot(snapshot: PersistedSnapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore quota errors
  }
}

function updateUrlProjectParam(projectId: string | null) {
  try {
    const url = new URL(window.location.href);
    if (projectId) {
      url.searchParams.set('proyecto', projectId);
    } else {
      url.searchParams.delete('proyecto');
    }
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Ignore history errors
  }
}

function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

async function upsertGitHubFile(
  token: string,
  path: string,
  branch: string,
  contentStr: string,
  commitMessage: string
) {
  const apiUrl = `https://api.github.com/repos/${GH_REPO}/contents/${path}`;
  let sha: string | undefined;

  const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (getRes.ok) {
    const data = (await getRes.json()) as { sha?: string };
    sha = data.sha;
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: commitMessage,
      content: utf8ToBase64(contentStr),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`GitHub API (${putRes.status}): ${errText}`);
  }
}

interface CatalogState extends PersistedSnapshot {
  activeView: CatalogViewTab;
  selectedCategory: CatalogCategory;
  searchQuery: string;
  selectedProjectId: string | null;
  activePhotoIndex: number;
  isExploded: boolean;
  isWireframe: boolean;
  autoRotate: boolean;
  copiedProjectId: string | null;
  isLiveSyncing: boolean;

  // Admin & Supabase sync state
  isAdminOpen: boolean;
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  isAuthLoading: boolean;
  authError: string | null;
  syncError: string | null;
  hasRemoteData: boolean;
  githubToken: string;

  setActiveView: (view: CatalogViewTab) => void;
  setSelectedCategory: (category: CatalogCategory) => void;
  setSearchQuery: (query: string) => void;
  openProject: (projectId: string, photoIndex?: number) => void;
  closeProject: () => void;
  setActivePhotoIndex: (index: number) => void;
  toggleExploded: () => void;
  toggleWireframe: () => void;
  toggleAutoRotate: () => void;
  markLinkCopied: (projectId: string) => void;
  syncFromUrl: () => void;
  fetchLiveCatalog: (options?: { force?: boolean }) => Promise<void>;
  subscribeRealtime: () => () => void;

  openAdminModal: () => void;
  closeAdminModal: () => void;
  initAdminSession: () => Promise<void>;
  loginAdminWithSupabase: (email: string, password: string) => Promise<boolean>;
  authenticateAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  setGithubToken: (token: string) => void;
  publishLiveToGitHub: () => Promise<void>;
  syncLocalToSupabase: () => Promise<void>;

  addProject: (project: CatalogProject) => Promise<void>;
  updateProject: (project: CatalogProject) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addCertificate: (cert: DigitalCertificate) => Promise<void>;
  updateCertificate: (cert: DigitalCertificate) => Promise<void>;
  deleteCertificate: (certId: string) => Promise<void>;
  updateBrandConfig: (patch: Partial<BrandConfig>) => Promise<void>;
  updateTrainingTrack: (track: CertificationTrack) => Promise<void>;
  saveBrandAndTraining: (
    brandConfig: BrandConfig,
    trainingTracks: CertificationTrack[]
  ) => Promise<void>;
  importSnapshot: (snapshot: Partial<PersistedSnapshot>) => void;
  resetToDefaults: () => void;
}

const initial = loadInitialSnapshot();

export const useCatalogStore = create<CatalogState>((set, get) => ({
  ...initial,
  activeView: 'portfolio',
  selectedCategory: 'all',
  searchQuery: '',
  selectedProjectId: null,
  activePhotoIndex: 0,
  isExploded: false,
  isWireframe: false,
  autoRotate: true,
  copiedProjectId: null,
  isLiveSyncing: false,
  isAdminOpen: false,
  isAdminAuthenticated: false,
  adminEmail: null,
  isAuthLoading: false,
  authError: null,
  syncError: null,
  hasRemoteData: false,
  githubToken: (() => {
    try {
      return localStorage.getItem(GH_TOKEN_KEY) ?? '';
    } catch {
      return '';
    }
  })(),

  setActiveView: (activeView) => set({ activeView }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  openProject: (projectId, photoIndex = 0) => {
    updateUrlProjectParam(projectId);
    set({
      selectedProjectId: projectId,
      activePhotoIndex: photoIndex,
      isExploded: false,
      isWireframe: false,
    });
  },

  closeProject: () => {
    updateUrlProjectParam(null);
    set({ selectedProjectId: null });
  },

  setActivePhotoIndex: (activePhotoIndex) => set({ activePhotoIndex }),
  toggleExploded: () => set((s) => ({ isExploded: !s.isExploded })),
  toggleWireframe: () => set((s) => ({ isWireframe: !s.isWireframe })),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),

  markLinkCopied: (projectId) => {
    set({ copiedProjectId: projectId });
    setTimeout(() => {
      set((s) => (s.copiedProjectId === projectId ? { copiedProjectId: null } : s));
    }, 2400);
  },

  syncFromUrl: () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const proyecto = params.get('proyecto');
      const adminParam = params.get('admin');
      const isHashAdmin = window.location.hash === '#admin';
      if (proyecto) {
        set({ selectedProjectId: proyecto, activeView: 'portfolio' });
      }
      if (adminParam === '1' || isHashAdmin) {
        set({ isAdminOpen: true });
      }
    } catch {
      // Ignore URL errors
    }
  },

  fetchLiveCatalog: async (options) => {
    set({ isLiveSyncing: true, syncError: null });
    try {
      if (isSupabaseConfigured) {
        const remote = await fetchCatalogFromSupabase();
        if (remote) {
          set({ hasRemoteData: remote.hasRemoteData });
          if (remote.hasRemoteData) {
            const s = get();
            if (!s.isAdminAuthenticated || options?.force) {
              const next: PersistedSnapshot = {
                projects: remote.projects.length ? remote.projects : s.projects,
                certificates:
                  remote.projects.length || remote.certificates.length
                    ? remote.certificates
                    : s.certificates,
                trainingTracks: remote.trainingTracks.length
                  ? remote.trainingTracks
                  : s.trainingTracks,
                brandConfig: remote.brandConfig
                  ? { ...s.brandConfig, ...remote.brandConfig }
                  : s.brandConfig,
              };
              saveSnapshot(next);
              set(next);
            }
            return;
          }
        }
      }

      // Fallback to static catalog-live.json if Supabase has no data yet or is unconfigured
      const res = await fetch(`./catalog-live.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const remote = (await res.json()) as Partial<PersistedSnapshot>;
      if (remote.projects?.length) {
        const s = get();
        if (!s.isAdminAuthenticated) {
          const next: PersistedSnapshot = {
            projects: remote.projects,
            certificates: remote.certificates ?? s.certificates,
            trainingTracks: remote.trainingTracks?.length
              ? remote.trainingTracks
              : s.trainingTracks,
            brandConfig: remote.brandConfig
              ? { ...s.brandConfig, ...remote.brandConfig }
              : s.brandConfig,
          };
          saveSnapshot(next);
          set(next);
        }
      }
    } catch (err) {
      set({
        syncError:
          err instanceof Error ? err.message : 'No se pudo sincronizar con Supabase.',
      });
    } finally {
      set({ isLiveSyncing: false });
    }
  },

  subscribeRealtime: () => {
    if (!isSupabaseConfigured) return () => {};
    return subscribeToCatalogRealtime(() => {
      // Never overwrite local state while Admin Studio is open to prevent clobbering active edits
      if (get().isAdminOpen) return;
      void get().fetchLiveCatalog({ force: true });
    });
  },

  openAdminModal: () => set({ isAdminOpen: true, authError: null }),
  closeAdminModal: () => set({ isAdminOpen: false, authError: null }),

  initAdminSession: async () => {
    if (!isSupabaseConfigured) return;
    try {
      const session = await checkCurrentAdminSession();
      set({
        isAdminAuthenticated: session.isAdmin,
        adminEmail: session.email,
      });
    } catch {
      set({ isAdminAuthenticated: false, adminEmail: null });
    }
  },

  loginAdminWithSupabase: async (email, password) => {
    set({ isAuthLoading: true, authError: null });
    try {
      const res = await signInAdminWithSupabase(email, password);
      set({
        isAdminAuthenticated: true,
        adminEmail: res.email,
        isAuthLoading: false,
        authError: null,
      });
      return true;
    } catch (err) {
      set({
        isAdminAuthenticated: false,
        adminEmail: null,
        isAuthLoading: false,
        authError: err instanceof Error ? err.message : 'Error de autenticación.',
      });
      return false;
    }
  },

  authenticateAdmin: (pin) => {
    if (isSupabaseConfigured) return false;
    const valid = pin.trim() === get().brandConfig.adminPin;
    if (valid) set({ isAdminAuthenticated: true });
    return valid;
  },

  logoutAdmin: () => {
    void signOutAdminFromSupabase();
    set({
      isAdminAuthenticated: false,
      adminEmail: null,
      isAdminOpen: false,
      authError: null,
    });
  },

  syncLocalToSupabase: async () => {
    const s = get();
    set({ isLiveSyncing: true, syncError: null });
    try {
      await seedSnapshotToSupabase({
        projects: s.projects,
        certificates: s.certificates,
        trainingTracks: s.trainingTracks,
        brandConfig: s.brandConfig,
      });
      set({ hasRemoteData: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Error al subir el catálogo a Supabase.';
      set({ syncError: msg });
      throw new Error(msg);
    } finally {
      set({ isLiveSyncing: false });
    }
  },

  setGithubToken: (token) => {
    try {
      localStorage.setItem(GH_TOKEN_KEY, token.trim());
    } catch {
      // Ignore
    }
    set({ githubToken: token.trim() });
  },

  publishLiveToGitHub: async () => {
    const s = get();
    if (!s.githubToken) {
      throw new Error('Ingresa tu Token de GitHub en la pestaña "Publicar en Vivo".');
    }
    // Strip adminPin from public catalog-live.json for security!
    const publicBrand = { ...s.brandConfig, adminPin: DEFAULT_BRAND_CONFIG.adminPin };
    const payload = JSON.stringify(
      {
        projects: s.projects,
        certificates: s.certificates,
        trainingTracks: s.trainingTracks,
        brandConfig: publicBrand,
      },
      null,
      2
    );

    await upsertGitHubFile(
      s.githubToken,
      'catalog-live.json',
      'gh-pages',
      payload,
      'chore: publish live CADCO catalog update'
    );
    await upsertGitHubFile(
      s.githubToken,
      'public/catalog-live.json',
      'main',
      payload,
      'chore: sync public/catalog-live.json from Admin Studio'
    );
  },

  addProject: async (project) => {
    const projects = [project, ...get().projects];
    const s = get();
    saveSnapshot({
      projects,
      certificates: s.certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ projects, syncError: null });
    if (isSupabaseConfigured) {
      try {
        await upsertProjectInSupabase(project, 0);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al guardar proyecto en Supabase.';
        set({ syncError: msg });
        throw new Error(msg);
      }
    }
  },

  updateProject: async (project) => {
    const projects = get().projects.map((p) => (p.id === project.id ? project : p));
    const sortOrder = Math.max(
      0,
      projects.findIndex((p) => p.id === project.id)
    );
    const s = get();
    saveSnapshot({
      projects,
      certificates: s.certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ projects, syncError: null });
    if (isSupabaseConfigured) {
      try {
        await upsertProjectInSupabase(project, sortOrder);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al actualizar proyecto en Supabase.';
        set({ syncError: msg });
        throw new Error(msg);
      }
    }
  },

  deleteProject: async (projectId) => {
    const projects = get().projects.filter((p) => p.id !== projectId);
    const s = get();
    saveSnapshot({
      projects,
      certificates: s.certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ projects, syncError: null });
    if (isSupabaseConfigured) {
      try {
        await deleteProjectInSupabase(projectId);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al eliminar proyecto en Supabase.';
        set({ syncError: msg });
        throw new Error(msg);
      }
    }
  },

  addCertificate: async (cert) => {
    const certificates = [cert, ...get().certificates];
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ certificates, syncError: null });
    if (isSupabaseConfigured) {
      try {
        await upsertCertificateInSupabase(cert, 0);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al guardar certificado en Supabase.';
        set({ syncError: msg });
        throw new Error(msg);
      }
    }
  },

  updateCertificate: async (cert) => {
    const certificates = get().certificates.map((c) => (c.id === cert.id ? cert : c));
    const sortOrder = Math.max(
      0,
      certificates.findIndex((c) => c.id === cert.id)
    );
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ certificates, syncError: null });
    if (isSupabaseConfigured) {
      try {
        await upsertCertificateInSupabase(cert, sortOrder);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al actualizar certificado en Supabase.';
        set({ syncError: msg });
        throw new Error(msg);
      }
    }
  },

  deleteCertificate: async (certId) => {
    const certificates = get().certificates.filter((c) => c.id !== certId);
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ certificates, syncError: null });
    if (isSupabaseConfigured) {
      try {
        await deleteCertificateInSupabase(certId);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al eliminar certificado en Supabase.';
        set({ syncError: msg });
        throw new Error(msg);
      }
    }
  },

  updateBrandConfig: async (patch) => {
    const brandConfig = { ...get().brandConfig, ...patch };
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates: s.certificates,
      trainingTracks: s.trainingTracks,
      brandConfig,
    });
    set({ brandConfig, syncError: null });
    if (isSupabaseConfigured) {
      try {
        await upsertBrandConfigInSupabase(brandConfig);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al guardar configuración en Supabase.';
        set({ syncError: msg });
        throw new Error(msg);
      }
    }
  },

  updateTrainingTrack: async (track) => {
    const trainingTracks = get().trainingTracks.map((t) =>
      t.code === track.code ? track : t
    );
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates: s.certificates,
      trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ trainingTracks, syncError: null });
    if (isSupabaseConfigured) {
      try {
        await upsertTrainingTrackInSupabase(track);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error al guardar capacitación en Supabase.';
        set({ syncError: msg });
        throw new Error(msg);
      }
    }
  },

  saveBrandAndTraining: async (brandConfig, trainingTracks) => {
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates: s.certificates,
      trainingTracks,
      brandConfig,
    });
    set({ brandConfig, trainingTracks, syncError: null });
    if (isSupabaseConfigured) {
      try {
        await Promise.all([
          upsertBrandConfigInSupabase(brandConfig),
          syncTrainingTracksInSupabase(trainingTracks),
        ]);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Error al guardar marca y capacitación en Supabase.';
        set({ syncError: msg });
        throw new Error(msg);
      }
    }
  },

  importSnapshot: (snapshot) => {
    const s = get();
    const next: PersistedSnapshot = {
      projects: snapshot.projects?.length ? snapshot.projects : s.projects,
      certificates: snapshot.certificates ?? s.certificates,
      trainingTracks: snapshot.trainingTracks?.length
        ? snapshot.trainingTracks
        : s.trainingTracks,
      brandConfig: snapshot.brandConfig
        ? { ...s.brandConfig, ...snapshot.brandConfig }
        : s.brandConfig,
    };
    saveSnapshot(next);
    set({ ...next, syncError: null });
    if (isSupabaseConfigured && s.isAdminAuthenticated) {
      void seedSnapshotToSupabase(next).catch((err) => {
        set({
          syncError:
            err instanceof Error ? err.message : 'Error al sincronizar respaldo en Supabase.',
        });
      });
    }
  },

  resetToDefaults: () => {
    const defaults: PersistedSnapshot = {
      projects: CATALOG_PROJECTS,
      certificates: DEFAULT_DIGITAL_CERTIFICATES,
      trainingTracks: CERTIFICATION_TRACKS,
      brandConfig: DEFAULT_BRAND_CONFIG,
    };
    saveSnapshot(defaults);
    set({ ...defaults, syncError: null });
    if (isSupabaseConfigured && get().isAdminAuthenticated) {
      void seedSnapshotToSupabase(defaults).catch((err) => {
        set({
          syncError:
            err instanceof Error ? err.message : 'Error al restaurar valores en Supabase.',
        });
      });
    }
  },
}));
