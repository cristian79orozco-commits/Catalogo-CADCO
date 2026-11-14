import { create } from 'zustand';
import type { CatalogCategory, ViewerEngine } from '../types';

interface CatalogState {
  selectedCategory: CatalogCategory;
  searchQuery: string;
  selectedProjectId: string | null;
  activePhotoIndex: number;
  isLightboxOpen: boolean;
  viewerEngine: ViewerEngine;
  isExploded: boolean;
  isWireframe: boolean;
  autoRotate: boolean;
  isUniversalViewerOpen: boolean;
  copiedProjectId: string | null;

  setSelectedCategory: (category: CatalogCategory) => void;
  setSearchQuery: (query: string) => void;
  openProject: (projectId: string, photoIndex?: number) => void;
  closeProject: () => void;
  setActivePhotoIndex: (index: number) => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  setViewerEngine: (engine: ViewerEngine) => void;
  toggleExploded: () => void;
  toggleWireframe: () => void;
  toggleAutoRotate: () => void;
  setUniversalViewerOpen: (open: boolean) => void;
  markLinkCopied: (projectId: string) => void;
  syncFromUrl: () => void;
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
    // Ignore history errors in restricted environments
  }
}

export const useCatalogStore = create<CatalogState>((set) => ({
  selectedCategory: 'all',
  searchQuery: '',
  selectedProjectId: null,
  activePhotoIndex: 0,
  isLightboxOpen: false,
  viewerEngine: 'r3f',
  isExploded: false,
  isWireframe: false,
  autoRotate: true,
  isUniversalViewerOpen: false,
  copiedProjectId: null,

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
    set({
      selectedProjectId: null,
      isLightboxOpen: false,
    });
  },

  setActivePhotoIndex: (activePhotoIndex) => set({ activePhotoIndex }),
  openLightbox: (index) => set({ activePhotoIndex: index, isLightboxOpen: true }),
  closeLightbox: () => set({ isLightboxOpen: false }),
  setViewerEngine: (viewerEngine) => set({ viewerEngine }),
  toggleExploded: () => set((s) => ({ isExploded: !s.isExploded })),
  toggleWireframe: () => set((s) => ({ isWireframe: !s.isWireframe })),
  toggleAutoRotate: () => set((s) => ({ autoRotate: !s.autoRotate })),
  setUniversalViewerOpen: (isUniversalViewerOpen) => set({ isUniversalViewerOpen }),

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
      if (proyecto) {
        set({ selectedProjectId: proyecto });
      }
    } catch {
      // Ignore URL parsing errors
    }
  },
}));
