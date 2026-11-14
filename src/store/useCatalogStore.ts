import { create } from 'zustand';
import {
  CATALOG_PROJECTS,
  CERTIFICATION_TRACKS,
  DEFAULT_BRAND_CONFIG,
  DEFAULT_DIGITAL_CERTIFICATES,
} from '../data/catalogData';
import type {
  BrandConfig,
  CatalogCategory,
  CatalogProject,
  CertificationTrack,
  DigitalCertificate,
} from '../types';

const STORAGE_KEY = 'cadco_catalog_storage_v2';

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
    // Fallback to defaults if storage is unavailable
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
    // Ignore quota errors cleanly
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

interface CatalogState extends PersistedSnapshot {
  selectedCategory: CatalogCategory;
  searchQuery: string;
  selectedProjectId: string | null;
  activePhotoIndex: number;
  isExploded: boolean;
  isWireframe: boolean;
  autoRotate: boolean;
  copiedProjectId: string | null;

  // Admin state (completely hidden from clients)
  isAdminOpen: boolean;
  isAdminAuthenticated: boolean;

  // Filter & Navigation
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

  // Admin Access
  openAdminModal: () => void;
  closeAdminModal: () => void;
  authenticateAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;

  // CRUD Projects
  addProject: (project: CatalogProject) => void;
  updateProject: (project: CatalogProject) => void;
  deleteProject: (projectId: string) => void;

  // CRUD Certificates
  addCertificate: (cert: DigitalCertificate) => void;
  updateCertificate: (cert: DigitalCertificate) => void;
  deleteCertificate: (certId: string) => void;

  // Update Brand & Training
  updateBrandConfig: (patch: Partial<BrandConfig>) => void;
  updateTrainingTrack: (track: CertificationTrack) => void;

  // Backup / Restore
  importSnapshot: (snapshot: Partial<PersistedSnapshot>) => void;
  resetToDefaults: () => void;
}

const initial = loadInitialSnapshot();

export const useCatalogStore = create<CatalogState>((set, get) => ({
  ...initial,
  selectedCategory: 'all',
  searchQuery: '',
  selectedProjectId: null,
  activePhotoIndex: 0,
  isExploded: false,
  isWireframe: false,
  autoRotate: true,
  copiedProjectId: null,
  isAdminOpen: false,
  isAdminAuthenticated: false,

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
        set({ selectedProjectId: proyecto });
      }
      if (adminParam === '1' || isHashAdmin) {
        set({ isAdminOpen: true });
      }
    } catch {
      // Ignore URL errors
    }
  },

  openAdminModal: () => set({ isAdminOpen: true }),
  closeAdminModal: () => set({ isAdminOpen: false }),
  authenticateAdmin: (pin) => {
    const valid = pin.trim() === get().brandConfig.adminPin;
    if (valid) {
      set({ isAdminAuthenticated: true });
    }
    return valid;
  },
  logoutAdmin: () => set({ isAdminAuthenticated: false, isAdminOpen: false }),

  addProject: (project) => {
    const projects = [project, ...get().projects];
    const s = get();
    saveSnapshot({
      projects,
      certificates: s.certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ projects });
  },

  updateProject: (project) => {
    const projects = get().projects.map((p) => (p.id === project.id ? project : p));
    const s = get();
    saveSnapshot({
      projects,
      certificates: s.certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ projects });
  },

  deleteProject: (projectId) => {
    const projects = get().projects.filter((p) => p.id !== projectId);
    const s = get();
    saveSnapshot({
      projects,
      certificates: s.certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ projects });
  },

  addCertificate: (cert) => {
    const certificates = [cert, ...get().certificates];
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ certificates });
  },

  updateCertificate: (cert) => {
    const certificates = get().certificates.map((c) => (c.id === cert.id ? cert : c));
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ certificates });
  },

  deleteCertificate: (certId) => {
    const certificates = get().certificates.filter((c) => c.id !== certId);
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates,
      trainingTracks: s.trainingTracks,
      brandConfig: s.brandConfig,
    });
    set({ certificates });
  },

  updateBrandConfig: (patch) => {
    const brandConfig = { ...get().brandConfig, ...patch };
    const s = get();
    saveSnapshot({
      projects: s.projects,
      certificates: s.certificates,
      trainingTracks: s.trainingTracks,
      brandConfig,
    });
    set({ brandConfig });
  },

  updateTrainingTrack: (track) => {
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
    set({ trainingTracks });
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
    set(next);
  },

  resetToDefaults: () => {
    const defaults: PersistedSnapshot = {
      projects: CATALOG_PROJECTS,
      certificates: DEFAULT_DIGITAL_CERTIFICATES,
      trainingTracks: CERTIFICATION_TRACKS,
      brandConfig: DEFAULT_BRAND_CONFIG,
    };
    saveSnapshot(defaults);
    set(defaults);
  },
}));
